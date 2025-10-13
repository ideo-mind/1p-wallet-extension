// Backend Verifier Service Client
// Handles all API calls to the 1P Protocol verifier service

import { payloadToHex } from '@/utils/signatures';
import { configService } from './config';

export interface ColorGroups {
  red?: string[];
  green?: string[];
  blue?: string[];
  yellow?: string[];
}

export interface Challenge {
  colorGroups: ColorGroups;
}

export interface RegisterOptionsResponse {
  colors: Record<string, string>;
  directions: Record<string, string>;
}

export interface RegisterVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AuthOptionsResponse {
  challenges: Challenge[];
  challenge_id: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface AirdropResponse {
  success: boolean;
  message?: string;
  transactions?: {
    native?: string;
    token?: string;
  };
  error?: string;
}

class BackendService {
  private baseUrl: string;
  private chainId: number;

  constructor() {
    this.baseUrl = configService.getBackendUrl();
    this.chainId = configService.getChainId();
  }

  /**
   * Get common headers for all requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      MONEYPOT_CHAIN: this.chainId.toString(),
    };
  }

  /**
   * Generic request wrapper with error handling
   */
  private async request<T>(endpoint: string, method: string = 'POST', body?: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[Backend] Request failed for ${endpoint}:`, error);
      throw error instanceof Error ? error : new Error('Backend request failed');
    }
  }

  /**
   * Get registration options (colors and directions)
   */
  async getRegisterOptions(): Promise<RegisterOptionsResponse> {
    return this.request<RegisterOptionsResponse>('/1p/register/options', 'POST');
  }

  /**
   * Verify registration with backend
   * Sends signed payload to create custodial account
   */
  async verifyRegistration(
    payload: Record<string, unknown>,
    signature: string
  ): Promise<RegisterVerifyResponse> {
    const requestPayload = {
      encrypted_payload: payloadToHex(payload),
      signature,
    };

    return this.request<RegisterVerifyResponse>('/1p/register/verify', 'POST', requestPayload);
  }

  /**
   * Get authentication challenges for an attempt
   */
  async getAuthOptions(attemptId: string, signature: string): Promise<AuthOptionsResponse> {
    const requestPayload = {
      payload: {
        attempt_id: attemptId,
        signature,
      },
    };

    return this.request<AuthOptionsResponse>('/1p/authenticate/options', 'POST', requestPayload);
  }

  /**
   * Verify authentication solutions
   */
  async verifyAuth(
    challengeId: string,
    solutions: string[],
    signature: string
  ): Promise<AuthVerifyResponse> {
    const walletPayload = {
      challenge_id: challengeId,
      solutions,
    };

    const requestPayload = {
      encrypted_payload: payloadToHex(walletPayload),
      signature,
    };

    return this.request<AuthVerifyResponse>('/1p/authenticate/verify', 'POST', requestPayload);
  }

  /**
   * Request airdrop of CTC and 1P tokens
   * Used when account has insufficient funds for transactions
   */
  async airdrop(message: string, signature: string): Promise<AirdropResponse> {
    const walletPayload = { message };

    const requestPayload = {
      encrypted_payload: payloadToHex(walletPayload),
      signature,
    };

    return this.request<AirdropResponse>('/1p/airdrop', 'POST', requestPayload);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health', 'GET');
  }
}

export const backendService = new BackendService();

