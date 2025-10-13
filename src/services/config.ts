// Configuration Service
// Manages environment variables and chain configuration

export interface ChainConfig {
  chainId: number;
  name: string;
  type: string;
  rpcUrl: string;
  explorerUrl: string;
  custom: {
    onep: {
      address: string;
    };
  };
}

export interface AppConfig {
  backendUrl: string;
  chainId: number;
  contractAddress: string;
  creatorPrivateKey: string;
}

class ConfigService {
  private chainConfig: ChainConfig | null = null;
  private appConfig: AppConfig;

  constructor() {
    // Load from environment variables (injected by webpack)
    this.appConfig = {
      backendUrl: process.env.MONEY_AUTH_URL || 'http://localhost:8787',
      chainId: parseInt(process.env.CHAIN_ID || '102031', 10),
      contractAddress: process.env.ONE_P_CONTRACT_ADDRESS || '',
      creatorPrivateKey: process.env.EVM_CREATOR_PRIVATE_KEY || '',
    };
  }

  getAppConfig(): AppConfig {
    return this.appConfig;
  }

  getBackendUrl(): string {
    return this.appConfig.backendUrl;
  }

  getChainId(): number {
    return this.appConfig.chainId;
  }

  getContractAddress(): string {
    return this.appConfig.contractAddress;
  }

  /**
   * @deprecated This method is deprecated. Creator wallets are now generated per user during registration.
   * This is kept for backward compatibility and testing only.
   */
  getCreatorPrivateKey(): string {
    return this.appConfig.creatorPrivateKey;
  }

  async fetchChainConfig(): Promise<ChainConfig> {
    if (this.chainConfig) {
      return this.chainConfig;
    }

    try {
      const response = await fetch(`${this.appConfig.backendUrl}/1p/chains`);

      if (!response.ok) {
        throw new Error(`Failed to fetch chain config: ${response.status}`);
      }

      const data = await response.json();
      const supportedChains: ChainConfig[] = data.supportedChains || [];

      // Find the chain configuration for our chain ID
      const chainConfig = supportedChains.find((chain) => chain.chainId === this.appConfig.chainId);

      if (!chainConfig) {
        throw new Error(`Chain ID ${this.appConfig.chainId} not found in supported chains`);
      }

      this.chainConfig = chainConfig;
      return chainConfig;
    } catch (error) {
      console.error('[Config] Failed to fetch chain config:', error);
      // Fallback configuration
      return {
        chainId: this.appConfig.chainId,
        name: 'Creditcoin Testnet',
        type: 'evm',
        rpcUrl: 'https://rpc.cc3-testnet.creditcoin.network',
        explorerUrl: 'https://creditcoin-testnet.blockscout.com',
        custom: {
          onep: {
            address: this.appConfig.contractAddress,
          },
        },
      };
    }
  }

  async getRpcUrl(): Promise<string> {
    const config = await this.fetchChainConfig();
    return config.rpcUrl;
  }

  async getExplorerUrl(): Promise<string> {
    const config = await this.fetchChainConfig();
    return config.explorerUrl;
  }

  async getOnePContractAddress(): Promise<string> {
    const config = await this.fetchChainConfig();
    return config.custom.onep.address;
  }
}

export const configService = new ConfigService();

