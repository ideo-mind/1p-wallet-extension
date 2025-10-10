import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { storage } from '@/services/storage';
import { Transaction } from '@/types/storage';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, ExternalLink, FileText, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ActivityView = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const { txHistory } = await storage.get(['txHistory']);
        const sortedTxs = (txHistory || []).sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border-none shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
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
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="border-none shadow-soft">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 mb-4">
            <ExternalLink className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">No activity yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your transactions will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx, index) => (
        <Card
          key={tx.hash}
          className="group relative border-none shadow-soft hover:shadow-neon transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] cursor-pointer animate-fade-in scanline"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-logo-teal/10 to-logo-blue/10 group-hover:shadow-neon-blue transition-shadow duration-300">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                    <Badge className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(tx.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleDateString()} {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                {tx.value && (
                  <p className="text-sm font-semibold">{tx.value} ETH</p>
                )}
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
