import { useState, useEffect } from 'react';
import Canvas from '../components/Canvas';
import Sidebar from '../components/Sidebar';
import PropertyPanel from '../components/PropertyPanel';
import Toolbar from '../components/Toolbar';
import WindowProperties from '../components/WindowProperties';
import CodePreview from '../components/CodePreview';
import Layers from '../components/Layers';
import WatermarkedCanvas from '../components/WatermarkedCanvas';
import { DashboardNav } from '@/components/Navigation/DashboardNav';
import { useAuth } from '@/contexts/AuthContext';
import { hasFeature, FEATURES } from '@/utils/subscriptionUtils';

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

  const { subscription } = useAuth();
  const canExportCode = hasFeature(subscription, FEATURES.EXPORT_CODE);
  const shouldShowWatermark = !hasFeature(subscription, FEATURES.REMOVE_WATERMARK);

  useEffect(() => {
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject) {
      const projectData = JSON.parse(savedProject);
      setWidgets(projectData.data.widgets || []);
      setWindowProperties(projectData.data.windowProperties || { width: 800, height: 600, title: 'My App' });
    }
  }, []);

  const updateWidget = (updatedWidget: Widget) => {
    setWidgets(widgets.map(widget => widget.id === updatedWidget.id ? updatedWidget : widget));
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    setSelectedWidget(null);
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
          <DashboardNav />
        </div>
        
        <div className="flex items-center space-x-2">
          <Toolbar 
            widgets={widgets}
            setWidgets={setWidgets}
            windowProperties={windowProperties}
            canExportCode={canExportCode}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar widgets={widgets} setWidgets={setWidgets} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-auto">
            {shouldShowWatermark ? (
              <WatermarkedCanvas 
                widgets={widgets}
                setWidgets={setWidgets}
                selectedWidget={selectedWidget}
                setSelectedWidget={setSelectedWidget}
                windowProperties={windowProperties}
              />
            ) : (
              <Canvas 
                widgets={widgets}
                setWidgets={setWidgets}
                selectedWidget={selectedWidget}
                setSelectedWidget={setSelectedWidget}
                windowProperties={windowProperties}
              />
            )}
          </div>
        </div>

        <div className="w-80 border-l bg-white flex flex-col">
          <div className="flex-1 overflow-auto">
            <WindowProperties 
              windowProperties={windowProperties}
              setWindowProperties={setWindowProperties}
            />
            {selectedWidget && (
              <PropertyPanel 
                widget={selectedWidget}
                onUpdate={updateWidget}
              />
            )}
            <Layers 
              widgets={widgets}
              selectedWidget={selectedWidget}
              onSelectWidget={setSelectedWidget}
              onDeleteWidget={deleteWidget}
            />
          </div>
          {showCodePreview && canExportCode && (
            <div className="border-t">
              <CodePreview 
                widgets={widgets}
                windowProperties={windowProperties}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
