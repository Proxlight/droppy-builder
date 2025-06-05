
// Widget code generators for CustomTkinter
import { formatColor } from './colorUtils';

/**
 * Generates CustomTkinter widget code
 */
export function generateWidgetCode(type: string, widgetId: string, props: any, indent: string): string {
  const position = props.position || { x: 0, y: 0 };
  const size = props.size || { width: 100, height: 30 };
  
  // Always use place() for positioning without width/height
  const placeParams = `x=${position.x}, y=${position.y}`;
  
  switch (type) {
    case 'button':
      return generateButtonCode(widgetId, props, indent, placeParams, size);
    case 'label':
      return generateLabelCode(widgetId, props, indent, placeParams, size);
    case 'entry':
      return generateEntryCode(widgetId, props, indent, placeParams, size);
    case 'image':
      return generateImageCode(widgetId, props, indent, placeParams, size);
    case 'slider':
      return generateSliderCode(widgetId, props, indent, placeParams, size);
    case 'frame':
      return generateFrameCode(widgetId, props, indent, placeParams, size);
    case 'checkbox':
      return generateCheckboxCode(widgetId, props, indent, placeParams, size);
    case 'datepicker':
      return generateDatePickerCode(widgetId, props, indent, placeParams, size);
    case 'progressbar':
      return generateProgressBarCode(widgetId, props, indent, placeParams, size);
    case 'textbox':
      return generateTextboxCode(widgetId, props, indent, placeParams, size);
    case 'paragraph':
      return generateParagraphCode(widgetId, props, indent, placeParams, size);
    default:
      return `${indent}# Unsupported widget type: ${type}\n`;
  }
}

function generateButtonCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const text = props.text || 'Button';
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const bgColor = formatColor(props.bgColor || '#3b82f6');
  const hoverColor = formatColor(props.hoverColor || '#2563eb');
  const cornerRadius = props.cornerRadius || 8;
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkButton(
${indent}    self,
${indent}    text="${text}",
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    fg_color="${bgColor}",
${indent}    text_color="${fgColor}",
${indent}    hover_color="${hoverColor}",
${indent}    corner_radius=${cornerRadius},
${indent}    font=("${font}", ${fontSize})
${indent})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateLabelCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const text = props.text || 'Label';
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const bgColor = formatColor(props.bgColor || 'transparent');
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkLabel(
${indent}    self,
${indent}    text="${text}",
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    text_color="${fgColor}",
${indent}    ${bgColor !== 'transparent' ? `fg_color="${bgColor}",` : ''}
${indent}    font=("${font}", ${fontSize})
${indent})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateEntryCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const placeholder = props.placeholder || '';
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const bgColor = formatColor(props.bgColor || '#374151');
  const borderColor = formatColor(props.borderColor || '#6b7280');
  const cornerRadius = props.cornerRadius || 8;
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkEntry(
${indent}    self,
${indent}    placeholder_text="${placeholder}",
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    fg_color="${bgColor}",
${indent}    text_color="${fgColor}",
${indent}    border_color="${borderColor}",
${indent}    corner_radius=${cornerRadius},
${indent}    font=("${font}", ${fontSize})
${indent})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateImageCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const fileName = props.fileName || 'placeholder.png';
  const bgColor = formatColor(props.bgColor || '#f3f4f6');
  const cornerRadius = props.cornerRadius || 8;
  
  return `${indent}try:
${indent}    self.${widgetId}_image = self.load_image("assets/${fileName}", (${size.width}, ${size.height}))
${indent}    self.${widgetId} = ctk.CTkLabel(
${indent}        self,
${indent}        image=self.${widgetId}_image,
${indent}        text="",
${indent}        width=${size.width},
${indent}        height=${size.height},
${indent}        fg_color="${bgColor}",
${indent}        corner_radius=${cornerRadius}
${indent}    )
${indent}except Exception as e:
${indent}    print(f"Error loading image: {e}")
${indent}    # Fallback if image not found
${indent}    self.${widgetId} = ctk.CTkLabel(
${indent}        self,
${indent}        text="Image\\nPlaceholder",
${indent}        width=${size.width},
${indent}        height=${size.height},
${indent}        fg_color="${bgColor}",
${indent}        corner_radius=${cornerRadius}
${indent}    )
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateSliderCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const fromValue = props.from || 0;
  const toValue = props.to || 100;
  const value = props.value || 50;
  const progressColor = formatColor(props.progressColor || '#3b82f6');
  const bgColor = formatColor(props.bgColor || '#374151');
  
  return `${indent}self.${widgetId} = ctk.CTkSlider(
${indent}    self,
${indent}    from_=${fromValue},
${indent}    to=${toValue},
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    progress_color="${progressColor}",
${indent}    fg_color="${bgColor}"
${indent})
${indent}self.${widgetId}.set(${value})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateFrameCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const bgColor = formatColor(props.bgColor || '#374151');
  const borderColor = formatColor(props.borderColor || '#6b7280');
  const cornerRadius = props.cornerRadius || 8;
  const borderWidth = props.borderWidth || 1;
  
  return `${indent}self.${widgetId} = ctk.CTkFrame(
${indent}    self,
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    fg_color="${bgColor}",
${indent}    border_color="${borderColor}",
${indent}    border_width=${borderWidth},
${indent}    corner_radius=${cornerRadius}
${indent})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateCheckboxCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const text = props.text || 'Checkbox';
  const checked = props.checked || false;
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const checkedColor = formatColor(props.checkedColor || '#3b82f6');
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkCheckBox(
${indent}    self,
${indent}    text="${text}",
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    text_color="${fgColor}",
${indent}    fg_color="${checkedColor}",
${indent}    font=("${font}", ${fontSize})
${indent})
${indent}${checked ? `self.${widgetId}.select()` : ''}
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateDatePickerCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const fgColor = formatColor(props.fgColor || '#000000');
  const bgColor = formatColor(props.bgColor || '#ffffff');
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}if DateEntry:
${indent}    self.${widgetId} = DateEntry(
${indent}        self,
${indent}        width=${Math.floor(size.width / 10)},
${indent}        background="${bgColor}",
${indent}        foreground="${fgColor}",
${indent}        borderwidth=1,
${indent}        font=("${font}", ${fontSize})
${indent}    )
${indent}    self.${widgetId}.place(${placeParams})
${indent}else:
${indent}    self.${widgetId} = ctk.CTkLabel(
${indent}        self,
${indent}        text="Date Picker (tkcalendar required)",
${indent}        width=${size.width},
${indent}        height=${size.height},
${indent}        text_color="${fgColor}"
${indent}    )
${indent}    self.${widgetId}.place(${placeParams})`;
}

function generateProgressBarCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const value = (props.value || 50) / 100; // Convert to 0-1 range
  const progressColor = formatColor(props.progressColor || '#3b82f6');
  const bgColor = formatColor(props.bgColor || '#374151');
  
  return `${indent}self.${widgetId} = ctk.CTkProgressBar(
${indent}    self,
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    progress_color="${progressColor}",
${indent}    fg_color="${bgColor}"
${indent})
${indent}self.${widgetId}.set(${value})
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateTextboxCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const text = props.text || '';
  const placeholder = props.placeholder || 'Enter text here...';
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const bgColor = formatColor(props.bgColor || '#374151');
  const borderColor = formatColor(props.borderColor || '#6b7280');
  const cornerRadius = props.cornerRadius || 8;
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkTextbox(
${indent}    self,
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    fg_color="${bgColor}",
${indent}    text_color="${fgColor}",
${indent}    border_color="${borderColor}",
${indent}    corner_radius=${cornerRadius},
${indent}    font=("${font}", ${fontSize})
${indent})
${indent}${text ? `self.${widgetId}.insert("1.0", "${text}")` : `self.${widgetId}.insert("1.0", "${placeholder}")`}
${indent}self.${widgetId}.place(${placeParams})`;
}

function generateParagraphCode(widgetId: string, props: any, indent: string, placeParams: string, size: any): string {
  const text = props.text || 'Paragraph text goes here.';
  const fgColor = formatColor(props.fgColor || '#ffffff');
  const bgColor = formatColor(props.bgColor || 'transparent');
  const fontSize = props.fontSize || 12;
  const font = props.font || 'Arial';
  
  return `${indent}self.${widgetId} = ctk.CTkLabel(
${indent}    self,
${indent}    text="${text}",
${indent}    width=${size.width},
${indent}    height=${size.height},
${indent}    text_color="${fgColor}",
${indent}    ${bgColor !== 'transparent' ? `fg_color="${bgColor}",` : ''}
${indent}    font=("${font}", ${fontSize}),
${indent}    wraplength=${size.width - 20},
${indent}    anchor="nw",
${indent}    justify="left"
${indent})
${indent}self.${widgetId}.place(${placeParams})`;
}
