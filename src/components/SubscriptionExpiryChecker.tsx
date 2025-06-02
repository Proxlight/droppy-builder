
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const SubscriptionExpiryChecker = () => {
  const { user } = useAuth();
  const { subscription, refetch } = useSubscription();

  useEffect(() => {
    if (!user || !subscription) return;

    const checkSubscriptionStatus = async () => {
      console.log('Checking subscription status for:', subscription);
      
      // Check if subscription has expired
      if (subscription.expires_at && new Date(subscription.expires_at) < new Date()) {
        console.log('Subscription expired, downgrading to free plan');
        
        // If subscription is expired and not already free, downgrade to free
        if (subscription.tier !== 'free') {
          try {
            const { error } = await supabase
              .from('user_subscriptions')
              .update({
                tier: 'free',
                expires_at: null,
                gumroad_product_id: null,
                gumroad_purchase_id: null,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (error) {
              console.error('Error downgrading expired subscription:', error);
            } else {
              console.log('Successfully downgraded expired subscription to free plan');
              toast.info('Your subscription has expired and has been downgraded to the free plan.');
              refetch(); // Refresh subscription data
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
