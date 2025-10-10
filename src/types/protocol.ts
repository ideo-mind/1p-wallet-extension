// 1P Protocol Type Definitions

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SKIP';

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

