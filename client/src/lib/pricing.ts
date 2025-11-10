// TODO: Replace mock prices with real Web3 price API integration
// Recommended APIs:
// - CoinGecko API: https://api.coingecko.com/api/v3/simple/price
// - Moralis Token Price API: https://docs.moralis.io/web3-data-api/evm/reference/get-token-price
// - Alchemy Token API: https://docs.alchemy.com/reference/alchemy-gettokenbalances
// - 1inch Price Oracle: https://api.1inch.dev/price/v1.1/1
//
// Example integration:
// export async function getTokenPrices(symbols: string[]) {
//   const params = new URLSearchParams({
//     ids: symbols.join(','),
//     vs_currencies: 'usd'
//   });
//   const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?${params}`);
//   return response.json();
// }

export interface TokenPrice {
  [symbol: string]: number;
}

/**
 * Get current USD prices for tokens
 * @param symbols Array of token symbols (e.g., ['BTC', 'ETH', 'SOL'])
 * @returns Object mapping symbol to USD price
 * 
 * MOCK DATA - Replace with live price API
 */
export async function getTokenPrices(symbols: string[]): Promise<TokenPrice> {
  // Mock prices updated as of November 2025
  const mockPrices: TokenPrice = {
    BTC: 67000,
    ETH: 3400,
    SOL: 180,
    AVAX: 28,
    LINK: 15,
    ADA: 0.45,
    XRP: 0.55,
    ZERC: 0.12,
    RLB: 0.085,
    PYR: 3.5,
    WILD: 0.35,
    JUP: 1.2,
    PENGU: 0.028,
    OP: 2.1,
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const result: TokenPrice = {};
  symbols.forEach(symbol => {
    result[symbol] = mockPrices[symbol] || 0;
  });

  return result;
}

/**
 * Calculate total USD value from token holdings
 * @param holdings Array of {symbol, amount} objects
 * @param prices Price map from getTokenPrices
 * @returns Total USD value
 */
export function calculateTotalValue(
  holdings: { symbol: string; amount: number }[],
  prices: TokenPrice
): number {
  return holdings.reduce((total, holding) => {
    const price = prices[holding.symbol] || 0;
    return total + (holding.amount * price);
  }, 0);
}

/**
 * Calculate portfolio allocation percentages
 * @param holdings Array of {symbol, amount} objects
 * @param prices Price map from getTokenPrices
 * @returns Array with USD value and percentage for each holding
 */
export function calculateAllocation(
  holdings: { symbol: string; amount: number }[],
  prices: TokenPrice
): { symbol: string; amount: number; usdValue: number; percentage: number }[] {
  const withValues = holdings.map(holding => ({
    ...holding,
    usdValue: holding.amount * (prices[holding.symbol] || 0),
  }));

  const total = withValues.reduce((sum, item) => sum + item.usdValue, 0);

  return withValues.map(item => ({
    ...item,
    percentage: total > 0 ? (item.usdValue / total) * 100 : 0,
  }));
}
