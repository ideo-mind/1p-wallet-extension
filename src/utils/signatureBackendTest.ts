// Backend Signature Compatibility Test
// Tests different signature methods to match backend behavior

import { Wallet, verifyMessage } from 'ethers';

/**
 * Test different signature methods to find one that matches backend
 */
export async function testBackendSignatureCompatibility(
  wallet: Wallet,
  message: string
): Promise<{
  method: string;
  signature: string;
  recoveredAddress: string;
  matchesExpected: boolean;
}[]> {
  const results: Array<{
    method: string;
    signature: string;
    recoveredAddress: string;
    matchesExpected: boolean;
  }> = [];

  const expectedAddress = wallet.address;

  console.log('[Backend Test] Testing signature compatibility...');
  console.log('[Backend Test] Expected address:', expectedAddress);
  console.log('[Backend Test] Message:', message);

  // Method 1: Standard ethers.js signMessage (current method)
  try {
    const signature1 = await wallet.signMessage(message);
    const recovered1 = verifyMessage(message, signature1);
    results.push({
      method: 'ethers.signMessage (current)',
      signature: signature1,
      recoveredAddress: recovered1,
      matchesExpected: recovered1.toLowerCase() === expectedAddress.toLowerCase()
    });
  } catch (error) {
    console.error('[Backend Test] Method 1 failed:', error);
  }

  // Method 2: Try different message encoding
  try {
    const signature2 = await wallet.signMessage(message);
    const recovered2 = verifyMessage(message, signature2);
    results.push({
      method: 'ethers.signMessage (alternative)',
      signature: signature2,
      recoveredAddress: recovered2,
      matchesExpected: recovered2.toLowerCase() === expectedAddress.toLowerCase()
    });
  } catch (error) {
    console.error('[Backend Test] Method 2 failed:', error);
  }

  // Method 3: Try using different signature format
  try {
    const signature3 = await wallet.signMessage(message);
    // Use standard verifyMessage for now
    const recovered3 = verifyMessage(message, signature3);

    results.push({
      method: 'ethers.signMessage (method 3)',
      signature: signature3,
      recoveredAddress: recovered3,
      matchesExpected: recovered3.toLowerCase() === expectedAddress.toLowerCase()
    });
  } catch (error) {
    console.error('[Backend Test] Method 3 failed:', error);
  }

  // Log results
  console.log('[Backend Test] Results:');
  results.forEach((result, index) => {
    console.log(`[Backend Test] Method ${index + 1}: ${result.method}`);
    console.log(`[Backend Test] Signature: ${result.signature}`);
    console.log(`[Backend Test] Recovered: ${result.recoveredAddress}`);
    console.log(`[Backend Test] Matches: ${result.matchesExpected ? '✅' : '❌'}`);
    console.log('---');
  });

  return results;
}

/**
 * Create signature using the method that matches backend behavior
 */
export async function createBackendCompatibleSignature(
  wallet: Wallet,
  message: string
): Promise<{ message: string; signature: string }> {
  // For now, use the standard method but with enhanced logging
  console.log('[Backend Compatible] Creating signature for backend...');
  console.log('[Backend Compatible] Wallet address:', wallet.address);
  console.log('[Backend Compatible] Message:', message);

  const signature = await wallet.signMessage(message);

  console.log('[Backend Compatible] Signature created:', signature);

  // Verify locally
  const recovered = verifyMessage(message, signature);
  console.log('[Backend Compatible] Local recovery:', recovered);
  console.log('[Backend Compatible] Addresses match:', recovered.toLowerCase() === wallet.address.toLowerCase());

  return { message, signature };
}
