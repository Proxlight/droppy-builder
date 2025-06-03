
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Plus, MoreVertical, Folder, Clock, User, Settings, Zap, Crown, Star, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  data?: any;
}

export default function Dashboard() {
  const { user, subscription, signOut } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('buildfy_projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  };

  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem('buildfy_projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      data: {
        widgets: [],
        windowProperties: {
          width: 800,
          height: 600,
          title: 'My App'
        }
      }
    };

    const updatedProjects = [newProject, ...projects];
    saveProjects(updatedProjects);
    setNewProjectName('');
    setIsCreateDialogOpen(false);
    toast.success('Project created successfully');
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    toast.success('Project deleted successfully');
  };

  const renameProject = (projectId: string) => {
    if (!editName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, name: editName.trim(), lastModified: new Date().toISOString() }
        : p
    );
    saveProjects(updatedProjects);
    setEditingProject(null);
    setEditName('');
    toast.success('Project renamed successfully');
  };

  const openProject = (project: Project) => {
    localStorage.setItem('currentProject', JSON.stringify(project));
    navigate('/canvas');
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

  const getTimeLeft = () => {
    if (!subscription?.expires_at) return null;
    
    const expiryDate = new Date(subscription.expires_at);
    const now = new Date();
    const timeLeft = expiryDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else {
      return 'Less than 1 day left';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-4 w-4" />;
      case 'standard':
        return <Star className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'standard':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Buildfy
                  </h1>
                  <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {subscription && (
                <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getTierColor(subscription.tier)}`}>
                  {getTierIcon(subscription.tier)}
                  <span className="capitalize">{subscription.tier} Plan</span>
                  {subscription.expires_at && (
                    <div className="flex items-center space-x-1 ml-2 pl-2 border-l border-white/30">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{getTimeLeft()}</span>
                    </div>
                  )}
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/pricing')}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Projects Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Projects</h2>
            <p className="text-gray-600">{projects.length} project{projects.length !== 1 ? 's' : ''} • Build amazing apps with ease</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Start building your next amazing application
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createProject()}
                  className="focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createProject} className="bg-blue-600 hover:bg-blue-700">
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Folder className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first project to start building amazing applications with our visual editor
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm hover:bg-white cursor-pointer overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    {editingProject === project.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => renameProject(project.id)}
                        onKeyPress={(e) => e.key === 'Enter' && renameProject(project.id)}
                        className="text-lg font-semibold border-0 p-0 h-auto focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <CardTitle 
                        className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors"
                        onClick={() => openProject(project)}
                      >
                        {project.name}
                      </CardTitle>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProject(project.id);
                            setEditName(project.name);
                          }}
                        >
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteProject(project.id)}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent onClick={() => openProject(project)} className="pt-0">
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-green-500" />
                      <span>Modified: {formatDate(project.lastModified)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Open Project →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
