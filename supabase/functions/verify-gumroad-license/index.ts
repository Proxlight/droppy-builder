
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

    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify the license with Gumroad API
    try {
      const gumroadResponse = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'product_id': 'FPvNjFxa5sPWtpTzMtRIcw==',
          'license_key': licenseKey,
          'increment_uses_count': 'false'
        })
      });

      const gumroadData = await gumroadResponse.json();
      
      if (!gumroadData.success) {
        return new Response(
          JSON.stringify({ error: "Invalid license key or license expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If license is valid, determine the tier based on the purchase
      const purchaseData = gumroadData.purchase;
      let tier = 'standard'; // Default for the $8 plan
      
      // Check if it's a yearly purchase (you can adjust this logic based on your pricing)
      if (purchaseData.price && parseInt(purchaseData.price) >= 95) {
        tier = 'pro';
      }

      // Calculate expiration date
      let expiresAt;
      const purchaseDate = new Date(purchaseData.created_at);
      
      if (tier === "standard") {
        // Standard plan: 1 month from purchase
        expiresAt = new Date(purchaseDate);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (tier === "pro") {
        // Pro plan: 1 year from purchase
        expiresAt = new Date(purchaseDate);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // Update user subscription
      const { data, error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: tier,
          starts_at: purchaseDate.toISOString(),
          expires_at: expiresAt?.toISOString(),
          gumroad_product_id: purchaseData.product_id,
          gumroad_purchase_id: purchaseData.id,
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error updating subscription:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update subscription" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ 
          message: "License verified and subscription updated successfully",
          subscription: data[0],
          tier: tier
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } catch (verifyError) {
      console.error("Error verifying with Gumroad:", verifyError);
      return new Response(
        JSON.stringify({ error: "Failed to verify license with Gumroad" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
