
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredSubscription?: 'free' | 'standard' | 'pro';
}

export default function ProtectedRoute({ 
  children, 
  requiredSubscription 
}: ProtectedRouteProps) {
  const { user, loading, subscription } = useAuth();

  console.log('ProtectedRoute - user:', user, 'loading:', loading, 'subscription:', subscription);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // If no subscription tier is required, or the user is on free plan and no specific tier is needed
  if (!requiredSubscription) {
    return <>{children}</>;
  }
  
  // If we get here, we're checking for specific subscription tier
  const userTier = subscription?.tier || 'free';
  
  // Handle standard tier requirement
  if (requiredSubscription === 'standard' && 
      (userTier === 'standard' || userTier === 'pro')) {
    return <>{children}</>;
  }
  
  // Handle pro tier requirement
  if (requiredSubscription === 'pro' && userTier === 'pro') {
    return <>{children}</>;
  }
  
  // If tier check fails, redirect to pricing
  if (requiredSubscription && 
      (requiredSubscription === 'standard' || requiredSubscription === 'pro')) {
    return <Navigate to="/pricing" replace />;
  }
  
  return <>{children}</>;
}
