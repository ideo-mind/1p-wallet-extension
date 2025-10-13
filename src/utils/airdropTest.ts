// Airdrop Test Utilities
// Comprehensive testing for airdrop signature and address extraction

import { debugCompleteAirdropFlow } from './backendDebug';
import { createRandomWallet } from './wallet';

/**
 * Test airdrop signature creation and backend verification
 * This is a comprehensive test to identify signature issues
 */
export async function testAirdropSignatureFlow(): Promise<{
  success: boolean;
  issues: string[];
  recommendations: string[];
  debugInfo: any;
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  console.log('[Airdrop Test] Starting comprehensive airdrop test...');

  try {
    // Create a test wallet using viem
    const testWallet = createRandomWallet();
    console.log('[Airdrop Test] Created test wallet:', testWallet.address);

    // Run comprehensive debug flow
    const debugResult = await debugCompleteAirdropFlow(testWallet.account);

    if (debugResult.issueIdentified) {
      issues.push(...debugResult.recommendations);
    }

    // Additional tests
    console.log('[Airdrop Test] Running additional signature tests...');

    // Test 1: Verify signature creation
    const { createAirdropSignatureWithDebug } = await import('./signatureDebug');
    const { debug: frontendDebug } = await createAirdropSignatureWithDebug(testWallet.account);

    if (!frontendDebug.addressesMatch) {
      issues.push('Frontend signature creation failed address verification');
      recommendations.push('Check ethers.js wallet.signMessage() implementation');
    }

    // Test 2: Test different message formats
    const messages = [`airdrop_${Math.floor(Date.now() / 1000)}`, 'airdrop_test', 'test_message'];

    for (const message of messages) {
      const { signMessage, verifySignature } = await import('./signatures');
      const signature = await signMessage(testWallet.account, message);
      const recovered = await verifySignature(message, signature, testWallet.address);

      if (!recovered) {
        issues.push(`Message format issue: "${message}"`);
        recommendations.push(`Check signature recovery for message: ${message}`);
      }
    }

    console.log('[Airdrop Test] Test completed');
    console.log('[Airdrop Test] Issues found:', issues.length);
    console.log('[Airdrop Test] Recommendations:', recommendations.length);

    return {
      success: issues.length === 0,
      issues,
      recommendations,
      debugInfo: debugResult,
    };
  } catch (error) {
    console.error('[Airdrop Test] Test failed:', error);
    issues.push(
      `Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return {
      success: false,
      issues,
      recommendations: ['Fix test execution errors before proceeding'],
      debugInfo: { error },
    };
  }
}

/**
 * Quick test to verify signature creation works correctly
 */
export async function quickSignatureTest(): Promise<boolean> {
  try {
    console.log('[Quick Test] Testing signature creation...');

    const wallet = createRandomWallet();
    const message = `airdrop_${Math.floor(Date.now() / 1000)}`;

    const { signMessage, verifySignature } = await import('./signatures');
    const signature = await signMessage(wallet.account, message);
    const recovered = await verifySignature(message, signature, wallet.address);

    const matches = recovered;

    console.log('[Quick Test] Wallet address:', wallet.address);
    console.log('[Quick Test] Signature valid:', recovered);
    console.log('[Quick Test] Matches:', matches);

    return matches;
  } catch (error) {
    console.error('[Quick Test] Failed:', error);
    return false;
  }
}
