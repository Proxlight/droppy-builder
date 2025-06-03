
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit3, Plus, Crown, Zap, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LicenseVerification } from '@/components/LicenseVerification';
import { hasFeature, FEATURES } from '@/utils/subscriptionUtils';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const createNewProject = () => {
    const projectId = Date.now().toString();
    const newProject = {
      id: projectId,
      name: 'New Project',
      lastModified: new Date().toISOString()
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    navigate(`/canvas/${projectId}`);
  };

  const openProject = (projectId: string) => {
    navigate(`/canvas/${projectId}`);
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    localStorage.removeItem(`project_${projectId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCreateProjects = hasFeature(subscription, FEATURES.CREATE_PROJECTS);
  const canExportCode = hasFeature(subscription, FEATURES.EXPORT_CODE);
  const shouldShowWatermark = !hasFeature(subscription, FEATURES.REMOVE_WATERMARK);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'standard': return <Zap className="w-4 h-4 text-blue-500" />;
      default: return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro': return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'standard': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const subscriptionTier = subscription?.tier || 'free';
  const renewsAt = subscription?.expires_at;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Buildfy
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Subscription Badge */}
              <div className={`px-3 py-1 rounded-full text-white text-sm font-medium flex items-center space-x-1 ${getTierColor(subscriptionTier)}`}>
                {getTierIcon(subscriptionTier)}
                <span className="capitalize">{subscriptionTier}</span>
                {renewsAt && (
                  <span className="text-xs opacity-90">
                    • Renews {formatDate(renewsAt)}
                  </span>
                )}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Create and manage your application projects with our drag-and-drop interface.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getTierIcon(subscriptionTier)}
                <span className="text-2xl font-bold text-gray-900 capitalize">{subscriptionTier}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-1">
                {canCreateProjects && <Badge variant="secondary" className="text-xs">Projects</Badge>}
                {canExportCode && <Badge variant="secondary" className="text-xs">Export</Badge>}
                {!shouldShowWatermark && <Badge variant="secondary" className="text-xs">No Watermark</Badge>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Plans */}
        {subscriptionTier === 'free' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span>Standard Plan</span>
                  </CardTitle>
                  <CardDescription>
                    Perfect for individuals and small teams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Unlimited projects</li>
                    <li>• Export code functionality</li>
                    <li>• Priority support</li>
                    <li>• Advanced components</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setShowLicenseDialog(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    Upgrade to Standard
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg border-2 border-yellow-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span>Pro Plan</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Most Popular</Badge>
                  </CardTitle>
                  <CardDescription>
                    For professionals and growing businesses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Everything in Standard</li>
                    <li>• Remove watermarks</li>
                    <li>• Advanced export options</li>
                    <li>• Premium templates</li>
                    <li>• 24/7 support</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => setShowLicenseDialog(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                  >
                    Upgrade to Pro
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Projects</h3>
            <Button 
              onClick={createNewProject}
              disabled={!canCreateProjects}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {!canCreateProjects && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Upgrade to Standard or Pro plan to create unlimited projects.
              </p>
            </div>
          )}

          {projects.length === 0 ? (
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first project
                </p>
                <Button 
                  onClick={createNewProject}
                  disabled={!canCreateProjects}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </CardTitle>
                    <CardDescription>
                      Last modified: {formatDate(project.lastModified)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => openProject(project.id)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => deleteProject(project.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* License Verification Dialog */}
      <LicenseVerification 
        isOpen={showLicenseDialog}
        onClose={() => setShowLicenseDialog(false)}
        onVerified={() => {
          setShowLicenseDialog(false);
          window.location.reload();
        }}
      />
    </div>
  );
}
