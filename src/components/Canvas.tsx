
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Maximize2, Minimize2, X, Copy, Scissors, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  props: Record<string, any>;
}

interface CanvasProps {
  components: Component[];
  setComponents: (components: Component[]) => void;
  selectedComponent: Component | null;
  setSelectedComponent: (component: Component | null) => void;
  onDeleteComponent?: (component: Component) => void;
  selectedComponents: string[];
  setSelectedComponents: (ids: string[]) => void;
  windowTitle?: string;
  windowSize?: { width: number; height: number };
  windowBgColor?: string;
  setWindowTitle?: (title: string) => void;
}

const Canvas = ({
  components,
  setComponents,
  selectedComponent,
  setSelectedComponent,
  onDeleteComponent,
  selectedComponents,
  setSelectedComponents,
  windowTitle = "My CustomTkinter Application",
  windowSize = { width: 800, height: 600 },
  windowBgColor = "#FFFFFF",
  setWindowTitle
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(windowTitle || "");
  const [draggedComponent, setDraggedComponent] = useState<Component | null>(null);

  useEffect(() => {
    setTitleInput(windowTitle || "");
  }, [windowTitle]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    const type = e.dataTransfer.getData('componentType');
    if (!type) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(10, e.clientX - rect.left - 60);
    const y = Math.max(10, e.clientY - rect.top - 20);

    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x, y },
      size: getDefaultSize(type),
      props: getDefaultProps(type),
    };

    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
    setSelectedComponents([newComponent.id]);
    
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to canvas`, {
      duration: 2000,
    });
  }, [components, setComponents, setSelectedComponent, setSelectedComponents]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedComponent(null);
      setSelectedComponents([]);
    }
  }, [setSelectedComponent, setSelectedComponents]);

  const handleComponentClick = useCallback((e: React.MouseEvent, component: Component) => {
    e.stopPropagation();
    setSelectedComponent(component);
    setSelectedComponents([component.id]);
  }, [setSelectedComponent, setSelectedComponents]);

  const handleMouseDown = useCallback((e: React.MouseEvent, component: Component) => {
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.target as HTMLElement;
    setDraggedComponent(component);
    
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeDirection(target.dataset.direction || null);
    } else {
      setIsDragging(true);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStart({
      x: e.clientX - component.position.x,
      y: e.clientY - component.position.y
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedComponent || (!isDragging && !isResizing)) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isDragging) {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      newX = Math.max(0, Math.min(newX, windowSize.width - draggedComponent.size.width));
      newY = Math.max(0, Math.min(newY, windowSize.height - draggedComponent.size.height));

      const updatedComponents = components.map(comp => 
        comp.id === draggedComponent.id 
          ? { ...comp, position: { x: newX, y: newY } }
          : comp
      );
      setComponents(updatedComponents);
      
      if (selectedComponent?.id === draggedComponent.id) {
        setSelectedComponent({ ...draggedComponent, position: { x: newX, y: newY } });
      }
    } else if (isResizing && resizeDirection) {
      const updatedComponents = components.map(comp => {
        if (comp.id === draggedComponent.id) {
          const newSize = { ...comp.size };
          const newPosition = { ...comp.position };

          if (resizeDirection.includes('e')) {
            newSize.width = Math.max(50, e.clientX - rect.left - comp.position.x);
          }
          if (resizeDirection.includes('s')) {
            newSize.height = Math.max(50, e.clientY - rect.top - comp.position.y);
          }
          if (resizeDirection.includes('w')) {
            const newWidth = Math.max(50, comp.size.width + (comp.position.x - (e.clientX - rect.left)));
            if (newWidth >= 50) {
              newPosition.x = e.clientX - rect.left;
              newSize.width = newWidth;
            }
          }
          if (resizeDirection.includes('n')) {
            const newHeight = Math.max(50, comp.size.height + (comp.position.y - (e.clientY - rect.top)));
            if (newHeight >= 50) {
              newPosition.y = e.clientY - rect.top;
              newSize.height = newHeight;
            }
          }

          const updatedComponent = { ...comp, size: newSize, position: newPosition };
          if (selectedComponent?.id === comp.id) {
            setSelectedComponent(updatedComponent);
          }
          return updatedComponent;
        }
        return comp;
      });
      setComponents(updatedComponents);
    }
  }, [isDragging, isResizing, draggedComponent, dragStart, components, setComponents, resizeDirection, windowSize, selectedComponent, setSelectedComponent]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
    setDraggedComponent(null);
  }, []);

  const handleDeleteComponent = useCallback(() => {
    if (selectedComponent) {
      if (onDeleteComponent) {
        onDeleteComponent(selectedComponent);
      } else {
        const newComponents = components.filter(comp => comp.id !== selectedComponent.id);
        setComponents(newComponents);
        setSelectedComponent(null);
        setSelectedComponents([]);
        toast.success("Component deleted", { duration: 2000 });
      }
    }
  }, [selectedComponent, onDeleteComponent, components, setComponents, setSelectedComponent, setSelectedComponents]);

  const handleTitleDoubleClick = () => {
    if (!isEditingTitle) {
      setIsEditingTitle(true);
      setTitleInput(windowTitle || "");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
  };

  const handleTitleSave = () => {
    if (setWindowTitle && titleInput.trim()) {
      setWindowTitle(titleInput.trim());
      toast.success("Window title updated", { duration: 2000 });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(windowTitle || "");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedComponent && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleDeleteComponent();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, handleDeleteComponent]);

  const getDefaultSize = (type: string) => {
    switch (type) {
      case 'button': return { width: 120, height: 40 };
      case 'label': return { width: 200, height: 30 };
      case 'entry': return { width: 200, height: 40 };
      case 'image': return { width: 200, height: 200 };
      case 'slider': return { width: 200, height: 30 };
      case 'frame': return { width: 300, height: 200 };
      case 'checkbox': return { width: 120, height: 30 };
      case 'datepicker': return { width: 200, height: 40 };
      case 'progressbar': return { width: 200, height: 30 };
      case 'notebook': return { width: 400, height: 300 };
      case 'listbox': return { width: 200, height: 200 };
      case 'canvas': return { width: 300, height: 200 };
      case 'paragraph': return { width: 300, height: 150 };
      default: return { width: 120, height: 40 };
    }
  };

  const getDefaultProps = (type: string) => {
    const fontProps = {
      font: 'Arial',
      fontSize: 12,
      fontWeight: 'normal',
      fontStyle: 'normal',
    };
    
    const borderProps = {
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
    };
    
    const colorProps = {
      bgColor: '#ffffff',
      fgColor: '#000000',
    };
    
    switch (type) {
      case 'button':
        return { text: 'Button', ...colorProps, ...fontProps, ...borderProps };
      case 'label':
        return { text: 'Label', ...fontProps, fgColor: '#000000' };
      case 'entry':
        return { placeholder: 'Enter text...', ...colorProps, ...fontProps, ...borderProps };
      case 'paragraph':
        return { text: 'Paragraph text goes here.', ...colorProps, ...fontProps, ...borderProps, padding: 10, lineHeight: 1.5 };
      default:
        return { ...colorProps, ...fontProps, ...borderProps };
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div 
        className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200/50"
        style={{ 
          width: windowSize.width, 
          height: windowSize.height,
        }}
      >
        {/* Window Title Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer">
              <X size={8} className="text-red-800 opacity-0 hover:opacity-100 transition-opacity p-0.5" />
            </div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors cursor-pointer">
              <Minimize2 size={8} className="text-yellow-800 opacity-0 hover:opacity-100 transition-opacity p-0.5" />
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer">
              <Maximize2 size={8} className="text-green-800 opacity-0 hover:opacity-100 transition-opacity p-0.5" />
            </div>
          </div>
          <div className="flex-1 text-center" onDoubleClick={handleTitleDoubleClick}>
            {isEditingTitle ? (
              <Input
                type="text"
                value={titleInput}
                onChange={handleTitleChange}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="w-48 mx-auto h-6 text-sm text-center bg-transparent border-none focus:ring-0"
                autoFocus
              />
            ) : (
              <div className="cursor-pointer font-medium text-gray-700 text-sm">
                {windowTitle}
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="relative w-full h-full overflow-hidden"
          style={{ 
            backgroundColor: windowBgColor || '#FFFFFF',
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
            backgroundSize: '20px 20px',
            height: windowSize.height - 50
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {components.map((component) => (
            <ContextMenu key={component.id}>
              <ContextMenuTrigger>
                <div
                  className={`absolute cursor-move select-none transition-all duration-150 ${
                    selectedComponent?.id === component.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg z-10' 
                      : 'hover:shadow-md z-0'
                  }`}
                  style={{
                    left: `${component.position.x}px`,
                    top: `${component.position.y}px`,
                    width: `${component.size.width}px`,
                    height: `${component.size.height}px`,
                  }}
                  onClick={(e) => handleComponentClick(e, component)}
                  onMouseDown={(e) => handleMouseDown(e, component)}
                >
                  <ComponentPreview component={component} />
                  {selectedComponent?.id === component.id && (
                    <>
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full -top-1.5 -left-1.5 cursor-nw-resize z-20 shadow-md hover:bg-blue-600 transition-colors border-2 border-white" data-direction="nw" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full -top-1.5 -right-1.5 cursor-ne-resize z-20 shadow-md hover:bg-blue-600 transition-colors border-2 border-white" data-direction="ne" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize z-20 shadow-md hover:bg-blue-600 transition-colors border-2 border-white" data-direction="sw" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full -bottom-1.5 -right-1.5 cursor-se-resize z-20 shadow-md hover:bg-blue-600 transition-colors border-2 border-white" data-direction="se" />
                    </>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl rounded-lg">
                <ContextMenuItem className="hover:bg-blue-50 focus:bg-blue-50">
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy</span>
                </ContextMenuItem>
                <ContextMenuItem className="hover:bg-orange-50 focus:bg-orange-50">
                  <Scissors className="mr-2 h-4 w-4" />
                  <span>Cut</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDeleteComponent} className="hover:bg-red-50 focus:bg-red-50 text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ComponentPreviewProps {
  component: Component;
}

const ComponentPreview = ({ component }: ComponentPreviewProps) => {
  switch (component.type) {
    case 'button':
      return (
        <div
          className="h-full w-full flex items-center justify-center rounded pointer-events-none font-medium"
          style={{
            backgroundColor: component.props?.bgColor || '#3b82f6',
            color: component.props?.fgColor || '#ffffff',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#2563eb'}`,
            borderRadius: `${component.props?.cornerRadius || 6}px`,
            fontFamily: component.props?.font || 'Inter, sans-serif',
            fontSize: `${component.props?.fontSize || 14}px`,
          }}
        >
          {component.props?.text || 'Button'}
        </div>
      );
    case 'label':
      return (
        <div
          className="h-full w-full flex items-center pointer-events-none"
          style={{
            color: component.props?.fgColor || '#374151',
            fontFamily: component.props?.font || 'Inter, sans-serif',
            fontSize: `${component.props?.fontSize || 14}px`,
            fontWeight: component.props?.fontWeight || 500,
          }}
        >
          {component.props?.text || 'Label'}
        </div>
      );
    case 'entry':
      return (
        <div
          className="h-full w-full flex items-center px-3 pointer-events-none"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#6b7280',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#d1d5db'}`,
            borderRadius: `${component.props?.cornerRadius || 6}px`,
            fontFamily: component.props?.font || 'Inter, sans-serif',
            fontSize: `${component.props?.fontSize || 14}px`,
          }}
        >
          {component.props?.placeholder || 'Enter text...'}
        </div>
      );
    case 'paragraph':
      return (
        <div
          className="h-full w-full p-3 overflow-auto pointer-events-none"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#374151',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#d1d5db'}`,
            borderRadius: `${component.props?.cornerRadius || 6}px`,
            fontFamily: component.props?.font || 'Inter, sans-serif',
            fontSize: `${component.props?.fontSize || 14}px`,
            lineHeight: component.props?.lineHeight || 1.5,
          }}
        >
          {component.props?.text || 'Paragraph text goes here.'}
        </div>
      );
    default:
      return (
        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded pointer-events-none bg-gray-50">
          <span className="text-gray-500 text-sm font-medium">{component.type}</span>
        </div>
      );
  }
};

export default Canvas;
