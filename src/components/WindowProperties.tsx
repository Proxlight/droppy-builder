
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ColorInput } from "@/components/ColorInput";
import { toast } from 'sonner';

interface WindowPropertiesProps {
  visible: boolean;
  title: string;
  setTitle: (title: string) => void;
  size: { width: number; height: number };
  setSize: (size: { width: number; height: number }) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
}

export const WindowProperties: React.FC<WindowPropertiesProps> = ({
  visible,
  title,
  setTitle,
  size,
  setSize,
  bgColor,
  setBgColor
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localWidth, setLocalWidth] = useState(size.width.toString());
  const [localHeight, setLocalHeight] = useState(size.height.toString());
  const [localBgColor, setLocalBgColor] = useState(bgColor);

  useEffect(() => {
    setLocalTitle(title);
    setLocalWidth(size.width.toString());
    setLocalHeight(size.height.toString());
    setLocalBgColor(bgColor);
  }, [title, size, bgColor]);

  const handleApply = () => {
    const width = parseInt(localWidth);
    const height = parseInt(localHeight);
    
    if (isNaN(width) || isNaN(height) || width < 100 || height < 100) {
      toast.error("Invalid dimensions. Width and height must be at least 100px.");
      return;
    }
    
    setTitle(localTitle);
    // Also update document title
    document.title = localTitle;
    setSize({ width, height });
    setBgColor(localBgColor);
    toast.success("Window properties updated");
  };

  if (!visible) return null;

  return (
    <div className="h-full overflow-auto bg-background p-4">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-semibold mb-4">Window Properties</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Customize the appearance of your application window
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="window-title">Window Title</Label>
          <Input
            id="window-title"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            placeholder="Application Title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="window-width">Width (px)</Label>
            <Input
              id="window-width"
              value={localWidth}
              onChange={(e) => setLocalWidth(e.target.value)}
              type="number"
              min="100"
              step="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="window-height">Height (px)</Label>
            <Input
              id="window-height"
              value={localHeight}
              onChange={(e) => setLocalHeight(e.target.value)}
              type="number"
              min="100"
              step="10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Window Size Presets</Label>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLocalWidth("640");
                setLocalHeight("480");
              }}
            >
              640×480
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLocalWidth("800");
                setLocalHeight("600");
              }}
            >
              800×600
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLocalWidth("1024");
                setLocalHeight("768");
              }}
            >
              1024×768
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLocalWidth("1280");
                setLocalHeight("720");
              }}
            >
              1280×720
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="window-bg">Background Color</Label>
          <ColorInput
            value={localBgColor}
            onChange={setLocalBgColor}
            label="Background Color"
          />
        </div>

        <Button 
          className="w-full mt-4" 
          onClick={handleApply}
        >
          Apply Changes
        </Button>
      </div>
    </div>
  );
};
