// Balance Checking Utility
// Checks if an account has sufficient native and token balances

import { contractService } from '@/services/contract';
import { parseEther, type Address } from 'viem';

export interface BalanceCheck {
  hasNative: boolean;
  hasTokens: boolean;
  needsAirdrop: boolean;
  nativeBalance: bigint;
  tokenBalance: bigint;
}

// Threshold for native balance (0.1 CTC for gas)
const NATIVE_THRESHOLD = parseEther('0.1');

/**
 * Check if an address has sufficient balances for a transaction
 * @param address Address to check
 * @param requiredTokens Required 1P token balance
 * @returns Balance check result
 */
export async function checkBalances(address: Address, requiredTokens: bigint): Promise<BalanceCheck> {
  // Get both balances in parallel
  const [nativeBalance, tokenBalance] = await Promise.all([
    contractService.getNativeBalance(address),
    contractService.balanceOf(address),
  ]);

  const hasNative = nativeBalance >= NATIVE_THRESHOLD;
  const hasTokens = tokenBalance >= requiredTokens;

  return {
    hasNative,
    hasTokens,
    needsAirdrop: !hasNative || !hasTokens,
    nativeBalance,
    tokenBalance,
  };
}

