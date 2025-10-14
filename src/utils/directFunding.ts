// Direct Funding Utility
// Transfers native tCTC and 1P tokens from creator account to new wallets

import { configService } from '@/services/config';
import { contractService } from '@/services/contract';
import { type Address, formatEther, type Hash, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export interface FundingResult {
  success: boolean;
  nativeTxHash?: Hash;
  tokenTxHash?: Hash;
  error?: string;
  insufficientFunds?: boolean;
  nativeAmount?: string;
  tokenAmount?: string;
}

// Funding amounts
const NATIVE_FUNDING_AMOUNT = parseEther('0.1'); // 0.1 tCTC for gas
const TOKEN_FUNDING_AMOUNT = parseEther('110'); // 110 1P tokens (100 for registration + 10 for auth fees)

/**
 * Fund a new wallet with native tCTC and 1P tokens from creator account
 * @param recipientAddress Address of the new wallet to fund
 * @returns FundingResult with transaction hashes or error details
 */
export async function fundNewWallet(recipientAddress: Address): Promise<FundingResult> {
  console.log('[DirectFunding] Starting funding process for:', recipientAddress);

  try {
    // Get creator private key from environment
    const creatorPrivateKey = configService.getCreatorPrivateKey();

    if (!creatorPrivateKey) {
      console.error('[DirectFunding] EVM_CREATOR_PRIVATE_KEY not configured');
      return {
        success: false,
        error: 'Creator account not configured',
        insufficientFunds: false,
      };
    }

    // Create account from private key
    const creatorAccount = privateKeyToAccount(creatorPrivateKey as `0x${string}`);
    console.log('[DirectFunding] Creator account:', creatorAccount.address);

    // Check creator balances
    const [creatorNativeBalance, creatorTokenBalance] = await Promise.all([
      contractService.getNativeBalance(creatorAccount.address),
      contractService.balanceOf(creatorAccount.address),
    ]);

    console.log('[DirectFunding] Creator balances:');
    console.log('  Native (tCTC):', formatEther(creatorNativeBalance), 'CTC');
    console.log('  1P Tokens:', formatEther(creatorTokenBalance), '1P');

    // Check if creator has sufficient funds
    const hasEnoughNative = creatorNativeBalance >= NATIVE_FUNDING_AMOUNT;
    const hasEnoughTokens = creatorTokenBalance >= TOKEN_FUNDING_AMOUNT;

    if (!hasEnoughNative || !hasEnoughTokens) {
      console.warn('[DirectFunding] Insufficient creator funds:');
      console.warn('  Native needed:', formatEther(NATIVE_FUNDING_AMOUNT), 'CTC, has:', formatEther(creatorNativeBalance), 'CTC');
      console.warn('  Tokens needed:', formatEther(TOKEN_FUNDING_AMOUNT), '1P, has:', formatEther(creatorTokenBalance), '1P');

      return {
        success: false,
        error: 'Creator account has insufficient funds',
        insufficientFunds: true,
      };
    }

    // Transfer native tCTC
    console.log('[DirectFunding] Transferring', formatEther(NATIVE_FUNDING_AMOUNT), 'tCTC to', recipientAddress);
    const nativeTxHash = await contractService.sendNativeToken(
      creatorAccount,
      recipientAddress,
      NATIVE_FUNDING_AMOUNT
    );
    console.log('[DirectFunding] Native transfer successful:', nativeTxHash);

    // Transfer 1P tokens
    console.log('[DirectFunding] Transferring', formatEther(TOKEN_FUNDING_AMOUNT), '1P tokens to', recipientAddress);
    const tokenTxHash = await contractService.transferTokens(
      creatorAccount,
      recipientAddress,
      TOKEN_FUNDING_AMOUNT
    );
    console.log('[DirectFunding] Token transfer successful:', tokenTxHash);

    return {
      success: true,
      nativeTxHash,
      tokenTxHash,
      nativeAmount: formatEther(NATIVE_FUNDING_AMOUNT),
      tokenAmount: formatEther(TOKEN_FUNDING_AMOUNT),
    };
  } catch (error) {
    console.error('[DirectFunding] Error funding wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      insufficientFunds: false,
    };
  }
}

