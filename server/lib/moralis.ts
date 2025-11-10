import type { NftHolding } from '@shared/treasury-types';

const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';

interface MoralisNFT {
  token_address: string;
  token_id: string;
  name?: string;
  symbol?: string;
  metadata?: string | null;
  normalized_metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: any[];
  };
  contract_type?: string;
  token_uri?: string;
}

interface MoralisFloorPriceResponse {
  floor_price_usd?: number;
  floor_price?: string;
}

export async function fetchWalletNFTs(walletAddress: string): Promise<NftHolding[]> {
  const apiKey = process.env.MORALIS_API_KEY;
  
  if (!apiKey) {
    console.warn('MORALIS_API_KEY not configured');
    throw new Error('MORALIS_API_KEY not configured');
  }

  try {
    const response = await fetch(
      `${MORALIS_API_URL}/${walletAddress}/nft?chain=eth&format=decimal&normalizeMetadata=true`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Moralis NFT API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const nfts: MoralisNFT[] = data.result || [];

    if (nfts.length === 0) {
      console.log(`No NFTs found for wallet ${walletAddress}`);
      return [];
    }

    const nftHoldings = await Promise.all(
      nfts.slice(0, 50).map(async (nft) => {
        const metadata = nft.normalized_metadata || parseMetadata(nft.metadata);
        const floorPrice = await fetchCollectionFloorPrice(nft.token_address);

        return {
          collection: metadata?.name || nft.name || nft.symbol || 'Unknown Collection',
          tokenId: nft.token_id,
          image: metadata?.image || '',
          floorPrice: floorPrice.eth,
          estimatedValueUsd: floorPrice.usd,
          contractAddress: nft.token_address,
        };
      })
    );

    const validNfts = nftHoldings.filter(nft => nft.image);
    
    if (validNfts.length === 0) {
      console.log(`No NFTs with valid images found for wallet ${walletAddress}`);
      return [];
    }

    return validNfts;
  } catch (error: any) {
    console.error('Error fetching NFTs from Moralis:', error);
    throw error;
  }
}

function parseMetadata(metadata: string | null): any {
  if (!metadata) return null;
  
  try {
    return typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
  } catch {
    return null;
  }
}

async function fetchCollectionFloorPrice(contractAddress: string): Promise<{ eth: number; usd: number }> {
  const apiKey = process.env.MORALIS_API_KEY;
  
  if (!apiKey) {
    return { eth: 0, usd: 0 };
  }

  try {
    const response = await fetch(
      `${MORALIS_API_URL}/nft/${contractAddress}/floor-price?chain=eth`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      }
    );

    if (!response.ok) {
      return { eth: 0, usd: 0 };
    }

    const data: MoralisFloorPriceResponse = await response.json();
    
    const ethPrice = data.floor_price ? parseFloat(data.floor_price) : 0;
    const usdPrice = data.floor_price_usd ? (typeof data.floor_price_usd === 'string' ? parseFloat(data.floor_price_usd) : data.floor_price_usd) : 0;
    
    return {
      eth: isNaN(ethPrice) ? 0 : ethPrice,
      usd: isNaN(usdPrice) ? 0 : usdPrice,
    };
  } catch (error) {
    console.error(`Error fetching floor price for ${contractAddress}:`, error);
    return { eth: 0, usd: 0 };
  }
}
