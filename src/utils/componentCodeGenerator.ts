
import { generateWidgetCode } from './widgetGenerators';
import { sanitizeId } from './codeGeneratorUtils';

/**
 * Generates Python code for a specific component
 * @param component The component to generate code for
 * @param indent The indentation string to use
 */
export function generateComponentCode(component: any, indent: string): string {
  if (!component || !component.type) {
    return `${indent}# Missing component data or type\n`;
  }
  
  // Extract props properly
  const props = {
    text: component.props?.text || '',
    placeholder: component.props?.placeholder || '',
    fgColor: component.props?.fgColor || component.props?.textColor || '#ffffff',
    bgColor: component.props?.bgColor || '#374151',
    hoverColor: component.props?.hoverColor || '#2563eb',
    borderColor: component.props?.borderColor || '#6b7280',
    cornerRadius: component.props?.cornerRadius || 8,
    fontSize: component.props?.fontSize || 12,
    font: component.props?.fontFamily || 'Arial',
    checked: component.props?.checked || false,
    value: component.props?.value || 50,
    from: component.props?.from || 0,
    to: component.props?.to || 100,
    progressColor: component.props?.progressColor || '#3b82f6',
    borderWidth: component.props?.borderWidth || 1,
    fileName: component.props?.fileName || 'placeholder.png',
    position: component.position || { x: 0, y: 0 },
    size: component.size || { width: 100, height: 30 }
  };
  
  const safeId = sanitizeId(component.id);
  
  try {
    return generateWidgetCode(component.type, safeId, props, indent);
  } catch (error) {
    console.error(`Error generating code for component ${component.id}:`, error);
    return `${indent}# Error generating code for ${component.type} (${component.id})\n`;
  }
}
