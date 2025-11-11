import { 
  type AdminSetting,
  type InsertAdminSetting,
  type NftAsset,
  type InsertNftAsset,
  type CommunityMessage,
  type InsertCommunityMessage
} from "@shared/schema";
import { db } from "./db";
import { adminSettings, nftAssets, communityMessages } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  
  getNftAssets(): Promise<NftAsset[]>;
  getNftAsset(contractAddress: string, tokenId: string): Promise<NftAsset | undefined>;
  upsertNftAsset(asset: InsertNftAsset): Promise<NftAsset>;
  upsertNftAssets(assets: InsertNftAsset[]): Promise<NftAsset[]>;

  getCommunityMessages(channel: string, limit: number, offset: number): Promise<CommunityMessage[]>;
  getLastMessageByWallet(walletAddress: string, channel: string): Promise<CommunityMessage | undefined>;
  createCommunityMessage(message: InsertCommunityMessage): Promise<CommunityMessage>;
}

export class DatabaseStorage implements IStorage {
  async getAdminSetting(key: string): Promise<AdminSetting | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting || undefined;
  }

  async setAdminSetting(insertSetting: InsertAdminSetting): Promise<AdminSetting> {
    const [setting] = await db
      .insert(adminSettings)
      .values(insertSetting)
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: {
          value: insertSetting.value,
          updatedAt: new Date(),
        },
      })
      .returning();
    return setting;
  }

  async getAllAdminSettings(): Promise<AdminSetting[]> {
    return await db.select().from(adminSettings);
  }

  async getNftAssets(): Promise<NftAsset[]> {
    return await db.select().from(nftAssets);
  }

  async getNftAsset(contractAddress: string, tokenId: string): Promise<NftAsset | undefined> {
    const [asset] = await db
      .select()
      .from(nftAssets)
      .where(and(
        eq(nftAssets.contractAddress, contractAddress),
        eq(nftAssets.tokenId, tokenId)
      ));
    return asset || undefined;
  }

  async upsertNftAsset(insertAsset: InsertNftAsset): Promise<NftAsset> {
    const [asset] = await db
      .insert(nftAssets)
      .values(insertAsset)
      .onConflictDoUpdate({
        target: [nftAssets.contractAddress, nftAssets.tokenId],
        set: {
          collection: insertAsset.collection,
          image: insertAsset.image,
          floorPrice: insertAsset.floorPrice,
          estimatedValueUsd: insertAsset.estimatedValueUsd,
          lastUpdated: new Date(),
        },
      })
      .returning();
    return asset;
  }

  async upsertNftAssets(assets: InsertNftAsset[]): Promise<NftAsset[]> {
    if (assets.length === 0) return [];
    
    const results: NftAsset[] = [];
    for (const asset of assets) {
      const result = await this.upsertNftAsset(asset);
      results.push(result);
    }
    return results;
  }

  async getCommunityMessages(channel: string, limit: number, offset: number): Promise<CommunityMessage[]> {
    const messages = await db
      .select()
      .from(communityMessages)
      .where(eq(communityMessages.channel, channel))
      .orderBy(desc(communityMessages.createdAt))
      .limit(limit)
      .offset(offset);
    return messages.reverse();
  }

  async getLastMessageByWallet(walletAddress: string, channel: string): Promise<CommunityMessage | undefined> {
    const [message] = await db
      .select()
      .from(communityMessages)
      .where(and(
        eq(communityMessages.walletAddress, walletAddress),
        eq(communityMessages.channel, channel)
      ))
      .orderBy(desc(communityMessages.createdAt))
      .limit(1);
    return message || undefined;
  }

  async createCommunityMessage(insertMessage: InsertCommunityMessage): Promise<CommunityMessage> {
    const [message] = await db
      .insert(communityMessages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
