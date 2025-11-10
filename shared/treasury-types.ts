export type TokenBalance = {
  symbol: string;
  name?: string;
  amount: number;
  usdPrice?: number;
  usdValue?: number;
  source: 'dune' | 'safe' | 'onchain' | 'sheets';
};

export type NftHolding = {
  collection: string;
  tokenId: string;
  image?: string;
  floorPrice?: number;
  estimatedValueUsd?: number;
  contractAddress?: string;
};

export type TreasurySnapshot = {
  timestamp: string;
  totalUsdValue: number;
  tokens: TokenBalance[];
  nfts: NftHolding[];
  wallets: { address: string; label?: string; chainId?: number }[];
};

export type SnapshotProposal = {
  id: string;
  title: string;
  state: 'active' | 'closed' | 'pending';
  start: number;
  end: number;
  link: string;
  choices?: string[];
  body?: string;
};

export type DiscordAnnouncement = {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
};

export type SheetTreasuryEntry = {
  date: string;
  description: string;
  category: string;
  amountUsd: number;
  source: string;
};

export type DuneTokenPrice = {
  symbol: string;
  name: string;
  price: number;
};

export type DuneNftFloor = {
  collection: string;
  floorPrice: number;
};

export type DuneWalletBalance = {
  address: string;
  tokens: Array<{
    symbol: string;
    amount: number;
  }>;
};

export type SafeBalance = {
  tokenAddress: string;
  token: {
    name: string;
    symbol: string;
    decimals: number;
  };
  balance: string;
  fiatBalance: string;
  fiatConversion: string;
};
