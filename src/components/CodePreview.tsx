
import React, { useState, useEffect } from 'react';
import { generatePythonCode, exportProject } from '@/utils/codeGenerator';
import Prism from 'prismjs';
import { Button } from '@/components/ui/button';
import { Copy, Download, Code, File } from 'lucide-react';
import { toast } from 'sonner';
import { CustomTkinterGuide } from './CustomTkinterGuide';

interface CodePreviewProps {
  components: any[];
  visible: boolean;
  windowTitle?: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ components, visible, windowTitle = "My CustomTkinter Application" }) => {
  const [code, setCode] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [codeTab, setCodeTab] = useState<'preview' | 'requirements' | 'readme'>('preview');

  useEffect(() => {
    if (visible) {
      // Generate code for components, ensuring they have properly initialized props
      const preparedComponents = components.map(component => {
        // Make a deep copy to avoid modifying the original component
        const componentCopy = JSON.parse(JSON.stringify(component));
        
        // Ensure props exists
        if (!componentCopy.props) {
          componentCopy.props = {};
        }
        
        // Ensure fileName property exists for images with data URLs
        if (componentCopy.props.src && componentCopy.props.src.startsWith('data:')) {
          if (!componentCopy.props.fileName) {
            componentCopy.props.fileName = `image-${componentCopy.id}-${Date.now()}.png`;
          }
        }
        
        return componentCopy;
      });
      
      const pythonCode = generatePythonCode(preparedComponents, windowTitle);
      setCode(pythonCode);
    }
  }, [components, visible, windowTitle]);

  useEffect(() => {
    if (visible) {
      Prism.highlightAll();
    }
  }, [code, visible, codeTab]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.info("Preparing project for export...");
      
      // Properly prepare components for export with fileName for images
      const preparedComponents = components.map(component => {
        // Make a deep copy to avoid modifying the original
        const componentCopy = JSON.parse(JSON.stringify(component));
        
        // Ensure props exists
        if (!componentCopy.props) {
          componentCopy.props = {};
        }
        
        // Set fileName property for images with data URLs
        if (componentCopy.props.src && componentCopy.props.src.startsWith('data:')) {
          if (!componentCopy.props.fileName) {
            componentCopy.props.fileName = `image-${componentCopy.id}-${Date.now()}.png`;
          }
        }
        
        return componentCopy;
      });
      
      console.log("Starting project export with prepared components:", preparedComponents.length);
      await exportProject(preparedComponents, windowTitle);
      toast.success("Project exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const requirementsCode = `customtkinter>=5.2.0
Pillow>=9.0.0
tkcalendar>=1.6.1
`;

  const readmeCode = `# CustomTkinter GUI Application

This is a modern CustomTkinter GUI application generated with GUI Builder.

## Requirements
- Python 3.7 or later
- Packages listed in requirements.txt

## Installation
1. Install Python from https://www.python.org/downloads/
2. Install dependencies: \`pip install -r requirements.txt\`

## Running the application
\`\`\`
python app.py
\`\`\`

## Features
- Modern UI with CustomTkinter
- Responsive layout
- Customizable components
- Cross-platform compatibility (Windows, macOS, Linux)

## Troubleshooting
If you encounter errors:
1. Make sure you have the correct version of CustomTkinter installed (5.2.0+)
2. Check that all required packages are installed
3. Verify Python version is 3.7 or later
4. For layout issues, adjust the window size or component placement
5. If you see "width and height arguments must be passed to the constructor" error, make sure to pass width and height in the constructor, not in place()
6. If you see "load_image" error, make sure the load_image method is defined in your app class

## Reference
For more information on CustomTkinter API:
- [CustomTkinter Documentation](https://customtkinter.tomschimansky.com/documentation/)
- [GitHub Repository](https://github.com/TomSchimansky/CustomTkinter)
`;

  if (!visible) {
    return null;
  }

  return (
    <div className="h-full overflow-auto bg-background p-4">
      <div className="mb-4 bg-muted p-4 rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Generated Python Code (CustomTkinter)</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="flex items-center gap-1"
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "Export Project"}</span>
            </Button>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4 border-b">
          <Button 
            variant={codeTab === 'preview' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setCodeTab('preview')}
            className="flex items-center gap-1 rounded-b-none"
          >
            <Code className="h-4 w-4" />
            <span>app.py</span>
          </Button>
          <Button 
            variant={codeTab === 'requirements' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setCodeTab('requirements')}
            className="flex items-center gap-1 rounded-b-none"
          >
            <File className="h-4 w-4" />
            <span>requirements.txt</span>
          </Button>
          <Button 
            variant={codeTab === 'readme' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setCodeTab('readme')}
            className="flex items-center gap-1 rounded-b-none"
          >
            <File className="h-4 w-4" />
            <span>README.md</span>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          {codeTab === 'preview' && "This code creates a CustomTkinter application with all your designed components."}
          {codeTab === 'requirements' && "Required packages to run the application."}
          {codeTab === 'readme' && "Documentation and troubleshooting for your project."}
        </p>
        
        <div className="relative">
          <pre className="overflow-x-auto rounded-md bg-[#282c34] p-4">
            <code className={`language-${codeTab === 'preview' ? 'python' : codeTab === 'readme' ? 'markdown' : 'bash'}`}>
              {codeTab === 'preview' 
                ? code 
                : codeTab === 'requirements' 
                  ? requirementsCode 
                  : readmeCode}
            </code>
          </pre>
        </div>
      </div>
      
      <CustomTkinterGuide />
      
      <div className="text-sm text-muted-foreground mt-6">
        <h3 className="font-medium text-foreground mb-2">Usage Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Export the project using the button above</li>
          <li>Extract the downloaded ZIP file</li>
          <li>Install the required dependencies with <code className="bg-muted-foreground/20 px-1 rounded">pip install -r requirements.txt</code></li>
          <li>Run the application with <code className="bg-muted-foreground/20 px-1 rounded">python app.py</code></li>
        </ol>
      </div>
    </div>
  );
};
