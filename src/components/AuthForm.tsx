
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Logged in successfully!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) throw error;
        toast.success('Account created successfully! Please check your email to verify your account.');
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <p className="text-white/70">
          {isLogin ? 'Welcome back! Please sign in to your account.' : 'Create a new account to get started.'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full px-4 py-3 text-white placeholder-white/60"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full px-4 py-3 text-white placeholder-white/60"
            required
            minLength={6}
          />
        </div>
        <button 
          type="submit" 
          className="glass-button w-full py-3 text-white font-medium" 
          disabled={loading}
        >
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-white/80 hover:text-white transition-colors underline"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};
