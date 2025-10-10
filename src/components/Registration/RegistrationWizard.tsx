import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { UnifiedBackground } from '@/components/effects/UnifiedBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockBackendService } from '@/services/mock/backend';
import { storage } from '@/services/storage';
import { createHotWallet } from '@/utils/hotWallet';
import { Brush, CheckCircle2, Key, Shield, User, UserPlus, Zap } from 'lucide-react';
import { useState } from 'react';
import { SecretInput } from './SecretInput';
import { UsernameInput } from './UsernameInput';

type Step = 'welcome' | 'username' | 'secret' | 'confirm' | 'complete';

interface RegistrationWizardProps {
  onComplete: () => void;
}

export const RegistrationWizard = ({ onComplete }: RegistrationWizardProps) => {
  const [step, setStep] = useState<Step>('welcome');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [secretValid, setSecretValid] = useState(false);
  const [confirmValid, setConfirmValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [custodialAddress, setCustodialAddress] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    try {
      // Register with backend
      const result = await mockBackendService.register({
        username,
        secret,
        publicData: { name: username },
      });

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      if (!result.data) {
        throw new Error('No data returned from registration');
      }

      // Save to storage
      await storage.set({
        onePUser: result.data.username,
        custodialAddress: result.data.custodialAddress,
        network: 'sepolia',
        approvedOrigins: {},
        txHistory: [],
      });

      // Create hot wallet
      await createHotWallet(secret);

      setCustodialAddress(result.data.custodialAddress);

      // Clear secret from memory
      setSecret('');
      setConfirmSecret('');

      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Creating your wallet..." />;
  }

  if (step === 'welcome') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-logo-teal via-logo-blue to-purple-500 p-8 text-white shadow-2xl scanline">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-neon animate-neon-pulse">
              <Shield className="h-10 w-10 animate-float" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">1P Wallet</h1>
              <p className="mt-2 text-sm text-white/90">
                The future of quantum-resistant authentication
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold gradient-text">Why 1P is different</h2>
            <div className="space-y-3">
              {[
                { icon: <Key className="h-5 w-5 text-logo-teal" />, text: 'No seed phrases to manage', subtext: 'Your brain is your vault' },
                { icon: <Brush className="h-5 w-5 text-logo-blue" />, text: 'Visual grid authentication', subtext: 'Beautiful and secure' },
                { icon: <Zap className="h-5 w-5 text-logo-green" />, text: 'Quantum-resistant', subtext: 'Future-proof security' },
                { icon: <UserPlus className="h-5 w-5 text-purple-500" />, text: 'Simple username.1p identity', subtext: 'Easy to remember' },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 hover:scale-105 hover:shadow-neon-sm group">
                  <div className="flex-shrink-0 mt-0.5 group-hover:animate-float">{feature.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{feature.text}</p>
                    <p className="text-xs text-muted-foreground">{feature.subtext}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
          <Button
            onClick={() => setStep('username')}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-logo-teal to-logo-blue hover:from-logo-blue hover:to-indigo-700 shadow-neon hover:shadow-neon-blue hover:scale-105 transition-all duration-200 neon-border"
          >
            Create New Wallet
          </Button>
      </div>
    );
  }

  if (step === 'username') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Step 1 of 3</span>
          <div className="flex gap-1.5">
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
            <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
            <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
          </div>
        </div>

        <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30">
          <CardHeader className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-logo-teal to-logo-blue text-white shadow-neon animate-neon-pulse">
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl gradient-text">Choose Username</CardTitle>
              <CardDescription className="text-base mt-1 text-muted-foreground">
                This will be your identity on the blockchain
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsernameInput
              value={username}
              onChange={setUsername}
              onValidation={setUsernameValid}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1 h-11">
                Back
              </Button>
              <Button
                onClick={() => setStep('secret')}
                disabled={!usernameValid}
                  className="flex-1 h-11 bg-gradient-to-r from-logo-teal to-logo-blue hover:from-logo-blue hover:to-indigo-700 shadow-neon hover:shadow-neon-blue hover:scale-105 transition-all duration-200 neon-border"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'secret') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Step 2 of 3</span>
          <div className="flex gap-1.5">
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
            <div className="h-1.5 w-12 rounded-full bg-gray-200"></div>
          </div>
        </div>

        <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-logo-teal to-logo-blue text-white shadow-neon animate-neon-pulse">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl gradient-text">Your Secret Character</CardTitle>
              <CardDescription className="text-base mt-1 text-muted-foreground">
                Choose a single character that you'll remember
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SecretInput
              value={secret}
              onChange={setSecret}
              onValidation={setSecretValid}
            />

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('username')} className="flex-1 h-11">
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                disabled={!secretValid}
                  className="flex-1 h-11 bg-gradient-to-r from-logo-teal to-logo-blue hover:from-logo-blue hover:to-indigo-700 shadow-neon hover:shadow-neon-blue hover:scale-105 transition-all duration-200 neon-border"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Step 3 of 3</span>
          <div className="flex gap-1.5">
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
              <div className="h-1.5 w-12 rounded-full bg-logo-blue shadow-neon-blue animate-glow-pulse"></div>
          </div>
        </div>

        <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-logo-green to-emerald-600 text-white shadow-neon-green animate-neon-pulse">
              <Key className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl gradient-text">Confirm Your Secret</CardTitle>
              <CardDescription className="text-base mt-1 text-muted-foreground">
                Enter the same character to confirm
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <SecretInput
              value={secret}
              onChange={setConfirmSecret}
              confirm={true}
              confirmValue={confirmSecret}
              onValidation={setConfirmValid}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setStep('secret');
                setConfirmSecret('');
              }} className="flex-1 h-11">
                Back
              </Button>
              <Button
                onClick={handleRegister}
                disabled={!confirmValid}
                  className="flex-1 h-11 bg-gradient-to-r from-logo-green to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-neon-green hover:shadow-neon hover:scale-105 transition-all duration-200 neon-border"
              >
                Create Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="space-y-6 animate-scale-in relative">
        <UnifiedBackground variant="dense" color="green" />
        {/* Success Animation */}
        <div className="text-center space-y-4 relative z-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-logo-green to-emerald-600 shadow-neon-green animate-neon-pulse">
            <CheckCircle2 className="h-12 w-12 text-white animate-scale-in" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text animate-slide-up">Wallet Created!</h2>
            <p className="text-sm text-muted-foreground mt-2 animate-fade-in">
              Your 1P Wallet is ready to use
            </p>
          </div>
        </div>

        {/* Wallet Details */}
        <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-indigo-950/30 relative z-10 scanline">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm neon-border-blue hover:scale-105 transition-all duration-200">
                <p className="text-xs font-medium text-logo-teal mb-1">Username</p>
                <p className="font-mono text-lg font-bold text-logo-teal">{username}.1p</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 backdrop-blur-sm neon-border hover:scale-105 transition-all duration-200">
                <p className="text-xs font-medium text-logo-blue mb-1">Custodial Address</p>
                <p className="font-mono text-xs break-all text-muted-foreground">{custodialAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={onComplete}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-logo-teal to-logo-blue hover:from-logo-blue hover:to-indigo-700 shadow-neon hover:shadow-neon-blue hover:scale-105 transition-all duration-200 neon-border relative z-10"
        >
          Go to Wallet
        </Button>
      </div>
    );
  }

  return null;
};

