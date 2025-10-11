import { PixelBadge } from '@/components/ui/pixel-badge';
import { PixelCard, PixelCardContent } from '@/components/ui/pixel-card';
import { Skeleton } from '@/components/ui/skeleton';
import { storage } from '@/services/storage';
import { Transaction } from '@/types/storage';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export const ActivityView = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const { txHistory } = await storage.get(['txHistory']);
        const sortedTxs = (txHistory || []).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setTransactions(sortedTxs);
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="h-4 w-4 text-logo-blue" />;
      case 'receive':
        return <ArrowDownLeft className="h-4 w-4 text-logo-green" />;
      case 'swap':
        return <ExternalLink className="h-4 w-4 text-logo-teal" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-3 w-3 text-logo-green" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-500" />;
      case 'failed':
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <PixelCard key={i} className="bg-pixel-bgDark">
            <PixelCardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 border-2 border-pixel-border" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </PixelCardContent>
          </PixelCard>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <PixelCard className="bg-pixel-bgDark">
        <PixelCardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center border-4 border-pixel-border bg-pixel-bg text-pixel-text shadow-pixel mb-4">
            <ExternalLink className="h-8 w-8 text-pixel-text" />
          </div>
          <p className="font-pixel text-sm text-pixel-text">NO ACTIVITY YET</p>
          <p className="text-xs font-pixelSmall text-pixel-text/70 mt-1">
            YOUR TRANSACTIONS WILL APPEAR HERE
          </p>
        </PixelCardContent>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => (
        <PixelCard
          key={tx.hash}
          className="group bg-pixel-bgDark hover:shadow-pixel-lg transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PixelCardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center border-2 border-pixel-border bg-pixel-bg text-pixel-text shadow-pixel-sm group-hover:shadow-pixel transition-shadow duration-300">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-pixel capitalize text-pixel-text">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <PixelBadge
                      className={`text-[10px] px-2 py-0.5 border-2 border-pixel-border font-pixelSmall ${
                        tx.status === 'confirmed'
                          ? 'bg-pixel-green text-pixel-text'
                          : tx.status === 'pending'
                            ? 'bg-pixel-accent text-white'
                            : 'bg-pixel-bgDark text-pixel-text'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </span>
                    </PixelBadge>
                  </div>
                  <p className="text-xs font-data text-pixel-text/70">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </p>
                  <p className="text-xs font-pixelSmall text-pixel-text/60">
                    {new Date(tx.timestamp).toLocaleDateString()}{' '}
                    {new Date(tx.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                {tx.value && <p className="text-sm font-pixel text-pixel-text">{tx.value} ETH</p>}
                <ExternalLink className="h-4 w-4 text-pixel-text/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      ))}
    </div>
  );
};
