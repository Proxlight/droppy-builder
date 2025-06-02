
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionExpiryChecker = () => {
  const { user } = useAuth();
  const { subscription, refetch } = useSubscription();

  useEffect(() => {
    if (!user || !subscription) return;

    const checkSubscriptionStatus = async () => {
      // Check if subscription has expired
      if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
        // If subscription is expired and not already free, downgrade to free
        if (subscription.tier !== 'free') {
          try {
            const { error } = await supabase.functions.invoke('verify-gumroad-purchase', {
              body: {
                productId: null,
                purchaseId: null,
                userId: user.id,
                tier: 'free'
              }
            });

            if (!error) {
              console.log('Subscription expired, downgraded to free plan');
              refetch();
            }
          } catch (error) {
            console.error('Error downgrading expired subscription:', error);
          }
        }
      }
    };

    // Check immediately
    checkSubscriptionStatus();

    // Set up interval to check every hour
    const interval = setInterval(checkSubscriptionStatus, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, subscription, refetch]);

  return null; // This component doesn't render anything
};
