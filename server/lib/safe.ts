const SAFE_TX_SERVICE_URL = process.env.SAFE_TX_SERVICE_URL || 'https://safe-transaction-mainnet.safe.global';

export async function fetchSafeBalances() {
  const safeAddress = process.env.SAFE_ADDRESS;
  
  if (!safeAddress) {
    console.warn('SAFE_ADDRESS not configured, returning empty balances');
    return [];
  }

  try {
    const response = await fetch(`${SAFE_TX_SERVICE_URL}/api/v1/safes/${safeAddress}/balances/usd/`);
    
    if (!response.ok) {
      throw new Error(`Safe API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.map((balance: any) => ({
      symbol: balance.token?.symbol || 'ETH',
      name: balance.token?.name || 'Ethereum',
      amount: parseFloat(balance.balance) / Math.pow(10, balance.token?.decimals || 18),
      usdPrice: parseFloat(balance.fiatConversion) || 0,
      usdValue: parseFloat(balance.fiatBalance) || 0,
      source: 'safe' as const,
    }));
  } catch (error) {
    console.error('Error fetching Safe balances:', error);
    return [];
  }
}
