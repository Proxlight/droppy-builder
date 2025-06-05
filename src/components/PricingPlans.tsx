
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Basic GUI builder',
      'Up to 5 components',
      'Export to Python',
      'Community support'
    ]
  },
  {
    name: 'Standard',
    price: '$9.99',
    description: 'Great for small projects',
    features: [
      'Advanced GUI builder',
      'Unlimited components',
      'Priority export',
      'Email support',
      'Custom themes',
      'Advanced widgets'
    ],
    isPopular: true
  },
  {
    name: 'Pro',
    price: '$19.99',
    description: 'Perfect for professionals',
    features: [
      'Everything in Standard',
      'Team collaboration',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'White-label option'
    ]
  }
];

interface PricingPlansProps {
  currentPlan?: string;
  onSelectPlan?: (planName: string) => void;
}

export const PricingPlans = ({ currentPlan = 'free', onSelectPlan }: PricingPlansProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.name} 
          className={`relative ${plan.isPopular ? 'border-primary shadow-lg' : ''} ${
            currentPlan.toLowerCase() === plan.name.toLowerCase() ? 'ring-2 ring-primary' : ''
          }`}
        >
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
          )}
          
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.price !== '$0' && <span className="text-muted-foreground">/month</span>}
            </div>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              variant={currentPlan.toLowerCase() === plan.name.toLowerCase() ? "secondary" : "default"}
              onClick={() => onSelectPlan?.(plan.name)}
              disabled={currentPlan.toLowerCase() === plan.name.toLowerCase()}
            >
              {currentPlan.toLowerCase() === plan.name.toLowerCase() ? 'Current Plan' : `Choose ${plan.name}`}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
