
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home, User, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const DashboardNav = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/')}
        className="flex items-center"
      >
        <Home className="h-4 w-4 mr-2" />
        Dashboard
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
