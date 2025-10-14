// Smart Contract Service
// Handles all interactions with the OneP contract on-chain

import OnePAbiData from '@/utils/OneP_Abi.json';
import {
  createPublicClient,
  decodeEventLog,
  TransactionReceipt,
  type Account,
  type Address,
  type Hash,
} from 'viem';
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
      const walletClient = await viemConfigService.createWalletClientWithAccount(account);

      // Call register function using viem writeContract
      const hash = await writeContract(walletClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'register',
        args: [username, name, imageUrl],
        account: account,
        gas: 500000n,
      });

      console.log('[Contract] Registration transaction sent:', hash);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(this.publicClient!, {
        hash,
      });

      console.log('[Contract] Registration receipt:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      });

      if (!receipt || receipt.status !== 'success') {
        throw new Error(
          `Registration transaction failed - Status: ${receipt.status}, Block: ${receipt.blockNumber}`
        );
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
      const walletClient = await viemConfigService.createWalletClientWithAccount(account);

      // Call requestAttempt using viem writeContract
      const hash = await writeContract(walletClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'requestAttempt',
        args: [username],
        account: account,
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
  private extractAttemptIdFromReceipt(receipt: TransactionReceipt): string | null {
    if (!receipt || !receipt.logs || !Array.isArray(receipt.logs)) {
      return null;
    }

    // Find AttemptCreated event using viem's decodeEventLog
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ONE_P_ABI,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === 'AttemptCreated' && decoded.args && 'id' in decoded.args) {
          const attemptId = decoded.args.id as bigint;
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
        args: [BigInt(attemptId)],
      })) as {
        id: bigint;
        onePUser: string;
        hotWallet: string;
        expiresAt: bigint;
        difficulty: bigint;
        status: number;
      };
      console.log('[Contract] Attempt info:', attempt);

      return {
        id: attempt.id,
        onePUser: attempt.onePUser,
        hotWallet: attempt.hotWallet as Address,
        expiresAt: attempt.expiresAt,
        difficulty: attempt.difficulty,
        status: Number(attempt.status),
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

  /**
   * Send native tCTC tokens from one account to another
   * @param fromAccount Account to send from
   * @param toAddress Address to send to
   * @param amount Amount to send in wei
   * @returns Transaction hash
   */
  async sendNativeToken(fromAccount: Account, toAddress: Address, amount: bigint): Promise<Hash> {
    await this.ensureInitialized();

    if (!this.publicClient) {
      throw new Error('Contract not initialized');
    }

    try {
      // Create wallet client with the sender account
      const walletClient = await viemConfigService.createWalletClientWithAccount(fromAccount);

      // Send transaction
      const hash = await walletClient.sendTransaction({
        account: fromAccount,
        to: toAddress,
        value: amount,
      });

      console.log('[Contract] Native token transfer sent:', hash);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(this.publicClient, {
        hash,
      });

      if (!receipt || receipt.status !== 'success') {
        throw new Error('Native token transfer failed');
      }

      console.log('[Contract] Native token transfer confirmed in block:', receipt.blockNumber);

      return hash;
    } catch (error) {
      console.error('[Contract] Native token transfer error:', error);
      throw new Error(error instanceof Error ? error.message : 'Native token transfer failed');
    }
  }

  /**
   * Transfer 1P tokens from one account to another
   * @param fromAccount Account to send from
   * @param toAddress Address to send to
   * @param amount Amount to send in wei
   * @returns Transaction hash
   */
  async transferTokens(fromAccount: Account, toAddress: Address, amount: bigint): Promise<Hash> {
    await this.ensureInitialized();

    if (!this.contractAddress || !this.publicClient) {
      throw new Error('Contract not initialized');
    }

    try {
      // Create wallet client with the sender account
      const walletClient = await viemConfigService.createWalletClientWithAccount(fromAccount);

      // Check if contract is paused
      const isPaused = (await readContract(this.publicClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'paused',
      })) as boolean;

      console.log('[Contract] Token contract paused status:', isPaused);

      if (isPaused) {
        // Check if the sender is the owner
        const owner = (await readContract(this.publicClient, {
          address: this.contractAddress,
          abi: ONE_P_ABI,
          functionName: 'owner',
        })) as Address;

        console.log('[Contract] Contract owner:', owner);
        console.log('[Contract] Sender account:', fromAccount.address);

        if (owner.toLowerCase() === fromAccount.address.toLowerCase()) {
          console.log('[Contract] Sender is owner, using mint function');
          // Use mint if sender is owner
          const hash = await writeContract(walletClient, {
            address: this.contractAddress,
            abi: ONE_P_ABI,
            functionName: 'mint',
            args: [toAddress, amount],
            account: fromAccount,
            gas: 150000n,
          });

          console.log('[Contract] Token mint sent:', hash);

          // Wait for confirmation
          const receipt = await waitForTransactionReceipt(this.publicClient, {
            hash,
          });

          console.log('[Contract] Token mint receipt:', {
            status: receipt.status,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
          });

          if (!receipt || receipt.status !== 'success') {
            throw new Error(
              `Token mint failed - Status: ${receipt?.status}, Block: ${receipt?.blockNumber}`
            );
          }

          console.log('[Contract] Token mint confirmed in block:', receipt.blockNumber);
          return hash;
        } else {
          throw new Error(
            `Contract is paused and sender (${fromAccount.address}) is not the owner (${owner}). ` +
              `Cannot transfer tokens. Please unpause the contract or use the owner account.`
          );
        }
      }

      // Contract is not paused, use normal transfer
      // First check if sender has enough balance
      const senderBalance = await this.balanceOf(fromAccount.address);
      console.log('[Contract] Sender balance:', senderBalance.toString(), 'wei');
      console.log('[Contract] Amount to transfer:', amount.toString(), 'wei');

      if (senderBalance < amount) {
        throw new Error(
          `Insufficient token balance. Has: ${senderBalance.toString()}, Needs: ${amount.toString()}`
        );
      }

      const hash = await writeContract(walletClient, {
        address: this.contractAddress,
        abi: ONE_P_ABI,
        functionName: 'transfer',
        args: [toAddress, amount],
        account: fromAccount,
      });

      console.log('[Contract] Token transfer sent:', hash);

      // Wait for confirmation
      const receipt = await waitForTransactionReceipt(this.publicClient, {
        hash,
      });

      console.log('[Contract] Token transfer receipt:', {
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      });

      if (!receipt || receipt.status !== 'success') {
        throw new Error(
          `Token transfer failed - Status: ${receipt?.status}, Block: ${receipt?.blockNumber}`
        );
      }

      console.log('[Contract] Token transfer confirmed in block:', receipt.blockNumber);

      return hash;
    } catch (error) {
      console.error('[Contract] Token transfer error:', error);

      // Log detailed error information
      if (error && typeof error === 'object') {
        console.error('[Contract] Error details:', error);
      }

      throw new Error(error instanceof Error ? error.message : 'Token transfer failed');
    }
  }
}
export const contractService = new ContractService();
