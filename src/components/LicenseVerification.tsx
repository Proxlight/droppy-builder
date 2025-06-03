
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LicenseVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const LicenseVerification = ({ isOpen, onClose, onVerified }: LicenseVerificationProps) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, refetchSubscription } = useAuth();

  const handleVerifyLicense = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter your license key');
      return;
    }

    if (!user) {
      toast.error('Please login to verify license');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting license verification for user:', user.id);
      
      // Call the verification function
      const { data, error } = await supabase.functions.invoke('verify-gumroad-license', {
        body: {
          licenseKey: licenseKey.trim(),
          userId: user.id
        }
      });

      if (error) {
        console.error('License verification error:', error);
        throw new Error(error.message);
      }

      console.log('License verification successful:', data);
      
      const renewalDate = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'Never';
      toast.success(`License verified successfully! Your ${data.tier} plan has been activated. Renews on: ${renewalDate}`);
      
      // Close the dialog immediately
      onClose();
      
      // Refresh subscription data
      if (refetchSubscription) {
        await refetchSubscription();
      }
      
      // Call the onVerified callback
      onVerified();
      
      // Small delay then reload to ensure all state is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('License verification error:', error);
      toast.error(`License verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your License</DialogTitle>
          <DialogDescription>
            Please enter your license key to verify your purchase and activate your subscription.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="license">License Key</Label>
            <Input
              id="license"
              type="text"
              placeholder="Enter your license key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleVerifyLicense} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify License'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
