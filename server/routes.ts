import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isKongHolder } from "./lib/isKongHolder";
import { fetchTokenPrices, fetchNftFloors, fetchWalletBalances } from "./lib/dune";
import { fetchSafeBalances } from "./lib/safe";
import { fetchTreasurySheetData } from "./lib/googleSheets";
import { fetchSnapshotProposals } from "./lib/snapshot";
import { fetchDiscordAnnouncements } from "./lib/discord";
import { getLatestSnapshot, upsertSnapshot } from "./lib/supabase";

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
      const announcements = await fetchDiscordAnnouncements();
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
      const cached = await getLatestSnapshot();
      
      if (cached) {
        return res.json(cached);
      }

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

      return res.json(snapshot);
    } catch (error: any) {
      console.error('Error fetching treasury snapshot:', error);
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
      
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error upserting snapshot:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save snapshot',
      });
    }
  });

  app.get("/api/nfts/holdings", async (req, res) => {
    try {
      const mockNfts = [
        {
          collection: 'Kong NFT',
          tokenId: '1234',
          image: '',
          floorPrice: 0.5,
          estimatedValueUsd: 1225,
        },
        {
          collection: 'Bored Ape Yacht Club',
          tokenId: '5678',
          image: '',
          floorPrice: 12.5,
          estimatedValueUsd: 30625,
        },
      ];

      return res.json(mockNfts);
    } catch (error: any) {
      console.error('Error fetching NFT holdings:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch NFT holdings',
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
