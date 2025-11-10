import { fetchTokenPrices, fetchWalletBalances } from './dune';
import { fetchSafeBalances } from './safe';
import { fetchTreasurySheetData } from './googleSheets';
import { upsertSnapshot } from './supabase';

const DEFAULT_SNAPSHOT_INTERVAL = 15 * 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

let snapshotTimer: NodeJS.Timeout | null = null;
let isRunning = false;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAndSaveSnapshot(retries = 0): Promise<void> {
  if (isRunning) {
    console.log('Snapshot generation already in progress, skipping...');
    return;
  }

  isRunning = true;

  try {
    console.log('Scheduled snapshot generation started...');

    const [tokenPrices, safeBalances, duneBalances, sheetBalances] = await Promise.all([
      fetchTokenPrices().catch(err => {
        console.warn('Failed to fetch token prices:', err);
        return [];
      }),
      fetchSafeBalances().catch(err => {
        console.warn('Failed to fetch Safe balances:', err);
        return [];
      }),
      fetchWalletBalances().catch(err => {
        console.warn('Failed to fetch wallet balances:', err);
        return [];
      }),
      fetchTreasurySheetData().catch(err => {
        console.warn('Failed to fetch sheet data:', err);
        return [];
      }),
    ]);

    const priceMap = new Map(tokenPrices.map(p => [p.symbol, p.price]));
    
    const tokenMap = new Map<string, any>();

    safeBalances.forEach(token => {
      tokenMap.set(token.symbol, { ...token, source: 'safe' });
    });

    duneBalances.forEach(wallet => {
      wallet.tokens.forEach(token => {
        if (!tokenMap.has(token.symbol) || tokenMap.get(token.symbol).source !== 'safe') {
          const existing = tokenMap.get(token.symbol);
          if (existing) {
            existing.amount += token.amount;
          } else {
            tokenMap.set(token.symbol, {
              symbol: token.symbol,
              amount: token.amount,
              usdPrice: priceMap.get(token.symbol),
              usdValue: (priceMap.get(token.symbol) || 0) * token.amount,
              source: 'dune' as const,
            });
          }
        }
      });
    });

    sheetBalances.forEach(token => {
      if (!tokenMap.has(token.symbol)) {
        tokenMap.set(token.symbol, { ...token, source: 'manual' });
      }
    });

    const allTokens = Array.from(tokenMap.values());

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

    const saved = await upsertSnapshot(snapshot);
    console.log(`✓ Scheduled snapshot saved: ${saved?.id}, value: $${totalUsdValue.toFixed(2)}`);
  } catch (error) {
    console.error('Error in scheduled snapshot generation:', error);
    
    if (retries < MAX_RETRIES) {
      const delay = RETRY_DELAY * Math.pow(2, retries);
      console.log(`Retrying in ${delay / 1000}s (attempt ${retries + 1}/${MAX_RETRIES})...`);
      await sleep(delay);
      await generateAndSaveSnapshot(retries + 1);
    } else {
      console.error('Max retries reached for snapshot generation');
    }
  } finally {
    isRunning = false;
  }
}

export function startSnapshotScheduler(): void {
  if (snapshotTimer) {
    console.log('Snapshot scheduler already running');
    return;
  }

  const intervalMs = parseInt(process.env.SNAPSHOT_INTERVAL || String(DEFAULT_SNAPSHOT_INTERVAL), 10);
  console.log(`Starting snapshot scheduler (interval: ${intervalMs / 1000 / 60} minutes)`);

  snapshotTimer = setInterval(() => {
    generateAndSaveSnapshot();
  }, intervalMs);

  generateAndSaveSnapshot();
}

export function stopSnapshotScheduler(): void {
  if (snapshotTimer) {
    clearInterval(snapshotTimer);
    snapshotTimer = null;
    console.log('Snapshot scheduler stopped');
  }
}
