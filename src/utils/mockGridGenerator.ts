// Mock Grid Generator for 1P Protocol

import { DEFAULT_GRID_SIZE, PROTOCOL_COLORS } from '@/constants/protocol';
import { ColoredGrid } from '@/types/protocol';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PROTOCOL_COLOR_VALUES = Object.values(PROTOCOL_COLORS);

export function generateMockGrid(round: number): ColoredGrid {
  const { rows, cols } = DEFAULT_GRID_SIZE;
  const letters: string[][] = [];
  const colors: string[][] = [];

  for (let i = 0; i < rows; i++) {
    const letterRow: string[] = [];
    const colorRow: string[] = [];

    for (let j = 0; j < cols; j++) {
      // Random letter
      const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      letterRow.push(randomLetter);

      // Random protocol color
      const randomColor =
        PROTOCOL_COLOR_VALUES[Math.floor(Math.random() * PROTOCOL_COLOR_VALUES.length)];
      colorRow.push(randomColor);
    }

    letters.push(letterRow);
    colors.push(colorRow);
  }

  return {
    letters,
    colors,
    rows,
    cols,
    round,
  };
}

export function generateMockChallenge(rounds: number): ColoredGrid[] {
  const grids: ColoredGrid[] = [];

  for (let i = 0; i < rounds; i++) {
    grids.push(generateMockGrid(i + 1));
  }

  return grids;
}

