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

interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: any;
}

interface WindowPropertiesType {
  width: number;
  height: number;
  title: string;
  bgColor: string;
}

const Index = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [windowProperties, setWindowProperties] = useState<WindowPropertiesType>({
    width: 800,
    height: 600,
    title: 'My App',
    bgColor: '#FFFFFF'
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

  // Convert Widget to Component
  const widgetToComponent = (widget: Widget): Component => ({
    id: widget.id,
    type: widget.type,
    position: { x: widget.x, y: widget.y },
    size: { width: widget.width, height: widget.height },
    props: widget.properties
  });

  // Convert Component to Widget
  const componentToWidget = (component: Component): Widget => ({
    id: component.id,
    type: component.type,
    x: component.position.x,
    y: component.position.y,
    width: component.size.width,
    height: component.size.height,
    properties: component.props
  });

  useEffect(() => {
    if (projectId) {
      // Load specific project
      const savedProject = localStorage.getItem(`project_${projectId}`);
      if (savedProject) {
        const projectData = JSON.parse(savedProject);
        setWidgets(projectData.widgets || []);
        setWindowProperties(projectData.windowProperties || { width: 800, height: 600, title: 'My App', bgColor: '#FFFFFF' });
      } else {
        // Start with blank canvas for new project
        setWidgets([]);
        setWindowProperties({ width: 800, height: 600, title: 'New Project', bgColor: '#FFFFFF' });
      }
    } else {
      // No project ID - start with blank canvas
      setWidgets([]);
      setWindowProperties({ width: 800, height: 600, title: 'New Project', bgColor: '#FFFFFF' });
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

  const handleComponentsChange = (newComponents: Component[]) => {
    const newWidgets = newComponents.map(componentToWidget);
    setUndoStack([...undoStack, widgets]);
    setRedoStack([]);
    setWidgets(newWidgets);
  };

  const handleOrderChange = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, movedWidget);
    setWidgets(newWidgets);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header with Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/a2511ed4-b088-4fc0-81c2-1d253b757b1b.png" 
              alt="Buildfy Logo" 
              className="w-6 h-6"
            />
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
                  components={widgets.map(widgetToComponent)}
                  setComponents={handleComponentsChange}
                  selectedComponent={selectedWidget ? widgetToComponent(selectedWidget) : null}
                  setSelectedComponent={(component) => setSelectedWidget(component ? componentToWidget(component) : null)}
                  selectedComponents={selectedWidget ? [selectedWidget.id] : []}
                  setSelectedComponents={(ids) => {
                    if (ids.length > 0) {
                      const widget = widgets.find(w => w.id === ids[0]);
                      setSelectedWidget(widget || null);
                    } else {
                      setSelectedWidget(null);
                    }
                  }}
                  windowSize={{ width: windowProperties.width, height: windowProperties.height }}
                  windowBgColor={windowProperties.bgColor}
                />
              </WatermarkedCanvas>
            ) : (
              <Canvas 
                components={widgets.map(widgetToComponent)}
                setComponents={handleComponentsChange}
                selectedComponent={selectedWidget ? widgetToComponent(selectedWidget) : null}
                setSelectedComponent={(component) => setSelectedWidget(component ? componentToWidget(component) : null)}
                selectedComponents={selectedWidget ? [selectedWidget.id] : []}
                setSelectedComponents={(ids) => {
                  if (ids.length > 0) {
                    const widget = widgets.find(w => w.id === ids[0]);
                    setSelectedWidget(widget || null);
                  } else {
                    setSelectedWidget(null);
                  }
                }}
                windowSize={{ width: windowProperties.width, height: windowProperties.height }}
                windowBgColor={windowProperties.bgColor}
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
              bgColor={windowProperties.bgColor}
              setBgColor={(bgColor) => setWindowProperties({...windowProperties, bgColor})}
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
              onComponentsChange={setWidgets}
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
