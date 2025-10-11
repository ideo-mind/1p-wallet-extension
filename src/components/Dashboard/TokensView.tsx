import { PixelBadge } from '@/components/ui/pixel-badge';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EthereumLogo, OnePProtocolLogo, USDCLogo } from '@/components/ui/token-logos';
import { DollarSign, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  usdValue?: string;
  change24h?: string;
  icon: React.ReactNode;
}

export const TokensView = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTokens = async () => {
      setLoading(true);
      try {
        // Mock token data - in real app, this would come from contract service
        const mockTokens: Token[] = [
          {
            symbol: 'ETH',
            name: 'Ethereum',
            balance: '2.45',
            usdValue: '$4,890.50',
            change24h: '+2.4%',
            icon: <EthereumLogo className="text-blue-500" />,
          },
          {
            symbol: '1P',
            name: '1P Protocol Token',
            balance: '1,250',
            usdValue: '$1,250.00',
            change24h: '+5.2%',
            icon: <OnePProtocolLogo className="text-pixel-teal" />,
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            balance: '500.00',
            usdValue: '$500.00',
            change24h: '0.0%',
            icon: <USDCLogo className="text-green-500" />,
          },
        ];

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setTokens(mockTokens);
      } catch (error) {
        console.error('Failed to load tokens:', error);
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
                    <p className="text-xs font-pixelSmall text-pixel-text/70">{token.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {token.change24h && (
                      <PixelBadge
                        variant={token.change24h.startsWith('+') ? 'success' : 'default'}
                        className="text-xs border-2 border-pixel-border"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {token.change24h}
                      </PixelBadge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-pixel text-sm text-pixel-text">{token.balance}</p>
                {token.usdValue && (
                  <p className="text-xs font-pixelSmall text-pixel-text/70 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {token.usdValue}
                  </p>
                )}
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      ))}
    </div>
  );
};
