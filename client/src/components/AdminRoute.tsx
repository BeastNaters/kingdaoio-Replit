import { useAccount } from 'wagmi';
import { TokenGated } from './TokenGated';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoading, error, refetch } = useAdminStatus();

  if (!isConnected || !address) {
    return <TokenGated />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-64 rounded-2xl" data-testid="skeleton-admin-check" />
      </div>
    );
  }

  if (error?.message?.includes('cancelled')) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 backdrop-blur-xl p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading mb-2">Signature Required</h2>
          <p className="text-muted-foreground mb-4">
            You cancelled the signature request. Please refresh to try again.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="rounded-2xl border border-orange-400/20 bg-orange-500/10 backdrop-blur-xl p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-heading mb-2">Verification Failed</h2>
          <p className="text-muted-foreground mb-6">
            Unable to verify admin status. This may be due to a network error or server issue.
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2 bg-orange-500 hover-elevate text-white rounded-md font-medium transition-colors"
            data-testid="button-retry-admin-check"
          >
            Retry Verification
          </button>
        </Card>
      </div>
    );
  }

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
