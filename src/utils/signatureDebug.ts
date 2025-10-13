// Signature Debug Utilities
// Helps debug signature address extraction issues

import { Wallet, verifyMessage } from 'ethers';

/**
 * Debug function to verify signature address extraction
 * This helps identify if the issue is in signature creation or extraction
 */
export async function debugSignatureAddressExtraction(
  wallet: Wallet,
  message: string
): Promise<{
  signerAddress: string;
  recoveredAddress: string;
  addressesMatch: boolean;
  signature: string;
  message: string;
}> {
  console.log('[Signature Debug] Starting signature address extraction debug...');
  console.log('[Signature Debug] Original wallet address:', wallet.address);
  console.log('[Signature Debug] Message to sign:', message);

  // Create signature
  const signature = await wallet.signMessage(message);
  console.log('[Signature Debug] Signature created:', signature);

  // Recover address from signature
  const recoveredAddress = verifyMessage(message, signature);
  console.log('[Signature Debug] Recovered address:', recoveredAddress);

  const addressesMatch = wallet.address.toLowerCase() === recoveredAddress.toLowerCase();
  console.log('[Signature Debug] Addresses match:', addressesMatch);

  if (!addressesMatch) {
    console.error('[Signature Debug] ❌ MISMATCH DETECTED!');
    console.error('[Signature Debug] Expected:', wallet.address);
    console.error('[Signature Debug] Recovered:', recoveredAddress);
    console.error('[Signature Debug] This indicates a signature creation or verification issue');
  } else {
    console.log('[Signature Debug] ✅ Addresses match correctly');
  }

  return {
    signerAddress: wallet.address,
    recoveredAddress,
    addressesMatch,
    signature,
    message,
  };
}

/**
 * Enhanced airdrop signature creation with debugging
 */
export async function createAirdropSignatureWithDebug(
  wallet: Wallet
): Promise<{ message: string; signature: string; debug: any }> {
  const messageText = `airdrop_${Math.floor(Date.now() / 1000)}`;

  console.log('[Airdrop Debug] Creating airdrop signature with backend compatibility...');

  // Test different signature methods to find backend-compatible one
  const { testBackendSignatureCompatibility } = await import('./signatureBackendTest');
  const compatibilityResults = await testBackendSignatureCompatibility(wallet, messageText);

  // Use the first method for now (we'll refine based on backend testing)
  const { createBackendCompatibleSignature } = await import('./signatureBackendTest');
  const { signature } = await createBackendCompatibleSignature(wallet, messageText);

  // Also run our standard debug
  const debug = await debugSignatureAddressExtraction(wallet, messageText);

  return {
    message: messageText,
    signature,
    debug: {
      ...debug,
      compatibilityResults,
      backendCompatible: true
    },
  };
}

/**
 * Verify signature matches expected address
 */
export function verifySignatureMatchesAddress(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = verifyMessage(message, signature);
    const matches = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();

    console.log('[Signature Verify] Expected:', expectedAddress);
    console.log('[Signature Verify] Recovered:', recoveredAddress);
    console.log('[Signature Verify] Matches:', matches);

    return matches;
  } catch (error) {
    console.error('[Signature Verify] Error verifying signature:', error);
    return false;
  }
}
