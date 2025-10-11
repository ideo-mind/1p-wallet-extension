// Color Assignment Utility for Unlock Screen
// Generates random, evenly-distributed color assignments for 40 characters

import { PROTOCOL_COLORS } from '@/constants/protocol';

// All 40 characters: 10 digits + 26 letters + 4 special chars
export const CHARACTERS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', // 10 digits
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', // Row 2 (10)
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',      // Row 3 (9)
  'z', 'x', 'c', 'v', 'b', 'n', 'm',                // Row 4 (7)
  '$', '#', '!', '%',                                // Row 5 (4)
];

// Color keys
const COLOR_KEYS = ['RED', 'GREEN', 'BLUE', 'YELLOW'] as const;

/**
 * Generates a random color assignment for all 40 characters
 * Ensures even distribution: 10 characters per color
 */
export function generateRandomColorAssignment(): Record<string, string> {
  const assignment: Record<string, string> = {};

  // Shuffle characters randomly
  const shuffledCharacters = [...CHARACTERS].sort(() => Math.random() - 0.5);

  // Assign 10 characters to each color
  COLOR_KEYS.forEach((colorKey, colorIndex) => {
    const colorHex = PROTOCOL_COLORS[colorKey];
    for (let i = 0; i < 10; i++) {
      const charIndex = colorIndex * 10 + i;
      assignment[shuffledCharacters[charIndex]] = colorHex;
    }
  });

  // Debug: Log color distribution
  const colorCounts = { RED: 0, GREEN: 0, BLUE: 0, YELLOW: 0 };
  Object.values(assignment).forEach(color => {
    const colorName = getColorNameFromHex(color);
    if (colorName) colorCounts[colorName]++;
  });

  return assignment;
}

/**
 * Get color name from hex value
 */
export function getColorNameFromHex(hex: string): 'RED' | 'GREEN' | 'BLUE' | 'YELLOW' | null {
  const normalizedHex = hex.toUpperCase();
  switch (normalizedHex) {
    case PROTOCOL_COLORS.RED:
      return 'RED';
    case PROTOCOL_COLORS.GREEN:
      return 'GREEN';
    case PROTOCOL_COLORS.BLUE:
      return 'BLUE';
    case PROTOCOL_COLORS.YELLOW:
      return 'YELLOW';
    default:
      console.warn('Unknown color hex:', hex, 'normalized:', normalizedHex);
      return null;
  }
}

/**
 * QWERTY layout structure for display
 */
export const QWERTY_LAYOUT = {
  row1: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  row2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  row3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  row4: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  row5: ['$', '#', '!', '%'],
};

/**
 * Validate that a character is in the allowed set
 */
export function isValidCharacter(char: string): boolean {
  return CHARACTERS.includes(char.toLowerCase());
}

