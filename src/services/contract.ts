// Smart Contract Service
// Handles all interactions with the OneP contract on-chain

import OnePAbiData from '@/utils/OneP_Abi.json';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { configService } from './config';

// Contract ABI
const ONE_P_ABI = OnePAbiData.abi;

interface UserProfile {
  name: string;
  img: string;
  account: string;
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
  hotWallet: string;
  expiresAt: bigint;
  difficulty: bigint;
  status: number;
}

class ContractService {
  private provider: JsonRpcProvider | null = null;
  private contract: Contract | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const rpcUrl = await configService.getRpcUrl();
      const contractAddress = await configService.getOnePContractAddress();

      this.provider = new JsonRpcProvider(rpcUrl);
      this.contract = new Contract(contractAddress, ONE_P_ABI, this.provider);

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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const exists = await this.contract.usernameExists(username) as unknown as boolean;
      return exists;
    } catch (error) {
      console.error('[Contract] Error checking username:', error);
      return false;
    }
  }

  /**
   * Register a new username on the contract
   * Requires 100 1P tokens as registration fee
   */
  async register(username: string, name: string, imageUrl: string, signer: Wallet): Promise<string> {
    await this.ensureInitialized();

    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized');
    }

    try {
      // Connect signer to provider
      const connectedSigner = signer.connect(this.provider);
      const contractWithSigner = this.contract.connect(connectedSigner);

      // Call register function using getFunction
      const registerFn = contractWithSigner.getFunction('register');
      const tx = await registerFn(username, name, imageUrl, {
        gasLimit: 500000,
      }) as unknown as { hash: string; wait: () => Promise<{ status?: number; blockNumber?: number }> };

      console.log('[Contract] Registration transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        throw new Error('Registration transaction failed');
      }

      console.log('[Contract] Registration confirmed in block:', receipt.blockNumber);

      return tx.hash;
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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const profile = await this.contract.getUserProfile(username) as unknown as [string, string, string];

      return {
        name: profile[0],
        img: profile[1],
        account: profile[2],
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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const state = await this.contract.getUserState(username) as unknown as [bigint, bigint, bigint, bigint, bigint, bigint, boolean];

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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const fee = await this.contract.getAttemptFee(username) as unknown as bigint;
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
  async requestAttempt(username: string, hotWallet: Wallet): Promise<string> {
    await this.ensureInitialized();

    if (!this.contract || !this.provider) {
      throw new Error('Contract not initialized');
    }

    try {
      // Connect hot wallet to provider
      const connectedWallet = hotWallet.connect(this.provider);
      const contractWithSigner = this.contract.connect(connectedWallet);

      // Call requestAttempt using getFunction
      const requestAttemptFn = contractWithSigner.getFunction('requestAttempt');
      const tx = await requestAttemptFn(username, {
        gasLimit: 500000,
      }) as unknown as { hash: string; wait: () => Promise<{ status?: number; blockNumber?: number; logs?: unknown[] }> };

      console.log('[Contract] Request attempt transaction sent:', tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
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
  private extractAttemptIdFromReceipt(receipt: unknown): string | null {
    if (!receipt || typeof receipt !== 'object') {
      return null;
    }

    const logs = (receipt as { logs?: unknown[] }).logs;
    if (!logs || !Array.isArray(logs)) {
      return null;
    }

    if (!this.contract) {
      return null;
    }

    // Find AttemptCreated event
    for (const log of logs) {
      try {
        const parsedLog = this.contract.interface.parseLog({
          topics: (log as { topics: string[] }).topics,
          data: (log as { data: string }).data,
        });

        if (parsedLog && parsedLog.name === 'AttemptCreated') {
          const attemptId = parsedLog.args.id;
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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const attempt = await this.contract.getAttempt(attemptId) as unknown as [bigint, string, string, bigint, bigint, number];

      return {
        id: attempt[0],
        onePUser: attempt[1],
        hotWallet: attempt[2],
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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const balance = await this.contract.balanceOf(address) as unknown as bigint;
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

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.name() as unknown as string;
    } catch (error) {
      return '1P';
    }
  }

  /**
   * Get contract symbol
   */
  async getSymbol(): Promise<string> {
    await this.ensureInitialized();

    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.symbol() as unknown as string;
    } catch (error) {
      return '1P';
    }
  }

  /**
   * Get provider instance
   */
  getProvider(): JsonRpcProvider | null {
    return this.provider;
  }
}

export const contractService = new ContractService();

