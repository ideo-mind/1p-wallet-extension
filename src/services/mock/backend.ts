// Mock Backend Service

import { DIFFICULTY_CONFIG } from '@/constants/protocol';
import { MessageResponse } from '@/types/messages';
import { AuthenticationChallenge, Direction, UserProfile } from '@/types/protocol';
import { generateMockChallenge } from '@/utils/mockGridGenerator';

interface RegisterParams {
  username: string;
  secret: string;
  publicData?: {
    name?: string;
    imageUrl?: string;
  };
}

interface RegisterResponse {
  username: string;
  custodialAddress: string;
  txHash: string;
}

interface AuthOptionsParams {
  username: string;
  action: string;
  payload: unknown;
  attemptId?: string;
}

interface AuthVerifyParams {
  username: string;
  attemptId: string;
  directions: Direction[];
  timestamp: number;
  duration: number;
}

interface AuthVerifyResponse {
  success: boolean;
  signature?: string;
  txHash?: string;
  result?: unknown;
  newDifficulty?: number;
}

// Simulated user database
const mockUsers = new Map<string, { address: string; difficulty: number; attempts: number }>();

// Simulated challenge storage
const mockChallenges = new Map<string, { rounds: number; createdAt: number }>();

export class MockBackendService {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateMockAddress(username: string): string {
    // Generate deterministic mock address from username
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const addr = `0x${hash.toString(16).padStart(40, '0')}`;
    return addr.slice(0, 42);
  }

  async register(params: RegisterParams): Promise<MessageResponse<RegisterResponse>> {
    // Simulate network delay
    await this.delay(1000 + Math.random() * 1000);

    const { username } = params;

    // Check if username already exists
    if (mockUsers.has(username)) {
      return {
        success: false,
        error: 'Username already taken',
        code: 'USERNAME_TAKEN',
      };
    }

    // Generate mock custodial address
    const custodialAddress = this.generateMockAddress(username);

    // Store user
    mockUsers.set(username, {
      address: custodialAddress,
      difficulty: 1,
      attempts: 0,
    });

    return {
      success: true,
      data: {
        username: `${username}.1p`,
        custodialAddress,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
      },
    };
  }

  async checkUsername(username: string): Promise<MessageResponse<{ available: boolean }>> {
    await this.delay(300);

    return {
      success: true,
      data: {
        available: !mockUsers.has(username),
      },
    };
  }

  async getAuthOptions(
    params: AuthOptionsParams
  ): Promise<MessageResponse<AuthenticationChallenge>> {
    await this.delay(500);

    const { username } = params;
    const cleanUsername = username.replace('.1p', '');

    const user = mockUsers.get(cleanUsername) || { difficulty: 1 };

    // Calculate rounds based on difficulty
    const rounds = Math.min(
      DIFFICULTY_CONFIG.BASE_ROUNDS + user.difficulty,
      DIFFICULTY_CONFIG.MAX_ROUNDS
    );

    // Generate grids
    const grids = generateMockChallenge(rounds);

    const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Store challenge
    mockChallenges.set(attemptId, {
      rounds,
      createdAt: Date.now(),
    });

    return {
      success: true,
      data: {
        attemptId,
        grids,
        rounds,
        difficulty: user.difficulty || 1,
        expiresAt: Date.now() + 300000, // 5 minutes
      },
    };
  }

  async verifyAuth(params: AuthVerifyParams): Promise<MessageResponse<AuthVerifyResponse>> {
    await this.delay(800);

    const { username, attemptId, directions } = params;
    const cleanUsername = username.replace('.1p', '');

    // Get challenge
    const challenge = mockChallenges.get(attemptId);
    if (!challenge) {
      return {
        success: false,
        error: 'Invalid or expired attempt',
        code: 'ATTEMPT_EXPIRED',
      };
    }

    // Validate directions length
    if (directions.length !== challenge.rounds) {
      return {
        success: false,
        error: 'Invalid number of directions',
        code: 'INVALID_INPUT',
      };
    }

    // Simulate 80% success rate for testing
    const isSuccess = Math.random() < 0.8;

    const user = mockUsers.get(cleanUsername);
    if (user) {
      user.attempts += 1;

      if (isSuccess) {
        // Reset difficulty on success
        user.difficulty = Math.max(1, user.difficulty - 1);
      } else {
        // Increase difficulty on failure
        user.difficulty = Math.min(DIFFICULTY_CONFIG.MAX_LEVEL, user.difficulty + 1);
      }
    }

    // Clean up challenge
    mockChallenges.delete(attemptId);

    if (isSuccess) {
      return {
        success: true,
        data: {
          success: true,
          signature: `0x${Math.random().toString(16).slice(2)}${Math.random()
            .toString(16)
            .slice(2)}`,
          newDifficulty: user?.difficulty || 1,
        },
      };
    } else {
      return {
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
        data: {
          success: false,
          newDifficulty: user?.difficulty || 1,
        },
      };
    }
  }

  async getProfile(username: string): Promise<MessageResponse<UserProfile>> {
    await this.delay(400);

    const cleanUsername = username.replace('.1p', '');
    const user = mockUsers.get(cleanUsername);

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        code: 'USERNAME_NOT_FOUND',
      };
    }

    return {
      success: true,
      data: {
        username: `${cleanUsername}.1p`,
        custodialAddress: user.address,
        name: cleanUsername,
        imageUrl: undefined,
        createdAt: Date.now() - 86400000, // 1 day ago
        difficulty: user.difficulty,
        totalAttempts: user.attempts,
        successfulAttempts: Math.floor(user.attempts * 0.8),
      },
    };
  }
}

export const mockBackendService = new MockBackendService();

