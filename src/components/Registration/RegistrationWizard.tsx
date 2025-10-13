import { ColorDirectionMapper } from '@/components/Registration/ColorDirectionMapper';
import { PasswordInput } from '@/components/Registration/PasswordInput';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { CardContent, CardDescription } from '@/components/ui/card';
import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { backendService } from '@/services/backend';
import { contractService } from '@/services/contract';
import { storage } from '@/services/storage';
import { ColorDirectionMapping } from '@/types/storage';
import { checkBalances } from '@/utils/balanceChecker';
import { createRegistrationSignature } from '@/utils/signatures';
import { Wallet, formatEther, parseEther } from 'ethers';
import { Brush, CheckCircle2, Key, Lock, Palette, User, UserPlus, Zap } from 'lucide-react';
import { useState } from 'react';
import { UsernameInput } from './UsernameInput';

type Step = 'welcome' | 'username' | 'password' | 'colorMapping' | 'complete';

interface RegistrationWizardProps {
  onComplete: () => void;
}

export const RegistrationWizard = ({ onComplete }: RegistrationWizardProps) => {
  const [step, setStep] = useState<Step>('welcome');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [colorDirectionMap, setColorDirectionMap] = useState<ColorDirectionMapping | null>(null);
  const [usernameValid, setUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [colorMappingValid, setColorMappingValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Creating your wallet...');
  const [error, setError] = useState<string | null>(null);
  const [custodialAddress, setCustodialAddress] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!colorDirectionMap) {
        throw new Error('Color direction mapping is required');
      }

      // Step 1: Generate new creator wallet for this user
      setLoadingMessage('Generating wallet...');
      console.log('[Registration] Generating new creator wallet...');
      const creatorWallet = Wallet.createRandom() as unknown as Wallet;
      console.log('[Registration] ========================================');
      console.log('[Registration] NEW WALLET CREATED');
      console.log('[Registration] Public Address:', creatorWallet.address);
      console.log('[Registration] Private Key:', creatorWallet.privateKey);
      console.log('[Registration] ========================================');

      // Step 2: Generate encryption key and encrypt private key
      setLoadingMessage('Securing wallet...');
      console.log('[Registration] Generating encryption key...');
      const { generateEncryptionKey, encryptPrivateKey, encryptWithPassword } = await import(
        '@/utils/crypto'
      );

      const encryptionKey = generateEncryptionKey();
      const encryptedCreatorPrivateKey = await encryptPrivateKey(
        creatorWallet.privateKey,
        encryptionKey
      );
      const encryptedEncryptionKey = await encryptWithPassword(encryptionKey, password);
      const encryptedPassword = await encryptWithPassword(password, password);

      console.log('[Registration] Wallet secured with encryption');

      // Step 3: Check balances and request airdrop if needed
      setLoadingMessage('Checking balances...');
      console.log('[Registration] Checking balances...');
      const REGISTRATION_FEE = parseEther('100'); // 100 1P tokens
      const balances = await checkBalances(creatorWallet.address, REGISTRATION_FEE);

      console.log('[Registration] Native balance:', formatEther(balances.nativeBalance), 'CTC');
      console.log('[Registration] Token balance:', formatEther(balances.tokenBalance), '1P');

      if (balances.needsAirdrop) {
        console.log('[Registration] Insufficient funds, requesting airdrop...');
        setLoadingMessage('Requesting airdrop...');

        // Debug signature creation to identify address extraction issue
        const { createAirdropSignatureWithDebug } = await import('@/utils/signatureDebug');
        const { message, signature, debug } = await createAirdropSignatureWithDebug(creatorWallet);

        console.log('[Registration] Signature debug info:', debug);

        if (!debug.addressesMatch) {
          console.error('[Registration] ❌ CRITICAL: Signature address mismatch detected!');
          console.error('[Registration] Expected address:', debug.signerAddress);
          console.error('[Registration] Recovered address:', debug.recoveredAddress);
          throw new Error(
            `Signature verification failed: Expected ${debug.signerAddress} but recovered ${debug.recoveredAddress}`
          );
        }

        const airdropResult = await backendService.airdrop(message, signature);

        if (!airdropResult.success) {
          throw new Error(airdropResult.error || 'Airdrop failed. Please contact support.');
        }

        console.log('[Registration] Airdrop successful!');
        if (airdropResult.transactions) {
          console.log('[Registration] Native TX:', airdropResult.transactions.native);
          console.log('[Registration] Token TX:', airdropResult.transactions.token);
        }

        // Validate that airdrop went to correct address
        if (airdropResult.address) {
          console.log('[Registration] Backend extracted address:', airdropResult.address);
          console.log('[Registration] Expected address:', creatorWallet.address);

          if (airdropResult.address.toLowerCase() !== creatorWallet.address.toLowerCase()) {
            console.error('[Registration] ❌ CRITICAL: Airdrop sent to wrong address!');
            console.error('[Registration] Expected:', creatorWallet.address);
            console.error('[Registration] Actual:', airdropResult.address);
            throw new Error(
              `Airdrop sent to wrong address: ${airdropResult.address} instead of ${creatorWallet.address}`
            );
          } else {
            console.log('[Registration] ✅ Airdrop sent to correct address');
          }
        }

        // Poll for balance updates (retry up to 10 times with 2s delay = 20s max)
        setLoadingMessage('Waiting for airdrop confirmation...');
        const { pollForBalances } = await import('@/utils/balancePoller');
        const NATIVE_THRESHOLD = parseEther('0.1');

        const pollResult = await pollForBalances(
          creatorWallet.address,
          NATIVE_THRESHOLD,
          REGISTRATION_FEE,
          10, // Max 10 attempts
          2000 // 2 second delay between attempts
        );

        if (!pollResult.success) {
          console.error('[Registration] Balances after polling:', {
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
          '[Registration] Balances sufficient after airdrop (took',
          pollResult.attempts,
          'attempts)'
        );
      }

      // Step 4: Register on-chain (costs 100 1P tokens)
      setLoadingMessage('Registering on contract...');
      console.log('[Registration] Registering on contract...');
      const txHash = await contractService.register(
        username,
        username, // Display name = username for now
        `https://example.com/avatar/${username}.png`, // Default avatar
        creatorWallet
      );

      console.log('[Registration] Contract registration successful:', txHash);

      // Step 5: Create legend for backend (convert color mapping to backend format)
      setLoadingMessage('Verifying with backend...');
      const legend = {
        red:
          colorDirectionMap.RED === 'UP'
            ? 'U'
            : colorDirectionMap.RED === 'DOWN'
              ? 'D'
              : colorDirectionMap.RED === 'LEFT'
                ? 'L'
                : 'R',
        green:
          colorDirectionMap.GREEN === 'UP'
            ? 'U'
            : colorDirectionMap.GREEN === 'DOWN'
              ? 'D'
              : colorDirectionMap.GREEN === 'LEFT'
                ? 'L'
                : 'R',
        blue:
          colorDirectionMap.BLUE === 'UP'
            ? 'U'
            : colorDirectionMap.BLUE === 'DOWN'
              ? 'D'
              : colorDirectionMap.BLUE === 'LEFT'
                ? 'L'
                : 'R',
        yellow:
          colorDirectionMap.YELLOW === 'UP'
            ? 'U'
            : colorDirectionMap.YELLOW === 'DOWN'
              ? 'D'
              : colorDirectionMap.YELLOW === 'LEFT'
                ? 'L'
                : 'R',
      };

      // Step 6: Create registration signature for backend
      console.log('[Registration] Creating backend signature...');
      const { payload, signature } = await createRegistrationSignature(creatorWallet, {
        onePUser: username,
        password,
        legend,
      });

      // Step 7: Verify registration with backend
      console.log('[Registration] Verifying with backend...');
      const verifyResult = await backendService.verifyRegistration(payload, signature);

      if (!verifyResult.success) {
        // Check if already registered error
        if (verifyResult.error?.toLowerCase().includes('already registered')) {
          console.log('[Registration] User already registered on backend, continuing...');
        } else {
          throw new Error(verifyResult.error || 'Backend verification failed');
        }
      }

      console.log('[Registration] Backend verification successful');

      // Step 8: Get custodial address from contract
      console.log('[Registration] Fetching user profile...');
      const profile = await contractService.getUserProfile(username);

      let custodialAddr = profile.account;
      if (!custodialAddr || custodialAddr === '0x0000000000000000000000000000000000000000') {
        // Account not attached yet, use creator address temporarily
        console.warn('[Registration] Custodial address not set, using creator address');
        custodialAddr = creatorWallet.address;
      }

      // Step 9: Save to storage with encrypted creator wallet
      setLoadingMessage('Saving wallet...');
      await storage.set({
        onePUser: username,
        custodialAddress: custodialAddr,
        creatorWalletAddress: creatorWallet.address,
        encryptedCreatorPrivateKey,
        encryptedEncryptionKey,
        encryptedPassword,
        colorDirectionMap,
        isLocked: false, // Unlocked initially
        network: 'creditcoin_testnet',
        approvedOrigins: {},
        txHistory: [],
        registrationTxHash: txHash,
        storageVersion: 2, // Mark as new storage version
      });

      setCustodialAddress(custodialAddr);

      // Clear sensitive data from memory
      setPassword('');

      console.log('[Registration] Registration complete!');
      setStep('complete');
    } catch (err) {
      console.error('[Registration] Error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  if (step === 'welcome') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section */}
        <PixelCard variant="teal" padding="lg" className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center border-4 border-white shadow-pixel bg-white/20">
            <img
              src="/icons/icon48.png"
              alt="1P Wallet"
              className="h-12 w-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div>
            <h1 className="text-3xl font-pixel tracking-tight">1P WALLET</h1>
            <p className="mt-2 text-sm font-pixelSmall text-white/90">
              THE FUTURE OF QUANTUM-RESISTANT AUTHENTICATION
            </p>
          </div>
        </PixelCard>

        {/* Features */}
        <PixelCard>
          <PixelCardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-pixel text-pixel-text">WHY 1P IS DIFFERENT</h2>
            <div className="space-y-3">
              {[
                {
                  icon: <Key className="h-5 w-5 text-pixel-teal" />,
                  text: 'NO SEED PHRASES TO MANAGE',
                  subtext: 'Your brain is your vault',
                },
                {
                  icon: <Brush className="h-5 w-5 text-pixel-blue" />,
                  text: 'VISUAL GRID AUTHENTICATION',
                  subtext: 'Beautiful and secure',
                },
                {
                  icon: <Zap className="h-5 w-5 text-pixel-green" />,
                  text: 'QUANTUM-RESISTANT',
                  subtext: 'Future-proof security',
                },
                {
                  icon: <UserPlus className="h-5 w-5 text-pixel-accent" />,
                  text: 'SIMPLE USERNAME.1P IDENTITY',
                  subtext: 'Easy to remember',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 border-2 border-pixel-border hover:border-pixel-teal transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                  <div>
                    <p className="font-pixelSmall text-sm font-bold">{feature.text}</p>
                    <p className="text-xs text-pixel-text/70 font-pixelSmall">{feature.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* CTA */}
        <PixelButton
          onClick={() => setStep('username')}
          variant="teal"
          size="lg"
          className="w-full h-12 text-base font-pixel"
        >
          CREATE NEW WALLET
        </PixelButton>
      </div>
    );
  }

  if (step === 'username') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-pixelSmall text-pixel-text">STEP 1 OF 3</span>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-bg border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-bg border border-pixel-border"></div>
          </div>
        </div>

        <PixelCard>
          <PixelCardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-pixel-border bg-pixel-teal text-white shadow-pixel">
              <User className="h-6 w-6" />
            </div>
            <div>
              <PixelCardTitle className="text-xl font-pixel text-pixel-text">
                CHOOSE USERNAME
              </PixelCardTitle>
              <CardDescription className="text-base mt-1 font-pixelSmall text-pixel-text/80">
                This will be your identity on the blockchain
              </CardDescription>
            </div>
          </PixelCardHeader>
          <CardContent className="space-y-6">
            <UsernameInput
              value={username}
              onChange={setUsername}
              onValidation={setUsernameValid}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <PixelButton
                variant="default"
                onClick={() => setStep('welcome')}
                className="flex-1 h-11"
              >
                BACK
              </PixelButton>
              <PixelButton
                onClick={() => setStep('password')}
                disabled={!usernameValid}
                variant="teal"
                className="flex-1 h-11"
              >
                CONTINUE
              </PixelButton>
            </div>
          </CardContent>
        </PixelCard>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-pixelSmall text-pixel-text">STEP 2 OF 3</span>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-bg border border-pixel-border"></div>
          </div>
        </div>

        <PixelCard>
          <PixelCardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-pixel-border bg-pixel-blue text-white shadow-pixel">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <PixelCardTitle className="text-xl font-pixel text-pixel-text">
                CHOOSE PASSWORD
              </PixelCardTitle>
              <CardDescription className="text-base mt-1 font-pixelSmall text-pixel-text/80">
                Type a single character that you&apos;ll remember
              </CardDescription>
            </div>
          </PixelCardHeader>
          <CardContent className="space-y-6">
            <PasswordInput
              value={password}
              onChange={setPassword}
              onValidation={setPasswordValid}
            />

            {error && <p className="text-sm font-pixelSmall text-red-600">{error}</p>}

            <div className="flex gap-3">
              <PixelButton
                variant="default"
                onClick={() => setStep('username')}
                className="flex-1 h-11"
              >
                BACK
              </PixelButton>
              <PixelButton
                onClick={() => setStep('colorMapping')}
                disabled={!passwordValid}
                variant="blue"
                className="flex-1 h-11"
              >
                CONTINUE
              </PixelButton>
            </div>
          </CardContent>
        </PixelCard>
      </div>
    );
  }

  if (step === 'colorMapping') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-pixelSmall text-pixel-text">STEP 3 OF 3</span>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
            <div className="h-1.5 w-12 bg-pixel-teal border border-pixel-border"></div>
          </div>
        </div>

        <PixelCard>
          <PixelCardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-pixel-border bg-pixel-accent text-white shadow-pixel">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <PixelCardTitle className="text-xl font-pixel text-pixel-text">
                ASSIGN COLORS TO DIRECTIONS
              </PixelCardTitle>
              <CardDescription className="text-base mt-1 font-pixelSmall text-pixel-text/80">
                Use arrow keys to assign directions to each color
              </CardDescription>
            </div>
          </PixelCardHeader>
          <CardContent className="space-y-6">
            <ColorDirectionMapper
              value={colorDirectionMap}
              onChange={setColorDirectionMap}
              onValidation={setColorMappingValid}
            />

            {error && <p className="text-sm font-pixelSmall text-red-600">{error}</p>}

            <div className="flex gap-3">
              <PixelButton
                variant="default"
                onClick={() => setStep('password')}
                className="flex-1 h-11"
              >
                BACK
              </PixelButton>
              <PixelButton
                onClick={handleRegister}
                disabled={!colorMappingValid}
                variant="teal"
                className="flex-1 h-11"
              >
                CREATE WALLET
              </PixelButton>
            </div>
          </CardContent>
        </PixelCard>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="space-y-8 relative min-h-[500px] flex flex-col justify-center">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pixel-green/10 via-pixel-teal/5 to-pixel-blue/10 pixel-grid" />

        {/* Success Animation */}
        <div className="text-center space-y-6 relative z-10">
          {/* Animated Success Icon */}
          <div className="mx-auto flex h-32 w-32 items-center justify-center border-4 border-pixel-border bg-gradient-to-br from-pixel-green to-pixel-teal text-white shadow-pixel-lg animate-pulse">
            <div className="flex h-20 w-20 items-center justify-center border-2 border-white bg-white/20 shadow-pixel-sm">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Enhanced Title */}
          <div className="space-y-3">
            <h2 className="text-3xl font-pixel text-pixel-text tracking-wider">WALLET CREATED!</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1 w-8 bg-pixel-teal"></div>
              <p className="text-sm font-pixelSmall text-pixel-text/80 px-2">
                YOUR 1P WALLET IS READY TO USE
              </p>
              <div className="h-1 w-8 bg-pixel-teal"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Wallet Details */}
        <PixelCard className="relative z-10 border-4 border-pixel-border bg-gradient-to-br from-pixel-bgDark to-pixel-bg shadow-pixel-lg">
          <PixelCardContent className="p-6 space-y-5">
            {/* Username Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pixel-teal to-pixel-blue opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative p-5 border-4 border-pixel-border bg-pixel-bgDark hover:shadow-pixel-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-teal bg-pixel-teal text-white shadow-pixel-sm">
                    <span className="text-sm font-pixel">@</span>
                  </div>
                  <p className="text-xs font-pixelSmall text-pixel-teal uppercase tracking-wider">
                    USERNAME
                  </p>
                </div>
                <p className="font-data text-xl font-bold text-pixel-teal break-all">
                  {username}.1p
                </p>
              </div>
            </div>

            {/* Address Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pixel-blue to-pixel-green opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative p-5 border-4 border-pixel-border bg-pixel-bgDark hover:shadow-pixel-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-blue bg-pixel-blue text-white shadow-pixel-sm">
                    <span className="text-sm font-pixel">0x</span>
                  </div>
                  <p className="text-xs font-pixelSmall text-pixel-blue uppercase tracking-wider">
                    CUSTODIAL ADDRESS
                  </p>
                </div>
                <p className="font-data text-sm break-all text-pixel-text/80 leading-relaxed">
                  {custodialAddress}
                </p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        {/* Enhanced CTA Button */}
        <div className="relative z-10">
          <PixelButton
            onClick={onComplete}
            variant="teal"
            className="w-full h-14 text-lg font-pixel border-4 border-pixel-border shadow-pixel-lg hover:shadow-pixel-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 group"
          >
            <div className="flex items-center justify-center gap-3">
              <span>GO TO WALLET</span>
              <div className="flex h-6 w-6 items-center justify-center border-2 border-white bg-white/20 shadow-pixel-sm group-hover:bg-white/30 transition-colors">
                <span className="text-sm font-pixel">→</span>
              </div>
            </div>
          </PixelButton>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-4 h-4 bg-pixel-teal/30 border border-pixel-border shadow-pixel-sm"></div>
        <div className="absolute top-20 right-16 w-3 h-3 bg-pixel-blue/30 border border-pixel-border shadow-pixel-sm"></div>
        <div className="absolute bottom-20 left-16 w-2 h-2 bg-pixel-green/30 border border-pixel-border shadow-pixel-sm"></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 bg-pixel-accent/30 border border-pixel-border shadow-pixel-sm"></div>
      </div>
    );
  }

  return null;
};
