
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generatePythonCode } from './pythonCodeGenerator';
import { collectComponentImages } from './codeGeneratorUtils';

/**
 * Exports the project as a ZIP file containing Python code and required files
 * @param components The list of components to export
 * @param windowTitle Optional title for the application window
 */
export async function exportProject(components: any[], windowTitle?: string) {
  try {
    // Create a new JSZip instance
    const zip = new JSZip();
    
    // Generate Python code
    const pythonCode = generatePythonCode(components, windowTitle);
    
    // Add files to the zip
    zip.file("app.py", pythonCode);
    zip.file("requirements.txt", "customtkinter>=5.2.0\nPillow>=9.0.0\ntkcalendar>=1.6.1\n");
    zip.file("README.md", generateReadmeContent(windowTitle));
    
    // Create the assets directory
    const assets = zip.folder("assets");
    if (!assets) {
      throw new Error("Failed to create assets directory");
    }
    
    // Create a placeholder image and add it to assets
    const placeholderImageData = generatePlaceholderImage();
    assets.file("placeholder.png", placeholderImageData, {base64: true});
    
    // Collect images from components
    const componentImages = collectComponentImages(components);
    
    // Process and add images to the zip
    if (Object.keys(componentImages).length > 0) {
      console.log(`Processing ${Object.keys(componentImages).length} images`);
      
      for (const [src, fileName] of Object.entries(componentImages)) {
        try {
          // Make sure we're working with a valid data URL
          if (src && typeof src === 'string' && src.startsWith('data:')) {
            const commaIndex = src.indexOf(',');
            if (commaIndex > -1) {
              console.log(`Adding image: ${fileName}`);
              // Extract the base64 content after the comma
              const base64Data = src.substring(commaIndex + 1);
              
              // Validate base64 data
              if (base64Data && base64Data.length > 0 && base64Data.length % 4 === 0) {
                assets.file(fileName, base64Data, { base64: true });
              } else {
                console.error(`Invalid base64 data for ${fileName}: length=${base64Data.length}`);
                // Add placeholder instead
                assets.file(fileName, placeholderImageData, { base64: true });
              }
            } else {
              console.error(`Invalid data URL format for ${fileName}`);
              // Add placeholder instead
              assets.file(fileName, placeholderImageData, { base64: true });
            }
          } else {
            console.log(`Skipping non-data URL: ${src}`);
            // Add placeholder for non-data URLs
            assets.file(fileName, placeholderImageData, { base64: true });
          }
        } catch (err) {
          console.error(`Error processing image ${fileName}:`, err);
          // Add placeholder on error
          assets.file(fileName, placeholderImageData, { base64: true });
        }
      }
    } else {
      console.log("No images found to include in export");
    }
    
    // Generate the zip file
    const content = await zip.generateAsync({ 
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: 6
      }
    });
    
    // Save the zip file
    saveAs(content, "customtkinter-project.zip");
    console.log("Project export completed successfully");
  } catch (error) {
    console.error("Error exporting project:", error);
    throw error;
  }
}

/**
 * Generates the content for the README.md file
 * @param windowTitle The window title for the app
 */
function generateReadmeContent(windowTitle?: string): string {
  return `# ${windowTitle || "CustomTkinter GUI Application"}

This is a modern CustomTkinter GUI application generated with GUI Builder.

## Requirements
- Python 3.7 or later
- Packages listed in requirements.txt

## Installation
1. Install Python from https://www.python.org/downloads/
2. Install dependencies: 
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

## Running the application
\`\`\`
python app.py
\`\`\`

## Features
- Modern UI with system theme detection (adapts to your OS settings)
- Responsive layout with proper widget positioning
- Customizable components
- Cross-platform compatibility (Windows, macOS, Linux)

## Theme settings
This application uses CustomTkinter's system mode by default to match your operating system theme:
\`\`\`python
ctk.set_appearance_mode("system")
\`\`\`

You can also manually set it to "light" or "dark" by changing the above line.

## Troubleshooting
If your GUI doesn't load properly or shows a blank window:
- Make sure all required packages are installed correctly
- Check if all image files are in the correct locations (assets/ folder)
- Verify Python and PIL/Pillow versions are compatible
- If you see placement errors, check that widgets are using place() method correctly

### Image handling
The application is designed to handle missing images gracefully:
- If an image file is not found, a blue placeholder is displayed
- Image references are properly maintained to prevent garbage collection
- All images should be placed in the 'assets' folder

### Layout issues
- The application uses place() layout manager for precise positioning
- Configure the window size in the App.__init__() method if needed
- Widget dimensions are set in the constructor, not in place() method

If you still encounter issues, please check the console output for detailed error messages.
`;
}

/**
 * Generates a simple placeholder PNG image
 * Returns a base64-encoded PNG image
 */
function generatePlaceholderImage(): string {
  // A minimal base64-encoded PNG image (a blue square 200x200)
  return 'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMnSURBVHhe7doxAQAwCAOw+jcdLXBBOzBIkr3d3QW85j8ELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHKCBCwnSMByggQsJ0jAcoIELCdIwHL3A8lAAEgNAF3HAAAAAElFTkSuQmCC';
}
