import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, real, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminSettings = pgTable("admin_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

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

export const insertAdminSettingSchema = createInsertSchema(adminSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertNftAssetSchema = createInsertSchema(nftAssets).omit({
  id: true,
  lastUpdated: true,
});

export type InsertAdminSetting = z.infer<typeof insertAdminSettingSchema>;
export type AdminSetting = typeof adminSettings.$inferSelect;

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

export const communityMessages = pgTable("community_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  username: text("username"),
  message: text("message").notNull(),
  channel: text("channel").notNull().default("general"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  windowSlot: text("window_slot").notNull().generatedAlwaysAs(sql`floor(extract(epoch from created_at) / 30)::text`),
}, (table) => ({
  rateLimitUnique: unique("rate_limit_unique").on(table.walletAddress, table.channel, table.windowSlot),
}));

export const insertCommunityMessageSchema = createInsertSchema(communityMessages).omit({
  id: true,
  createdAt: true,
  windowSlot: true,
}).extend({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long (max 1000 characters)"),
  channel: z.string().min(1).max(50).default("general"),
  username: z.string().max(50).optional(),
});

export type InsertCommunityMessage = z.infer<typeof insertCommunityMessageSchema>;
export type CommunityMessage = typeof communityMessages.$inferSelect;
