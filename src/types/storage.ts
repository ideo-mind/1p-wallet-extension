// Chrome Storage Schema

import type { Address, Hex } from 'viem';
import { Direction } from './protocol';

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

export interface ColorDirectionMapping {
  RED: Direction;
  GREEN: Direction;
  BLUE: Direction;
  YELLOW: Direction;
}

export interface StorageSchema {
  // User identity
  onePUser: string; // username.1p
  custodialAddress: string;

  // Creator wallet data (replaces hot wallet)
  creatorWalletAddress: Address; // User's main wallet address
  encryptedCreatorPrivateKey: string; // AES-GCM encrypted private key (Hex)
  encryptedEncryptionKey: string; // Encryption key (encrypted with user password)

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

  // Authentication fields
  colorDirectionMap: ColorDirectionMapping; // User's color-to-direction mapping
  encryptedPassword: string; // User's single character password (encrypted)
  isLocked: boolean; // Wallet lock state

  // Registration data
  registrationTxHash?: string; // Transaction hash for on-chain registration

  // Current attempt tracking
  lastAttemptId?: string; // Last authentication attempt ID

  // Legacy fields (for migration)
  hotWalletPrivkey?: string; // Deprecated: Hot wallet private key
  hotWalletAddress?: string; // Deprecated: Hot wallet address
  password?: string; // Deprecated: Old password field
}

// Viem-specific types for wallet operations
export interface ViemWalletInfo {
  privateKey: Hex;
  address: Address;
}

