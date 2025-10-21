// Signature Utilities for 1P Protocol
// Handles signing of payloads and messages for backend authentication

import { viemConfigService } from '@/services/viemConfig';
import { verifyMessage, type Account, type Address, type Hex } from 'viem';
import { signMessage as viemSignMessage } from 'viem/actions';

/**
 * Sign a JSON payload with provided account
 * Used for registration and verification requests
 */
export async function signPayload(
  account: Account,
  payload: Record<string, unknown>
): Promise<Hex> {
  // Convert payload to JSON string with no spaces (must match backend format)
  const payloadString = JSON.stringify(payload);

  // Create wallet client with the account
  const walletClient = await viemConfigService.createWalletClientWithAccount(account.address);

  // Sign the JSON string using viem
  const signature = await viemSignMessage(walletClient, {
    account,
    message: payloadString,
  });

  return signature;
}

/**
 * Sign a simple string message with provided account
 * Used for attempt ID and challenge ID signatures
 */
export async function signMessage(account: Account, message: string): Promise<Hex> {
  // Create wallet client with the account
  const walletClient = await viemConfigService.createWalletClientWithAccount(account.address);

  // Sign the message using viem
  const signature = await viemSignMessage(walletClient, {
    account,
    message,
  });

  return signature;
}

/**
 * Create registration signature
 * Signs the registration payload with color-direction legend
 */
export async function createRegistrationSignature(
  account: Account,
  registrationData: {
    onePUser: string;
    password: string;
    legend: Record<string, string>;
  }
): Promise<{ payload: Record<string, unknown>; signature: Hex }> {
  const currentTime = Math.floor(Date.now() / 1000);

  const payload = {
    onePUser: registrationData.onePUser,
    '1p': registrationData.password,
    legend: registrationData.legend,
    iat: currentTime,
    iss: account.address,
    exp: currentTime + 3600, // 1 hour expiry
  };

  const signature = await signPayload(account, payload);

  return { payload, signature };
}

/**
 * Create authentication options signature
 * Signs the attempt ID to get challenges from backend
 */
export async function createAuthOptionsSignature(
  account: Account,
  attemptId: string
): Promise<Hex> {
  return signMessage(account, attemptId);
}

/**
 * Create authentication verification signature
 * Signs the challenge ID to submit solutions
 */
export async function createAuthVerifySignature(
  account: Account,
  challengeId: string,
  solutions: string[]
): Promise<{ payload: Record<string, unknown>; signature: Hex }> {
  // Sign the challenge ID directly (as per backend middleware)
  const signature = await signMessage(account, challengeId);

  const payload = {
    challenge_id: challengeId,
    solutions,
  };

  return { payload, signature };
}

/**
 * Create airdrop signature
 * Signs a timestamped message to request airdrop from backend
 * Uses viem signature method for backend compatibility
 */
export async function createAirdropSignature(
  account: Account
): Promise<{ message: string; signature: Hex }> {
  // Create timestamped message (matches Python: f"airdrop_{int(time.time())}")
  const messageText = `airdrop_${Math.floor(Date.now() / 1000)}`;

  // Sign the message using viem
  const signature = await signMessage(account, messageText);

  return { message: messageText, signature };
}

/**
 * Verify a signature using viem
 * Replaces ethers verifyMessage
 */
export async function verifySignature(
  message: string,
  signature: Hex,
  address: Address
): Promise<boolean> {
  try {
    return await verifyMessage({
      message,
      signature,
      address,
    });
  } catch (error) {
    console.error('[Signatures] Signature verification failed:', error);
    return false;
  }
}

/**
 * Convert payload to hex-encoded string for backend
 * Backend expects encrypted_payload as hex(JSON)
 */
export function payloadToHex(payload: Record<string, unknown>): string {
  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonString);

  // Convert to hex
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

