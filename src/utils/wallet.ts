// Wallet Management Utilities using Viem
// Handles wallet creation, account management, and address operations

import type { Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount, type Account, type Address } from 'viem/accounts';

export interface WalletInfo {
  privateKey: Hex;
  address: Address;
  account: Account;
}

/**
 * Create a new random wallet using viem
 * Replaces Wallet.createRandom() from ethers
 */
export function createRandomWallet(): WalletInfo {
  console.log('[Wallet] Creating new random wallet with viem...');

  // Generate a new private key
  const privateKey = generatePrivateKey();

  // Create account from private key
  const account = privateKeyToAccount(privateKey);

  const walletInfo: WalletInfo = {
    privateKey,
    address: account.address,
    account,
  };

  console.log('[Wallet] ✅ Wallet created:', walletInfo.address);
  console.log('[Wallet] Private key:', privateKey);

  return walletInfo;
}

/**
 * Recreate wallet from private key using viem
 * Replaces new Wallet(privateKey) from ethers
 */
export function createWalletFromPrivateKey(privateKey: Hex): WalletInfo {
  console.log('[Wallet] Creating wallet from private key with viem...');

  try {
    // Create account from existing private key
    const account = privateKeyToAccount(privateKey);

    const walletInfo: WalletInfo = {
      privateKey,
      address: account.address,
      account,
    };

    console.log('[Wallet] ✅ Wallet recreated:', walletInfo.address);

    return walletInfo;
  } catch (error) {
    console.error('[Wallet] ❌ Failed to create wallet from private key:', error);
    throw new Error(`Invalid private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate if an address is valid
 */
export function isValidAddress(address: string): address is Address {
  try {
    // Basic validation - viem will throw if invalid
    return typeof address === 'string' && address.startsWith('0x') && address.length === 42;
  } catch {
    return false;
  }
}

/**
 * Get address from account
 */
export function getAddressFromAccount(account: Account): Address {
  return account.address;
}

/**
 * Get private key from wallet info
 */
export function getPrivateKeyFromWallet(wallet: WalletInfo): Hex {
  return wallet.privateKey;
}
