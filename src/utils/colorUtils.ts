
/**
 * Adjusts a color by a given percentage
 * @param color - The color to adjust in hex format (e.g. #RRGGBB)
 * @param percent - The percentage to adjust by (negative to darken, positive to lighten)
 * @returns The adjusted color in hex format
 */
export function adjustColor(color: string, percent: number): string {
  // Default to a light grey if color is invalid
  if (!color || !color.startsWith('#') || color.length !== 7) {
    return '#e2e8f0';
  }

  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, R + Math.round(R * percent / 100)));
  G = Math.min(255, Math.max(0, G + Math.round(G * percent / 100)));
  B = Math.min(255, Math.max(0, B + Math.round(B * percent / 100)));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

/**
 * Formats a color to ensure it's a valid hex color
 * @param color - The color to format
 * @returns A valid hex color string
 */
export function formatColor(color: string): string {
  // If no color provided, return default
  if (!color) {
    return '#000000';
  }

  // If already a valid hex color, return as is
  if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
    return color;
  }

  // If it's a short hex color (e.g., #fff), expand it
  if (color.startsWith('#') && color.length === 4) {
    const r = color[1];
    const g = color[2];
    const b = color[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  // If it doesn't start with #, add it
  if (!color.startsWith('#')) {
    return `#${color}`;
  }

  // Default fallback
  return '#000000';
}
