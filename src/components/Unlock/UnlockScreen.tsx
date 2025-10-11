import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { CharacterGrid } from '@/components/Unlock/CharacterGrid';
import { DirectionSelector } from '@/components/Unlock/DirectionSelector';
import { ResetWalletDialog } from '@/components/Unlock/ResetWalletDialog';
import { storage } from '@/services/storage';
import { Direction } from '@/types/protocol';
import { generateRandomColorAssignment, getColorNameFromHex } from '@/utils/colorAssignment';
import { decrypt } from '@/utils/crypto';
import { AlertCircle, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UnlockScreenProps {
  onUnlock: () => void;
}

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock }) => {
  const [characterColors, setCharacterColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [username, setUsername] = useState('');

  // Generate random color assignment on mount
  useEffect(() => {
    const initColors = async () => {
      const colors = generateRandomColorAssignment();
      setCharacterColors(colors);

      // Get username for display
      const { onePUser } = await storage.get(['onePUser']);
      if (onePUser) {
        setUsername(onePUser);
      }
    };

    initColors();
  }, []);

  const handleDirectionSelect = async (direction: Direction) => {
    setLoading(true);
    setError(null);

    try {
      // Get stored password and color-direction mapping
      const { encryptedPassword, colorDirectionMap, onePUser } = await storage.get([
        'encryptedPassword',
        'colorDirectionMap',
        'onePUser',
      ]);

      console.log('=== STORAGE RETRIEVAL DEBUG ===');
      console.log('Encrypted password exists:', !!encryptedPassword);
      console.log('Color direction map exists:', !!colorDirectionMap);
      console.log('OnePUser exists:', !!onePUser);
      console.log('Retrieved colorDirectionMap:', JSON.stringify(colorDirectionMap, null, 2));
      console.log('Type of colorDirectionMap:', typeof colorDirectionMap);
      console.log('================================');

      if (!encryptedPassword || !colorDirectionMap || !onePUser) {
        throw new Error('Wallet data not found. Please reset your wallet.');
      }

      // Decrypt password (using username as key)
      console.log('=== DECRYPTION DEBUG ===');
      console.log('Encrypted password:', encryptedPassword);
      console.log('OnePUser for decryption:', onePUser);
      console.log('=======================');
      const password = await decrypt(encryptedPassword, onePUser);
      console.log('Decrypted password:', password);

      // Ensure password is lowercase for lookup
      const passwordLower = password.toLowerCase();

      // Get color assigned to password character in current grid
      const passwordColor = characterColors[passwordLower];

      if (!passwordColor) {
        throw new Error(`Password character '${passwordLower}' not found in grid.`);
      }

      // Get color name from hex
      const colorName = getColorNameFromHex(passwordColor);

      if (!colorName) {
        throw new Error('Invalid color assignment.');
      }

      // Get the direction user assigned to that color
      const correctDirection = colorDirectionMap[colorName];

      // Enhanced debug logging
      console.log('=== UNLOCK VALIDATION DEBUG ===');
      console.log('1. Password character:', passwordLower);
      console.log('2. Color assigned to password:', passwordColor);
      console.log('3. Color name:', colorName);
      console.log('4. User color-direction mapping:', JSON.stringify(colorDirectionMap, null, 2));
      console.log('5. Correct direction for', colorName, ':', correctDirection);
      console.log('6. User selected direction:', direction);
      console.log('7. Match?', direction === correctDirection);
      console.log('================================');

      if (!correctDirection) {
        throw new Error(`No direction found for color ${colorName} in mapping`);
      }

      // Verify with detailed comparison
      const isMatch = direction === correctDirection;
      console.log('=== DIRECTION COMPARISON ===');
      console.log('Selected direction:', JSON.stringify(direction));
      console.log('Correct direction:', JSON.stringify(correctDirection));
      console.log('Selected type:', typeof direction);
      console.log('Correct type:', typeof correctDirection);
      console.log('String comparison:', direction === correctDirection);
      console.log('Strict equality:', direction === correctDirection);
      console.log('============================');

      if (isMatch) {
        console.log('✓ Unlock successful!');
        await storage.set({ isLocked: false });
        onUnlock();
      } else {
        setError(`Incorrect. ${colorName} should be ${correctDirection}, you selected ${direction}.`);
        const newColors = generateRandomColorAssignment();
        setCharacterColors(newColors);
      }
    } catch (err) {
      console.error('Unlock error:', err);
      setError(err instanceof Error ? err.message : 'Unlock failed. Please try again.');

      // Regenerate colors on error
      const newColors = generateRandomColorAssignment();
      setCharacterColors(newColors);
    } finally {
      setLoading(false);
    }
  };

  const handleResetWallet = async () => {
    try {
      // Clear all storage
      await storage.clear();

      // Reload to trigger registration flow
      window.location.reload();
    } catch (err) {
      console.error('Reset wallet error:', err);
      setError('Failed to reset wallet. Please try again.');
    }
  };

  if (loading) {
    return <LoadingOverlay message="Unlocking wallet..." />;
  }

  return (
    <div className="min-h-screen bg-pixel-bg pixel-grid p-4 space-y-5">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-teal text-white shadow-pixel">
          <Lock className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-pixel text-pixel-text">WALLET LOCKED</h1>
          <p className="text-sm font-pixelSmall text-pixel-text/70 mt-1">
            {username ? `${username}.1p` : 'Unlock to continue'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <PixelCard className="border-2 border-pixel-accent bg-pixel-accent/10 animate-shake">
          <PixelCardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-pixel-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-pixelSmall text-sm text-pixel-accent">{error}</p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      )}

      {/* Character Grid */}
      <CharacterGrid characterColors={characterColors} />

      {/* Direction Selector */}
      <DirectionSelector
        onSelect={handleDirectionSelect}
        disabled={loading}
      />

      {/* Reset Option */}
      <div className="text-center pt-4">
        <button
          onClick={() => setShowResetDialog(true)}
          className="text-sm font-pixelSmall text-pixel-text/50 hover:text-pixel-accent transition-colors underline"
        >
          Unable to unlock? Reset Wallet
        </button>
      </div>

      {/* Reset Dialog */}
      <ResetWalletDialog
        isOpen={showResetDialog}
        onConfirm={handleResetWallet}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
};

