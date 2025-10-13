// Airdrop Test Utilities
// Comprehensive testing for airdrop signature and address extraction

import { Wallet } from 'ethers';
import { debugCompleteAirdropFlow } from './backendDebug';

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
    // Create a test wallet
    const testWallet = Wallet.createRandom() as unknown as Wallet;
    console.log('[Airdrop Test] Created test wallet:', testWallet.address);

    // Run comprehensive debug flow
    const debugResult = await debugCompleteAirdropFlow(testWallet);

    if (debugResult.issueIdentified) {
      issues.push(...debugResult.recommendations);
    }

    // Additional tests
    console.log('[Airdrop Test] Running additional signature tests...');

    // Test 1: Verify signature creation
    const { createAirdropSignatureWithDebug } = await import('./signatureDebug');
    const { debug: frontendDebug } = await createAirdropSignatureWithDebug(testWallet);

    if (!frontendDebug.addressesMatch) {
      issues.push('Frontend signature creation failed address verification');
      recommendations.push('Check ethers.js wallet.signMessage() implementation');
    }

    // Test 2: Test different message formats
    const messages = [
      `airdrop_${Math.floor(Date.now() / 1000)}`,
      'airdrop_test',
      'test_message',
    ];

    for (const message of messages) {
      const signature = await testWallet.signMessage(message);
      const { verifyMessage } = await import('ethers');
      const recovered = verifyMessage(message, signature);

      if (recovered.toLowerCase() !== testWallet.address.toLowerCase()) {
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
    issues.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

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

    const wallet = Wallet.createRandom() as unknown as Wallet;
    const message = `airdrop_${Math.floor(Date.now() / 1000)}`;

    const signature = await wallet.signMessage(message);
    const { verifyMessage } = await import('ethers');
    const recovered = verifyMessage(message, signature);

    const matches = recovered.toLowerCase() === wallet.address.toLowerCase();

    console.log('[Quick Test] Wallet address:', wallet.address);
    console.log('[Quick Test] Recovered address:', recovered);
    console.log('[Quick Test] Matches:', matches);

    return matches;
  } catch (error) {
    console.error('[Quick Test] Failed:', error);
    return false;
  }
}
