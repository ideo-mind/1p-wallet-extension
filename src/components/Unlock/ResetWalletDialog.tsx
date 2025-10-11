import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from '@/components/ui/pixel-card';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface ResetWalletDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetWalletDialog: React.FC<ResetWalletDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <PixelCard className="w-full max-w-md border-4 border-pixel-accent shadow-pixel-xl">
        <PixelCardHeader className="space-y-3">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-accent text-white shadow-pixel mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <PixelCardTitle className="text-center text-xl font-pixel text-pixel-text">
            RESET WALLET?
          </PixelCardTitle>
        </PixelCardHeader>

        <PixelCardContent className="space-y-6">
          {/* Warning Message */}
          <div className="space-y-3 p-4 border-2 border-pixel-accent bg-pixel-accent/10">
            <p className="font-pixelSmall text-sm text-pixel-text leading-relaxed">
              This action will permanently delete:
            </p>
            <ul className="list-none space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <span className="text-pixel-accent font-bold">•</span>
                <span className="font-pixelSmall text-sm text-pixel-text/90">
                  Your wallet account and address
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pixel-accent font-bold">•</span>
                <span className="font-pixelSmall text-sm text-pixel-text/90">
                  All stored passwords and settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pixel-accent font-bold">•</span>
                <span className="font-pixelSmall text-sm text-pixel-text/90">
                  Transaction history (local cache)
                </span>
              </li>
            </ul>
          </div>

          {/* Additional Warning */}
          <div className="p-4 border-2 border-pixel-border bg-pixel-bgDark">
            <p className="font-pixelSmall text-xs text-pixel-text/80 text-center leading-relaxed">
              Make sure you have access to your custodial account credentials if you want to recover
              your wallet. This action <span className="text-pixel-accent font-bold">cannot be undone</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <PixelButton
              onClick={onCancel}
              variant="default"
              className="flex-1 h-12 text-sm"
            >
              CANCEL
            </PixelButton>
            <PixelButton
              onClick={onConfirm}
              variant="default"
              className="flex-1 h-12 text-sm border-pixel-accent bg-pixel-accent text-white hover:bg-pixel-accent/80"
            >
              RESET WALLET
            </PixelButton>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
};

