
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LicenseVerification } from '@/components/LicenseVerification';
import { PricingPlans } from '@/components/Subscription/PricingPlans';
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Edit3, 
  Clock, 
  Crown,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

export const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showLicenseVerification, setShowLicenseVerification] = useState(false);
  const [showPricingPlans, setShowPricingPlans] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      // Sort by last modified date (most recent first)
      parsedProjects.sort((a: Project, b: Project) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      setProjects(parsedProjects);
    }
  };

  const createNewProject = () => {
    const projectId = `project_${Date.now()}`;
    const newProject: Project = {
      id: projectId,
      name: 'Untitled Project',
      lastModified: new Date().toISOString()
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Navigate to the new project with blank canvas
    navigate(`/canvas/${projectId}`);
    toast.success('New project created!');
  };

  const openProject = (projectId: string) => {
    navigate(`/canvas/${projectId}`);
  };

  const deleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    localStorage.removeItem(`project_${projectId}`);
    
    toast.success('Project deleted successfully');
  };

  const startRename = (projectId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(projectId);
    setNewProjectName(currentName);
  };

  const saveRename = (projectId: string) => {
    if (!newProjectName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }

    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, name: newProjectName.trim() } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Update the specific project data as well
    const projectData = localStorage.getItem(`project_${projectId}`);
    if (projectData) {
      const parsed = JSON.parse(projectData);
      parsed.name = newProjectName.trim();
      if (parsed.windowProperties) {
        parsed.windowProperties.title = newProjectName.trim();
      }
      localStorage.setItem(`project_${projectId}`, JSON.stringify(parsed));
    }
    
    setEditingProject(null);
    setNewProjectName('');
    toast.success('Project renamed successfully');
  };

  const cancelRename = () => {
    setEditingProject(null);
    setNewProjectName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'standard':
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      default:
        return <Zap className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'from-purple-600 to-pink-600';
      case 'standard':
        return 'from-blue-600 to-cyan-600';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getRenewalDate = () => {
    if (!subscription?.expires_at) return null;
    return new Date(subscription.expires_at).toLocaleDateString();
  };

  const isSubscriptionActive = subscription?.tier && subscription.tier !== 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${getPlanColor(subscription?.tier || 'free')} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Buildfy Canvas</h1>
                <p className="text-sm text-gray-600">Visual Application Builder</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Subscription Status */}
              <div className="flex items-center space-x-2">
                {getPlanIcon(subscription?.tier || 'free')}
                <Badge variant={subscription?.tier === 'pro' ? 'default' : subscription?.tier === 'standard' ? 'secondary' : 'outline'}>
                  {subscription?.tier?.toUpperCase() || 'FREE'} Plan
                </Badge>
                {getRenewalDate() && (
                  <span className="text-sm text-gray-600">
                    Renews: {getRenewalDate()}
                  </span>
                )}
              </div>
              
              <Button 
                onClick={() => navigate('/profile')}
                variant="outline"
                size="sm"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
                <p className="text-gray-600 mt-1">Create and manage your application designs</p>
              </div>
              <Button 
                onClick={createNewProject}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length === 0 ? (
                <Card className="col-span-full p-12 text-center bg-white/50 backdrop-blur-sm border-dashed border-2 border-gray-300">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">No Projects Yet</h3>
                      <p className="text-gray-600 mt-2">Get started by creating your first project</p>
                    </div>
                    <Button 
                      onClick={createNewProject}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                  </div>
                </Card>
              ) : (
                projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:scale-105"
                    onClick={() => openProject(project.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {editingProject === project.id ? (
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              type="text"
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              onBlur={() => saveRename(project.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(project.id);
                                if (e.key === 'Escape') cancelRename();
                              }}
                              className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </CardTitle>
                        )}
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => startRename(project.id, project.name, e)}
                            className="h-8 w-8 p-0 hover:bg-blue-100"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => deleteProject(project.id, e)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Modified {formatDate(project.lastModified)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Subscription & Upgrade Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getPlanIcon(subscription?.tier || 'free')}
                  <span>Current Plan</span>
                </CardTitle>
                <CardDescription>
                  You're currently on the {subscription?.tier?.toUpperCase() || 'FREE'} plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getRenewalDate() && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Renews on:</strong> {getRenewalDate()}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {!isSubscriptionActive ? (
                    <>
                      <Button 
                        onClick={() => setShowLicenseVerification(true)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Verify License Key
                      </Button>
                      
                      <Button 
                        onClick={() => setShowPricingPlans(true)}
                        variant="outline"
                        className="w-full"
                      >
                        View Pricing Plans
                      </Button>
                    </>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 text-green-800">
                        <Crown className="h-5 w-5" />
                        <span className="font-semibold">Premium Active</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        You have access to all premium features
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Projects</span>
                    <Badge variant="outline">{projects.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan Status</span>
                    <Badge variant={isSubscriptionActive ? "default" : "secondary"}>
                      {isSubscriptionActive ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LicenseVerification
        isOpen={showLicenseVerification}
        onClose={() => setShowLicenseVerification(false)}
        onVerified={() => {
          setShowLicenseVerification(false);
          toast.success('License verified successfully!');
        }}
      />

      {showPricingPlans && (
        <PricingPlans onClose={() => setShowPricingPlans(false)} />
      )}
    </div>
  );
};
