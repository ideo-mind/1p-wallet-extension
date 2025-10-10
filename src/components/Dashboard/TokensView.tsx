import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CircleDollarSign, Coins, DollarSign, TrendingUp, Zap } from 'lucide-react';
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
            icon: <Coins className="h-5 w-5 text-logo-blue animate-float" />
          },
          {
            symbol: '1P',
            name: '1P Protocol Token',
            balance: '1,250',
            usdValue: '$1,250.00',
            change24h: '+5.2%',
            icon: <Zap className="h-5 w-5 text-logo-teal animate-float-slow" />
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            balance: '500.00',
            usdValue: '$500.00',
            change24h: '0.0%',
            icon: <CircleDollarSign className="h-5 w-5 text-logo-green animate-float" />
          }
        ];

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
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
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <Card className="border-none shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-logo-dark to-gray-900 mb-4">
            <Coins className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">No tokens found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your tokens will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-lg">
      {tokens.map((token, index) => (
        <Card
          key={token.symbol}
          className="border-none shadow-soft hover:shadow-neon transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] animate-fade-in group relative overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-logo-teal/0 via-logo-teal/5 to-logo-teal/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-logo-teal/10 to-logo-blue/10 group-hover:shadow-neon transition-shadow duration-300">
                  {token.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">{token.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {token.change24h && (
                      <Badge
                        variant={token.change24h.startsWith('+') ? 'default' : 'secondary'}
                        className={`text-xs ${
                          token.change24h.startsWith('+')
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {token.change24h}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">{token.balance}</p>
                {token.usdValue && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {token.usdValue}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
