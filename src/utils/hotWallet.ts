// Hot Wallet Management

import { storage } from '@/services/storage';
import { Wallet } from 'ethers';
import { decrypt, encrypt } from './crypto';

export async function createHotWallet(password: string): Promise<{
  address: string;
  encryptedPrivkey: string;
}> {
  // Generate random wallet
  const wallet = Wallet.createRandom();

  // Encrypt private key with password
  const encryptedPrivkey = await encrypt(wallet.privateKey, password);

  // Store in chrome.storage
  await storage.set({
    hotWalletPrivkey: encryptedPrivkey,
    hotWalletAddress: wallet.address,
  });

  return {
    address: wallet.address,
    encryptedPrivkey,
  };
}

export async function getHotWalletSigner(password: string): Promise<Wallet> {
  const { hotWalletPrivkey } = await storage.get(['hotWalletPrivkey']);

  if (!hotWalletPrivkey) {
    throw new Error('Hot wallet not configured');
  }

  // Decrypt private key
  const privateKey = await decrypt(hotWalletPrivkey, password);

  // Create wallet instance
  return new Wallet(privateKey);
}

export async function exportHotWallet(password: string): Promise<string> {
  const { hotWalletPrivkey } = await storage.get(['hotWalletPrivkey']);

  if (!hotWalletPrivkey) {
    throw new Error('Hot wallet not configured');
  }

  // Decrypt and return private key
  return await decrypt(hotWalletPrivkey, password);
}

export async function importHotWallet(privateKey: string, password: string): Promise<string> {
  try {
    // Validate private key
    const wallet = new Wallet(privateKey);

    // Encrypt and store
    const encryptedPrivkey = await encrypt(privateKey, password);

    await storage.set({
      hotWalletPrivkey: encryptedPrivkey,
      hotWalletAddress: wallet.address,
    });

    return wallet.address;
  } catch (error) {
    throw new Error('Invalid private key');
  }
}

export async function hasHotWallet(): Promise<boolean> {
  const { hotWalletPrivkey } = await storage.get(['hotWalletPrivkey']);
  return !!hotWalletPrivkey;
}

