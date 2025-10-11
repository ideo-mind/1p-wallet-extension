import { ActivityView } from '@/components/Dashboard/ActivityView';
import { TokensView } from '@/components/Dashboard/TokensView';
import { WalletOverview } from '@/components/Dashboard/WalletOverview';
import { RegistrationWizard } from '@/components/Registration/RegistrationWizard';
import { UnlockScreen } from '@/components/Unlock/UnlockScreen';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { PixelBackground } from '@/components/effects/PixelBackground';
import { HamburgerMenu } from '@/components/ui/hamburger-menu';
import { NETWORKS } from '@/constants/protocol';
import { storage } from '@/services/storage';
import { Activity, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';

type View = 'loading' | 'register' | 'unlock' | 'dashboard';

const PopupContent = () => {
  const [view, setView] = useState<View>('loading');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('tokens');
  const [currentNetwork, setCurrentNetwork] = useState<keyof typeof NETWORKS>('creditcoin_testnet');

  // Connect to background for auto-lock functionality
  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'popup' });
    return () => {
      port.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const { onePUser, custodialAddress, network, isLocked } = await storage.get([
          'onePUser',
          'custodialAddress',
          'network',
          'isLocked',
        ]);

        if (!onePUser || !custodialAddress) {
          setView('register');
          return;
        }

        setUsername(onePUser);
        setAddress(custodialAddress);

        // Set the network from storage or default to testnet
        if (network && network in NETWORKS) {
          setCurrentNetwork(network as keyof typeof NETWORKS);
        }

        // Check if wallet is locked
        if (isLocked) {
          setView('unlock');
        } else {
          setView('dashboard');
        }
      } catch (error) {
        console.error('Failed to check user:', error);
        setView('register');
      }
    };

    checkExistingUser();
  }, []);

  const handleRegistrationComplete = async () => {
    const { onePUser, custodialAddress } = await storage.get(['onePUser', 'custodialAddress']);
    if (onePUser && custodialAddress) {
      setUsername(onePUser);
      setAddress(custodialAddress);
      setView('dashboard');
    }
  };

  const handleNetworkChange = async (network: keyof typeof NETWORKS) => {
    try {
      // Only allow switching to active networks
      if (NETWORKS[network].status === 'active') {
        setCurrentNetwork(network);
        await storage.set({ network });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to change network:', error);
    }
  };

  const handleLockWallet = async () => {
    try {
      await storage.set({ isLocked: true });
      setView('unlock');
    } catch (error) {
      console.error('Failed to lock wallet:', error);
    }
  };

  const handleUnlock = () => {
    setView('dashboard');
  };

  const handleResetWallet = async () => {
    try {
      // Clear all stored data
      await storage.clear();

      // Reset state
      setUsername('');
      setAddress('');
      setCurrentNetwork('creditcoin_testnet');
      setView('register');
    } catch (error) {
      console.error('Failed to reset wallet:', error);
    }
  };

  if (view === 'loading') {
    return <LoadingOverlay message="Loading wallet..." />;
  }

  if (view === 'register') {
    return (
      <div className="popup-container overflow-y-auto bg-pixel-bg pixel-grid">
        <div className="p-4">
          <RegistrationWizard onComplete={handleRegistrationComplete} />
        </div>
      </div>
    );
  }

  if (view === 'unlock') {
    return (
      <div className="popup-container overflow-y-auto">
        <UnlockScreen onUnlock={handleUnlock} />
      </div>
    );
  }

  return (
    <div className="popup-container overflow-y-auto bg-pixel-bg pixel-grid relative">
      <PixelBackground variant="grid" />
      {/* Header */}
      <div className="sticky top-0 z-20 bg-pixel-bgDark border-b-4 border-pixel-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center">
              <img
                src="/icons/icon48.png"
                alt="1P Wallet"
                className="h-8 w-8 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <h1 className="text-lg font-pixel tracking-tight text-pixel-text">1P WALLET</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-data text-pixel-text/70">
              {NETWORKS[currentNetwork].name}
            </div>
            <HamburgerMenu
              currentNetwork={currentNetwork}
              onNetworkChange={handleNetworkChange}
              onLockWallet={handleLockWallet}
              onResetWallet={handleResetWallet}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5 relative z-10">
        <WalletOverview username={username} address={address} currentNetwork={currentNetwork} />

        <div className="w-full">
          <div className="grid w-full grid-cols-2 bg-pixel-bg border-4 border-pixel-border p-1 mb-4">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center justify-center gap-2 px-3 py-2 border-2 font-pixelSmall text-sm transition-all duration-200 ${
                activeTab === 'tokens'
                  ? 'bg-pixel-teal text-white border-pixel-border shadow-pixel-sm'
                  : 'text-pixel-text hover:text-pixel-teal hover:border-pixel-teal border-transparent'
              }`}
            >
              <Coins className="h-4 w-4" />
              TOKENS
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center justify-center gap-2 px-3 py-2 border-2 font-pixelSmall text-sm transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-pixel-teal text-white border-pixel-border shadow-pixel-sm'
                  : 'text-pixel-text hover:text-pixel-teal hover:border-pixel-teal border-transparent'
              }`}
            >
              <Activity className="h-4 w-4" />
              ACTIVITY
            </button>
          </div>

          {activeTab === 'tokens' && (
            <div className="mt-4">
              <TokensView />
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="mt-4">
              <ActivityView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Popup = () => {
  return <PopupContent />;
};

