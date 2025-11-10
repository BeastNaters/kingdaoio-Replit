const DUNE_API_BASE = 'https://api.dune.com/api/v1';

async function queryDune(queryId: string) {
  const apiKey = process.env.DUNE_API_KEY;
  
  if (!apiKey) {
    throw new Error('DUNE_API_KEY not configured');
  }

  const response = await fetch(`${DUNE_API_BASE}/query/${queryId}/results`, {
    headers: {
      'x-dune-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Dune API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result?.rows || [];
}

export async function fetchTokenPrices() {
  const queryId = process.env.DUNE_TOKEN_PRICES_QUERY_ID;
  
  if (!queryId) {
    return [
      { symbol: 'ETH', name: 'Ethereum', price: 2450.50 },
      { symbol: 'USDC', name: 'USD Coin', price: 1.00 },
      { symbol: 'DAI', name: 'Dai Stablecoin', price: 1.00 },
    ];
  }

  try {
    const rows = await queryDune(queryId);
    return rows.map((row: any) => ({
      symbol: row.symbol,
      name: row.name,
      price: parseFloat(row.price) || 0,
    }));
  } catch (error) {
    console.error('Error fetching token prices from Dune:', error);
    return [];
  }
}

export async function fetchNftFloors() {
  const queryId = process.env.DUNE_NFT_FLOOR_PRICES_QUERY_ID;
  
  if (!queryId) {
    return [
      { collection: 'Kong NFT', floorPrice: 0.5 },
      { collection: 'Other Collection', floorPrice: 0.3 },
    ];
  }

  try {
    const rows = await queryDune(queryId);
    return rows.map((row: any) => ({
      collection: row.collection,
      floorPrice: parseFloat(row.floor_price) || 0,
    }));
  } catch (error) {
    console.error('Error fetching NFT floors from Dune:', error);
    return [];
  }
}

export async function fetchWalletBalances() {
  const queryId = process.env.DUNE_WALLET_BALANCES_QUERY_ID;
  
  if (!queryId) {
    return [
      {
        address: '0x0000000000000000000000000000000000000000',
        tokens: [
          { symbol: 'ETH', amount: 10.5 },
          { symbol: 'USDC', amount: 50000 },
        ],
      },
    ];
  }

  try {
    const rows = await queryDune(queryId);
    return rows.map((row: any) => ({
      address: row.address,
      tokens: row.tokens || [],
    }));
  } catch (error) {
    console.error('Error fetching wallet balances from Dune:', error);
    return [];
  }
}
