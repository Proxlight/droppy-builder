
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
            console.log(`Adding image: ${fileName}`);
            // Extract the base64 content after the comma
            const base64Data = src.split(',')[1];
            if (base64Data && base64Data.length > 0) {
              // Clean and validate base64 content
              const cleanBase64 = base64Data.replace(/[^A-Za-z0-9+/]/g, '');
              
              // Ensure proper padding
              const padding = cleanBase64.length % 4;
              const paddedBase64 = padding ? cleanBase64 + '='.repeat(4 - padding) : cleanBase64;
              
              // Verify it's valid base64 and has reasonable length
              if (paddedBase64.length >= 4 && paddedBase64.length % 4 === 0) {
                try {
                  // Test if it's valid base64
                  const testDecode = atob(paddedBase64.substring(0, Math.min(100, paddedBase64.length)));
                  if (testDecode) {
                    assets.file(fileName, paddedBase64, { base64: true });
                    console.log(`Successfully added image: ${fileName}`);
                  } else {
                    throw new Error('Invalid base64 test decode');
                  }
                } catch (base64Error) {
                  console.error(`Invalid base64 data for ${fileName}:`, base64Error);
                  // Add placeholder instead of failing
                  assets.file(fileName, placeholderImageData, { base64: true });
                }
              } else {
                console.error(`Invalid base64 length for ${fileName}: ${paddedBase64.length}`);
                assets.file(fileName, placeholderImageData, { base64: true });
              }
            } else {
              console.error(`Empty base64 data for ${fileName}`);
              assets.file(fileName, placeholderImageData, { base64: true });
            }
          } else {
            console.log(`Skipping non-data URL: ${src}`);
          }
        } catch (err) {
          console.error(`Error processing image ${fileName}:`, err);
          // Add placeholder image instead of failing
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
    throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates the content for the README.md file
 * @param windowTitle The window title for the app
 */
function generateReadmeContent(windowTitle?: string): string {
  return `# ${windowTitle || "CustomTkinter GUI Application"}

This is a modern CustomTkinter GUI application generated with Buildfy Canvas.

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
- Responsive layout with grid system
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
- Check if all image files are in the correct locations
- Verify Python and PIL/Pillow versions are compatible
- If you see "load_image" related errors, the app structure has been corrected to properly handle this

### Image handling
The application is designed to handle missing images gracefully:
- If an image file is not found, a blue placeholder is displayed
- Image references are properly maintained to prevent garbage collection
- All images should be placed in the 'assets' folder

### Layout issues
- The application uses both place and grid layout managers
- Configure the window size in the App.__init__() method if needed
- For grid layout customization, modify the grid_columnconfigure and grid_rowconfigure settings

If you still encounter issues, please check the console output for detailed error messages.
`;
}

/**
 * Generates a simple placeholder PNG image
 * Returns a base64-encoded PNG image
 */
function generatePlaceholderImage(): string {
  // A minimal base64-encoded PNG image (a blue square)
  return 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAF3SURBVHhe7dAxAQAwDASh+je9+WsYD0LACQScgIATEHACAk5AwAkIOAEBJyDgBASc+7N3lY0dwGF4AkvQOLO8AY0rhcc4zPLs2TU77d21+xPIA8QD+fkB4oFkyzHngXggOSACyRLZcsx5IB5IDogvWVkiW445D8QDyQERSJbIlmPOA/FAckAEkiWy5ZjzQDyQHBCBZIlsOeY8EA8kB0QgWSJbjjkPxAPJARFIlsiWY84D8UByQASSJbLlmPNAPJAcEIFkiWw55jwQDyQHRCBZIluOOQ/EA8kBEUiWyJZjzgPxQHJABJIlsuWY80A8kBwQgWSJbDnmPBAPJAdEIFkiW445D8QDyQERSJbIlsOeY8EA8kB0QgWSJbDnmPBAPJAcEIFkiWy5ZjzQDyQHRCBZIlsOeY8EA8kBEUiWyJZDnmPBAPJAcEIFkiWy5ZjzQDyQHRCBZIlsOeY8EA8kBEUiWyJZjzgPxQArtpXaW3e+UawAAAABJRU5ErkJggg==';
}
