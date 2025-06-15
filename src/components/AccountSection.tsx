
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Session } from '@supabase/supabase-js';
import { AuthForm } from './AuthForm';
import { PricingPlans } from './PricingPlans';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X as Cross } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

export const AccountSection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserData(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      setProfile(profileData);

      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const handlePlanSelect = async (planName: string) => {
    if (!user) {
      toast.error('Please sign in to select a plan');
      return;
    }

    try {
      const tierMap: { [key: string]: SubscriptionTier } = {
        'Free': 'free',
        'Standard': 'standard',
        'Pro': 'pro'
      };

      const selectedTier = tierMap[planName] || 'free';

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          tier: selectedTier
        });

      if (error) throw error;
      
      toast.success(`Successfully upgraded to ${planName} plan!`);
      fetchUserData(user.id);
    } catch (error: any) {
      toast.error(error.message || 'Error updating plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to GUI Builder</h1>
          <p className="text-muted-foreground mb-8">Sign in to access your account and manage your subscription</p>
        </div>
        <AuthForm />
      </div>
    );
  }

  // User is logged in, show the dashboard, with cross and scroll area
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-32px)] relative max-w-2xl">
      <button
        aria-label="Close dashboard"
        className="absolute top-2 right-2 z-10 bg-muted text-muted-foreground hover:bg-accent/60 rounded-full p-2 transition"
        onClick={() => navigate('/')}
      >
        <Cross className="w-5 h-5" />
      </button>
      <ScrollArea className="h-full rounded-lg border shadow bg-background p-0">
        <div className="space-y-8 py-4 px-2 md:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Account Dashboard</h1>
            <p className="text-muted-foreground">Manage your account and subscription</p>
          </div>
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Display Name:</strong> {profile?.display_name || 'Not set'}
              </div>
              <div>
                <strong>Current Plan:</strong> 
                <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Free'}
                </span>
              </div>
              <Separator />
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
          {/* Pricing Plans */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h2>
            <PricingPlans 
              currentPlan={subscription?.tier || 'free'}
              onSelectPlan={handlePlanSelect}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
