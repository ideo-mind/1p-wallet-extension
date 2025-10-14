import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EthereumLogo, OnePProtocolLogo } from '@/components/ui/token-logos';
import { NETWORKS } from '@/constants/protocol';
import { contractService } from '@/services/contract';
import { storage } from '@/services/storage';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  icon: React.ReactNode;
}

export const TokensView = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      try {
        // Get user's wallet address from storage
        const storageData = await storage.get([
          'creatorWalletAddress',
          'custodialAddress',
          'network',
        ]);
        const address = storageData.creatorWalletAddress || storageData.custodialAddress;
        const network = (storageData.network as keyof typeof NETWORKS) || 'creditcoin_testnet';

        if (!address) {
          console.warn('[TokensView] No wallet address found');
          setTokens([]);
          return;
        }

        // Fetch real balances from contract service
        const [nativeBalance, tokenBalance] = await Promise.all([
          contractService.getNativeBalance(address),
          contractService.balanceOf(address),
        ]);

        const realTokens: Token[] = [
          {
            symbol: NETWORKS[network].currencySymbol,
            name: `${NETWORKS[network].name} Native Token`,
            balance: parseFloat(formatEther(nativeBalance)).toFixed(4),
            icon: <EthereumLogo className="text-blue-500" />,
          },
          {
            symbol: '1P',
            name: '1P Protocol Token',
            balance: parseFloat(formatEther(tokenBalance)).toFixed(2),
            icon: <OnePProtocolLogo className="text-pixel-teal" />,
          },
        ];

        setTokens(realTokens);
      } catch (error) {
        console.error('[TokensView] Failed to load tokens:', error);
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <PixelCard key={i} className="bg-pixel-bgDark">
            <PixelCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 border-2 border-pixel-border" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <PixelCard className="bg-pixel-bgDark">
        <PixelCardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-bg text-pixel-text shadow-pixel mb-4">
            <EthereumLogo size="lg" className="text-pixel-text" />
          </div>
          <p className="font-pixel text-sm text-pixel-text">NO TOKENS FOUND</p>
          <p className="text-xs font-pixelSmall text-pixel-text/70 mt-1">
            YOUR TOKENS WILL APPEAR HERE
          </p>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-3">
      {tokens.map((token, index) => (
        <PixelCard
          key={token.symbol}
          className="bg-pixel-bgDark hover:shadow-pixel-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 group"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PixelCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-pixel-border bg-pixel-bg text-pixel-text shadow-pixel-sm group-hover:shadow-pixel transition-shadow duration-300">
                  {token.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-pixel text-sm text-pixel-text">{token.symbol}</p>
                  </div>
                  <p className="text-xs font-pixelSmall text-pixel-text/70 mt-1">{token.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-pixel text-lg text-pixel-text">{token.balance}</p>
                <p className="text-xs font-pixelSmall text-pixel-text/70">{token.symbol}</p>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      ))}
    </div>
  );
};
