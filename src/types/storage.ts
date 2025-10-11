// Chrome Storage Schema

export interface OriginApproval {
  origin: string;
  approvedAt: number;
  permissions: string[];
}

export interface Transaction {
  hash: string;
  blockNumber?: number;
  timestamp: number;
  type: 'authentication_attempt' | 'transaction' | 'sign';
  status: 'pending' | 'confirmed' | 'failed';
  from?: string;
  to?: string;
  value?: string;
}

export interface StorageSchema {
  // User identity
  onePUser: string; // username.1p
  custodialAddress: string;

  // Hot wallet (encrypted)
  hotWalletPrivkey: string;
  hotWalletAddress: string;

  // Settings
  network: 'creditcoin_mainnet' | 'creditcoin_testnet' | 'creditcoin_devnet' | 'mainnet';

  // Approved dApp origins
  approvedOrigins: Record<string, OriginApproval>;

  // Transaction history (cached)
  txHistory: Transaction[];

  // Profile cache
  profileCache?: {
    data: unknown;
    updatedAt: number;
  };

  // Session data
  lastAuthTime?: number;
  authSessionToken?: string;

  // Storage version for migrations
  storageVersion?: number;
}

