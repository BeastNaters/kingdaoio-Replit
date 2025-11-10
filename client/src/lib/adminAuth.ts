import { type WalletClient } from 'viem';

export async function getAdminAuthHeaders(walletClient: WalletClient): Promise<Record<string, string>> {
  if (!walletClient.account) {
    throw new Error('Wallet not connected');
  }

  const timestamp = Date.now().toString();
  const message = `KingDAO Admin Access\nTimestamp: ${timestamp}`;

  const signature = await walletClient.signMessage({
    account: walletClient.account,
    message,
  });

  return {
    'x-wallet-address': walletClient.account.address,
    'x-wallet-signature': signature,
    'x-timestamp': timestamp,
  };
}
