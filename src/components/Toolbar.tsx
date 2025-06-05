
import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Code, Layers as LayersIcon, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarProps {
  components: any[];
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleCodePreview: () => void;
  onToggleLayers?: () => void;
  onToggleWindowProperties?: () => void;
  showCodePreview: boolean;
  showLayers?: boolean;
  showWindowProperties?: boolean;
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
  showLayers = false,
  showWindowProperties = false
}: ToolbarProps) => {
  return (
    <div className="h-12 border-b flex items-center px-4 gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Shift+Z)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-6 mx-2" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showCodePreview ? "default" : "ghost"}
              size="sm"
              onClick={onToggleCodePreview}
              className="gap-2 text-xs"
            >
              <Code size={16} />
              {!showCodePreview ? "Code" : "Hide Code"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle code preview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {onToggleLayers && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showLayers ? "default" : "ghost"}
                size="sm"
                onClick={onToggleLayers}
                className="gap-2 text-xs"
              >
                <LayersIcon size={16} />
                {!showLayers ? "Layers" : "Hide Layers"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle layers panel (Figma style)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onToggleWindowProperties && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showWindowProperties ? "default" : "ghost"}
                size="sm"
                onClick={onToggleWindowProperties}
                className="gap-2 text-xs"
              >
                <Settings size={16} />
                {!showWindowProperties ? "Window" : "Hide Window"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle window properties</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <div className="ml-auto text-xs text-muted-foreground">
        {components.length} components
      </div>
    </div>
  );
};
