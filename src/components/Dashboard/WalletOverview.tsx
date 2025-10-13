import { PixelButton } from '@/components/ui/pixel-button';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { PixelCopy } from '@/components/ui/pixel-icons';
import { EthereumLogo, OnePProtocolLogo } from '@/components/ui/token-logos';
import { NETWORKS } from '@/constants/protocol';
import { contractService } from '@/services/contract';
import { formatEther } from 'ethers';
import { Check, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WalletOverviewProps {
  username: string;
  address: string;
  currentNetwork: keyof typeof NETWORKS;
}

export const WalletOverview = ({ username, address, currentNetwork }: WalletOverviewProps) => {
  const [copied, setCopied] = useState(false);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBalances = async () => {
      setLoading(true);
      try {
        // Get token balance from contract
        const tokenBal = await contractService.balanceOf(address);
        setTokenBalance(formatEther(tokenBal));

        // Get ETH/CTC balance from provider
        const provider = contractService.getProvider();
        if (provider) {
          const ethBal = await provider.getBalance(address);
          setEthBalance(formatEther(ethBal));
        } else {
          setEthBalance('0');
        }
      } catch (error) {
        console.error('Failed to load balances:', error);
        setEthBalance('0');
        setTokenBalance('0');
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
    <div className="space-y-4">
      {/* User Identity Card */}
      <PixelCard className="relative overflow-hidden hover:shadow-pixel-lg transition-all duration-200">
        <PixelCardContent className="pt-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border-4 border-pixel-border bg-pixel-blue text-white shadow-pixel text-xl font-pixel">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-data text-base text-pixel-text">
                  {username.endsWith('.1p') ? username : `${username}.1p`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-data text-xs text-pixel-text/70">{shortAddress}</p>
                <PixelButton
                  variant="default"
                  size="sm"
                  onClick={handleCopy}
                  className="h-5 w-5 p-0 border-2 border-pixel-border hover:border-pixel-teal transition-all duration-200 hover:scale-110"
                  title={copied ? 'Copied!' : 'Copy address'}
                >
                  {copied ? (
                    <Check className="h-2.5 w-2.5 text-pixel-green" />
                  ) : (
                    <PixelCopy className="h-2.5 w-2.5 text-pixel-text" />
                  )}
                </PixelButton>
                <PixelButton
                  variant="default"
                  size="sm"
                  className="h-5 w-5 p-0 border-2 border-pixel-border hover:border-pixel-blue transition-all duration-200 hover:scale-110"
                  title="View on explorer"
                >
                  <ExternalLink className="h-2.5 w-2.5 text-pixel-text" />
                </PixelButton>
              </div>
            </div>
          </div>
        </PixelCardContent>
      </PixelCard>

      {/* Balances */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-pixel-bgDark border-4 border-pixel-border shadow-pixel animate-pulse"></div>
          <div className="h-24 bg-pixel-bgDark border-4 border-pixel-border shadow-pixel animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Network Balance */}
          <PixelCard className="bg-pixel-bgDark text-white hover:shadow-pixel-lg transition-all duration-200 hover:-translate-y-1 group">
            <PixelCardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-7 w-7 items-center justify-center border-2 border-pixel-border bg-pixel-bg shadow-pixel-sm">
                  <EthereumLogo size="sm" className="text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-pixelSmall text-white/90">
                    {NETWORKS[currentNetwork].currencySymbol} BALANCE
                  </p>
                  <p className="text-xs font-data text-white/75">{NETWORKS[currentNetwork].name}</p>
                </div>
              </div>
              <p className="text-2xl font-data tracking-tight text-white">{ethBalance}</p>
            </PixelCardContent>
          </PixelCard>

          {/* $1P Tokens */}
          <PixelCard className="bg-pixel-bgDark text-white hover:shadow-pixel-lg transition-all duration-200 hover:-translate-y-1 group">
            <PixelCardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-7 w-7 items-center justify-center border-2 border-pixel-border bg-pixel-bg shadow-pixel-sm">
                  <OnePProtocolLogo size="sm" className="text-pixel-teal" />
                </div>
                <div>
                  <p className="text-xs font-pixelSmall text-white/90">$1P TOKENS</p>
                  <p className="text-xs font-data text-white/75">For auth fees</p>
                </div>
              </div>
              <p className="text-2xl font-data tracking-tight text-white">{tokenBalance}</p>
            </PixelCardContent>
          </PixelCard>
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <PixelButton
            variant="default"
            className="h-16 flex-col gap-1 border-4 border-pixel-border bg-pixel-bgDark/50 hover:bg-pixel-bgDark hover:shadow-pixel transition-all group"
            disabled
          >
            <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-border bg-pixel-blue text-white shadow-pixel-sm group-hover:shadow-pixel transition-shadow">
              <span className="text-sm font-pixel">↑</span>
            </div>
            <span className="text-[10px] font-data">SEND</span>
          </PixelButton>
          <PixelButton
            variant="default"
            className="h-16 flex-col gap-1 border-4 border-pixel-border bg-pixel-bgDark/50 hover:bg-pixel-bgDark hover:shadow-pixel transition-all group"
            disabled
          >
            <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-border bg-pixel-green text-white shadow-pixel-sm group-hover:shadow-pixel transition-shadow">
              <span className="text-sm font-pixel">↓</span>
            </div>
            <span className="text-[10px] font-data">RECEIVE</span>
          </PixelButton>
          <PixelButton
            variant="default"
            className="h-16 flex-col gap-1 border-4 border-pixel-border bg-pixel-bgDark/50 hover:bg-pixel-bgDark hover:shadow-pixel transition-all group"
            disabled
          >
            <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-border bg-pixel-accent text-white shadow-pixel-sm group-hover:shadow-pixel transition-shadow">
              <span className="text-sm font-pixel">$</span>
            </div>
            <span className="text-[10px] font-data">BUY $1P</span>
          </PixelButton>
        </div>
      </div>
    </div>
  );
};
