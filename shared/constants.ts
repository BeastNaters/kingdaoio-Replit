export const KONG_NFT_CONTRACT = '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328';

export const SNAPSHOT_SPACE = 'kongsdao.eth';

export const SNAPSHOT_HUB_URL = 'https://hub.snapshot.org/graphql';

export const CHAIN_IDS = {
  ETHEREUM: 1,
  SOLANA: 'mainnet-beta',
} as const;

export const EXPLORERS = {
  ETH_BASE: 'https://etherscan.io',
  SOL_BASE: 'https://solscan.io',
} as const;

export const SUPPORTED_CHAINS = {
  ETH: {
    chainId: 1,
    name: 'Ethereum',
    explorer: 'etherscan.io',
    explorerUrl: 'https://etherscan.io',
  },
  SOL: {
    chainId: 'mainnet-beta',
    name: 'Solana',
    explorer: 'solscan.io',
    explorerUrl: 'https://solscan.io',
  },
} as const;

export const ERC721_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
] as const;
