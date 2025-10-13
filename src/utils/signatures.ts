// Signature Utilities for 1P Protocol
// Handles signing of payloads and messages for backend authentication

import { Wallet } from 'ethers';

/**
 * Sign a JSON payload with a wallet
 * Used for registration and verification requests
 */
export async function signPayload(wallet: Wallet, payload: Record<string, unknown>): Promise<string> {
  // Convert payload to JSON string with no spaces (must match backend format)
  const payloadString = JSON.stringify(payload);

  // Sign the JSON string
  const signature = await wallet.signMessage(payloadString);

  return signature;
}

/**
 * Sign a simple string message
 * Used for attempt ID and challenge ID signatures
 */
export async function signMessage(wallet: Wallet, message: string): Promise<string> {
  const signature = await wallet.signMessage(message);
  return signature;
}

/**
 * Create registration signature
 * Signs the registration payload with color-direction legend
 */
export async function createRegistrationSignature(
  wallet: Wallet,
  registrationData: {
    onePUser: string;
    password: string;
    legend: Record<string, string>;
  }
): Promise<{ payload: Record<string, unknown>; signature: string }> {
  const currentTime = Math.floor(Date.now() / 1000);

  const payload = {
    onePUser: registrationData.onePUser,
    '1p': registrationData.password,
    legend: registrationData.legend,
    iat: currentTime,
    iss: wallet.address,
    exp: currentTime + 3600, // 1 hour expiry
  };

  const signature = await signPayload(wallet, payload);

  return { payload, signature };
}

/**
 * Create authentication options signature
 * Signs the attempt ID to get challenges from backend
 */
export async function createAuthOptionsSignature(
  wallet: Wallet,
  attemptId: string
): Promise<string> {
  return signMessage(wallet, attemptId);
}

/**
 * Create authentication verification signature
 * Signs the challenge ID to submit solutions
 */
export async function createAuthVerifySignature(
  wallet: Wallet,
  challengeId: string,
  solutions: string[]
): Promise<{ payload: Record<string, unknown>; signature: string }> {
  // Sign the challenge ID directly (as per backend middleware)
  const signature = await signMessage(wallet, challengeId);

  const payload = {
    challenge_id: challengeId,
    solutions,
  };

  return { payload, signature };
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

