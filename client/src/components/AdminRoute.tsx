import { useAccount } from 'wagmi';
import { TokenGated } from './TokenGated';
import { Card } from './ui/card';
import { AlertTriangle } from 'lucide-react';

const ADMIN_ADDRESSES = (import.meta.env.VITE_ADMIN_ADDRESSES || '').toLowerCase().split(',').filter(Boolean);

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return <TokenGated />;
  }

  const isAdmin = ADMIN_ADDRESSES.includes(address.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-2xl border border-red-400/20 bg-red-500/10 backdrop-blur-xl p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
