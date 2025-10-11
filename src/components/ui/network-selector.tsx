import { PixelBadge } from '@/components/ui/pixel-badge';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { NETWORKS } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import React from 'react';

interface NetworkSelectorProps {
  currentNetwork: keyof typeof NETWORKS;
  onNetworkChange: (network: keyof typeof NETWORKS) => void;
  className?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  currentNetwork,
  onNetworkChange,
  className,
}) => {
  const getNetworkStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-pixel-green text-pixel-text';
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
        return 'COMING SOON';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs font-pixelSmall text-pixel-text/70 uppercase tracking-wider">
        Available Networks
      </p>

      <div className="space-y-2">
        {Object.entries(NETWORKS).map(([key, network]) => {
          const isCurrent = key === currentNetwork;
          const isDisabled = network.status === 'coming_soon';

          return (
            <PixelCard
              key={key}
              className={cn(
                'cursor-pointer transition-all duration-200',
                isCurrent && 'ring-2 ring-pixel-teal',
                isDisabled && 'opacity-60',
                !isDisabled && 'hover:shadow-pixel-lg hover:-translate-y-1'
              )}
              onClick={() => !isDisabled && onNetworkChange(key as keyof typeof NETWORKS)}
            >
              <PixelCardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-pixel text-sm text-pixel-text">
                        {network.name}
                      </h3>
                      <PixelBadge
                        variant="default"
                        className={cn(
                          'text-[10px] px-2 py-0.5 border-2 border-pixel-border font-pixelSmall',
                          getNetworkStatusColor(network.status)
                        )}
                      >
                        {getNetworkStatusText(network.status)}
                      </PixelBadge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-data text-pixel-text/70">
                        Chain ID: {parseInt(network.chainId, 16)}
                      </p>
                      <p className="text-xs font-data text-pixel-text/70">
                        Currency: {network.currencySymbol}
                      </p>
                      <p className="text-xs font-data text-pixel-text/70 truncate">
                        RPC: {network.rpcUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <div className="flex h-6 w-6 items-center justify-center border-2 border-pixel-border bg-pixel-teal text-white shadow-pixel-sm">
                        <span className="text-xs font-pixel">✓</span>
                      </div>
                    )}
                    {isDisabled && (
                      <div className="flex h-6 w-6 items-center justify-center border-2 border-pixel-border bg-pixel-bgDark text-pixel-text shadow-pixel-sm">
                        <span className="text-xs font-pixel">⏳</span>
                      </div>
                    )}
                  </div>
                </div>
              </PixelCardContent>
            </PixelCard>
          );
        })}
      </div>

      <div className="border-4 border-pixel-border bg-pixel-bgDark p-3">
        <p className="text-xs font-pixelSmall text-pixel-text/70 text-center">
          💡 Only Creditcoin Testnet is currently active. Other networks are coming soon!
        </p>
      </div>
    </div>
  );
};
