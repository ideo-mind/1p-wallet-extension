// Mock Contract Service

import { UserProfile } from '@/types/protocol';

interface MockProfile {
  custodialAddress: string;
  name: string;
  imageUrl: string;
  difficulty: number;
  createdAt: number;
}

// Simulated on-chain registry
const mockRegistry = new Map<string, MockProfile>();

export class MockContractService {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateMockAddress(username: string): string {
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const addr = `0x${hash.toString(16).padStart(40, '0')}`;
    return addr.slice(0, 42);
  }

  async resolveUsername(username: string): Promise<string> {
    await this.delay(200);

    const cleanUsername = username.replace('.1p', '');

    let profile = mockRegistry.get(cleanUsername);

    if (!profile) {
      // Create mock profile
      profile = {
        custodialAddress: this.generateMockAddress(cleanUsername),
        name: cleanUsername,
        imageUrl: '',
        difficulty: 1,
        createdAt: Date.now(),
      };
      mockRegistry.set(cleanUsername, profile);
    }

    return profile.custodialAddress;
  }

  async getProfile(username: string): Promise<UserProfile> {
    await this.delay(300);

    const cleanUsername = username.replace('.1p', '');
    let profile = mockRegistry.get(cleanUsername);

    if (!profile) {
      profile = {
        custodialAddress: this.generateMockAddress(cleanUsername),
        name: cleanUsername,
        imageUrl: '',
        difficulty: 1,
        createdAt: Date.now(),
      };
      mockRegistry.set(cleanUsername, profile);
    }

    return {
      username: `${cleanUsername}.1p`,
      custodialAddress: profile.custodialAddress,
      name: profile.name,
      imageUrl: profile.imageUrl || undefined,
      createdAt: profile.createdAt,
      difficulty: profile.difficulty,
      totalAttempts: 0,
      successfulAttempts: 0,
    };
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    await this.delay(200);
    return !mockRegistry.has(username);
  }

  async requestAttempt(_username: string): Promise<string> {
    await this.delay(500);

    // Simulate on-chain transaction
    const attemptId = `0x${Date.now().toString(16)}${Math.random().toString(36).slice(2)}`;

    return attemptId;
  }

  async getTokenBalance(_address: string): Promise<string> {
    await this.delay(200);

    // Return mock balance
    return '100.0';
  }

  async getEthBalance(_address: string): Promise<string> {
    await this.delay(200);

    // Return mock balance
    return '0.5';
  }

  async lookupAddress(address: string): Promise<string | null> {
    await this.delay(200);

    // Simple reverse lookup
    for (const [username, profile] of mockRegistry.entries()) {
      if (profile.custodialAddress.toLowerCase() === address.toLowerCase()) {
        return `${username}.1p`;
      }
    }

    return null;
  }
}

export const mockContractService = new MockContractService();

