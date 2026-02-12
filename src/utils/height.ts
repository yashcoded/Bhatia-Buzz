/**
 * Height conversion and display for matrimonial profiles.
 * Store heightInCm for consistent conversion; display in both ft/in and cm on cards.
 */

/** Convert feet and inches to cm (1 ft = 30.48 cm, 1 in = 2.54 cm). */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round(feet * 30.48 + inches * 2.54);
}

/** Convert cm to feet and inches. */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/** Format cm as "X cm". */
export function formatCm(cm: number): string {
  return `${cm} cm`;
}

/** Format feet and inches as 5'7". */
export function formatFeetInches(feet: number, inches: number): string {
  return `${feet}'${inches}"`;
}

/**
 * Format height for display on cards: show primary string and converted value in parentheses.
 * If heightInCm is present, show both units; otherwise try to parse height string for conversion.
 */
export function formatHeightForDisplay(height: string, heightInCm?: number): string {
  if (!height && heightInCm == null) return '';
  const cm = heightInCm ?? parseHeightToCm(height);
  if (cm != null) {
    const isCm = /^\d+\s*cm$/i.test(height.trim());
    if (isCm) {
      const { feet, inches } = cmToFeetInches(cm);
      return `${height} (${formatFeetInches(feet, inches)})`;
    }
    return `${height} (${cm} cm)`;
  }
  return height;
}

/** Parse stored height string to cm if it's "X cm", or from "5'7"" format. */
export function parseHeightToCm(height: string): number | undefined {
  const trimmed = height.trim();
  const cmMatch = trimmed.match(/^(\d+)\s*cm$/i);
  if (cmMatch) return parseInt(cmMatch[1], 10);
  const ftMatch = trimmed.match(/^(\d+)'(\d+)"?$/);
  if (ftMatch) return feetInchesToCm(parseInt(ftMatch[1], 10), parseInt(ftMatch[2], 10));
  return undefined;
}
