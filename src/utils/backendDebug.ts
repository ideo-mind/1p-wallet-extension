// Backend Debug Utilities
// Helps debug backend signature verification issues

import { backendService } from '@/services/backend';
import { Wallet } from 'ethers';

/**
 * Debug backend signature verification
 * This helps identify if the backend is extracting the correct address
 */
export async function debugBackendSignatureVerification(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<{
  success: boolean;
  backendAddress?: string;
  error?: string;
  debugInfo: any;
}> {
  console.log('[Backend Debug] Testing backend signature verification...');
  console.log('[Backend Debug] Message:', message);
  console.log('[Backend Debug] Signature:', signature);
  console.log('[Backend Debug] Expected address:', expectedAddress);

  try {
    // Call the airdrop endpoint to see what address the backend extracts
    const result = await backendService.airdrop(message, signature);

    console.log('[Backend Debug] Backend response:', result);

    // Extract the address that the backend thinks signed the message
    // This is typically returned in the response or we can infer it from the transaction
    const backendAddress = result.address || 'Unknown';

    const addressesMatch = backendAddress.toLowerCase() === expectedAddress.toLowerCase();

    console.log('[Backend Debug] Backend extracted address:', backendAddress);
    console.log('[Backend Debug] Addresses match:', addressesMatch);

    if (!addressesMatch) {
      console.error('[Backend Debug] ❌ MISMATCH DETECTED!');
      console.error('[Backend Debug] Expected:', expectedAddress);
      console.error('[Backend Debug] Backend extracted:', backendAddress);
      console.error('[Backend Debug] This indicates a backend signature verification issue');
    } else {
      console.log('[Backend Debug] ✅ Backend extracted correct address');
    }

    return {
      success: result.success,
      backendAddress,
      error: result.error,
      debugInfo: {
        expectedAddress,
        backendAddress,
        addressesMatch,
        message,
        signature: signature.substring(0, 20) + '...', // Truncated for security
        response: result,
      },
    };
  } catch (error) {
    console.error('[Backend Debug] Error during backend verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugInfo: {
        expectedAddress,
        message,
        signature: signature.substring(0, 20) + '...',
        error,
      },
    };
  }
}

/**
 * Comprehensive airdrop debug flow
 * Tests the complete signature creation and backend verification flow
 */
export async function debugCompleteAirdropFlow(wallet: Wallet): Promise<{
  frontendDebug: any;
  backendDebug: any;
  issueIdentified: boolean;
  recommendations: string[];
}> {
  const recommendations: string[] = [];
  let issueIdentified = false;

  console.log('[Complete Debug] Starting comprehensive airdrop debug flow...');

  // Step 1: Test frontend signature creation
  const { createAirdropSignatureWithDebug } = await import('@/utils/signatureDebug');
  const { message, signature, debug: frontendDebug } = await createAirdropSignatureWithDebug(wallet);

  if (!frontendDebug.addressesMatch) {
    issueIdentified = true;
    recommendations.push('Frontend signature creation issue: Addresses do not match');
    recommendations.push('Check wallet.signMessage() implementation');
  }

  // Step 2: Test backend signature verification
  const backendDebug = await debugBackendSignatureVerification(
    message,
    signature,
    wallet.address
  );

  if (!backendDebug.success) {
    issueIdentified = true;
    recommendations.push('Backend verification failed: ' + backendDebug.error);
  }

  if (backendDebug.backendAddress && backendDebug.backendAddress !== wallet.address) {
    issueIdentified = true;
    recommendations.push('Backend extracted wrong address from signature');
    recommendations.push('Check backend signature verification middleware');
    recommendations.push('Verify backend uses same signature recovery method as frontend');
  }

  // Step 3: Provide specific recommendations
  if (!issueIdentified) {
    recommendations.push('No signature issues detected in frontend or backend');
    recommendations.push('Issue might be in transaction execution or address handling');
  } else {
    recommendations.push('Signature verification mismatch detected');
    recommendations.push('Check both frontend and backend signature handling');
  }

  return {
    frontendDebug,
    backendDebug,
    issueIdentified,
    recommendations,
  };
}
