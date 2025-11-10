/**
 * Centralized mock data for development and testing
 * TODO: Replace with live data from Web3 APIs
 */

/**
 * Mock wallet balances in USD
 * These values are used across the dashboard tabs until live API integration
 */
export const MOCK_WALLET_BALANCES: Record<string, number> = {
  // Multi-Sig Wallets (Gnosis Safe)
  '0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF': 250000, // DAO Fund
  '0x24901F1b9b41e853778107CD737cC426b456fC95': 150000, // Reward Wallet
  '0x00239b99703b773B0A1B6A33f4691867aF071d5A': 75000,  // Incentivization Bucket

  // Controller Wallets
  '0xd8a7113a701a4eccc5f8aa85a621ac42104d6eb8': 125000, // Controller (ETH)
  'Gok7zfZ2aZ6ftvYtXhRR2KR8dzu2cKZLDeqvDhNQvipT': 45000,  // Controller (SOL)
  '0xB26ACB02661620C7533A20CC709afDECFe3b94DB': 35000,  // Deployer Wallet
  '0x17c08C6445401736A31f50aFbCca7258623F0Cfb': 28000,  // KING Developer

  // Tactical Wallets
  '0x1C0F0b94B3130Bd7F3c93417D4c19e9E80C56f74': 18000,  // Dogepound & ZK Race
  '0x8CC04643143caFa204b2797459AA3cb82cd41283': 12000,  // Wilder World
};

/**
 * Gets mock balance for a wallet address
 * @param address - The wallet address
 * @returns Mock balance in USD, or 0 if not found
 */
export function getMockBalance(address: string): number {
  return MOCK_WALLET_BALANCES[address] || 0;
}

/**
 * Formats balance as ETH or SOL based on chain
 * @param balanceUsd - Balance in USD
 * @param chain - 'ETH' or 'SOL'
 * @returns Formatted balance string
 */
export function formatMockBalance(balanceUsd: number, chain: 'ETH' | 'SOL'): string {
  // Mock conversions: $2,500/ETH, $100/SOL
  if (chain === 'SOL') {
    const solAmount = balanceUsd / 100;
    return `${solAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} SOL`;
  }
  
  const ethAmount = balanceUsd / 2500;
  return `${ethAmount.toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH`;
}
