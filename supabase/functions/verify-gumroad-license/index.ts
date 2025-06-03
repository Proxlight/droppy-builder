
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-LICENSE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { licenseKey, userId } = await req.json();
    logStep("Verifying license for user", { userId, license: licenseKey });

    if (!licenseKey || !userId) {
      throw new Error('License key and user ID are required');
    }

    // Check if this license key has already been used by another user
    const { data: existingSubscription, error: checkError } = await supabaseClient
      .from('user_subscriptions')
      .select('user_id, gumroad_purchase_id')
      .eq('gumroad_purchase_id', licenseKey)
      .neq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      logStep("Error checking existing license usage", checkError);
      throw new Error('Failed to verify license uniqueness');
    }

    if (existingSubscription) {
      logStep("License key already used by another user", { existingUserId: existingSubscription.user_id });
      throw new Error('This license key has already been activated by another user');
    }

    // Product IDs for verification
    const STANDARD_PRODUCT_ID = 'FPvNjFxa5sPWtpTzMtRIcw==';
    const PRO_PRODUCT_ID = 'vxwrgFi49_CZb5Yrghn7EA==';

    let verificationResult = null;
    let tier = null;
    let expiresAt = null;

    // Try Pro plan first
    logStep("Trying pro product ID", { productId: PRO_PRODUCT_ID });
    try {
      const proResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          product_id: PRO_PRODUCT_ID,
          license_key: licenseKey,
          increment_uses_count: 'false'
        }),
      });

      const proResult = await proResponse.json();
      logStep("Pro verification response", proResult);

      if (proResult.success) {
        verificationResult = proResult;
        tier = 'pro';
        // Pro is yearly plan - expires in 1 year from purchase
        const purchaseDate = new Date(proResult.purchase.sale_timestamp);
        expiresAt = new Date(purchaseDate.getTime() + (365 * 24 * 60 * 60 * 1000)).toISOString();
        logStep("License verified as Pro plan", { expiresAt });
      }
    } catch (error) {
      logStep("Error verifying pro license", error);
    }

    // If Pro verification failed, try Standard plan
    if (!verificationResult) {
      logStep("Trying standard product ID", { productId: STANDARD_PRODUCT_ID });
      try {
        const standardResponse = await fetch('https://api.gumroad.com/v2/licenses/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            product_id: STANDARD_PRODUCT_ID,
            license_key: licenseKey,
            increment_uses_count: 'false'
          }),
        });

        const standardResult = await standardResponse.json();
        logStep("Standard verification response", standardResult);

        if (standardResult.success) {
          verificationResult = standardResult;
          tier = 'standard';
          // Standard is monthly plan - expires in 1 month from purchase
          const purchaseDate = new Date(standardResult.purchase.sale_timestamp);
          expiresAt = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString();
          logStep("License verified as Standard plan", { expiresAt });
        }
      } catch (error) {
        logStep("Error verifying standard license", error);
      }
    }

    if (!verificationResult) {
      throw new Error('Invalid license key or license not found for any of our products');
    }

    // Update or create subscription in database
    logStep("Updating subscription for user", { userId, tier, expires: expiresAt });

    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        tier: tier,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        gumroad_product_id: tier === 'pro' ? PRO_PRODUCT_ID : STANDARD_PRODUCT_ID,
        gumroad_purchase_id: verificationResult.purchase.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (subscriptionError) {
      logStep("Subscription update error", subscriptionError);
      throw new Error(`Failed to update subscription: ${subscriptionError.message}`);
    }

    logStep("Subscription updated successfully", subscriptionData);

    return new Response(
      JSON.stringify({
        success: true,
        tier: tier,
        expiresAt: expiresAt,
        message: `License verified successfully! Your ${tier} plan has been activated.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logStep("ERROR in verify-gumroad-license", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
