// Smart Contract Service
// Handles all interactions with the OneP contract on-chain

import OnePAbiData from '@/utils/OneP_Abi.json';
import { createPublicClient, type Account, type Address, type Hash } from 'viem';
import { getBalance, readContract, waitForTransactionReceipt, writeContract } from 'viem/actions';
import { configService } from './config';
import { viemConfigService } from './viemConfig';

// Contract ABI
const ONE_P_ABI = OnePAbiData.abi;

interface UserProfile {
  name: string;
  img: string;
  account: Address;
}

interface UserState {
  totalAttempts: bigint;
  successCount: bigint;
  failureCount: bigint;
  firstFailureTs: bigint;
  lastFailureTs: bigint;
  d: bigint;
  highAbuse: boolean;
}

interface AttemptInfo {
  id: bigint;
  onePUser: string;
  hotWallet: Address;
  expiresAt: bigint;
  difficulty: bigint;
  status: number;
}

class ContractService {
  private publicClient: ReturnType<typeof createPublicClient> | null = null;
  private contractAddress: Address | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize viem config first
      await viemConfigService.initialize();

      const contractAddress = await configService.getOnePContractAddress();

      this.publicClient = viemConfigService.getPublicClient();
      this.contractAddress = contractAddress as Address;

      this.initialized = true;
      console.log('[Contract Service] Initialized with address:', contractAddress);
    } catch (error) {
      console.error('[Contract Service] Failed to initialize:', error);
      throw new Error('Failed to initialize contract service');
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Check if a username is already registered on-chain
   */
  async usernameExists(username: string): Promise<boolean> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const exists = await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'usernameExists',
        args: [username],
      });
      return exists as boolean;
    } catch (error) {
      console.error('[Contract] Error checking username:', error);
      return false;
    }
  }

  /**
   * Register a new username on the contract
   * Requires 100 1P tokens as registration fee
   */
  async register(
    username: string,
    name: string,
    imageUrl: string,
    account: Account
  ): Promise<Hash> {
    await this.ensureInitialized();

    if (!this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      // Create wallet client with the account
      const walletClient = await viemConfigService.createWalletClientWithAccount(account.address);

      // Call register function using viem writeContract
      const hash = await writeContract(walletClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'register',
        args: [username, name, imageUrl],
        gas: 500000n,
      });

      console.log('[Contract] Registration transaction sent:', hash);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(this.publicClient!, {
        hash,
      });

      if (!receipt || receipt.status !== 'success') {
        throw new Error('Registration transaction failed');
      }

      console.log('[Contract] Registration confirmed in block:', receipt.blockNumber);

      return hash;
    } catch (error) {
      console.error('[Contract] Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  /**
   * Get user profile from contract
   */
  async getUserProfile(username: string): Promise<UserProfile> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const profile = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'getUserProfile',
        args: [username],
      })) as [string, string, string];

      return {
        name: profile[0],
        img: profile[1],
        account: profile[2] as Address,
      };
    } catch (error) {
      console.error('[Contract] Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Get user state (attempts, difficulty, etc.)
   */
  async getUserState(username: string): Promise<UserState> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const state = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'getUserState',
        args: [username],
      })) as [bigint, bigint, bigint, bigint, bigint, bigint, boolean];

      return {
        totalAttempts: state[0],
        successCount: state[1],
        failureCount: state[2],
        firstFailureTs: state[3],
        lastFailureTs: state[4],
        d: state[5],
        highAbuse: state[6],
      };
    } catch (error) {
      console.error('[Contract] Error getting user state:', error);
      throw new Error('Failed to get user state');
    }
  }

  /**
   * Get attempt fee for a username
   */
  async getAttemptFee(username: string): Promise<bigint> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const fee = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'getAttemptFee',
        args: [username],
      })) as bigint;
      return fee;
    } catch (error) {
      console.error('[Contract] Error getting attempt fee:', error);
      throw new Error('Failed to get attempt fee');
    }
  }

  /**
   * Request an authentication attempt on-chain
   * Returns the attempt ID extracted from transaction events
   */
  async requestAttempt(username: string, account: Account): Promise<string> {
    await this.ensureInitialized();

    if (!this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      // Create wallet client with the account
      const walletClient = await viemConfigService.createWalletClientWithAccount(account.address);

      // Call requestAttempt using viem writeContract
      const hash = await writeContract(walletClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'requestAttempt',
        args: [username],
        gas: 500000n,
      });

      console.log('[Contract] Request attempt transaction sent:', hash);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(this.publicClient!, {
        hash,
      });

      if (!receipt || receipt.status !== 'success') {
        throw new Error('Request attempt transaction failed');
      }

      console.log('[Contract] Request attempt confirmed in block:', receipt.blockNumber);

      // Extract attempt ID from AttemptCreated event
      const attemptId = this.extractAttemptIdFromReceipt(receipt);

      if (!attemptId) {
        throw new Error('Could not extract attempt ID from transaction');
      }

      console.log('[Contract] Attempt ID:', attemptId);

      return attemptId;
    } catch (error) {
      console.error('[Contract] Request attempt error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to request attempt');
    }
  }

  /**
   * Extract attempt ID from transaction receipt
   */
  private extractAttemptIdFromReceipt(receipt: any): string | null {
    if (!receipt || !receipt.logs || !Array.isArray(receipt.logs)) {
      return null;
    }

    // Find AttemptCreated event using viem's decodeEventLog
    const { decodeEventLog } = require('viem');

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ONE_P_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === 'AttemptCreated') {
          const attemptId = (decoded.args as any).id;
          return attemptId.toString();
        }
      } catch (error) {
        // Not the event we're looking for, continue
        continue;
      }
    }

    return null;
  }

  /**
   * Get attempt information from contract
   */
  async getAttempt(attemptId: string): Promise<AttemptInfo> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const attempt = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'getAttempt',
        args: [attemptId],
      })) as [bigint, string, string, bigint, bigint, number];

      return {
        id: attempt[0],
        onePUser: attempt[1],
        hotWallet: attempt[2] as Address,
        expiresAt: attempt[3],
        difficulty: attempt[4],
        status: Number(attempt[5]),
      };
    } catch (error) {
      console.error('[Contract] Error getting attempt:', error);
      throw new Error('Failed to get attempt info');
    }
  }

  /**
   * Get 1P token balance for an address
   */
  async balanceOf(address: string): Promise<bigint> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      const balance = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint;
      return balance;
    } catch (error) {
      console.error('[Contract] Error getting balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get contract name
   */
  async getName(): Promise<string> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      return (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'name',
        args: [],
      })) as string;
    } catch (error) {
      return '1P';
    }
  }

  /**
   * Get contract symbol
   */
  async getSymbol(): Promise<string> {
    await this.ensureInitialized();

    if (!this.publicClient || !this.contractAddress) {
      throw new Error('Contract not initialized');
    }

    try {
      return (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'symbol',
        args: [],
      })) as string;
    } catch (error) {
      return '1P';
    }
  }

  /**
   * Get native balance (CTC) for an address
   */
  async getNativeBalance(address: string): Promise<bigint> {
    await this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error('Public client not initialized');
    }

    try {
      const balance = await getBalance(this.publicClient, {
        address: address as Address,
      });
      return balance;
    } catch (error) {
      console.error('[Contract] Error getting native balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get public client instance
   */
  getPublicClient() {
    return this.publicClient;
  }
}

export const contractService = new ContractService();

