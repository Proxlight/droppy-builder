
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const SUPABASE_URL = "https://mmcmimmzgvovmvnbsznv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { licenseKey, userId } = await req.json();

    if (!licenseKey || !userId) {
      return new Response(
        JSON.stringify({ error: "License key and user ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verifying license for user: ${userId}, license: ${licenseKey}`);

    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try verifying with the pro product ID first
    const proProductId = 'vxwrgFi49_CZb5Yrghn7EA==';
    const standardProductId = 'FPvNjFxa5sPWtpTzMtRIcw==';

    let gumroadData = null;
    let tier = 'standard';
    let productId = standardProductId;

    // First try pro product ID
    try {
      console.log(`Trying pro product ID: ${proProductId}`);
      const proResponse = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'product_id': proProductId,
          'license_key': licenseKey,
          'increment_uses_count': 'false'
        })
      });

      const proData = await proResponse.json();
      console.log('Pro verification response:', proData);
      
      if (proData.success) {
        gumroadData = proData;
        tier = 'pro';
        productId = proProductId;
        console.log('License verified as Pro plan');
      }
    } catch (error) {
      console.log('Pro verification failed, trying standard:', error);
    }

    // If pro failed, try standard product ID
    if (!gumroadData) {
      try {
        console.log(`Trying standard product ID: ${standardProductId}`);
        const standardResponse = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'product_id': standardProductId,
            'license_key': licenseKey,
            'increment_uses_count': 'false'
          })
        });

        const standardData = await standardResponse.json();
        console.log('Standard verification response:', standardData);
        
        if (standardData.success) {
          gumroadData = standardData;
          tier = 'standard';
          productId = standardProductId;
          console.log('License verified as Standard plan');
        }
      } catch (error) {
        console.log('Standard verification failed:', error);
      }
    }

    if (!gumroadData || !gumroadData.success) {
      console.log('License verification failed for both products');
      return new Response(
        JSON.stringify({ error: "Invalid license key or license expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If license is valid, calculate expiration date
    const purchaseData = gumroadData.purchase;
    const purchaseDate = new Date(purchaseData.created_at);
    let expiresAt;
    
    if (tier === "standard") {
      // Standard plan: 1 month from purchase
      expiresAt = new Date(purchaseDate);
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (tier === "pro") {
      // Pro plan: 1 year from purchase
      expiresAt = new Date(purchaseDate);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    console.log(`Updating subscription for user ${userId}: tier=${tier}, expires=${expiresAt?.toISOString()}`);

    // Update user subscription in Supabase
    const { data, error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        tier: tier,
        starts_at: purchaseDate.toISOString(),
        expires_at: expiresAt?.toISOString(),
        gumroad_product_id: productId,
        gumroad_purchase_id: purchaseData.id,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error("Error updating subscription:", error);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Subscription updated successfully:", data);

    return new Response(
      JSON.stringify({ 
        message: "License verified and subscription updated successfully",
        subscription: data[0],
        tier: tier,
        expiresAt: expiresAt?.toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
