import { useState, useRef, useEffect } from 'react';
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
  onAddComponent?: (component: Component) => Component; // Added this missing prop type
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
  windowBgColor = "#f0f0f0",
  setWindowTitle,
  onAddComponent
}: CanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(windowTitle || "");
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  const [clipboard, setClipboard] = useState<Component | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{x: number, y: number} | null>(null);
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  
  const [selectionBox, setSelectionBox] = useState<{start: {x: number, y: number}, end: {x: number, y: number}} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isMultiSelectKeyDown, setIsMultiSelectKeyDown] = useState(false);
  
  // Update titleInput when windowTitle changes
  useEffect(() => {
    setTitleInput(windowTitle || "");
  }, [windowTitle]);
  
  // Safety function to validate component before operations
  const isValidComponent = (component: Component | null): boolean => {
    if (!component) return false;
    if (!component.id) return false;
    return components.some(c => c.id === component.id);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsMultiSelectKeyDown(true);
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        
        if (selectedComponents.length > 1) {
          const newComponents = components.filter(c => !selectedComponents.includes(c.id));
          setComponents(newComponents);
          setSelectedComponents([]);
          setSelectedComponent(null);
          toast.success("Multiple components deleted");
        } else if (selectedComponent && isValidComponent(selectedComponent)) {
          handleDeleteComponent();
          setSelectedComponent(null);
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsMultiSelectKeyDown(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedComponent, selectedComponents, components, setComponents, setSelectedComponents, setSelectedComponent]);
  
  useEffect(() => {
    const imageComponents = components.filter(c => c.type === 'image');
    
    imageComponents.forEach(comp => {
      if (comp.props.src && !imageCache[comp.props.src] && comp.props.src.startsWith('data:')) {
        setImageCache(prev => ({
          ...prev,
          [comp.props.src]: comp.props.src
        }));
      }
    });
  }, [components, imageCache]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      if (!isMultiSelectKeyDown) {
        setSelectedComponent(null);
        setSelectedComponents([]);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setIsSelecting(true);
      setSelectionBox({
        start: { x: e.clientX - rect.left, y: e.clientY - rect.top },
        end: { x: e.clientX - rect.left, y: e.clientY - rect.top }
      });
      
      if (!isMultiSelectKeyDown) {
        setSelectedComponent(null);
        setSelectedComponents([]);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isSelecting && selectionBox && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionBox({
        ...selectionBox,
        end: { x: e.clientX - rect.left, y: e.clientY - rect.top }
      });
    }
    
    handleMouseMove(e);
  };

  const handleCanvasMouseUp = () => {
    if (isSelecting && selectionBox) {
      const x1 = Math.min(selectionBox.start.x, selectionBox.end.x);
      const y1 = Math.min(selectionBox.start.y, selectionBox.end.y);
      const x2 = Math.max(selectionBox.start.x, selectionBox.end.x);
      const y2 = Math.max(selectionBox.start.y, selectionBox.end.y);
      
      const selected = components.filter(component => {
        const cx1 = component.position.x;
        const cy1 = component.position.y;
        const cx2 = cx1 + component.size.width;
        const cy2 = cy1 + component.size.height;
        
        return !(cx2 < x1 || cx1 > x2 || cy2 < y1 || cy1 > y2);
      });
      
      if (selected.length > 0) {
        if (isMultiSelectKeyDown) {
          const newSelection = [
            ...selectedComponents,
            ...selected.map(c => c.id).filter(id => !selectedComponents.includes(id))
          ];
          setSelectedComponents(newSelection);
          
          if (newSelection.length === 1) {
            const selectedComp = components.find(c => c.id === newSelection[0]) || null;
            if (selectedComp) {
              setSelectedComponent(selectedComp);
            }
          } else if (newSelection.length > 1) {
            setSelectedComponent(null);
          }
        } else {
          setSelectedComponents(selected.map(c => c.id));
          if (selected.length === 1) {
            setSelectedComponent(selected[0]);
          } else if (selected.length > 1) {
            setSelectedComponent(null);
          }
        }
      }
    }
    
    setIsSelecting(false);
    setSelectionBox(null);
    handleMouseUp();
  };

  const handleContextMenu = (e: React.MouseEvent, component: Component) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Validate component exists before setting it as selected
      if (!isValidComponent(component)) {
        console.warn("Invalid component in context menu:", component?.id || "unknown");
        return;
      }
      
      setSelectedComponent(component);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
    } catch (error) {
      console.error("Error in context menu:", error);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, component: Component) => {
    try {
      e.stopPropagation();
      
      // First, validate the component exists in our components array
      if (!isValidComponent(component)) {
        console.warn("Attempted to select non-existent component:", component?.id || "unknown");
        return;
      }
      
      if (isMultiSelectKeyDown) {
        if (selectedComponents.includes(component.id)) {
          const newSelected = selectedComponents.filter(id => id !== component.id);
          setSelectedComponents(newSelected);
          if (newSelected.length === 1) {
            const selectedComp = components.find(c => c.id === newSelected[0]) || null;
            if (selectedComp) {
              setSelectedComponent(selectedComp);
            } else {
              setSelectedComponent(null);
            }
          } else {
            setSelectedComponent(null);
          }
        } else {
          const newSelected = [...selectedComponents, component.id];
          setSelectedComponents(newSelected);
          if (newSelected.length === 1) {
            setSelectedComponent(component);
          } else {
            setSelectedComponent(null);
          }
        }
      } else {
        setSelectedComponent(component);
        setSelectedComponents([component.id]);
      }
      
      const target = e.target as HTMLElement;
      if (target.classList.contains('resize-handle')) {
        setIsResizing(true);
        setResizeDirection(target.dataset.direction || null);
      } else {
        setIsDragging(true);
      }

      setDragStart({
        x: e.clientX - component.position.x,
        y: e.clientY - component.position.y
      });
    } catch (error) {
      console.error("Error in mouse down handler:", error);
      setSelectedComponent(null);
      setSelectedComponents([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedComponent || !isValidComponent(selectedComponent)) return;

    try {
      if (isDragging) {
        const newComponents = components.map(comp => {
          if (comp.id === selectedComponent.id) {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return comp;
            
            let newX = e.clientX - dragStart.x;
            let newY = e.clientY - dragStart.y;
            
            newX = Math.max(0, Math.min(newX, rect.width - comp.size.width));
            newY = Math.max(0, Math.min(newY, rect.height - comp.size.height));
            
            return {
              ...comp,
              position: {
                x: newX,
                y: newY
              }
            };
          }
          return comp;
        });
        setComponents(newComponents);
      } else if (isResizing && resizeDirection) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newComponents = components.map(comp => {
          if (comp.id === selectedComponent.id) {
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

            return {
              ...comp,
              size: newSize,
              position: newPosition
            };
          }
          return comp;
        });
        setComponents(newComponents);
      }
    } catch (error) {
      console.error("Error in mouse move handler:", error);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const handleComponentMouseEnter = (componentId: string) => {
    // Verify componentId exists in components array first
    if (components.some(c => c.id === componentId)) {
      setHoveredComponent(componentId);
    }
  };

  const handleComponentMouseLeave = () => {
    setHoveredComponent(null);
  };

  // Fixed to prevent null widgets during drag and drop
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const type = e.dataTransfer.getData('componentType');
      if (!type) {
        console.warn("Drop event missing component type");
        return;
      }
      
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Special handling for image uploads
      if (type === 'image' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageDrop(e.dataTransfer.files[0], x, y);
        return;
      }

      // Regular component creation with properly initialized props
      const newComponent: Component = {
        id: `${type}-${Date.now()}`,
        type,
        position: { x, y },
        size: getDefaultSize(type),
        props: getDefaultProps(type),
      };

      // Create a new array instead of modifying the existing one
      const updatedComponents = [...components, newComponent];
      setComponents(updatedComponents);
      
      toast.success(`${type} component added to canvas`);
    } catch (error) {
      console.error("Error in drop handler:", error);
      toast.error("Failed to add component");
    }
  };

  // Handle image file uploads directly
  const handleImageDrop = (file: File, x: number, y: number) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      toast.error("Only image files are allowed");
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imageResult = e.target?.result as string;
        if (!imageResult) {
          toast.error("Failed to load image");
          return;
        }
        
        const fileName = file.name || "Uploaded Image";
        
        const newComponent: Component = {
          id: `image-${Date.now()}`,
          type: 'image',
          position: { x, y },
          size: getDefaultSize('image'),
          props: {
            ...getDefaultProps('image'),
            src: imageResult,
            fileName: fileName,
            alt: fileName
          },
        };
        
        setImageCache(prev => ({
          ...prev,
          [imageResult]: imageResult
        }));
        
        // Create a new array instead of modifying the existing one
        const updatedComponents = [...components, newComponent];
        setComponents(updatedComponents);
        
        toast.success(`Image "${fileName}" added to canvas`);
      } catch (error) {
        console.error("Error processing image file:", error);
        toast.error("Failed to process image file");
      }
    };
    
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    
    reader.readAsDataURL(file);
  };

  const handleCopyComponent = () => {
    try {
      if (selectedComponent && isValidComponent(selectedComponent)) {
        setClipboard({...selectedComponent});
        toast.success("Component copied to clipboard");
      }
    } catch (error) {
      console.error("Error copying component:", error);
    }
  };

  const handleCutComponent = () => {
    try {
      if (selectedComponent && isValidComponent(selectedComponent)) {
        setClipboard({...selectedComponent});
        handleDeleteComponent();
        toast.success("Component cut to clipboard");
      }
    } catch (error) {
      console.error("Error cutting component:", error);
    }
  };

  const handlePasteComponent = (e: React.MouseEvent | null) => {
    try {
      if (clipboard) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        let x, y;
        if (e) {
          x = e.clientX - rect.left;
          y = e.clientY - rect.top;
        } else {
          x = clipboard.position.x + 20;
          y = clipboard.position.y + 20;
        }

        const newComponent: Component = {
          ...clipboard,
          id: `${clipboard.type}-${Date.now()}`,
          position: { x, y }
        };

        setComponents([...components, newComponent]);
        toast.success("Component pasted from clipboard");
      }
    } catch (error) {
      console.error("Error pasting component:", error);
    }
  };

  const handleDeleteComponent = () => {
    try {
      if (selectedComponents.length > 1) {
        // Validate all components exist before deletion
        const validComponentIds = selectedComponents.filter(id => 
          components.some(c => c.id === id)
        );
        
        const newComponents = components.filter(comp => !validComponentIds.includes(comp.id));
        setComponents(newComponents);
        setSelectedComponents([]);
        setSelectedComponent(null);
        toast.success("Components deleted");
      } else if (selectedComponent && isValidComponent(selectedComponent)) {
        if (onDeleteComponent) {
          onDeleteComponent(selectedComponent);
        } else {
          const newComponents = components.filter(comp => comp.id !== selectedComponent.id);
          setComponents(newComponents);
          setSelectedComponent(null);
          toast.success("Component deleted");
        }
      }
    } catch (error) {
      console.error("Error deleting component:", error);
      // In case of error, reset selections to be safe
      setSelectedComponent(null);
      setSelectedComponents([]);
    }
  };

  // Handle double-click on title to enter edit mode
  const handleTitleDoubleClick = () => {
    if (!isEditingTitle) {
      setIsEditingTitle(true);
      setTitleInput(windowTitle || "");
    }
  };

  // Handle input changes for title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleInput(e.target.value);
  };

  // Handle saving title when done editing
  const handleTitleSave = () => {
    if (setWindowTitle && titleInput.trim()) {
      setWindowTitle(titleInput.trim());
      // Also update document title
      document.title = titleInput.trim();
      toast.success("Window title updated");
    }
    setIsEditingTitle(false);
  };

  // Handle Enter key press to save title
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(windowTitle || "");
    }
  };

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
      case 'textbox':
        return { width: 300, height: 150 };
      default:
        return { width: 120, height: 40 };
    }
  };

  const getDefaultProps = (type: string) => {
    // Base font properties to share across components
    const fontProps = {
      font: 'Arial',
      fontSize: 12,
      fontWeight: 'normal',
      fontStyle: 'normal',
    };
    
    // Common border properties
    const borderProps = {
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
    };
    
    // Common color properties
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
          hoverColor: '#f0f0f0',
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
          text: 'Paragraph text goes here. Double-click to edit.',
          ...colorProps,
          ...fontProps,
          ...borderProps,
          padding: 10,
          lineHeight: 1.5
        };
      case 'textbox':
        return {
          text: '',
          ...colorProps,
          ...fontProps,
          ...borderProps,
          padding: 8,
          multiline: true,
          placeholder: 'Enter text here...'
        };
      case 'image':
        return { 
          src: '',
          fit: 'contain',
          ...borderProps,
          fileName: 'placeholder.png',
          alt: 'Image'
        };
      case 'slider':
        return { 
          from: 0,
          to: 100,
          value: 50,
          orient: 'horizontal',
          bgColor: '#e2e8f0',
          progressColor: '#3b82f6',
          borderWidth: 0
        };
      case 'frame':
        return { 
          relief: 'flat',
          ...borderProps,
          ...colorProps,
          ...fontProps,
        };
      case 'checkbox':
        return { 
          text: 'Checkbox',
          checked: false,
          fgColor: '#000000',
          borderColor: '#e2e8f0',
          checkedColor: '#3b82f6',
          ...fontProps,
        };
      case 'datepicker':
        return { 
          format: 'yyyy-mm-dd',
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
      case 'progressbar':
        return { 
          value: 50,
          maxValue: 100,
          progressColor: '#3b82f6',
          bgColor: '#e2e8f0',
          cornerRadius: 4,
          borderWidth: 0,
          ...fontProps,
        };
      case 'notebook':
        return { 
          tabs: 'Tab 1,Tab 2,Tab 3',
          selectedTab: 'Tab 1',
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
      case 'listbox':
        return { 
          items: 'Item 1,Item 2,Item 3,Item 4,Item 5',
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
      case 'canvas':
        return { 
          bgColor: '#ffffff',
          ...borderProps,
          ...fontProps,
        };
      default:
        return {
          ...colorProps,
          ...fontProps,
          ...borderProps,
        };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedComponent && isValidComponent(selectedComponent) || selectedComponents.length > 0) {
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
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
          handlePasteComponent(null);
          e.preventDefault();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedComponents, clipboard, components]);

  return (
    <div className="w-full h-full p-8 flex items-center justify-center">
      <div 
        className="macos-window light flex flex-col"
        style={{ 
          width: windowSize.width, 
          height: windowSize.height,
          backgroundColor: windowBgColor || '#f0f0f0',
        }}
      >
        <div className="window-titlebar">
          <div className="window-buttons">
            <div className="window-button window-close">
              <X size={8} className="text-red-800" />
            </div>
            <div className="window-button window-minimize">
              <Minimize2 size={8} className="text-yellow-800" />
            </div>
            <div className="window-button window-maximize">
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
                className="w-48 mx-auto h-6 text-sm text-center bg-transparent"
                autoFocus
              />
            ) : (
              <div className="cursor-pointer">
                {windowTitle}
              </div>
            )}
          </div>
        </div>

        <div
          ref={canvasRef}
          className={`flex-1 canvas-grid relative overflow-auto`}
          style={{ backgroundColor: windowBgColor || '#f0f0f0' }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onClick={handleCanvasClick}
          onContextMenu={(e) => {
            e.preventDefault();
            if (e.target === canvasRef.current) {
              if (clipboard) {
                handlePasteComponent(e);
              }
            }
          }}
          tabIndex={0}
        >
          {isSelecting && selectionBox && (
            <div 
              className="absolute border border-primary bg-primary/10 pointer-events-none"
              style={{
                left: Math.min(selectionBox.start.x, selectionBox.end.x),
                top: Math.min(selectionBox.start.y, selectionBox.end.y),
                width: Math.abs(selectionBox.end.x - selectionBox.start.x),
                height: Math.abs(selectionBox.end.y - selectionBox.start.y),
              }}
            />
          )}
          
          {components.map((component) => (
            <ContextMenu key={component.id}>
              <ContextMenuTrigger>
                <div
                  className={`absolute component-preview cursor-move ${
                    selectedComponent?.id === component.id ? 'ring-2 ring-primary ring-offset-2' : 
                    selectedComponents.includes(component.id) ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                  }`}
                  style={{
                    left: `${component.position.x}px`,
                    top: `${component.position.y}px`,
                    width: `${component.size.width}px`,
                    height: `${component.size.height}px`,
                    transform: 'translate(0, 0)',
                    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease',
                    willChange: 'transform, left, top, width, height',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, component)}
                  onContextMenu={(e) => handleContextMenu(e, component)}
                  onMouseEnter={() => handleComponentMouseEnter(component.id)}
                  onMouseLeave={handleComponentMouseLeave}
                >
                  <ComponentPreview 
                    component={component} 
                    isHovered={hoveredComponent === component.id}
                  />
                  {selectedComponent?.id === component.id && (
                    <>
                      <div className="resize-handle absolute w-2 h-2 bg-primary rounded-full top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize" data-direction="nw" />
                      <div className="resize-handle absolute w-2 h-2 bg-primary rounded-full top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize" data-direction="ne" />
                      <div className="resize-handle absolute w-2 h-2 bg-primary rounded-full bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize" data-direction="sw" />
                      <div className="resize-handle absolute w-2 h-2 bg-primary rounded-full bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-se-resize" data-direction="se" />
                    </>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={handleCopyComponent}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleCutComponent}>
                  <Scissors className="mr-2 h-4 w-4" />
                  <span>Cut</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={handleDeleteComponent}>
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
  isHovered: boolean;
}

const ComponentPreview = ({ component, isHovered }: ComponentPreviewProps) => {
  // Render different component types
  switch (component.type) {
    case 'button':
      return (
        <div
          className="h-full w-full flex items-center justify-center rounded"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          {component.props?.text || 'Button'}
        </div>
      );
    case 'label':
      return (
        <div
          className="h-full w-full flex items-center"
          style={{
            color: component.props?.fgColor || '#000000',
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          {component.props?.text || 'Label'}
        </div>
      );
    case 'entry':
      return (
        <div
          className="h-full w-full flex items-center px-2"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          {component.props?.placeholder || 'Enter text...'}
        </div>
      );
    case 'image':
      return (
        <div 
          className="h-full w-full flex items-center justify-center"
          style={{
            backgroundColor: '#f3f4f6',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            overflow: 'hidden',
          }}
        >
          {component.props?.src ? (
            <img 
              src={component.props.src} 
              alt={component.props?.alt || 'Image'} 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-400">Image Placeholder</div>
          )}
        </div>
      );
    case 'paragraph':
      return (
        <div
          className="h-full w-full p-2 overflow-auto"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
            lineHeight: component.props?.lineHeight || 1.5,
            padding: `${component.props?.padding || 10}px`,
            whiteSpace: 'pre-wrap',
          }}
        >
          {component.props?.text || 'Paragraph text goes here.'}
        </div>
      );
    case 'textbox':
      return (
        <div
          className="h-full w-full border p-2"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
            padding: `${component.props?.padding || 8}px`,
          }}
        >
          {component.props?.text || component.props?.placeholder || 'Enter text here...'}
        </div>
      );
    case 'slider':
      return (
        <div 
          className="h-full w-full flex items-center"
          style={{
            padding: '0 6px',
          }}
        >
          <div 
            className="w-full h-2 rounded-full relative"
            style={{
              backgroundColor: component.props?.bgColor || '#e2e8f0',
            }}
          >
            <div 
              className="absolute h-full rounded-full"
              style={{
                backgroundColor: component.props?.progressColor || '#3b82f6',
                width: `${component.props?.value || 50}%`,
              }}
            />
            <div 
              className="absolute h-4 w-4 rounded-full bg-white shadow-md top-1/2 -mt-2"
              style={{
                left: `calc(${component.props?.value || 50}% - 8px)`,
                borderWidth: 1,
                borderColor: '#cbd5e1',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      );
    case 'checkbox':
      return (
        <div
          className="h-full w-full flex items-center gap-2"
          style={{
            color: component.props?.fgColor || '#000000',
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          <div
            className="w-4 h-4 border flex items-center justify-center"
            style={{
              backgroundColor: component.props?.checked ? (component.props?.checkedColor || '#3b82f6') : 'transparent',
              borderColor: component.props?.borderColor || '#e2e8f0',
              borderWidth: 1,
              borderRadius: 3,
            }}
          >
            {component.props?.checked && (
              <div className="text-white font-bold text-xs">✓</div>
            )}
          </div>
          {component.props?.text || 'Checkbox'}
        </div>
      );
    case 'frame':
      return (
        <div
          className="h-full w-full"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
          }}
        >
          {isHovered && (
            <div className="text-xs text-center text-gray-500 mt-1">Frame</div>
          )}
        </div>
      );
    case 'notebook':
      return (
        <div
          className="h-full w-full flex flex-col"
          style={{
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            overflow: 'hidden',
          }}
        >
          <div className="flex border-b bg-gray-100">
            {(component.props?.tabs || 'Tab 1,Tab 2,Tab 3').split(',').map((tab, index) => (
              <div 
                key={index}
                className={`px-4 py-1 ${index === 0 ? 'bg-white' : ''} text-sm`}
                style={{
                  fontFamily: component.props?.font || 'Arial',
                  fontSize: `${component.props?.fontSize || 12}px`,
                  fontWeight: component.props?.fontWeight || 'normal',
                  fontStyle: component.props?.fontStyle || 'normal',
                }}
              >
                {tab.trim()}
              </div>
            ))}
          </div>
          <div
            className="flex-1"
            style={{
              backgroundColor: component.props?.bgColor || '#ffffff',
            }}
          >
            {isHovered && (
              <div className="text-xs text-center text-gray-500 mt-2">Selected Tab Content</div>
            )}
          </div>
        </div>
      );
    case 'listbox':
      return (
        <div
          className="h-full w-full overflow-auto"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          {(component.props?.items || 'Item 1,Item 2,Item 3,Item 4,Item 5').split(',').map((item, index) => (
            <div
              key={index}
              className="px-2 py-1 hover:bg-gray-100"
              style={{
                color: component.props?.fgColor || '#000000',
              }}
            >
              {item.trim()}
            </div>
          ))}
        </div>
      );
    case 'progressbar':
      return (
        <div className="h-full w-full flex items-center">
          <div 
            className="w-full h-4 relative"
            style={{
              backgroundColor: component.props?.bgColor || '#e2e8f0',
              borderRadius: `${component.props?.cornerRadius || 4}px`,
              border: component.props?.borderWidth ? `${component.props.borderWidth}px solid ${component.props?.borderColor || '#e2e8f0'}` : 'none',
            }}
          >
            <div 
              className="absolute h-full"
              style={{
                backgroundColor: component.props?.progressColor || '#3b82f6',
                width: `${component.props?.value || 50}%`,
                borderRadius: `${component.props?.cornerRadius || 4}px`,
              }}
            />
          </div>
        </div>
      );
    case 'datepicker':
      return (
        <div
          className="h-full w-full flex items-center px-2"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            color: component.props?.fgColor || '#000000',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
            borderRadius: `${component.props?.cornerRadius || 8}px`,
            fontFamily: component.props?.font || 'Arial',
            fontSize: `${component.props?.fontSize || 12}px`,
            fontWeight: component.props?.fontWeight || 'normal',
            fontStyle: component.props?.fontStyle || 'normal',
          }}
        >
          {component.props?.format || 'yyyy-mm-dd'}
        </div>
      );
    case 'canvas':
      return (
        <div 
          className="h-full w-full"
          style={{
            backgroundColor: component.props?.bgColor || '#ffffff',
            border: `${component.props?.borderWidth || 1}px solid ${component.props?.borderColor || '#e2e8f0'}`,
          }}
        >
          {isHovered && (
            <div className="text-xs text-center text-gray-500 mt-1">Canvas</div>
          )}
        </div>
      );
    default:
      return (
        <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300">
          <span className="text-gray-500">{component.type}</span>
        </div>
      );
  }
};

export default Canvas;
