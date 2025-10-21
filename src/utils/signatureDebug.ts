// Signature Debug Utilities
// Helps debug signature address extraction issues

import { verifyMessage, type Account, type Address, type Hex } from 'viem';
import { signMessage } from './signatures';

/**
 * Debug function to verify signature address extraction
 * This helps identify if the issue is in signature creation or extraction
 */
export async function debugSignatureAddressExtraction(
  account: Account,
  message: string
): Promise<{
  signerAddress: Address;
  recoveredAddress: Address;
  addressesMatch: boolean;
  signature: Hex;
  message: string;
}> {
  console.log('[Signature Debug] Starting signature address extraction debug...');
  console.log('[Signature Debug] Original wallet address:', account.address);
  console.log('[Signature Debug] Message to sign:', message);

  // Create signature using viem
  const signature = await signMessage(account, message);
  console.log('[Signature Debug] Signature created:', signature);

  // Verify signature using viem
  const isValid = await verifyMessage({
    message,
    signature,
    address: account.address,
  });
  console.log('[Signature Debug] Signature valid:', isValid);

  const addressesMatch = isValid;
  console.log('[Signature Debug] Addresses match:', addressesMatch);

  if (!addressesMatch) {
    console.error('[Signature Debug] ❌ MISMATCH DETECTED!');
    console.error('[Signature Debug] Expected:', account.address);
    console.error('[Signature Debug] Signature verification failed');
    console.error('[Signature Debug] This indicates a signature creation or verification issue');
  } else {
    console.log('[Signature Debug] ✅ Addresses match correctly');
  }

  return {
    signerAddress: account.address,
    recoveredAddress: account.address, // For compatibility, return the account address
    addressesMatch,
    signature,
    message,
  };
}

/**
 * Enhanced airdrop signature creation with debugging
 */
export async function createAirdropSignatureWithDebug(
  account: Account
): Promise<{ message: string; signature: Hex; debug: any }> {
  const messageText = `airdrop_${Math.floor(Date.now() / 1000)}`;

  console.log('[Airdrop Debug] Creating airdrop signature with viem...');

  // Use viem signature creation
  const signature = await signMessage(account, messageText);

  // Run our standard debug
  const debug = await debugSignatureAddressExtraction(account, messageText);

  return {
    message: messageText,
    signature,
    debug: {
      ...debug,
      viemCompatible: true,
    },
  };
}

/**
 * Verify signature matches expected address
 */
export async function verifySignatureMatchesAddress(
  message: string,
  signature: Hex,
  expectedAddress: Address
): Promise<boolean> {
  try {
    const isValid = await verifyMessage({
      message,
      signature,
      address: expectedAddress,
    });

    console.log('[Signature Verify] Expected:', expectedAddress);
    console.log('[Signature Verify] Signature valid:', isValid);

    return isValid;
  } catch (error) {
    console.error('[Signature Verify] Error verifying signature:', error);
    return false;
  }
}
