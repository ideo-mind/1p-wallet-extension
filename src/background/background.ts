// Background Service Worker

import { mockBackendService } from '@/services/mock/backend';
import { storage } from '@/services/storage';
import { MessageResponse } from '@/types/messages';

// Message handler type
type MessageHandler = (payload: unknown, sender: chrome.runtime.MessageSender) => Promise<MessageResponse>;

class MessageRouter {
  private handlers = new Map<string, MessageHandler>();

  register(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  async route(
    message: { type: string; payload: unknown },
    sender: chrome.runtime.MessageSender
  ): Promise<MessageResponse> {
    const handler = this.handlers.get(message.type);

    if (!handler) {
      return {
        success: false,
        error: `No handler for message type: ${message.type}`,
      };
    }

    try {
      return await handler(message.payload, sender);
    } catch (error) {
      console.error(`[Background] Error handling ${message.type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

const router = new MessageRouter();

// Handle GET_STATE
router.register('GET_STATE', async () => {
  const { custodialAddress, network } = await storage.get([
    'custodialAddress',
    'network',
  ]);

  const accounts = custodialAddress ? [custodialAddress] : [];
  const chainId = network === 'mainnet' ? '0x1' : '0xaa36a7';

  return {
    success: true,
    data: {
      chainId,
      accounts,
    },
  };
});

// Handle REQUEST_ACCOUNTS
router.register('REQUEST_ACCOUNTS', async (payload) => {
  const { origin } = payload as { origin: string };

  // Check if already approved
  const { approvedOrigins, onePUser, custodialAddress } = await storage.get([
    'approvedOrigins',
    'onePUser',
    'custodialAddress',
  ]);

  if (!onePUser || !custodialAddress) {
    return {
      success: false,
      error: 'No wallet configured',
    };
  }

  // Check if origin is approved
  const isApproved = approvedOrigins && approvedOrigins[origin];

  if (!isApproved) {
    // In a full implementation, show approval popup here
    // For now, auto-approve
    const newApprovals = {
      ...approvedOrigins,
      [origin]: {
        origin,
        approvedAt: Date.now(),
        permissions: ['eth_accounts'],
      },
    };
    await storage.set({ approvedOrigins: newApprovals });
  }

  return {
    success: true,
    data: {
      accounts: [custodialAddress],
    },
  };
});

// Handle PERSONAL_SIGN
router.register('PERSONAL_SIGN', async (payload) => {
  const { message, origin } = payload as { message: string; address: string; origin: string };

  const { onePUser } = await storage.get(['onePUser']);

  if (!onePUser) {
    return {
      success: false,
      error: 'No wallet configured',
    };
  }

  // In full implementation:
  // 1. Show confirmation popup
  // 2. Request authentication challenge
  // 3. User solves grids
  // 4. Submit to backend
  // 5. Return signature

  // For now, mock the authentication
  try {
    const challenge = await mockBackendService.getAuthOptions({
      username: onePUser,
      action: 'sign',
      payload: { message, origin },
    });

    if (!challenge.success || !challenge.data) {
      throw new Error('Failed to get challenge');
    }

    // Simulate successful authentication
    const mockDirections = Array(challenge.data.rounds).fill('UP');
    const verifyResult = await mockBackendService.verifyAuth({
      username: onePUser,
      attemptId: challenge.data.attemptId,
      directions: mockDirections as ('UP')[],
      timestamp: Date.now(),
      duration: 1000,
    });

    if (!verifyResult.success || !verifyResult.data) {
      throw new Error('Authentication failed');
    }

    return {
      success: true,
      data: {
        signature: verifyResult.data.signature,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Signing failed',
    };
  }
});

// Handle SEND_TRANSACTION
router.register('SEND_TRANSACTION', async (payload) => {
  const { to, value, data, origin } = payload as {
    to: string;
    value?: string;
    data?: string;
    from: string;
    origin: string;
  };

  const { onePUser } = await storage.get(['onePUser']);

  if (!onePUser) {
    return {
      success: false,
      error: 'No wallet configured',
    };
  }

  // Similar to PERSONAL_SIGN, but for transactions
  try {
    const challenge = await mockBackendService.getAuthOptions({
      username: onePUser,
      action: 'sendTransaction',
      payload: { to, value, data, origin },
    });

    if (!challenge.success || !challenge.data) {
      throw new Error('Failed to get challenge');
    }

    // Simulate successful authentication
    const mockDirections = Array(challenge.data.rounds).fill('UP');
    const verifyResult = await mockBackendService.verifyAuth({
      username: onePUser,
      attemptId: challenge.data.attemptId,
      directions: mockDirections as ('UP')[],
      timestamp: Date.now(),
      duration: 1000,
    });

    if (!verifyResult.success) {
      throw new Error('Authentication failed');
    }

    // Mock transaction hash
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random()
      .toString(16)
      .slice(2)}`;

    return {
      success: true,
      data: {
        txHash,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
});

// Setup message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  router.route(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[1P Wallet] Extension installed');
  } else if (details.reason === 'update') {
    console.log('[1P Wallet] Extension updated');
  }
});

// Auto-lock wallet when popup closes
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(async () => {
      // Popup closed - lock the wallet
      console.log('[1P Wallet] Popup closed, locking wallet');
      try {
        const { isLocked } = await storage.get(['isLocked']);
        if (!isLocked) {
          await storage.set({ isLocked: true });
        }
      } catch (error) {
        console.error('[1P Wallet] Failed to lock wallet:', error);
      }
    });
  }
});

console.log('[1P Wallet] Background service worker initialized');

