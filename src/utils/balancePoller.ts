// Balance Polling Utility
// Polls for balance updates after airdrop with retries

import { contractService } from '@/services/contract';
import { formatEther, type Address } from 'viem';

interface PollResult {
  success: boolean;
  nativeBalance: bigint;
  tokenBalance: bigint;
  attempts: number;
}

/**
 * Poll for balance updates with retries
 * @param address Address to check
 * @param requiredNative Required native balance
 * @param requiredTokens Required token balance
 * @param maxAttempts Maximum number of poll attempts
 * @param delayMs Delay between attempts in milliseconds
 * @returns Poll result
 */
export async function pollForBalances(
  address: Address,
  requiredNative: bigint,
  requiredTokens: bigint,
  maxAttempts: number = 10,
  delayMs: number = 2000
): Promise<PollResult> {
  console.log('[BalancePoller] Starting balance poll...');
  console.log('[BalancePoller] Required native:', formatEther(requiredNative), 'CTC');
  console.log('[BalancePoller] Required tokens:', formatEther(requiredTokens), '1P');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Wait before checking (except first attempt)
    if (attempt > 1) {
      console.log(
        `[BalancePoller] Waiting ${delayMs}ms before attempt ${attempt}/${maxAttempts}...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    try {
      // Force fresh balance query by calling contract service directly
      const [nativeBalance, tokenBalance] = await Promise.all([
        contractService.getNativeBalance(address),
        contractService.balanceOf(address),
      ]);

      console.log(
        `[BalancePoller] Attempt ${attempt}/${maxAttempts} - Native: ${formatEther(nativeBalance)} CTC, Tokens: ${formatEther(tokenBalance)} 1P`
      );

      // Check if balances are sufficient
      if (nativeBalance >= requiredNative && tokenBalance >= requiredTokens) {
        console.log('[BalancePoller] ✅ Sufficient balances achieved!');
        return {
          success: true,
          nativeBalance,
          tokenBalance,
          attempts: attempt,
        };
      }

      console.log(
        `[BalancePoller] Still insufficient - Native: ${nativeBalance >= requiredNative ? '✅' : '❌'}, Tokens: ${tokenBalance >= requiredTokens ? '✅' : '❌'}`
      );
    } catch (error) {
      console.error(`[BalancePoller] Error on attempt ${attempt}:`, error);
    }
  }

  // Get final balances
  const [finalNative, finalTokens] = await Promise.all([
    contractService.getNativeBalance(address),
    contractService.balanceOf(address),
  ]);

  console.log('[BalancePoller] ❌ Max attempts reached. Final balances:');
  console.log(
    '[BalancePoller] Native:',
    formatEther(finalNative),
    'CTC (need',
    formatEther(requiredNative),
    ')'
  );
  console.log(
    '[BalancePoller] Tokens:',
    formatEther(finalTokens),
    '1P (need',
    formatEther(requiredTokens),
    ')'
  );

  return {
    success: false,
    nativeBalance: finalNative,
    tokenBalance: finalTokens,
    attempts: maxAttempts,
  };
}

