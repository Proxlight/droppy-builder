
import { useState, useEffect } from 'react';
import Canvas from '../components/Canvas';
import { Sidebar } from '../components/Sidebar';
import { PropertyPanel } from '../components/PropertyPanel';
import { Toolbar } from '../components/Toolbar';
import { WindowProperties } from '../components/WindowProperties';
import { CodePreview } from '../components/CodePreview';
import { Layers } from '../components/Layers';
import WatermarkedCanvas from '../components/WatermarkedCanvas';
import { DashboardNav } from '@/components/Navigation/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { hasFeature, FEATURES } from '@/utils/subscriptionUtils';
import { useNavigate, useParams } from 'react-router-dom';

interface Widget {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: any;
}

interface WindowPropertiesType {
  width: number;
  height: number;
  title: string;
}

const Index = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [windowProperties, setWindowProperties] = useState<WindowPropertiesType>({
    width: 800,
    height: 600,
    title: 'My App'
  });
  const [showCodePreview, setShowCodePreview] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [undoStack, setUndoStack] = useState<Widget[][]>([]);
  const [redoStack, setRedoStack] = useState<Widget[][]>([]);
  
  const { subscription } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const canExportCode = hasFeature(subscription, FEATURES.EXPORT_CODE);
  const shouldShowWatermark = !hasFeature(subscription, FEATURES.REMOVE_WATERMARK);

  useEffect(() => {
    if (projectId) {
      // Load specific project
      const savedProject = localStorage.getItem(`project_${projectId}`);
      if (savedProject) {
        const projectData = JSON.parse(savedProject);
        setWidgets(projectData.widgets || []);
        setWindowProperties(projectData.windowProperties || { width: 800, height: 600, title: 'My App' });
      } else {
        // Start with blank canvas for new project
        setWidgets([]);
        setWindowProperties({ width: 800, height: 600, title: 'New Project' });
      }
    } else {
      // No project ID - start with blank canvas
      setWidgets([]);
      setWindowProperties({ width: 800, height: 600, title: 'New Project' });
    }
  }, [projectId]);

  // Auto-save project changes
  useEffect(() => {
    if (projectId) {
      const projectData = {
        id: projectId,
        name: windowProperties.title,
        widgets,
        windowProperties,
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
      
      // Update projects list
      const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = existingProjects.findIndex((p: any) => p.id === projectId);
      if (projectIndex >= 0) {
        existingProjects[projectIndex] = {
          id: projectId,
          name: windowProperties.title,
          lastModified: new Date().toISOString()
        };
      } else {
        existingProjects.push({
          id: projectId,
          name: windowProperties.title,
          lastModified: new Date().toISOString()
        });
      }
      localStorage.setItem('projects', JSON.stringify(existingProjects));
    }
  }, [widgets, windowProperties, projectId]);

  const updateWidget = (updatedWidget: Widget) => {
    setWidgets(widgets.map(widget => widget.id === updatedWidget.id ? updatedWidget : widget));
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    setSelectedWidget(null);
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack([...redoStack, widgets]);
      setWidgets(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack([...undoStack, widgets]);
      setWidgets(nextState);
      setRedoStack(redoStack.slice(0, -1));
    }
  };

  const handleComponentsChange = (newComponents: Widget[]) => {
    setUndoStack([...undoStack, widgets]);
    setRedoStack([]);
    setWidgets(newComponents);
  };

  const handleOrderChange = (newOrder: Widget[]) => {
    setWidgets(newOrder);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-semibold text-gray-900">Buildfy Canvas</span>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <DashboardNav />
        </div>
        
        <div className="flex items-center space-x-2">
          <Toolbar 
            components={widgets}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onToggleCodePreview={() => setShowCodePreview(!showCodePreview)}
            showCodePreview={showCodePreview}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-auto">
            {shouldShowWatermark ? (
              <WatermarkedCanvas>
                <Canvas 
                  components={widgets}
                  setComponents={handleComponentsChange}
                  selectedComponent={selectedWidget}
                  setSelectedComponent={setSelectedWidget}
                  windowSize={{ width: windowProperties.width, height: windowProperties.height }}
                  onComponentUpdate={updateWidget}
                />
              </WatermarkedCanvas>
            ) : (
              <Canvas 
                components={widgets}
                setComponents={handleComponentsChange}
                selectedComponent={selectedWidget}
                setSelectedComponent={setSelectedWidget}
                windowSize={{ width: windowProperties.width, height: windowProperties.height }}
                onComponentUpdate={updateWidget}
              />
            )}
          </div>
        </div>

        <div className="w-80 border-l bg-white flex flex-col">
          <div className="flex-1 overflow-auto">
            <WindowProperties 
              visible={true}
              title={windowProperties.title}
              setTitle={(title) => setWindowProperties({...windowProperties, title})}
              size={{ width: windowProperties.width, height: windowProperties.height }}
              setSize={(size) => setWindowProperties({...windowProperties, ...size})}
              onDelete={() => {}}
              onDuplicate={() => {}}
            />
            {selectedWidget && (
              <PropertyPanel 
                selectedComponent={selectedWidget}
                onUpdate={updateWidget}
                setInputFocused={setInputFocused}
                inputFocused={inputFocused}
              />
            )}
            <Layers 
              visible={true}
              components={widgets}
              onComponentsChange={handleComponentsChange}
              selectedComponent={selectedWidget}
              setSelectedComponent={setSelectedWidget}
              onOrderChange={handleOrderChange}
            />
          </div>
          {showCodePreview && canExportCode && (
            <div className="border-t">
              <CodePreview 
                components={widgets}
                visible={showCodePreview}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
