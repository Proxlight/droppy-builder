
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'standard' | 'pro';
  starts_at: string;
  expires_at: string | null;
  gumroad_product_id: string | null;
  gumroad_purchase_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found, setting subscription to null');
        setSubscription(null);
        return;
      }
      
      console.log('Fetching subscription for user:', session.user.id);
      
      // Clear any cached data by forcing a fresh fetch
      const { data, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Subscription fetch error:', subscriptionError);
        throw subscriptionError;
      }
      
      if (data && data.length > 0) {
        const latestSubscription = data[0];
        console.log('Fetched subscription:', latestSubscription);
        
        // Check if subscription is expired
        if (latestSubscription.expires_at && new Date(latestSubscription.expires_at) < new Date()) {
          console.log('Subscription expired, should be free tier');
          // Don't set expired subscription, let the SubscriptionExpiryChecker handle it
        }
        
        setSubscription(latestSubscription as Subscription);
      } else {
        console.log('No subscription found for user, creating free subscription');
        
        // Create a free subscription if none exists
        const { data: newSub, error: createError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: session.user.id,
            tier: 'free',
            starts_at: new Date().toISOString(),
            expires_at: null
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating free subscription:', createError);
        } else {
          console.log('Created free subscription:', newSub);
          setSubscription(newSub as Subscription);
        }
      }
      
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    
    // Set up auth state listener to refetch subscription when auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
        // If user logs in or out, refetch subscription
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          fetchSubscription();
        }
      }
    );
    
    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription
  };
};
