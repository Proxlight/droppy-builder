
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Grip, Eye, EyeOff, Lock, Unlock, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface LayersProps {
  components: any[];
  onComponentsChange: (components: any[]) => void;
  selectedComponent: any;
  setSelectedComponent: (component: any) => void;
  onOrderChange: (fromIndex: number, toIndex: number) => void;
  visible: boolean;
}

export const Layers = ({
  components,
  onComponentsChange,
  selectedComponent,
  setSelectedComponent,
  onOrderChange,
  visible
}: LayersProps) => {
  // Use component IDs for visibility and lock state tracking
  const [visibilityStates, setVisibilityStates] = useState<Record<string, boolean>>({});
  const [lockStates, setLockStates] = useState<Record<string, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Initialize states from components when they change
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    const initialLockStates: Record<string, boolean> = {};
    
    components.forEach(component => {
      // Use existing visibility from component props if available
      initialVisibility[component.id] = component.visible !== false; // Default to true
      
      // Use existing lock state from component props if available
      initialLockStates[component.id] = component.locked === true; // Default to false
    });
    
    setVisibilityStates(initialVisibility);
    setLockStates(initialLockStates);
  }, [components]);
  
  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the component
    
    setVisibilityStates(prev => {
      const newVisibility = {
        ...prev,
        [id]: !prev[id]
      };
      
      // Update the components with visibility information
      const updatedComponents = components.map(c => {
        if (c.id === id) {
          return {
            ...c,
            visible: newVisibility[id]
          };
        }
        return c;
      });
      
      onComponentsChange(updatedComponents);
      return newVisibility;
    });
    
    toast.info(`Component visibility ${visibilityStates[id] ? 'hidden' : 'shown'}`);
  };
  
  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the component
    
    setLockStates(prev => {
      const newLockState = {
        ...prev,
        [id]: !prev[id]
      };
      
      // Update the components with lock information
      const updatedComponents = components.map(c => {
        if (c.id === id) {
          return {
            ...c,
            locked: newLockState[id]
          };
        }
        return c;
      });
      
      onComponentsChange(updatedComponents);
      
      const componentName = components.find(c => c.id === id)?.type || 'Component';
      if (newLockState[id]) {
        toast.info(`"${componentName}" locked`);
      } else {
        toast.info(`"${componentName}" unlocked`);
      }
      
      return newLockState;
    });
  };
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }
    
    if (result.destination.index === result.source.index) {
      return;
    }
    
    onOrderChange(result.source.index, result.destination.index);
    toast.success('Layer order updated');
  };
  
  const handleLayerClick = (component: any) => {
    // If the component is not locked, allow selection
    if (!lockStates[component.id]) {
      setSelectedComponent(component);
    } else {
      toast.error('This component is locked. Unlock it to select.');
    }
  };
  
  // Reverse the components array for display so that the top-most layer appears at the top
  const displayComponents = [...components].reverse();

  if (!visible) return null;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 border-r border-border flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Layers</h2>
        <p className="text-sm text-muted-foreground">Manage visibility and layer order</p>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="layers">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 overflow-y-auto p-2"
            >
              {displayComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No components found. Add some components to see them here.
                </div>
              ) : (
                displayComponents.map((component, index) => {
                  const isVisible = visibilityStates[component.id] !== false;
                  const isLocked = lockStates[component.id] === true;
                  
                  return (
                    <Draggable 
                      key={component.id} 
                      draggableId={component.id}
                      index={index}
                      isDragDisabled={isLocked}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`mb-1 p-2 rounded transition-colors ${
                            selectedComponent?.id === component.id 
                              ? 'bg-primary/10 border border-primary/30' 
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                          onClick={() => handleLayerClick(component)}
                        >
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing">
                              <Grip size={16} className="text-muted-foreground" />
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => toggleVisibility(component.id, e)}
                              title={isVisible ? "Hide layer" : "Show layer"}
                            >
                              {isVisible ? (
                                <Eye size={14} className="text-muted-foreground" />
                              ) : (
                                <EyeOff size={14} className="text-muted-foreground" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mr-2"
                              onClick={(e) => toggleLock(component.id, e)}
                              title={isLocked ? "Unlock layer" : "Lock layer"}
                            >
                              {isLocked ? (
                                <Lock size={14} className="text-muted-foreground" />
                              ) : (
                                <Unlock size={14} className="text-muted-foreground" />
                              )}
                            </Button>
                            
                            <div 
                              className={`flex-1 truncate text-sm ${
                                !isVisible ? 'text-muted-foreground italic' : 
                                isLocked ? 'font-medium' : ''
                              }`}
                            >
                              {component.type}{' '}
                              {component.type === 'image' && component.props?.fileName && (
                                <span className="text-xs text-blue-600">
                                  ({component.props.fileName})
                                </span>
                              )}
                              {component.type !== 'image' && (
                                <span className="text-xs text-muted-foreground">
                                  ({component.id.split('-')[0]})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      <div className="p-3 border-t">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">
            {components.length} components
          </span>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Lock layers to prevent editing
          </span>
        </div>
      </div>
    </div>
  );
};
