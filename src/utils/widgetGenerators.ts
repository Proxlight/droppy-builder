import { adjustColorBrightness, generateGridCode } from './codeGeneratorUtils';

/**
 * Generates code for a specific widget type
 * @param type The widget type
 * @param safeId The sanitized component ID
 * @param props The component properties
 * @param indent The indentation string to use
 */
export function generateWidgetCode(type: string, safeId: string, props: any, indent: string): string {
  // Skip hidden components
  if (props.visible === false) {
    return `${indent}# Component ${safeId} is hidden\n`;
  }
  
  // Normalize the type to lowercase for case-insensitive matching
  const normalizedType = type.toLowerCase();
  
  // Map component types to their generator functions
  switch (normalizedType) {
    case 'ctklabel':
    case 'label':
      return generateLabelCode(safeId, props, indent);
    case 'ctkbutton':
    case 'button':
      return generateButtonCode(safeId, props, indent);
    case 'ctkentry':
    case 'entry':
    case 'textfield':
      return generateEntryCode(safeId, props, indent);
    case 'ctktextbox':
    case 'textbox':
    case 'textarea':
      return generateTextboxCode(safeId, props, indent);
    case 'ctkslider':
    case 'slider':
      return generateSliderCode(safeId, props, indent);
    case 'ctkswitch':
    case 'switch':
    case 'toggle':
      return generateSwitchCode(safeId, props, indent);
    case 'ctkprogressbar':
    case 'progressbar':
      return generateProgressBarCode(safeId, props, indent);
    case 'paragraph':
    case 'text':
      return generateParagraphCode(safeId, props, indent);
    case 'frame':
    case 'container':
      return generateFrameCode(safeId, props, indent);
    case 'checkbox':
    case 'ctkcheckbox':
      return generateCheckboxCode(safeId, props, indent);
    case 'image':
    case 'picture':
      return generateImageCode(safeId, props, indent);
    case 'notebook':
    case 'tabs':
    case 'tabview':
      return generateNotebookCode(safeId, props, indent);
    case 'listbox':
    case 'list':
      return generateListboxCode(safeId, props, indent);
    case 'canvas':
    case 'drawing':
      return generateCanvasCode(safeId, props, indent);
    case 'datepicker':
    case 'calendar':
      return generateDatePickerCode(safeId, props, indent);
    case 'combobox':
    case 'dropdown':
      return generateComboboxCode(safeId, props, indent);
    case 'radiobutton':
    case 'radio':
      return generateRadioButtonCode(safeId, props, indent);
    default:
      // Return a descriptive comment for unsupported types
      return `${indent}# Unsupported component type: ${type}\n${indent}# Creating a label as a placeholder\n${indent}self.${safeId} = ctk.CTkLabel(self, text="Unsupported: ${type}", fg_color="#ffcccc", text_color="#000000")\n${indent}self.${safeId}.place(x=${props.x}, y=${props.y}, width=${props.width}, height=${props.height})\n`;
  }
}

function generateLabelCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  if (props.image) {
    const imagePath = props.image;
    const imageSize = props.image_size || { width: 50, height: 50 };
    code += `${indent}self.${safeId} = ctk.CTkLabel(self, text="${props.text || ''}", ${props.fontConfig.replace("font=", "")}, image=self.load_image("${imagePath}", (${imageSize.width}, ${imageSize.height})), compound="${props.compound || 'left'}", fg_color="${props.fg_color || 'transparent'}", text_color="${props.text_color}")\n`;
  } else {
    code += `${indent}self.${safeId} = ctk.CTkLabel(self, text="${props.text || ''}", width=${props.width}, height=${props.height}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || 'transparent'}", text_color="${props.text_color || '#ffffff'}", ${props.fontConfig})\n`;
  }
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y}, width=${props.width}, height=${props.height})\n`;
  }
  
  return code;
}

function generateButtonCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Use hover color that's slightly darker
  const hoverColor = props.fg_color ? adjustColorBrightness(props.fg_color, -20) : '#2b70b8';
  
  code += `${indent}self.${safeId} = ctk.CTkButton(self, text="${props.text || 'Button'}", width=${props.width}, height=${props.height}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#3b82f6'}", hover_color="${hoverColor}", text_color="${props.text_color || '#ffffff'}", border_width=${props.borderWidth}, border_color="${props.borderColor}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateEntryCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkEntry(self, width=${props.width}, height=${props.height}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#ffffff'}", text_color="${props.text_color || '#000000'}", border_width=${props.borderWidth}, border_color="${props.borderColor}", placeholder_text="Enter text...", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateTextboxCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkTextbox(self, width=${props.width}, height=${props.height || 80}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#ffffff'}", text_color="${props.text_color || '#000000'}", border_width=${props.borderWidth}, border_color="${props.borderColor}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  if (props.text) {
    code += `${indent}self.${safeId}.insert("1.0", """${props.text}""")\n`;
  }
  
  return code;
}

function generateSliderCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkSlider(self, width=${props.width || 160}, height=${props.height || 16}, from_=0, to=1, corner_radius=${props.cornerRadius}, border_width=${props.borderWidth}, button_color="${props.fg_color || '#3b82f6'}", button_hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", progress_color="${props.fg_color || '#3b82f6'}", fg_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -40)}")\n`;
  code += `${indent}self.${safeId}.set(${props.value || 0.5})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateSwitchCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Improved switch widget with proper styling
  code += `${indent}self.${safeId} = ctk.CTkSwitch(self, text="${props.text || 'Toggle'}", width=${props.width || 100}, button_color="${props.fg_color || '#3b82f6'}", button_hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", progress_color="${props.fg_color || '#3b82f6'}", text_color="${props.text_color || '#ffffff'}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Set default value if specified
  if (props.isOn === true || props.checked === true) {
    code += `${indent}self.${safeId}.select()\n`;
  } else {
    code += `${indent}self.${safeId}.deselect()\n`;
  }
  
  return code;
}

function generateProgressBarCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkProgressBar(self, width=${props.width || 160}, height=${props.height || 16}, corner_radius=${props.cornerRadius}, border_width=${props.borderWidth}, progress_color="${props.fg_color || '#3b82f6'}", fg_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -40)}")\n`;
  code += `${indent}self.${safeId}.set(${props.value || 0.5})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateParagraphCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkTextbox(self, width=${props.width || 200}, height=${props.height || 100}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || 'transparent'}", text_color="${props.text_color || '#ffffff'}", border_width=${props.borderWidth}, border_color="${props.borderColor}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  code += `${indent}self.${safeId}.insert("1.0", """${props.text || 'Paragraph text'}""")\n`;
  code += `${indent}self.${safeId}.configure(state="disabled")  # Make read-only\n`;
  
  return code;
}

function generateFrameCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkFrame(self, width=${props.width || 200}, height=${props.height || 150}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#2b2b2b'}", border_width=${props.borderWidth}, border_color="${props.borderColor}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateCheckboxCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}self.${safeId} = ctk.CTkCheckBox(self, text="${props.text || 'Checkbox'}", fg_color="${props.fg_color || '#3b82f6'}", hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", text_color="${props.text_color || '#ffffff'}", border_color="${props.borderColor}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Set checked state if specified
  if (props.checked) {
    code += `${indent}self.${safeId}.select()\n`;
  } else {
    code += `${indent}self.${safeId}.deselect()\n`;
  }
  
  return code;
}

function generateImageCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  const imagePath = props.image || "placeholder.png";
  const imageWidth = props.width || 100;
  const imageHeight = props.height || 100;
  
  code += `${indent}# Image setup for ${safeId}\n`;
  code += `${indent}self.img_${safeId} = self.load_image("${imagePath}", (${imageWidth}, ${imageHeight}))\n`;
  code += `${indent}self.image_label_${safeId} = ctk.CTkLabel(self, image=self.img_${safeId}, text="", fg_color="${props.bg_color || 'transparent'}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  if (props.useGrid && props.row !== null && props.column !== null) {
    const sticky = props.sticky ? `, sticky="${props.sticky}"` : '';
    code += `${indent}self.image_label_${safeId}.grid(row=${props.row}, column=${props.column}, rowspan=${props.rowspan}, columnspan=${props.columnspan}, padx=${props.padx}, pady=${props.pady}${sticky})\n`;
  } else {
    code += `${indent}self.image_label_${safeId}.place(x=${props.x}, y=${props.y}, width=${imageWidth}, height=${imageHeight})\n`;
  }
  
  return code;
}

function generateNotebookCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Create CTkTabView (CustomTkinter's implementation of tabs)
  code += `${indent}# TabView setup for ${safeId}\n`;
  code += `${indent}self.${safeId} = ctk.CTkTabview(self, width=${props.width || 300}, height=${props.height || 200}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#2b2b2b'}", segmented_button_fg_color="${adjustColorBrightness(props.fg_color || '#2b2b2b', -10)}", segmented_button_selected_color="${props.fg_color || '#3b82f6'}", segmented_button_selected_hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", text_color="${props.text_color || '#ffffff'}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Add tabs
  code += `${indent}# Add tabs to ${safeId}\n`;
  code += `${indent}tab_titles = "${props.tabs || 'Tab 1,Tab 2,Tab 3'}".split(',')\n`;
  code += `${indent}for tab_title in tab_titles:\n`;
  code += `${indent}    tab = self.${safeId}.add(tab_title.strip())\n`;
  code += `${indent}    # You can add widgets to this tab with tab as parent\n`;
  code += `${indent}    ctk.CTkLabel(tab, text=f"Content for {tab_title.strip()}", ${props.fontConfig}).pack(pady=20)\n`;
  
  return code;
}

function generateListboxCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  code += `${indent}# Listbox implementation using CTkScrollableFrame with labels\n`;
  code += `${indent}self.${safeId}_frame = ctk.CTkScrollableFrame(self, width=${props.width || 200}, height=${props.height || 150}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#2b2b2b'}", border_width=${props.borderWidth}, border_color="${props.borderColor}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  if (props.useGrid && props.row !== null && props.column !== null) {
    const sticky = props.sticky ? `, sticky="${props.sticky}"` : '';
    code += `${indent}self.${safeId}_frame.grid(row=${props.row}, column=${props.column}, rowspan=${props.rowspan}, columnspan=${props.columnspan}, padx=${props.padx}, pady=${props.pady}${sticky})\n`;
  } else {
    code += `${indent}self.${safeId}_frame.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Add items
  code += `${indent}# Add items to the listbox\n`;
  code += `${indent}items = "${props.items || 'Item 1,Item 2,Item 3,Item 4,Item 5'}".split(',')\n`;
  code += `${indent}self.${safeId}_items = []\n`;
  code += `${indent}\n`;
  code += `${indent}for i, item in enumerate(items):\n`;
  code += `${indent}    item_label = ctk.CTkLabel(self.${safeId}_frame, text=item.strip(), anchor="w", ${props.fontConfig}, text_color="${props.text_color || '#ffffff'}")\n`;
  code += `${indent}    item_label.pack(fill="x", padx=5, pady=2)\n`;
  code += `${indent}    self.${safeId}_items.append(item_label)\n`;
  
  return code;
}

function generateCanvasCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Create a frame to host the canvas
  code += `${indent}self.${safeId}_frame = ctk.CTkFrame(self, width=${props.width || 200}, height=${props.height || 150}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#2b2b2b'}", border_width=${props.borderWidth}, border_color="${props.borderColor}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  if (props.useGrid && props.row !== null && props.column !== null) {
    const sticky = props.sticky ? `, sticky="${props.sticky}"` : '';
    code += `${indent}self.${safeId}_frame.grid(row=${props.row}, column=${props.column}, rowspan=${props.rowspan}, columnspan=${props.columnspan}, padx=${props.padx}, pady=${props.pady}${sticky})\n`;
  } else {
    code += `${indent}self.${safeId}_frame.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Create the canvas inside the frame
  code += `${indent}self.${safeId} = tk.Canvas(self.${safeId}_frame, width=${props.width - 4 || 196}, height=${props.height - 4 || 146}, bg="${props.bg_color || '#2b2b2b'}", highlightthickness=0)\n`;
  code += `${indent}self.${safeId}.place(relx=0.5, rely=0.5, anchor="center")\n`;
  
  // Example drawing
  code += `${indent}\n`;
  code += `${indent}# Example drawing\n`;
  code += `${indent}self.${safeId}.create_rectangle(20, 20, 50, 50, fill="#3b82f6", outline="")\n`;
  code += `${indent}self.${safeId}.create_oval(60, 20, 90, 50, fill="#f97316", outline="")\n`;
  
  return code;
}

function generateDatePickerCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Try to import tkcalendar, with fallback
  code += `${indent}try:\n`;
  code += `${indent}    from tkcalendar import DateEntry\n`;
  code += `${indent}    # Create a frame to host the date picker\n`;
  code += `${indent}    self.${safeId}_frame = ctk.CTkFrame(self, width=${props.width || 200}, height=${props.height || 30}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#2b2b2b'}", border_width=${props.borderWidth}, border_color="${props.borderColor}")\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  if (props.useGrid && props.row !== null && props.column !== null) {
    const sticky = props.sticky ? `, sticky="${props.sticky}"` : '';
    code += `${indent}    self.${safeId}_frame.grid(row=${props.row}, column=${props.column}, rowspan=${props.rowspan}, columnspan=${props.columnspan}, padx=${props.padx}, pady=${props.pady}${sticky})\n`;
  } else {
    code += `${indent}    self.${safeId}_frame.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Use tkcalendar's DateEntry
  code += `${indent}    self.${safeId} = DateEntry(self.${safeId}_frame, width=12, background="${props.fg_color || '#3b82f6'}", foreground="${props.text_color || '#ffffff'}", borderwidth=0, date_pattern="yyyy-mm-dd")\n`;
  code += `${indent}    self.${safeId}.place(relx=0.5, rely=0.5, anchor="center")\n`;
  code += `${indent}except ImportError:\n`;
  code += `${indent}    print("tkcalendar not installed. Install with: pip install tkcalendar")\n`;
  code += `${indent}    # Fallback to a button that could open a date selection dialog\n`;
  code += `${indent}    self.${safeId} = ctk.CTkButton(self, text="Select Date", width=${props.width}, height=${props.height}, corner_radius=${props.cornerRadius}, fg_color="${props.fg_color || '#3b82f6'}", hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", text_color="${props.text_color || '#ffffff'}", ${props.fontConfig})\n`;
  
  // Use grid layout for the fallback if grid properties are specified, otherwise use place
  if (props.useGrid && props.row !== null && props.column !== null) {
    const sticky = props.sticky ? `, sticky="${props.sticky}"` : '';
    code += `${indent}    self.${safeId}.grid(row=${props.row}, column=${props.column}, rowspan=${props.rowspan}, columnspan=${props.columnspan}, padx=${props.padx}, pady=${props.pady}${sticky})\n`;
  } else {
    code += `${indent}    self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateComboboxCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Create a combobox with the specified items
  code += `${indent}# Create a combobox/dropdown for ${safeId}\n`;
  code += `${indent}values = "${props.items || 'Option 1,Option 2,Option 3'}".split(',')\n`;
  code += `${indent}self.${safeId} = ctk.CTkComboBox(self, values=[item.strip() for item in values], width=${props.width}, height=${props.height}, corner_radius=${props.cornerRadius}, border_width=${props.borderWidth}, fg_color="${props.fg_color || '#2b2b2b'}", border_color="${props.borderColor}", text_color="${props.text_color || '#ffffff'}", button_color="${props.fg_color || '#3b82f6'}", button_hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", dropdown_fg_color="${props.fg_color || '#2b2b2b'}", dropdown_text_color="${props.text_color || '#ffffff'}", dropdown_hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  return code;
}

function generateRadioButtonCode(safeId: string, props: any, indent: string): string {
  let code = '';
  
  // Create a variable for the radio button
  code += `${indent}# Radio button setup for ${safeId}\n`;
  code += `${indent}self.${safeId}_var = tk.StringVar(value="")\n`;
  code += `${indent}self.${safeId} = ctk.CTkRadioButton(self, text="${props.text || 'Radio Button'}", variable=self.${safeId}_var, value="selected", fg_color="${props.fg_color || '#3b82f6'}", hover_color="${adjustColorBrightness(props.fg_color || '#3b82f6', -20)}", border_color="${props.borderColor || '#e2e8f0'}", text_color="${props.text_color || '#ffffff'}", ${props.fontConfig})\n`;
  
  // Use grid layout if grid properties are specified, otherwise use place
  const gridCode = generateGridCode(safeId, props, indent);
  if (gridCode) {
    code += gridCode;
  } else {
    code += `${indent}self.${safeId}.place(x=${props.x}, y=${props.y})\n`;
  }
  
  // Set the radio button if specified
  if (props.checked) {
    code += `${indent}self.${safeId}.select()\n`;
  }
  
  return code;
}
