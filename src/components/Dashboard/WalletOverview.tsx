import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockContractService } from '@/services/mock/contract';
import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WalletOverviewProps {
  username: string;
  address: string;
}

export const WalletOverview = ({ username, address }: WalletOverviewProps) => {
  const [copied, setCopied] = useState(false);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBalances = async () => {
      setLoading(true);
      try {
        const [eth, token] = await Promise.all([
          mockContractService.getEthBalance(address),
          mockContractService.getTokenBalance(address),
        ]);
        setEthBalance(eth);
        setTokenBalance(token);
      } catch (error) {
        console.error('Failed to load balances:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBalances();
  }, [address]);

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* User Identity Card */}
          <Card className="border-none shadow-soft bg-gradient-to-br from-logo-dark via-slate-900 to-purple-950 scanline relative overflow-hidden hover:shadow-neon transition-all duration-300">
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-logo-teal to-logo-blue text-white shadow-neon text-2xl font-bold animate-neon-pulse">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{username}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-xs text-muted-foreground">{shortAddress}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-6 w-6 hover:bg-black/20 transition-all duration-200 hover:scale-110"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-logo-green animate-scale-in" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balances */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse"></div>
          <div className="h-28 rounded-xl bg-gray-200 animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* ETH Balance */}
              <div className="balance-card from-logo-blue to-logo-teal text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <p className="text-xs font-medium opacity-90 mb-1">ETH Balance</p>
              <p className="text-3xl font-bold tracking-tight animate-slide-up">{ethBalance}</p>
              <p className="text-xs opacity-75 mt-1">Ethereum</p>
            </div>
          </div>

          {/* $1P Tokens */}
          <div className="balance-card from-purple-500 to-pink-600 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <p className="text-xs font-medium opacity-90 mb-1">$1P Tokens</p>
              <p className="text-3xl font-bold tracking-tight animate-slide-up">{tokenBalance}</p>
              <p className="text-xs opacity-75 mt-1">For auth fees</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-20 flex-col gap-2 hover:bg-accent hover:shadow-md transition-all"
          disabled
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <span className="text-lg">↑</span>
          </div>
          <span className="text-xs font-medium">Send</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2 hover:bg-accent hover:shadow-md transition-all"
          disabled
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <span className="text-lg">↓</span>
          </div>
          <span className="text-xs font-medium">Receive</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 flex-col gap-2 hover:bg-accent hover:shadow-md transition-all"
          disabled
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <span className="text-lg">$</span>
          </div>
          <span className="text-xs font-medium">Buy $1P</span>
        </Button>
      </div>
    </div>
  );
};

