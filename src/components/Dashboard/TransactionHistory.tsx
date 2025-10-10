import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/services/storage';
import { Transaction } from '@/types/storage';
import { ExternalLink, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const { txHistory } = await storage.get(['txHistory']);
      setTransactions(txHistory || []);
    };

    loadTransactions();
  }, []);

  if (transactions.length === 0) {
    return (
      <Card className="border-none shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-logo-dark to-gray-900 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">No transactions yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your activity will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx, idx) => (
            <div
              key={tx.hash}
              className="group relative flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Timeline Dot */}
              <div className="absolute -left-px top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border-2 border-background bg-gradient-to-br from-indigo-500 to-purple-600"></div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold capitalize">{tx.type.replace('_', ' ')}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'confirmed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

