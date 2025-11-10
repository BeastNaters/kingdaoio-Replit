import { 
  type AdminSetting,
  type InsertAdminSetting,
  type NftAsset,
  type InsertNftAsset
} from "@shared/schema";
import { db } from "./db";
import { adminSettings, nftAssets } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  
  getNftAssets(): Promise<NftAsset[]>;
  getNftAsset(contractAddress: string, tokenId: string): Promise<NftAsset | undefined>;
  upsertNftAsset(asset: InsertNftAsset): Promise<NftAsset>;
  upsertNftAssets(assets: InsertNftAsset[]): Promise<NftAsset[]>;
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
}

export const storage = new DatabaseStorage();
