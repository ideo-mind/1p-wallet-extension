// EIP-1193 Provider Injection

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

class OnePProvider {
  public readonly is1PWallet = true;
  public readonly isMetaMask = true; // Compatibility

  private listeners: Map<string, Set<Function>> = new Map();
  private _chainId: string = '0xaa36a7'; // Sepolia
  private _accounts: string[] = [];

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    // Listen for messages from background
    window.addEventListener('message', (event) => {
      if (event.data.type === 'FROM_BACKGROUND_TO_PAGE') {
        this.handleBackgroundMessage(event.data);
      }
    });

    // Request initial state
    this.sendToBackground('GET_STATE', {});
  }

  async request(args: RequestArguments): Promise<unknown> {
    const { method, params = [] } = args;

    switch (method) {
      case 'eth_requestAccounts':
        return this.requestAccounts();
      case 'eth_accounts':
        return this._accounts;
      case 'eth_chainId':
        return this._chainId;
      case 'net_version':
        return parseInt(this._chainId, 16).toString();
      case 'personal_sign':
        return this.personalSign(params as [string, string]);
      case 'eth_sendTransaction':
        return this.sendTransaction(params as [{ to: string; value?: string; data?: string }]);
      default:
        // Forward read-only calls to RPC
        return this.forwardToRPC(method, params);
    }
  }

  private async requestAccounts(): Promise<string[]> {
    const result = await this.sendToBackground('REQUEST_ACCOUNTS', {
      origin: window.location.origin,
    });

    if (result.success && result.data) {
      const data = result.data as { accounts?: string[] };
      this._accounts = data.accounts || [];
      this.emit('accountsChanged', this._accounts);
      return this._accounts;
    }

    throw new Error(result.error || 'User denied account access');
  }

  private async personalSign([message, address]: [string, string]): Promise<string> {
    const result = await this.sendToBackground('PERSONAL_SIGN', {
      message,
      address,
      origin: window.location.origin,
    });

    if (result.success && result.data) {
      const data = result.data as { signature?: string };
      if (!data.signature) {
        throw new Error('No signature returned');
      }
      return data.signature;
    }

    throw new Error(result.error || 'Signature rejected');
  }

  private async sendTransaction([tx]: [
    { to: string; value?: string; data?: string }
  ]): Promise<string> {
    const result = await this.sendToBackground('SEND_TRANSACTION', {
      ...tx,
      from: this._accounts[0],
      origin: window.location.origin,
    });

    if (result.success && result.data) {
      const data = result.data as { txHash?: string };
      if (!data.txHash) {
        throw new Error('No transaction hash returned');
      }
      return data.txHash;
    }

    throw new Error(result.error || 'Transaction rejected');
  }

  private sendToBackground(method: string, params: unknown): Promise<{ success: boolean; data?: unknown; error?: string }> {
    return new Promise((resolve) => {
      const messageId = `${Date.now()}-${Math.random()}`;

      const listener = (event: MessageEvent) => {
        if (
          event.data.type === 'FROM_BACKGROUND_TO_PAGE' &&
          event.data.id === messageId
        ) {
          window.removeEventListener('message', listener);
          resolve(event.data.result);
        }
      };

      window.addEventListener('message', listener);

      // Send to content script
      window.postMessage(
        {
          type: 'FROM_PAGE_TO_CONTENT',
          id: messageId,
          method,
          params,
        },
        '*'
      );

      // Timeout after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', listener);
        resolve({ success: false, error: 'Request timeout' });
      }, 300000);
    });
  }

  private handleBackgroundMessage(data: { type: string; payload?: unknown }) {
    if (data.type === 'STATE_UPDATE' && data.payload) {
      const payload = data.payload as { chainId?: string; accounts?: string[] };
      if (payload.chainId) this._chainId = payload.chainId;
      if (payload.accounts) {
        if (JSON.stringify(this._accounts) !== JSON.stringify(payload.accounts)) {
          this._accounts = payload.accounts;
          this.emit('accountsChanged', this._accounts);
        }
      }
    }
  }

  private async forwardToRPC(method: string, params: unknown): Promise<unknown> {
    // Simple RPC forwarding for read-only calls
    try {
      const response = await fetch('https://rpc.cc3-testnet.creditcoin.network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.result;
    } catch (error) {
      throw new Error(`RPC call failed: ${error}`);
    }
  }

  // Event emitter methods
  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  removeListener(event: string, handler: Function): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(...args);
      } catch (error) {
        console.error(`[1P Provider] Error in ${event} handler:`, error);
      }
    });
  }
}

// Inject provider
if (typeof window !== 'undefined') {
  const provider = new OnePProvider();

  Object.defineProperty(window, 'ethereum', {
    value: provider,
    writable: false,
    configurable: false,
  });

  // Announce to dApps
  window.dispatchEvent(new Event('ethereum#initialized'));
}

