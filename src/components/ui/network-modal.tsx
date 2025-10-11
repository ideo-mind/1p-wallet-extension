import { PixelBadge } from '@/components/ui/pixel-badge';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { NETWORKS } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import React from 'react';

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNetwork: keyof typeof NETWORKS;
  onNetworkChange: (network: keyof typeof NETWORKS) => void;
}

export const NetworkModal: React.FC<NetworkModalProps> = ({
  isOpen,
  onClose,
  currentNetwork,
  onNetworkChange,
}) => {
  if (!isOpen) return null;

  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-pixel-green text-white';
      case 'coming_soon':
        return 'bg-pixel-accent text-white';
      default:
        return 'bg-pixel-bgDark text-pixel-text';
    }
  };

  const getNetworkStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'coming_soon':
        return 'SOON';
      default:
        return 'UNKNOWN';
    }
  };

  const handleNetworkSelect = (network: keyof typeof NETWORKS) => {
    if (NETWORKS[network].status === 'active') {
      onNetworkChange(network);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg mx-4">
        <PixelCard className="border-4 border-pixel-border bg-pixel-bgDark shadow-pixel-lg">
          <PixelCardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <PixelCardTitle className="text-lg font-pixel text-pixel-text">
                CHANGE NETWORK
              </PixelCardTitle>
              <PixelButton
                variant="default"
                onClick={onClose}
                className="h-8 w-8 p-0 border-2 border-pixel-border bg-pixel-bgDark hover:bg-pixel-bgDark/80"
              >
                <X className="h-4 w-4 text-pixel-text" />
              </PixelButton>
            </div>
          </PixelCardHeader>

          <PixelCardContent className="space-y-4">
            <div className="space-y-3">
              {Object.entries(NETWORKS).map(([key, network]) => {
                const isCurrent = key === currentNetwork;
                const isDisabled = network.status === 'coming_soon';

                return (
                  <PixelButton
                    key={key}
                    variant="default"
                    onClick={() => handleNetworkSelect(key as keyof typeof NETWORKS)}
                    disabled={isDisabled}
                    className={cn(
                      'w-full justify-between h-14 px-4 border-2 border-pixel-border transition-all duration-200',
                      isCurrent && 'bg-pixel-teal text-white border-pixel-teal',
                      !isCurrent && !isDisabled && 'bg-pixel-bg hover:bg-pixel-bgDark',
                      isDisabled && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center border-2 border-pixel-border shadow-pixel-sm flex-shrink-0',
                        isCurrent ? 'bg-white text-pixel-teal' : 'bg-pixel-bgDark text-pixel-text'
                      )}>
                        <span className="text-sm font-pixel">
                          {network.currencySymbol.charAt(0)}
                        </span>
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="font-data text-sm font-semibold truncate">
                          {network.name}
                        </p>
                        <p className="text-xs font-data text-pixel-text/70 truncate">
                          Chain ID: {parseInt(network.chainId, 16)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PixelBadge
                        variant="default"
                        className={cn(
                          'text-[10px] px-2 py-1 border border-pixel-border font-pixelSmall whitespace-nowrap',
                          getNetworkStatusColor(network.status)
                        )}
                      >
                        {getNetworkStatusText(network.status)}
                      </PixelBadge>

                      {isCurrent && (
                        <div className="flex h-6 w-6 items-center justify-center border border-pixel-border bg-white text-pixel-teal shadow-pixel-sm">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </PixelButton>
                );
              })}
            </div>

            <div className="pt-4 border-t-2 border-pixel-border">
              <div className="bg-pixel-bg border-2 border-pixel-border p-3">
                <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
                  💡 Only active networks can be selected. Coming soon networks will be available in future updates.
                </p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      </div>
    </div>
  );
};
