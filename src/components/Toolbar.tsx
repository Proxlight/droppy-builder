
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Undo2, 
  Redo2, 
  Code, 
  Layers, 
  Settings,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

interface ToolbarProps {
  components: any[];
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleCodePreview: () => void;
  onToggleLayers: () => void;
  onToggleWindowProperties: () => void;
  showCodePreview: boolean;
  showLayers: boolean;
  showWindowProperties: boolean;
}

export const Toolbar = ({
  components,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleCodePreview,
  onToggleLayers,
  onToggleWindowProperties,
  showCodePreview,
  showLayers,
  showWindowProperties
}: ToolbarProps) => {
  return (
    <div className="border-b bg-background p-2 flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1">
        <Button
          variant={showCodePreview ? "default" : "ghost"}
          size="sm"
          onClick={onToggleCodePreview}
        >
          <Code className="h-4 w-4" />
          Code
        </Button>
        <Button
          variant={showLayers ? "default" : "ghost"}
          size="sm"
          onClick={onToggleLayers}
        >
          <Layers className="h-4 w-4" />
          Layers
        </Button>
        <Button
          variant={showWindowProperties ? "default" : "ghost"}
          size="sm"
          onClick={onToggleWindowProperties}
        >
          <Settings className="h-4 w-4" />
          Window
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-sm text-muted-foreground">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </span>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        <Link to="/account">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
            Account
          </Button>
        </Link>
      </div>
    </div>
  );
};
