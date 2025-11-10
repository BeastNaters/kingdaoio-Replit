import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, real, integer, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const treasurySnapshots = pgTable("treasury_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  totalUsdValue: real("total_usd_value").notNull(),
  tokens: jsonb("tokens").notNull(),
  nfts: jsonb("nfts").notNull(),
  wallets: jsonb("wallets").notNull(),
  metadata: jsonb("metadata"),
}, (table) => ({
  timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

export const nftAssets = pgTable("nft_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractAddress: text("contract_address").notNull(),
  tokenId: text("token_id").notNull(),
  collection: text("collection").notNull(),
  image: text("image"),
  floorPrice: real("floor_price"),
  estimatedValueUsd: real("estimated_value_usd"),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
}, (table) => ({
  contractTokenUnique: unique("contract_token_unique").on(table.contractAddress, table.tokenId),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertTreasurySnapshotSchema = createInsertSchema(treasurySnapshots).omit({
  id: true,
});

export const insertNftAssetSchema = createInsertSchema(nftAssets).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

export type InsertTreasurySnapshot = z.infer<typeof insertTreasurySnapshotSchema>;
export type TreasurySnapshot = typeof treasurySnapshots.$inferSelect;

export type InsertNftAsset = z.infer<typeof insertNftAssetSchema>;
export type NftAsset = typeof nftAssets.$inferSelect;

export interface TokenBalance {
  symbol: string;
  amount: number;
  usdPrice?: number;
  usdValue?: number;
  source: 'safe' | 'dune' | 'manual';
}

export interface NftHolding {
  collection: string;
  tokenId: string;
  image?: string;
  floorPrice?: number;
  estimatedValueUsd?: number;
}

export interface WalletInfo {
  address: string;
  chainId: number;
}

export interface SnapshotData {
  timestamp: string;
  totalUsdValue: number;
  tokens: TokenBalance[];
  nfts: NftHolding[];
  wallets: WalletInfo[];
}
