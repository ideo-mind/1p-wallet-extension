import { PixelBadge } from '@/components/ui/pixel-badge';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { NETWORKS } from '@/constants/protocol';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

interface NetworkSwitcherProps {
  currentNetwork: keyof typeof NETWORKS;
  onNetworkChange: (network: keyof typeof NETWORKS) => void;
  className?: string;
}

export const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({
  currentNetwork,
  onNetworkChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentNetworkConfig = NETWORKS[currentNetwork];

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

  return (
    <div className={cn('relative', className)}>
      {/* Clean Current Network Display */}
      <PixelButton
        variant="default"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 border-2 border-pixel-border bg-pixel-bgDark hover:bg-pixel-bgDark/80 justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="font-data text-sm text-pixel-text">
            {currentNetworkConfig.name}
          </span>
          <PixelBadge
            variant="default"
            className={cn(
              'text-[9px] px-2 py-0.5 border border-pixel-border font-pixelSmall',
              getNetworkStatusColor(currentNetworkConfig.status)
            )}
          >
            {getNetworkStatusText(currentNetworkConfig.status)}
          </PixelBadge>
        </div>
        {isOpen ? (
          <ChevronUp className="h-3 w-3 text-pixel-text" />
        ) : (
          <ChevronDown className="h-3 w-3 text-pixel-text" />
        )}
      </PixelButton>

      {/* Clean Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-11 left-0 right-0 z-50">
          <PixelCard className="border-2 border-pixel-border bg-pixel-bgDark shadow-pixel">
            <PixelCardContent className="p-2">
              <div className="space-y-1">
                {Object.entries(NETWORKS).map(([key, network]) => {
                  const isCurrent = key === currentNetwork;
                  const isDisabled = network.status === 'coming_soon';

                  return (
                    <PixelButton
                      key={key}
                      variant="default"
                      onClick={() => {
                        if (!isDisabled) {
                          onNetworkChange(key as keyof typeof NETWORKS);
                          setIsOpen(false);
                        }
                      }}
                      disabled={isDisabled}
                      className={cn(
                        'w-full justify-between h-9 px-3 border border-pixel-border transition-all duration-200',
                        isCurrent && 'bg-pixel-teal text-white border-pixel-teal',
                        !isCurrent && !isDisabled && 'bg-pixel-bg hover:bg-pixel-bgDark',
                        isDisabled && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-data text-sm">
                          {network.name}
                        </span>
                        <PixelBadge
                          variant="default"
                          className={cn(
                            'text-[9px] px-2 py-0.5 border border-pixel-border font-pixelSmall',
                            getNetworkStatusColor(network.status)
                          )}
                        >
                          {getNetworkStatusText(network.status)}
                        </PixelBadge>
                      </div>

                      <div className="flex items-center">
                        {isCurrent && (
                          <div className="flex h-5 w-5 items-center justify-center border border-pixel-border bg-white text-pixel-teal shadow-pixel-sm">
                            <span className="text-xs font-pixel">✓</span>
                          </div>
                        )}
                        {isDisabled && (
                          <div className="flex h-5 w-5 items-center justify-center border border-pixel-border bg-pixel-bgDark text-pixel-text shadow-pixel-sm">
                            <span className="text-xs font-pixel">⏳</span>
                          </div>
                        )}
                      </div>
                    </PixelButton>
                  );
                })}
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>
      )}
    </div>
  );
};
