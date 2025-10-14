// 1P Protocol Type Definitions

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SKIP';

// Backend format for challenges
export interface ColorGroups {
  red?: string[];
  green?: string[];
  blue?: string[];
  yellow?: string[];
}

export interface ColoredGrid {
  letters: string[][];
  colors: string[][];
  rows: number;
  cols: number;
  round: number;
}

export interface AuthenticationChallenge {
  attemptId: string;
  grids: ColoredGrid[];
  rounds: number;
  difficulty: number;
  expiresAt: number;
  challengeId?: string; // Backend challenge ID for verification
}

export interface AuthenticationResponse {
  directions: Direction[];
  timestamps?: number[];
  totalTime: number;
}

export interface DifficultyState {
  currentLevel: number;
  currentRounds: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

export interface UserProfile {
  username: string;
  custodialAddress: string;
  name?: string;
  imageUrl?: string;
  createdAt: number;
  difficulty: number;
  totalAttempts: number;
  successfulAttempts: number;
}

/**
 * Parse grid string from backend into ColorGroups
 * Backend sends: "JQVA=*@:Yvgjd<!zDk{$1x.;P}7iC9h>f&q2e|Wp5?_+(#u]),^-t8s40Rw%6y3"
 * Need to extract characters by color based on user's secret character
 */
export function parseGridToColorGroups(
  gridString: string,
  userSecret: string,
  _colorDirectionMap: { RED: Direction; GREEN: Direction; BLUE: Direction; YELLOW: Direction }
): ColorGroups {
  const colorGroups: ColorGroups = {
    red: [],
    green: [],
    blue: [],
    yellow: []
  };

  // Find the position of user's secret character in the grid
  const secretIndex = gridString.indexOf(userSecret);

  if (secretIndex === -1) {
    // Secret character not found, return empty groups
    return colorGroups;
  }

  // Based on the secret character's position and the color-direction mapping,
  // we need to determine which characters belong to which color
  // This is a simplified version - the actual algorithm would be more complex

  // For now, let's create a basic mapping based on character positions
  // This needs to match the backend's algorithm exactly
  const totalChars = gridString.length;
  const charsPerColor = Math.floor(totalChars / 4);

  colorGroups.red = Array.from(gridString.slice(0, charsPerColor));
  colorGroups.green = Array.from(gridString.slice(charsPerColor, charsPerColor * 2));
  colorGroups.blue = Array.from(gridString.slice(charsPerColor * 2, charsPerColor * 3));
  colorGroups.yellow = Array.from(gridString.slice(charsPerColor * 3, totalChars));

  return colorGroups;
}

/**
 * Convert backend ColorGroups format to ColoredGrid for UI
 * Backend sends: { red: ["A", "F"], green: ["B", "G"], ... }
 * UI needs: { letters: [[...]], colors: [[...]] }
 */
export function colorGroupsToGrid(colorGroups: ColorGroups, round: number): ColoredGrid {
  // Combine all characters from color groups
  const allChars: Array<{ char: string; color: string }> = [];

  if (colorGroups.red) {
    colorGroups.red.forEach((char) => allChars.push({ char, color: '#FF0000' }));
  }
  if (colorGroups.green) {
    colorGroups.green.forEach((char) => allChars.push({ char, color: '#00FF00' }));
  }
  if (colorGroups.blue) {
    colorGroups.blue.forEach((char) => allChars.push({ char, color: '#0000FF' }));
  }
  if (colorGroups.yellow) {
    colorGroups.yellow.forEach((char) => allChars.push({ char, color: '#FFFF00' }));
  }

  // Shuffle for display
  const shuffled = allChars.sort(() => Math.random() - 0.5);

  // Create 6x6 grid (or adjust based on total characters)
  const cols = 6;
  const rows = Math.ceil(shuffled.length / cols);

  const letters: string[][] = [];
  const colors: string[][] = [];

  for (let i = 0; i < rows; i++) {
    const rowLetters: string[] = [];
    const rowColors: string[] = [];

    for (let j = 0; j < cols; j++) {
      const index = i * cols + j;
      if (index < shuffled.length) {
        rowLetters.push(shuffled[index].char);
        rowColors.push(shuffled[index].color);
      } else {
        rowLetters.push('');
        rowColors.push('#FFFFFF');
      }
    }

    letters.push(rowLetters);
    colors.push(rowColors);
  }

  return {
    letters,
    colors,
    rows,
    cols,
    round,
  };
}

