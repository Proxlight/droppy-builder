import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Session } from '@supabase/supabase-js';
import { AuthForm } from './AuthForm';
import { PricingPlans } from './PricingPlans';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

export const AccountSection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);

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

  const handleBackToApp = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen dashboard-bg flex items-center justify-center">
        <div className="glass-container p-8">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen dashboard-bg relative overflow-hidden">
        {/* Floating orbs */}
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 text-white">Welcome to GUI Builder</h1>
                <p className="text-white/80 mb-8">Sign in to access your account and manage your subscription</p>
              </div>
              <div className="glass-container p-6">
                <AuthForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg relative overflow-hidden">
      {/* Floating orbs */}
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      <div className="floating-orb"></div>
      
      {/* Cross button to go back to main app */}
      <button
        onClick={handleBackToApp}
        className="fixed top-6 right-6 z-50 glass-button p-3 text-white hover:bg-white/20 transition-all duration-300"
        title="Back to GUI Builder"
      >
        <X className="h-6 w-6" />
      </button>
      
      <div className="scrollable-container">
        <div className="container mx-auto px-4 py-8 space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">Account Dashboard</h1>
            <p className="text-white/80">Manage your account and subscription</p>
          </div>

          {/* User Info */}
          <div className="glass-container p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Account Information</h2>
              <p className="text-white/70">Your account details and current status</p>
            </div>
            <div className="space-y-4 text-white">
              <div>
                <strong>Email:</strong> <span className="text-white/80">{user.email}</span>
              </div>
              <div>
                <strong>Display Name:</strong> <span className="text-white/80">{profile?.display_name || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Current Plan:</strong>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                  {subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Free'}
                </span>
              </div>
              <div className="pt-4 border-t border-white/20">
                <button 
                  onClick={handleSignOut}
                  className="glass-button px-6 py-2 text-white font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="glass-container p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-white">Choose Your Plan</h2>
            <PricingPlans 
              currentPlan={subscription?.tier || 'free'}
              onSelectPlan={handlePlanSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
