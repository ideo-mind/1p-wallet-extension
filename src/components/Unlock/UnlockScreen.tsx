import { ChallengeContainer } from '@/components/AuthChallenge/ChallengeContainer';
import { ResetWalletDialog } from '@/components/Unlock/ResetWalletDialog';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { backendService } from '@/services/backend';
import { contractService } from '@/services/contract';
import { storage } from '@/services/storage';
import { AuthenticationChallenge, Direction, colorGroupsToGrid } from '@/types/protocol';
import { getHotWalletSigner } from '@/utils/hotWallet';
import { createAuthOptionsSignature, createAuthVerifySignature } from '@/utils/signatures';
import { formatEther } from 'ethers';
import { AlertCircle, KeyRound, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UnlockScreenProps {
  onUnlock: () => void;
}

type UnlockStep = 'password' | 'challenge' | 'verifying';

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock }) => {
  const [step, setStep] = useState<UnlockStep>('password');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState<AuthenticationChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const init = async () => {
      const { onePUser } = await storage.get(['onePUser']);
      if (onePUser) {
        setUsername(onePUser);
      }
    };
    init();
  }, []);

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { onePUser, hotWalletAddress } = await storage.get(['onePUser', 'hotWalletAddress']);

      if (!onePUser || !hotWalletAddress) {
        throw new Error('Wallet data not found. Please reset your wallet.');
      }

      // Step 1: Decrypt hot wallet with password
      console.log('[Unlock] Decrypting hot wallet...');
      const hotWallet = await getHotWalletSigner(password);
      console.log('[Unlock] Hot wallet decrypted:', hotWallet.address);

      // Step 2: Get attempt fee
      console.log('[Unlock] Getting attempt fee...');
      const attemptFee = await contractService.getAttemptFee(onePUser);
      console.log('[Unlock] Attempt fee:', formatEther(attemptFee), '1P tokens');

      // Step 3: Check hot wallet has sufficient balance
      const hotWalletBalance = await contractService.balanceOf(hotWallet.address);
      if (hotWalletBalance < attemptFee) {
        throw new Error(
          `Insufficient 1P tokens. Need ${formatEther(attemptFee)} but have ${formatEther(hotWalletBalance)}`
        );
      }

      // Step 4: Request attempt on-chain
      console.log('[Unlock] Requesting authentication attempt...');
      const attemptId = await contractService.requestAttempt(onePUser, hotWallet);
      console.log('[Unlock] Attempt ID:', attemptId);

      // Step 5: Get attempt details from contract
      const attemptInfo = await contractService.getAttempt(attemptId);
      console.log('[Unlock] Attempt difficulty:', attemptInfo.difficulty.toString());

      // Step 6: Sign attempt ID for backend
      console.log('[Unlock] Creating signature for backend...');
      const attemptSignature = await createAuthOptionsSignature(hotWallet, attemptId);

      // Step 7: Get challenges from backend
      console.log('[Unlock] Fetching authentication challenges...');
      const authOptions = await backendService.getAuthOptions(attemptId, attemptSignature);

      const challenges = authOptions.challenges || [];
      const challengeId = authOptions.challenge_id;

      if (!challenges.length || !challengeId) {
        throw new Error('No challenges received from backend');
      }

      console.log('[Unlock] Received', challenges.length, 'challenges');

      // Step 8: Convert challenges to grids for UI
      const grids = challenges.map((ch, idx) => colorGroupsToGrid(ch.colorGroups, idx + 1));

      // Create authentication challenge object
      const authChallenge: AuthenticationChallenge = {
        attemptId,
        grids,
        rounds: challenges.length,
        difficulty: Number(attemptInfo.difficulty),
        expiresAt: Number(attemptInfo.expiresAt) * 1000, // Convert to milliseconds
        challengeId,
      };

      // Store password and challenge for the challenge step
      setChallenge(authChallenge);
      setStep('challenge');
    } catch (err) {
      console.error('[Unlock] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeSubmit = async (directions: Direction[]) => {
    if (!challenge || !challenge.challengeId) {
      return;
    }

    setStep('verifying');
    setLoading(true);
    setError(null);

    try {
      // Decrypt hot wallet again for signing
      const hotWallet = await getHotWalletSigner(password);

      // Convert directions to backend format (U, D, L, R, S)
      const solutions = directions.map((dir) => {
        switch (dir) {
          case 'UP':
            return 'U';
          case 'DOWN':
            return 'D';
          case 'LEFT':
            return 'L';
          case 'RIGHT':
            return 'R';
          case 'SKIP':
            return 'S';
          default:
            return 'S';
        }
      });

      // Sign challenge ID
      console.log('[Unlock] Signing solutions...');
      const { signature } = await createAuthVerifySignature(
        hotWallet,
        challenge.challengeId,
        solutions
      );

      console.log('[Unlock] Submitting solutions to backend...');
      const verifyResult = await backendService.verifyAuth(
        challenge.challengeId,
        solutions,
        signature
      );

      if (!verifyResult.success) {
        throw new Error(verifyResult.error || 'Authentication failed');
      }

      console.log('[Unlock] Authentication successful!');

      // Update storage to unlock wallet
      await storage.set({ isLocked: false });

      // Clear password from memory
      setPassword('');

      // Call onUnlock callback
      onUnlock();
    } catch (err) {
      console.error('[Unlock] Verification error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      // Reset to password step on error
      setStep('password');
      setPassword('');
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 'challenge') {
    return (
      <LoadingOverlay
        message={step === 'verifying' ? 'Verifying authentication...' : 'Initializing unlock...'}
      />
    );
  }

  if (step === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pixel-bg pixel-grid">
        <div className="w-full max-w-md space-y-6">
          <PixelCard variant="blue" padding="lg">
            <PixelCardContent className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-blue shadow-pixel">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-pixel text-pixel-text">WALLET LOCKED</h2>
                  {username && (
                    <p className="mt-2 text-sm font-pixelSmall text-pixel-text/70">{username}</p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-pixelSmall text-pixel-text">
                    ENTER YOUR PASSWORD
                  </label>
                  <Input
                    type="text"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                    placeholder="Enter single character"
                    maxLength={1}
                    pixel={true}
                    autoFocus
                    className="h-16 text-center text-4xl font-bold"
                  />
                  <p className="text-xs font-pixelSmall text-pixel-text/60">
                    ENTER THE SINGLE CHARACTER YOU CHOSE DURING REGISTRATION
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded border-2 border-red-500 bg-red-500/10 p-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                    <p className="text-sm font-pixelSmall text-red-600">{error}</p>
                  </div>
                )}

                <PixelButton
                  onClick={handlePasswordSubmit}
                  disabled={!password || loading}
                  variant="teal"
                  size="lg"
                  className="w-full"
                >
                  <KeyRound className="mr-2 h-5 w-5" />
                  UNLOCK WALLET
                </PixelButton>

                <button
                  onClick={() => setShowResetDialog(true)}
                  className="w-full py-2 text-sm font-pixelSmall text-pixel-text/60 hover:text-pixel-text transition-colors"
                >
                  FORGOT PASSWORD? RESET WALLET
                </button>
              </div>
            </PixelCardContent>
          </PixelCard>

          {showResetDialog && (
            <ResetWalletDialog
              isOpen={showResetDialog}
              onConfirm={async () => {
                await storage.clear();
                window.location.reload();
              }}
              onCancel={() => setShowResetDialog(false)}
            />
          )}
        </div>
      </div>
    );
  }

  if (step === 'challenge' && challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pixel-bg pixel-grid">
        <div className="w-full max-w-2xl">
          <PixelCard variant="blue" padding="lg">
            <PixelCardContent>
              <ChallengeContainer
                challenge={challenge}
                onSubmit={handleChallengeSubmit}
                onCancel={() => {
                  setStep('password');
                  setPassword('');
                  setChallenge(null);
                }}
              />
            </PixelCardContent>
          </PixelCard>
        </div>
      </div>
    );
  }

  if (step === 'verifying') {
    return <LoadingOverlay message="Verifying authentication..." />;
  }

  return <LoadingOverlay message="Loading..." />;
};
