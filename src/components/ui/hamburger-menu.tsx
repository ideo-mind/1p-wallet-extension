import { NetworkModal } from '@/components/ui/network-modal';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { NETWORKS } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import { Lock, Menu, Network, RotateCcw, Settings, X } from 'lucide-react';
import React, { useState } from 'react';

interface HamburgerMenuProps {
  currentNetwork: keyof typeof NETWORKS;
  onNetworkChange: (network: keyof typeof NETWORKS) => void;
  onLockWallet: () => void;
  onResetWallet: () => void;
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  currentNetwork,
  onNetworkChange,
  onLockWallet,
  onResetWallet,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);

  const handleLockWallet = () => {
    onLockWallet();
    setIsOpen(false);
  };

  const handleResetWallet = () => {
    onResetWallet();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Hamburger Button */}
      <PixelButton
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 p-0 border-2 border-pixel-border bg-pixel-bgDark hover:bg-pixel-bgDark/80"
      >
        {isOpen ? (
          <X className="h-4 w-4 text-pixel-text" />
        ) : (
          <Menu className="h-4 w-4 text-pixel-text" />
        )}
      </PixelButton>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-11 right-0 z-50">
          <PixelCard className="border-2 border-pixel-border bg-pixel-bgDark shadow-pixel min-w-64">
            <PixelCardContent className="p-3">
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-pixel-border">
                  <Settings className="h-4 w-4 text-pixel-text" />
                  <span className="font-pixel text-sm text-pixel-text">SETTINGS</span>
                </div>

                {/* Change Network Button */}
                <div className="space-y-1">
                  <PixelButton
                    variant="default"
                    onClick={() => {
                      setIsNetworkModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full justify-start h-10 px-3 border border-pixel-border bg-pixel-bg hover:bg-pixel-bgDark transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Network className="h-4 w-4 text-pixel-text" />
                      <div className="text-left">
                        <p className="font-pixelSmall text-xs text-pixel-text">CHANGE NETWORK</p>
                        <p className="font-data text-xs text-pixel-text/70">
                          {NETWORKS[currentNetwork].name}
                        </p>
                      </div>
                    </div>
                  </PixelButton>
                </div>

                {/* Lock Wallet Button */}
                <div className="space-y-1">
                  <PixelButton
                    variant="default"
                    onClick={handleLockWallet}
                    className="w-full justify-start h-10 px-3 border border-pixel-border bg-pixel-bg hover:bg-pixel-bgDark transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4 text-pixel-text" />
                      <span className="font-pixelSmall text-xs text-pixel-text">LOCK WALLET</span>
                    </div>
                  </PixelButton>
                </div>

                {/* Reset Section */}
                <div className="pt-2 border-t border-pixel-border">
                  <PixelButton
                    variant="default"
                    onClick={handleResetWallet}
                    className="w-full justify-start h-8 px-2 border border-pixel-border bg-pixel-accent hover:bg-pixel-accent/80 text-white transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="h-3 w-3" />
                      <span className="font-pixelSmall text-xs">RESET WALLET</span>
                    </div>
                  </PixelButton>
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>
      )}

      {/* Network Modal */}
      <NetworkModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        currentNetwork={currentNetwork}
        onNetworkChange={onNetworkChange}
      />
    </div>
  );
};
