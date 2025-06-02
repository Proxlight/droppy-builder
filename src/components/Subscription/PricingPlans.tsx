
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LicenseVerification } from '@/components/LicenseVerification';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  billingPeriod: string;
  features: PlanFeature[];
  tier: 'free' | 'standard' | 'pro';
  productId?: string;
  gumroadUrl?: string;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features for hobbyists',
    price: '$0',
    billingPeriod: 'forever',
    tier: 'free',
    features: [
      { name: 'Basic widgets', included: true },
      { name: 'Limited canvas size', included: true },
      { name: 'Watermarked exports', included: true },
      { name: 'Community support', included: true },
      { name: 'Export code', included: false },
      { name: 'Advanced widgets', included: false },
      { name: 'No watermarks', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'For serious developers',
    price: '$8',
    billingPeriod: 'monthly',
    tier: 'standard',
    productId: 'FPvNjFxa5sPWtpTzMtRIcw==',
    gumroadUrl: 'https://proxlightapps.gumroad.com/l/ykteb',
    features: [
      { name: 'Basic widgets', included: true },
      { name: 'Unlimited canvas size', included: true },
      { name: 'Export code without watermark', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced widgets', included: true },
      { name: 'Email support', included: true },
      { name: 'Priority support', included: false },
      { name: 'Custom integrations', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professional developers',
    price: '$95',
    billingPeriod: 'yearly',
    tier: 'pro',
    productId: 'FPvNjFxa5sPWtpTzMtRIcw==',
    gumroadUrl: 'https://proxlightapps.gumroad.com/l/ykteb',
    features: [
      { name: 'Basic widgets', included: true },
      { name: 'Unlimited canvas size', included: true },
      { name: 'Export code without watermark', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced widgets', included: true },
      { name: 'Email support', included: true },
      { name: 'Priority support', included: true },
      { name: 'Custom integrations', included: true },
    ],
  },
];

export default function PricingPlans() {
  const [processing, setProcessing] = useState<string | null>(null);
  const [showLicenseVerification, setShowLicenseVerification] = useState(false);
  const { subscription, loading, refetch } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleUpgrade = async (plan: PricingPlan) => {
    try {
      if (!user) {
        toast.error('Please login to upgrade your plan');
        navigate('/auth');
        return;
      }
      
      setProcessing(plan.id);
      
      if (plan.tier === 'free') {
        // Downgrade to free plan
        const { error } = await supabase.functions.invoke('verify-gumroad-purchase', {
          body: {
            productId: null,
            purchaseId: null,
            userId: user.id,
            tier: 'free'
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast.success('Downgraded to Free plan successfully');
        refetch();
      } else {
        // For paid plans, open payment page and then show license verification
        if (plan.gumroadUrl) {
          // Open Gumroad in new tab
          window.open(plan.gumroadUrl, '_blank');
          
          toast.success('Complete your purchase, then verify your license key below');
          
          // Show license verification dialog after a short delay
          setTimeout(() => {
            setShowLicenseVerification(true);
          }, 2000);
        } else {
          throw new Error('Payment URL not available');
        }
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error(`Failed to process upgrade: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return 'free';
    return subscription.tier;
  };

  const isCurrentPlan = (planTier: string) => {
    return getCurrentPlan() === planTier;
  };

  const handleLicenseVerified = () => {
    refetch();
    toast.success('Subscription activated successfully!');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-10">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Choose Your Plan</h1>
            <p className="text-muted-foreground mt-2">
              Select the plan that best fits your needs
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col ${isCurrentPlan(plan.tier) ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan(plan.tier) && (
                    <Badge variant="secondary">Current Plan</Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.billingPeriod}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan(plan.tier) ? "secondary" : "default"}
                  onClick={() => handleUpgrade(plan)}
                  disabled={processing !== null || (isCurrentPlan(plan.tier) && plan.tier !== 'free')}
                >
                  {processing === plan.id
                    ? 'Processing...'
                    : isCurrentPlan(plan.tier)
                    ? 'Current Plan'
                    : `Upgrade to ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* License Verification Dialog */}
        <LicenseVerification
          isOpen={showLicenseVerification}
          onClose={() => setShowLicenseVerification(false)}
          onVerified={handleLicenseVerified}
        />

        {/* Feedback Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                Help us improve by sharing your thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('mailto:feedback@buildfy.com?subject=Pricing Feedback', '_blank')}
              >
                Send Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
