import { ChallengeContainer } from '@/components/AuthChallenge/ChallengeContainer';
import { ResetWalletDialog } from '@/components/Unlock/ResetWalletDialog';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { backendService } from '@/services/backend';
import { contractService } from '@/services/contract';
import { storage } from '@/services/storage';
import { AuthenticationChallenge, colorGroupsToGrid, Direction } from '@/types/protocol';
import { checkBalances } from '@/utils/balanceChecker';
import { createAuthOptionsSignature, createAuthVerifySignature } from '@/utils/signatures';
import { createWalletFromPrivateKey } from '@/utils/wallet';
import { AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { Hex } from 'viem';
import { formatEther, parseEther } from 'viem';
import type { Account } from 'viem/accounts';

interface UnlockScreenProps {
  onUnlock: () => void;
}

type UnlockStep = 'challenge' | 'verifying';

export const UnlockScreen: React.FC<UnlockScreenProps> = ({ onUnlock }) => {
  const [step, setStep] = useState<UnlockStep>('challenge');
  const [challenge, setChallenge] = useState<AuthenticationChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Starting authentication...');
  const [error, setError] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [creatorWallet, setCreatorWallet] = useState<Account | null>(null); // Store decrypted wallet

  useEffect(() => {
    const init = async () => {
      const { onePUser } = await storage.get(['onePUser']);
      if (onePUser) {
        setUsername(onePUser);
        // Start authentication flow immediately
        await startAuthenticationFlow(onePUser);
      } else {
        setError('No username found. Please reset your wallet.');
        setLoading(false);
      }
    };
    init();
  }, []);

  const startAuthenticationFlow = async (onePUser: string) => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get attempt fee
      setLoadingMessage('Getting attempt fee...');
      console.log('[Unlock] Getting attempt fee...');
      const attemptFee = await contractService.getAttemptFee(onePUser);
      console.log('[Unlock] Attempt fee:', formatEther(attemptFee), '1P tokens');

      // Step 2: Load encrypted creator wallet data from storage
      setLoadingMessage('Loading wallet...');
      const { encryptedCreatorPrivateKey, encryptedEncryptionKey, creatorWalletAddress } =
        await storage.get([
          'encryptedCreatorPrivateKey',
          'encryptedEncryptionKey',
          'creatorWalletAddress',
        ]);

      if (!encryptedCreatorPrivateKey || !encryptedEncryptionKey || !creatorWalletAddress) {
        throw new Error('Creator wallet not found. Please reset your wallet.');
      }

      // Step 3: Decrypt creator wallet (we need password for this)
      setLoadingMessage('Decrypting wallet...');
      console.log('[Unlock] Decrypting creator wallet...');

      // For now, we'll need to prompt for password since we need it to decrypt the encryption key
      // This is a temporary solution - in the future we might keep wallet unlocked in memory
      const password = prompt('Enter your password to unlock wallet:');
      if (!password) {
        throw new Error('Password required to unlock wallet');
      }

      const { decryptWithPassword, decryptPrivateKey } = await import('@/utils/crypto');
      const encryptionKey = await decryptWithPassword(encryptedEncryptionKey, password);
      const privateKey = await decryptPrivateKey(encryptedCreatorPrivateKey, encryptionKey);

      // Create wallet from decrypted private key using viem
      const walletInfo = createWalletFromPrivateKey(privateKey as Hex);
      const creatorWallet = walletInfo.account;
      console.log('[Unlock] Creator wallet decrypted:', walletInfo.address);

      // Store wallet in state for later use
      setCreatorWallet(creatorWallet);

      // Step 4: Check creator wallet has sufficient balance
      setLoadingMessage('Checking balances...');
      const balances = await checkBalances(walletInfo.address, attemptFee);

      console.log('[Unlock] Native balance:', formatEther(balances.nativeBalance), 'CTC');
      console.log('[Unlock] Token balance:', formatEther(balances.tokenBalance), '1P');

      if (balances.needsAirdrop) {
        console.log('[Unlock] Insufficient funds, requesting airdrop...');
        setLoadingMessage('Requesting airdrop...');

        // Use decrypted creator wallet for airdrop with debug
        const { createAirdropSignatureWithDebug } = await import('@/utils/signatureDebug');
        const { message, signature, debug } = await createAirdropSignatureWithDebug(creatorWallet);

        console.log('[Unlock] Signature debug info:', debug);

        if (!debug.addressesMatch) {
          console.error('[Unlock] ❌ CRITICAL: Signature address mismatch detected!');
          console.error('[Unlock] Expected address:', debug.signerAddress);
          console.error('[Unlock] Recovered address:', debug.recoveredAddress);
          throw new Error(
            `Signature verification failed: Expected ${debug.signerAddress} but recovered ${debug.recoveredAddress}`
          );
        }

        const airdropResult = await backendService.airdrop(message, signature);

        if (!airdropResult.success) {
          throw new Error(airdropResult.error || 'Airdrop failed. Please contact support.');
        }

        console.log('[Unlock] Airdrop successful!');
        if (airdropResult.transactions) {
          console.log('[Unlock] Native TX:', airdropResult.transactions.native);
          console.log('[Unlock] Token TX:', airdropResult.transactions.token);
        }

        // Validate that airdrop went to correct address
        if (airdropResult.address) {
          console.log('[Unlock] Backend extracted address:', airdropResult.address);
          console.log('[Unlock] Expected address:', walletInfo.address);

          if (airdropResult.address.toLowerCase() !== walletInfo.address.toLowerCase()) {
            console.error('[Unlock] ❌ CRITICAL: Airdrop sent to wrong address!');
            console.error('[Unlock] Expected:', walletInfo.address);
            console.error('[Unlock] Actual:', airdropResult.address);
            throw new Error(
              `Airdrop sent to wrong address: ${airdropResult.address} instead of ${walletInfo.address}`
            );
          } else {
            console.log('[Unlock] ✅ Airdrop sent to correct address');
          }
        }

        // Poll for balance updates (retry up to 10 times with 2s delay = 20s max)
        setLoadingMessage('Waiting for airdrop confirmation...');
        const { pollForBalances } = await import('@/utils/balancePoller');
        const NATIVE_THRESHOLD = parseEther('0.1');

        const pollResult = await pollForBalances(
          walletInfo.address,
          NATIVE_THRESHOLD,
          attemptFee,
          10, // Max 10 attempts
          2000 // 2 second delay between attempts
        );

        if (!pollResult.success) {
          console.error('[Unlock] Balances after polling:', {
            native: formatEther(pollResult.nativeBalance),
            tokens: formatEther(pollResult.tokenBalance),
            attempts: pollResult.attempts,
          });
          throw new Error(
            `Airdrop completed but balances still insufficient after ${pollResult.attempts} checks. ` +
              `Current: ${formatEther(pollResult.nativeBalance)} CTC, ${formatEther(pollResult.tokenBalance)} 1P. ` +
              `Please wait a moment and try again or contact support.`
          );
        }

        console.log(
          '[Unlock] Balances sufficient after airdrop (took',
          pollResult.attempts,
          'attempts)'
        );
      }

      // Step 5: Request attempt on-chain (using decrypted creator wallet)
      setLoadingMessage('Requesting authentication attempt...');
      console.log('[Unlock] Requesting authentication attempt...');
      const attemptId = await contractService.requestAttempt(onePUser, creatorWallet);
      console.log('[Unlock] Attempt ID:', attemptId);

      // Step 5: Get attempt details from contract
      const attemptInfo = await contractService.getAttempt(attemptId);
      console.log('[Unlock] Attempt difficulty:', attemptInfo.difficulty.toString());

      // Step 6: Sign attempt ID for backend (using creator wallet)
      console.log('[Unlock] Creating signature for backend...');
      const attemptSignature = await createAuthOptionsSignature(creatorWallet, attemptId);

      // Step 7: Get challenges from backend
      setLoadingMessage('Fetching authentication challenges...');
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

      // Store challenge for the challenge step
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
    if (!challenge || !challenge.challengeId || !creatorWallet) {
      return;
    }

    setStep('verifying');
    setLoading(true);
    setError(null);

    try {
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

      // Sign challenge ID (using creator wallet)
      console.log('[Unlock] Signing solutions...');
      const { signature } = await createAuthVerifySignature(
        creatorWallet,
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

      // Call onUnlock callback
      onUnlock();
    } catch (err) {
      console.error('[Unlock] Verification error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      // Reset to challenge step on error
      setStep('challenge');
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step !== 'challenge') {
    return <LoadingOverlay message={loadingMessage} />;
  }

  if (error && step === 'challenge') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pixel-bg pixel-grid">
        <div className="w-full max-w-md space-y-6">
          <PixelCard variant="default" padding="lg">
            <PixelCardContent className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-red shadow-pixel">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-pixel text-pixel-text">AUTHENTICATION ERROR</h2>
                  {username && (
                    <p className="mt-2 text-sm font-pixelSmall text-pixel-text/70">{username}</p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              <div className="flex items-start gap-3 rounded border-2 border-red-500 bg-red-500/10 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <p className="text-sm font-pixelSmall text-red-600">{error}</p>
              </div>

              <div className="flex gap-3">
                <PixelButton
                  onClick={() => {
                    setError(null);
                    startAuthenticationFlow(username);
                  }}
                  variant="teal"
                  size="lg"
                  className="flex-1"
                >
                  RETRY
                </PixelButton>

                <button
                  onClick={() => setShowResetDialog(true)}
                  className="px-4 py-2 text-sm font-pixelSmall text-pixel-text/60 hover:text-pixel-text transition-colors"
                >
                  RESET WALLET
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
                  setStep('challenge');
                  setChallenge(null);
                  setError('Authentication cancelled');
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
