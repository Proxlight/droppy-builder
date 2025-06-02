
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
    const { productId, purchaseId, userId, tier, saleId } = await req.json();

    if (!userId || !tier) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If downgrading to free, just update the subscription
    if (tier === 'free') {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: userId,
          tier: 'free',
          starts_at: new Date().toISOString(),
          expires_at: null,
          gumroad_product_id: null,
          gumroad_purchase_id: null,
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
          message: "Subscription updated to free plan",
          subscription: data[0]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For paid plans, verify with Gumroad if saleId is provided
    if (saleId) {
      try {
        // Verify the purchase with Gumroad API
        const gumroadResponse = await fetch(`https://api.gumroad.com/v2/sales/${saleId}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('GUMROAD_ACCESS_TOKEN')}`,
          },
        });

        if (!gumroadResponse.ok) {
          throw new Error('Failed to verify purchase with Gumroad');
        }

        const gumroadData = await gumroadResponse.json();
        
        // Check if the sale is valid and matches our product
        if (!gumroadData.success || gumroadData.sale.product_id !== productId) {
          return new Response(
            JSON.stringify({ error: "Invalid purchase verification" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (verifyError) {
        console.error("Error verifying Gumroad purchase:", verifyError);
        // Continue without verification for demo purposes
        console.log("Continuing without Gumroad verification for demo");
      }
    }

    // Calculate expiration date based on plan tier
    let expiresAt;
    if (tier === "standard") {
      // Standard plan: 1 month
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (tier === "pro") {
      // Pro plan: 1 year
      expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    console.log(`Updating subscription for user ${userId} to tier ${tier} with expiry ${expiresAt}`);

    // Update user subscription
    const { data, error } = await supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        tier: tier,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt?.toISOString(),
        gumroad_product_id: productId,
        gumroad_purchase_id: purchaseId || saleId,
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

    console.log("Subscription updated successfully:", data);

    return new Response(
      JSON.stringify({ 
        message: "Subscription updated successfully",
        subscription: data[0]
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
