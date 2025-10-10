import { ActivityView } from '@/components/Dashboard/ActivityView';
import { TokensView } from '@/components/Dashboard/TokensView';
import { WalletOverview } from '@/components/Dashboard/WalletOverview';
import { RegistrationWizard } from '@/components/Registration/RegistrationWizard';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { UnifiedBackground } from '@/components/effects/UnifiedBackground';
import { storage } from '@/services/storage';
import { Activity, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';

type View = 'loading' | 'register' | 'dashboard';

const PopupContent = () => {
  const [view, setView] = useState<View>('loading');
  const [username, setUsername] = useState('');
  const [address, setAddress] = useState('');
  const [activeTab, setActiveTab] = useState('tokens');

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const { onePUser, custodialAddress } = await storage.get(['onePUser', 'custodialAddress']);

        if (onePUser && custodialAddress) {
          setUsername(onePUser);
          setAddress(custodialAddress);
          setView('dashboard');
        } else {
          setView('register');
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

  if (view === 'loading') {
    return <LoadingOverlay message="Loading wallet..." />;
  }

  if (view === 'register') {
    return (
      <div className="popup-container overflow-y-auto bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30">
        <div className="p-4">
          <RegistrationWizard onComplete={handleRegistrationComplete} />
        </div>
      </div>
    );
  }

  return (
      <div className="popup-container overflow-y-auto bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30 relative">
      <UnifiedBackground variant="default" color="teal" />
      {/* Header */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/80 border-b border-gray-800/50 px-5 py-4 scanline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-logo-teal to-logo-blue text-white shadow-neon animate-neon-pulse">
              <span className="text-sm font-bold">1P</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">1P Wallet</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-green-900/50 text-green-300 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Sepolia
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5 relative z-10">
        <WalletOverview username={username} address={address} />

        <div className="w-full">
          <div className="grid w-full grid-cols-2 bg-muted/50 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'tokens'
                  ? 'bg-gradient-to-r from-logo-teal to-logo-blue text-white shadow-neon'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105'
              }`}
            >
              <Coins className="h-4 w-4" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-logo-teal to-logo-blue text-white shadow-neon'
                  : 'text-muted-foreground hover:text-foreground hover:scale-105'
              }`}
            >
              <Activity className="h-4 w-4" />
              Activity
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

