/**
 * Centralized exports for shared types, constants, and data
 * Use: import { TreasurySnapshot, KONG_NFT_CONTRACT, daoWallets } from '@shared'
 */

export type { TreasurySnapshot, TokenBalance, NftHolding } from './treasury-types';

export { 
  KONG_NFT_CONTRACT, 
  SNAPSHOT_SPACE, 
  SNAPSHOT_HUB_URL,
  CHAIN_IDS,
  EXPLORERS,
  SUPPORTED_CHAINS,
  ERC721_ABI 
} from './constants';

export { daoWallets, dcaPortfolio, otherTreasuryTokens } from './daoWallets';
export type { DaoWallet, DaoWalletGroups, TokenHolding, Chain } from './daoWallets';

export { daoNftCollections } from './daoNfts';
export type { DaoNftCollection } from './daoNfts';
