
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Calendar, Trash2, Edit, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LicenseVerification } from '@/components/LicenseVerification';
import PricingPlans from '@/components/Subscription/PricingPlans';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  id: string;
  name: string;
  lastModified: string;
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects.sort((a: Project, b: Project) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      ));
    }
  }, []);

  const createNewProject = () => {
    const projectId = Date.now().toString();
    const newProject: Project = {
      id: projectId,
      name: 'New Project',
      lastModified: new Date().toISOString()
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Navigate to the new project
    navigate(`/canvas/${projectId}`);
  };

  const openProject = (projectId: string) => {
    navigate(`/canvas/${projectId}`);
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Also remove the project data
    localStorage.removeItem(`project_${projectId}`);
  };

  const startRenaming = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setNewProjectName(currentName);
  };

  const saveRename = (projectId: string) => {
    if (newProjectName.trim()) {
      const updatedProjects = projects.map(p => 
        p.id === projectId 
          ? { ...p, name: newProjectName.trim(), lastModified: new Date().toISOString() }
          : p
      );
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Update the project data as well
      const projectData = localStorage.getItem(`project_${projectId}`);
      if (projectData) {
        const parsed = JSON.parse(projectData);
        parsed.name = newProjectName.trim();
        localStorage.setItem(`project_${projectId}`, JSON.stringify(parsed));
      }
    }
    setEditingProject(null);
    setNewProjectName('');
  };

  const cancelRename = () => {
    setEditingProject(null);
    setNewProjectName('');
  };

  const getSubscriptionBadge = () => {
    const tier = subscription?.tier || 'free';
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[tier as keyof typeof colors]}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
      </Badge>
    );
  };

  const getRenewalInfo = () => {
    if (!subscription?.renewsAt) return null;
    
    const renewalDate = new Date(subscription.renewsAt);
    const timeLeft = formatDistanceToNow(renewalDate, { addSuffix: true });
    
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>Renews {timeLeft}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Buildfy
                </h1>
              </div>
              {getSubscriptionBadge()}
            </div>
            
            <div className="flex items-center space-x-4">
              {getRenewalInfo()}
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-gray-300 hover:border-blue-500"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Create stunning applications with our visual builder
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={createNewProject}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
            <Button 
              onClick={() => navigate('/canvas')}
              variant="outline"
              className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Blank Canvas
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Recent Projects</CardTitle>
                <CardDescription>
                  Continue working on your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first project</p>
                    <Button 
                      onClick={createNewProject}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 6).map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            {editingProject === project.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={newProjectName}
                                  onChange={(e) => setNewProjectName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveRename(project.id);
                                    if (e.key === 'Escape') cancelRename();
                                  }}
                                  className="px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <Button size="sm" onClick={() => saveRename(project.id)}>Save</Button>
                                <Button size="sm" variant="outline" onClick={cancelRename}>Cancel</Button>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                                  {project.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Modified {formatDistanceToNow(new Date(project.lastModified), { addSuffix: true })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {editingProject !== project.id && (
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openProject(project.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                            >
                              <FolderOpen className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startRenaming(project.id, project.name)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteProject(project.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {projects.length > 6 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" className="border-gray-300 hover:border-blue-500">
                          View All Projects ({projects.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription & License Section */}
          <div className="space-y-6">
            {/* Subscription Status */}
            <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Plan:</span>
                  {getSubscriptionBadge()}
                </div>
                
                {subscription?.renewsAt && (
                  <div className="text-sm text-gray-600">
                    <strong>Renews:</strong> {new Date(subscription.renewsAt).toLocaleDateString()}
                  </div>
                )}

                {(!subscription || subscription.tier === 'free') && (
                  <div className="border-t pt-4">
                    <LicenseVerification />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upgrade Section */}
            {(!subscription || subscription.tier === 'free') && (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Upgrade Your Plan</CardTitle>
                  <CardDescription>
                    Unlock advanced features and remove limitations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingPlans />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
