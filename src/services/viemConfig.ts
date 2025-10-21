// Viem Configuration
// Sets up public and wallet clients for the 1P Wallet

import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Address,
  type Chain,
} from 'viem';
import { configService } from './config';

// Custom chain configuration for Creditcoin Testnet
const creditcoinTestnet: Chain = {
  id: 102031,
  name: 'Creditcoin Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Creditcoin',
    symbol: 'CTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-creditcoin-testnet.creditcoin.org'],
    },
    public: {
      http: ['https://rpc-creditcoin-testnet.creditcoin.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Creditcoin Explorer',
      url: 'https://explorer-creditcoin-testnet.creditcoin.org',
    },
  },
  testnet: true,
};

class ViemConfigService {
  private publicClient: ReturnType<typeof createPublicClient> | null = null;
  private walletClient: ReturnType<typeof createWalletClient> | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const rpcUrl = await configService.getRpcUrl();

      // Create public client for read operations
      this.publicClient = createPublicClient({
        chain: creditcoinTestnet,
        transport: http(rpcUrl),
      });

      // Create wallet client for write operations (will be configured with account when needed)
      this.walletClient = createWalletClient({
        chain: creditcoinTestnet,
        transport: http(rpcUrl), // Fallback for wallet operations
      });

      this.initialized = true;
      console.log('[ViemConfig] ✅ Viem clients initialized');
    } catch (error) {
      console.error('[ViemConfig] ❌ Failed to initialize viem clients:', error);
      throw error;
    }
  }

  getPublicClient() {
    if (!this.publicClient) {
      throw new Error('Public client not initialized. Call initialize() first.');
    }
    return this.publicClient;
  }

  getWalletClient() {
    if (!this.walletClient) {
      throw new Error('Wallet client not initialized. Call initialize() first.');
    }
    return this.walletClient;
  }

  // Create a wallet client with a specific account
  async createWalletClientWithAccount(account: Account | Address) {
    if (!this.initialized) {
      throw new Error('Viem config not initialized. Call initialize() first.');
    }

    const rpcUrl = await configService.getRpcUrl();
    return createWalletClient({
      chain: creditcoinTestnet,
      transport: http(rpcUrl),
      account: typeof account === 'string' ? account : account,
    });
  }

  getChain() {
    return creditcoinTestnet;
  }
}

export const viemConfigService = new ViemConfigService();
export { creditcoinTestnet };
export type { Address, Chain };

