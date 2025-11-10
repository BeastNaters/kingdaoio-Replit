import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { isKongHolder } from "./lib/isKongHolder";
import { fetchTokenPrices, fetchNftFloors, fetchWalletBalances } from "./lib/dune";
import { fetchSafeBalances } from "./lib/safe";
import { fetchTreasurySheetData } from "./lib/googleSheets";
import { fetchSnapshotProposals } from "./lib/snapshot";
import { fetchDiscordAnnouncements } from "./lib/discord";
import { getLatestSnapshot, upsertSnapshot, getHistoricalSnapshots } from "./lib/supabase";

let io: SocketIOServer | null = null;

export function getSocketIO(): SocketIOServer | null {
  return io;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/auth/holdings", async (req, res) => {
    try {
      const { address } = req.query;
      
      if (!address || typeof address !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Address parameter required',
        });
      }

      const isHolder = await isKongHolder(address);
      
      return res.json({
        success: true,
        isHolder,
        address,
      });
    } catch (error: any) {
      console.error('Error checking holdings:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to check NFT holdings',
      });
    }
  });

  app.get("/api/dune/token-prices", async (req, res) => {
    try {
      const prices = await fetchTokenPrices();
      return res.json({
        success: true,
        data: prices,
      });
    } catch (error: any) {
      console.error('Error fetching token prices:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch token prices',
      });
    }
  });

  app.get("/api/dune/nft-floors", async (req, res) => {
    try {
      const floors = await fetchNftFloors();
      return res.json({
        success: true,
        data: floors,
      });
    } catch (error: any) {
      console.error('Error fetching NFT floors:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch NFT floor prices',
      });
    }
  });

  app.get("/api/dune/wallet-balances", async (req, res) => {
    try {
      const balances = await fetchWalletBalances();
      return res.json({
        success: true,
        data: balances,
      });
    } catch (error: any) {
      console.error('Error fetching wallet balances:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch wallet balances',
      });
    }
  });

  app.get("/api/treasury/safe", async (req, res) => {
    try {
      const balances = await fetchSafeBalances();
      return res.json(balances);
    } catch (error: any) {
      console.error('Error fetching Safe balances:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch Safe balances',
      });
    }
  });

  app.get("/api/treasury/google-sheets", async (req, res) => {
    try {
      const entries = await fetchTreasurySheetData();
      return res.json(entries);
    } catch (error: any) {
      console.error('Error fetching Google Sheets data:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch treasury sheet data',
      });
    }
  });

  app.get("/api/snapshot/proposals", async (req, res) => {
    try {
      const proposals = await fetchSnapshotProposals();
      return res.json(proposals);
    } catch (error: any) {
      console.error('Error fetching Snapshot proposals:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch Snapshot proposals',
      });
    }
  });

  app.get("/api/discord/announcements", async (req, res) => {
    try {
      const discordSettings = await storage.getAdminSetting('discord_config');
      const settings = discordSettings?.value as any;
      
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const before = req.query.before as string | undefined;
      
      const announcements = await fetchDiscordAnnouncements(settings, limit, before);
      return res.json(announcements);
    } catch (error: any) {
      console.error('Error fetching Discord announcements:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch Discord announcements',
      });
    }
  });

  app.get("/api/treasury/snapshots", async (req, res) => {
    try {
      const cacheMaxAge = 5 * 60 * 1000;
      const cached = await getLatestSnapshot();
      
      if (cached && cached.timestamp) {
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        if (cacheAge < cacheMaxAge) {
          console.log(`Returning cached snapshot (age: ${Math.floor(cacheAge / 1000)}s)`);
          return res.json(cached);
        }
      }

      console.log('Generating new treasury snapshot...');

      const [tokenPrices, safeBalances, duneBalances] = await Promise.all([
        fetchTokenPrices(),
        fetchSafeBalances(),
        fetchWalletBalances(),
      ]);

      const priceMap = new Map(tokenPrices.map(p => [p.symbol, p.price]));
      
      const allTokens = [...safeBalances];
      duneBalances.forEach(wallet => {
        wallet.tokens.forEach(token => {
          const existing = allTokens.find(t => t.symbol === token.symbol);
          if (existing) {
            existing.amount += token.amount;
          } else {
            allTokens.push({
              symbol: token.symbol,
              amount: token.amount,
              usdPrice: priceMap.get(token.symbol),
              usdValue: (priceMap.get(token.symbol) || 0) * token.amount,
              source: 'dune' as const,
            });
          }
        });
      });

      allTokens.forEach(token => {
        if (token.usdPrice && !token.usdValue) {
          token.usdValue = token.usdPrice * token.amount;
        }
      });

      const totalUsdValue = allTokens.reduce((sum, token) => sum + (token.usdValue || 0), 0);

      const snapshot = {
        timestamp: new Date().toISOString(),
        totalUsdValue,
        tokens: allTokens,
        nfts: [],
        wallets: duneBalances.map(w => ({ address: w.address, chainId: 1 })),
      };

      try {
        const saved = await upsertSnapshot(snapshot);
        console.log('Snapshot persisted to Supabase:', saved?.id);
      } catch (persistError) {
        console.error('Failed to persist snapshot, continuing with response:', persistError);
      }

      return res.json(snapshot);
    } catch (error: any) {
      console.error('Error fetching treasury snapshot:', error);
      
      const cached = await getLatestSnapshot();
      if (cached) {
        console.log('Returning stale cached snapshot due to error');
        return res.json(cached);
      }
      
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch treasury snapshot',
      });
    }
  });

  app.post("/api/treasury/snapshots", async (req, res) => {
    try {
      const snapshot = req.body;
      const result = await upsertSnapshot(snapshot);
      
      if (!result) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save snapshot',
        });
      }

      const camelCaseResult = {
        id: result.id,
        timestamp: result.timestamp,
        totalUsdValue: result.total_usd_value,
        tokens: result.tokens,
        nfts: result.nfts,
        wallets: result.wallets,
        metadata: result.metadata,
      };
      
      return res.json({
        success: true,
        data: camelCaseResult,
      });
    } catch (error: any) {
      console.error('Error upserting snapshot:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save snapshot',
      });
    }
  });

  app.get("/api/treasury/snapshots/history", async (req, res) => {
    try {
      const { startDate, endDate, limit } = req.query;
      
      const snapshots = await getHistoricalSnapshots(
        startDate as string | undefined,
        endDate as string | undefined,
        limit ? parseInt(limit as string, 10) : undefined
      );
      
      return res.json(snapshots);
    } catch (error: any) {
      console.error('Error fetching historical snapshots:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch historical snapshots',
      });
    }
  });

  app.get("/api/nfts/holdings", async (req, res) => {
    const walletListSetting = await storage.getAdminSetting('treasury_wallets');
    const walletList = (walletListSetting?.value as string[]) || [];
    
    const safeAddress = process.env.SAFE_ADDRESS;
    const defaultWallets = safeAddress ? [safeAddress] : [];
    const walletsToFetch = walletList.length > 0 ? walletList : defaultWallets;
    
    if (walletsToFetch.length === 0) {
      console.warn('No treasury wallets configured, returning empty NFT list');
      return res.json([]);
    }

    try {
      const { fetchWalletNFTs } = await import('./lib/moralis');
      
      const allNfts: any[] = [];
      for (const wallet of walletsToFetch) {
        try {
          const walletNfts = await fetchWalletNFTs(wallet);
          allNfts.push(...walletNfts);
        } catch (walletError: any) {
          console.error(`Error fetching NFTs for wallet ${wallet}:`, walletError);
          if (walletError.message !== 'MORALIS_API_KEY_MISSING') {
            throw walletError;
          }
        }
      }

      if (allNfts.length > 0) {
        const nftAssetData = allNfts.map(nft => ({
          contractAddress: nft.contractAddress,
          tokenId: nft.tokenId,
          collection: nft.collection,
          image: nft.image || '',
          floorPrice: nft.floorPrice || 0,
          estimatedValueUsd: nft.estimatedValueUsd || 0,
        }));

        await storage.upsertNftAssets(nftAssetData);
      }
      
      return res.json(allNfts);
    } catch (error: any) {
      console.error('Error fetching NFT holdings, attempting cache fallback:', error);
      
      try {
        const cachedNfts = await storage.getNftAssets();
        console.log(`Returning ${cachedNfts.length} cached NFTs due to API error`);
        return res.json(cachedNfts);
      } catch (cacheError) {
        console.error('Error fetching cached NFTs:', cacheError);
        return res.json([]);
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

export function initializeSocketIO(server: Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`WebSocket client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO initialized');
}
