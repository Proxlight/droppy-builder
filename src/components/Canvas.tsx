
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
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(windowTitle || "");
  const [clipboard, setClipboard] = useState<Component | null>(null);
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

    const x = Math.max(0, e.clientX - rect.left - 60);
    const y = Math.max(0, e.clientY - rect.top - 20);

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
    toast.success(`${type} component added`, {
      duration: 2000,
      className: "bg-green-50 border-green-200 text-green-800",
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

          return { ...comp, size: newSize, position: newPosition };
        }
        return comp;
      });
      setComponents(updatedComponents);
    }
  }, [isDragging, isResizing, draggedComponent, dragStart, components, setComponents, resizeDirection, windowSize]);

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
        toast.success("Component deleted", {
          duration: 2000,
          className: "bg-red-50 border-red-200 text-red-800",
        });
      }
    }
  }, [selectedComponent, onDeleteComponent, components, setComponents, setSelectedComponent, setSelectedComponents]);

  const handleCopyComponent = useCallback(() => {
    if (selectedComponent) {
      setClipboard({...selectedComponent});
      toast.success("Component copied", {
        duration: 2000,
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    }
  }, [selectedComponent]);

  const handleCutComponent = useCallback(() => {
    if (selectedComponent) {
      setClipboard({...selectedComponent});
      handleDeleteComponent();
      toast.success("Component cut", {
        duration: 2000,
        className: "bg-orange-50 border-orange-200 text-orange-800",
      });
    }
  }, [selectedComponent, handleDeleteComponent]);

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
      toast.success("Window title updated", {
        duration: 2000,
        className: "bg-green-50 border-green-200 text-green-800",
      });
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
      if (selectedComponent) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
          e.preventDefault();
          handleDeleteComponent();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          handleCopyComponent();
          e.preventDefault();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
          handleCutComponent();
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, handleDeleteComponent, handleCopyComponent, handleCutComponent]);

  const getDefaultSize = (type: string) => {
    switch (type) {
      case 'button':
        return { width: 120, height: 40 };
      case 'label':
        return { width: 200, height: 30 };
      case 'entry':
        return { width: 200, height: 40 };
      case 'image':
        return { width: 200, height: 200 };
      case 'slider':
        return { width: 200, height: 30 };
      case 'frame':
        return { width: 300, height: 200 };
      case 'checkbox':
        return { width: 120, height: 30 };
      case 'datepicker':
        return { width: 200, height: 40 };
      case 'progressbar':
        return { width: 200, height: 30 };
      case 'notebook':
        return { width: 400, height: 300 };
      case 'listbox':
        return { width: 200, height: 200 };
      case 'canvas':
        return { width: 300, height: 200 };
      case 'paragraph':
        return { width: 300, height: 150 };
      default:
        return { width: 120, height: 40 };
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
        return { 
          text: 'Button', 
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
      case 'label':
        return { 
          text: 'Label', 
          ...fontProps,
          fgColor: '#000000',
        };
      case 'entry':
        return { 
          placeholder: 'Enter text...',
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
      case 'paragraph':
        return {
          text: 'Paragraph text goes here.',
          ...colorProps,
          ...fontProps,
          ...borderProps,
          padding: 10,
          lineHeight: 1.5
        };
      default:
        return {
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
    }
  };

  return (
    <div className="w-full h-full p-8 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div 
        className="macos-window shadow-2xl rounded-xl overflow-hidden backdrop-blur-sm border border-white/20"
        style={{ 
          width: windowSize.width, 
          height: windowSize.height,
          backgroundColor: windowBgColor || '#FFFFFF',
        }}
      >
        <div className="window-titlebar bg-white/90 backdrop-blur-md border-b border-gray-200/50">
          <div className="window-buttons">
            <div className="window-button window-close hover:bg-red-600 transition-colors">
              <X size={8} className="text-red-800" />
            </div>
            <div className="window-button window-minimize hover:bg-yellow-600 transition-colors">
              <Minimize2 size={8} className="text-yellow-800" />
            </div>
            <div className="window-button window-maximize hover:bg-green-600 transition-colors">
              <Maximize2 size={8} className="text-green-800" />
            </div>
          </div>
          <div className="window-title" onDoubleClick={handleTitleDoubleClick}>
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
              <div className="cursor-pointer font-medium text-gray-700">
                {windowTitle}
              </div>
            )}
          </div>
        </div>

        <div
          ref={canvasRef}
          className="flex-1 canvas-grid relative overflow-hidden rounded-b-xl"
          style={{ backgroundColor: windowBgColor || '#FFFFFF' }}
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
                  className={`absolute component-preview cursor-move select-none transition-all duration-150 ${
                    selectedComponent?.id === component.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' 
                      : 'hover:shadow-md'
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
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize z-10 shadow-md hover:bg-blue-600 transition-colors" data-direction="nw" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize z-10 shadow-md hover:bg-blue-600 transition-colors" data-direction="ne" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize z-10 shadow-md hover:bg-blue-600 transition-colors" data-direction="sw" />
                      <div className="resize-handle absolute w-3 h-3 bg-blue-500 rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize z-10 shadow-md hover:bg-blue-600 transition-colors" data-direction="se" />
                    </>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-xl">
                <ContextMenuItem onClick={handleCopyComponent} className="hover:bg-blue-50">
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleCutComponent} className="hover:bg-orange-50">
                  <Scissors className="mr-2 h-4 w-4" />
                  <span>Cut</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDeleteComponent} className="hover:bg-red-50 text-red-600">
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
          className="h-full w-full flex items-center justify-center rounded pointer-events-none"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
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
            color: component.props?.fgColor || '#000000',
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
          }}
        >
          {component.props?.text || 'Label'}
        </div>
      );
    case 'entry':
      return (
        <div
          className="h-full w-full flex items-center px-2 pointer-events-none"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
          }}
        >
          {component.props?.placeholder || 'Enter text...'}
        </div>
      );
    case 'paragraph':
      return (
        <div
          className="h-full w-full p-2 overflow-auto pointer-events-none"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            lineHeight: component.props?.lineHeight || 1.5,
            padding: `${component.props?.padding || 10}px`,
          }}
        >
          {component.props?.text || 'Paragraph text goes here.'}
        </div>
      );
    default:
      return (
        <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 pointer-events-none">
          <span className="text-gray-500">{component.type}</span>
        </div>
      );
  }
};

export default Canvas;
