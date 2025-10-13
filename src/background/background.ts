// Background Service Worker

import { storage } from '@/services/storage';
import { MessageResponse } from '@/types/messages';

// Message handler type
type MessageHandler = (
  payload: unknown,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse>;

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
  const { custodialAddress, network } = await storage.get(['custodialAddress', 'network']);

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
router.register('PERSONAL_SIGN', async () => {
  const { onePUser } = await storage.get(['onePUser']);

  if (!onePUser) {
    return {
      success: false,
      error: 'No wallet configured',
    };
  }

  // TODO: In full implementation, show confirmation popup and perform real authentication
  // For now, return error indicating this needs user interaction
  return {
    success: false,
    error: 'Personal sign requires authentication - not yet implemented in background',
  };
});

// Handle SEND_TRANSACTION
router.register('SEND_TRANSACTION', async () => {
  const { onePUser } = await storage.get(['onePUser']);

  if (!onePUser) {
    return {
      success: false,
      error: 'No wallet configured',
    };
  }

  // TODO: In full implementation, show confirmation popup and perform real authentication
  // For now, return error indicating this needs user interaction
  return {
    success: false,
    error: 'Send transaction requires authentication - not yet implemented in background',
  };
});

// Setup message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  router.route(message, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

// Auto-lock wallet when popup closes
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'popup') {
    port.onDisconnect.addListener(async () => {
      // Popup closed - lock the wallet
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
