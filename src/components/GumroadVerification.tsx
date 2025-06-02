
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

export default function GumroadVerification() {
  const { user } = useAuth();
  const { refetch } = useSubscription();

  useEffect(() => {
    // Check for Gumroad purchase completion
    const checkPurchaseCompletion = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const saleId = urlParams.get('sale_id');
      const productId = urlParams.get('product_id');
      
      if (saleId && productId && user) {
        try {
          // Get pending upgrade info from localStorage
          const pendingUpgrade = localStorage.getItem('pendingUpgrade');
          
          if (pendingUpgrade) {
            const upgradeInfo = JSON.parse(pendingUpgrade);
            
            // Verify the purchase with our backend
            const { error } = await supabase.functions.invoke('verify-gumroad-purchase', {
              body: {
                productId: productId,
                saleId: saleId,
                userId: user.id,
                tier: upgradeInfo.tier
              }
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            // Clear pending upgrade and refresh subscription
            localStorage.removeItem('pendingUpgrade');
            await refetch();
            
            toast.success('Purchase verified! Your subscription has been upgraded.');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Error verifying purchase:', error);
          toast.error('Failed to verify purchase. Please contact support.');
        }
      }
    };

    checkPurchaseCompletion();
  }, [user, refetch]);

  return null; // This component doesn't render anything
}
