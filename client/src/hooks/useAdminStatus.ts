import { useQuery } from '@tanstack/react-query';
import { useAccount, useSignMessage } from 'wagmi';
import { apiRequest } from '@/lib/queryClient';

const SIGNATURE_VALIDITY_MS = 5 * 60 * 1000;

export function useAdminStatus() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const query = useQuery({
    queryKey: ['/api/auth/is-admin', address],
    queryFn: async () => {
      if (!address) {
        throw new Error('No wallet connected');
      }

      try {
        const timestamp = Date.now().toString();
        const message = `KingDAO Admin Check\nTimestamp: ${timestamp}`;
        
        const signature = await signMessageAsync({ message });

        const response = await apiRequest('/api/auth/is-admin', {
          method: 'POST',
          body: JSON.stringify({
            walletAddress: address,
            signature,
            timestamp,
          }),
        });

        return response;
      } catch (error: any) {
        if (error.code === 4001 || error.message?.includes('User rejected')) {
          throw new Error('Signature request cancelled');
        }
        throw error;
      }
    },
    enabled: isConnected && !!address,
    staleTime: SIGNATURE_VALIDITY_MS - 60000,
    retry: false,
  });

  return {
    isAdmin: query.data?.isAdmin ?? false,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
