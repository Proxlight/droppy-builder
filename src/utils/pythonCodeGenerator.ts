
import { generateComponentCode } from './componentCodeGenerator';

/**
 * Generates the complete Python code for the application
 * @param components The list of components to include in the code
 * @param windowTitle The title for the application window
 */
export function generatePythonCode(components: any[], windowTitle = "My CustomTkinter Application"): string {
  // Initialize code with imports and class definition
  let code = `import customtkinter as ctk
from PIL import Image, ImageTk
import os
import sys
from pathlib import Path

# Try to import DateEntry for date picker components
try:
    from tkcalendar import DateEntry
except ImportError:
    DateEntry = None
    print("tkcalendar not installed. Date picker components will not work.")

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        # Set appearance mode and default color theme
        ctk.set_appearance_mode("system")  # Options: "light", "dark", "system"
        ctk.set_default_color_theme("blue")  # Options: "blue", "green", "dark-blue"

        # Configure window
        self.title("${windowTitle}")
        self.geometry("800x600")
        
        # Set background color to match the design
        self.configure(fg_color="#1A1A1A")

        # Create assets directory if it doesn't exist
        assets_dir = Path("assets")
        assets_dir.mkdir(exist_ok=True)

        # Store references to images to prevent garbage collection
        self._image_references = []
        
        # Create all widgets and components
        self.create_widgets()
        
    def create_widgets(self):
        """Create and place all widgets"""
`;

  // Process components and add widget creation code within the create_widgets method
  if (components && components.length > 0) {
    components.forEach(component => {
      // Only include visible components
      if (component.visible !== false) {
        // Generate code for this component and add it to the main code
        const componentCode = generateComponentCode(component, '        ');
        code += componentCode;
        code += '\n';
      }
    });
  } else {
    // Add a sample widget if no components are present
    code += `        # No components found - adding sample label
        self.sample_label = ctk.CTkLabel(
            self,
            text="Hello, CustomTkinter!",
            width=200,
            height=50,
            font=("Arial", 16)
        )
        self.sample_label.place(x=300, y=275)
`;
  }

  // Add the load_image method as a separate method in the class
  code += `
    def load_image(self, path, size):
        """Load an image, resize it and return as CTkImage"""
        try:
            # Handle path as string or Path object
            path_str = str(path)
            
            # Check if image file exists
            if os.path.exists(path_str):
                img = Image.open(path_str)
                img = img.resize(size, Image.LANCZOS if hasattr(Image, 'LANCZOS') else Image.ANTIALIAS)
                ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=size)
                self._image_references.append(ctk_img)  # Keep reference
                return ctk_img
            else:
                print(f"Image file not found: {path_str}")
                # Create a fallback colored rectangle
                img = Image.new('RGB', size, color='#3B82F6')  # Blue color as placeholder
                ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=size)
                self._image_references.append(ctk_img)
                return ctk_img
        except Exception as e:
            print(f"Error loading image '{path}': {e}")
            # Create a colored rectangle with error indication
            img = Image.new('RGB', size, color='#FF5555')  # Red color for error
            ctk_img = ctk.CTkImage(light_image=img, dark_image=img, size=size)
            self._image_references.append(ctk_img)
            return ctk_img

if __name__ == "__main__":
    try:
        app = App()
        app.mainloop()
    except Exception as e:
        print(f"Error running application: {e}")
        import traceback
        traceback.print_exc()
`;

  return code;
}
