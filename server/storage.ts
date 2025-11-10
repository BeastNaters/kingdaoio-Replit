import { 
  type User, 
  type InsertUser,
  type AdminSetting,
  type InsertAdminSetting,
  type TreasurySnapshot,
  type InsertTreasurySnapshot
} from "@shared/schema";
import { db } from "./db";
import { users, adminSettings, treasurySnapshots } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAdminSetting(key: string): Promise<AdminSetting | undefined>;
  setAdminSetting(setting: InsertAdminSetting): Promise<AdminSetting>;
  getAllAdminSettings(): Promise<AdminSetting[]>;
  
  getTreasurySnapshots(limit?: number): Promise<TreasurySnapshot[]>;
  getLatestTreasurySnapshot(): Promise<TreasurySnapshot | undefined>;
  createTreasurySnapshot(snapshot: InsertTreasurySnapshot): Promise<TreasurySnapshot>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

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

  async getTreasurySnapshots(limit: number = 100): Promise<TreasurySnapshot[]> {
    return await db
      .select()
      .from(treasurySnapshots)
      .orderBy(desc(treasurySnapshots.timestamp))
      .limit(limit);
  }

  async getLatestTreasurySnapshot(): Promise<TreasurySnapshot | undefined> {
    const snapshots = await this.getTreasurySnapshots(1);
    return snapshots[0];
  }

  async createTreasurySnapshot(insertSnapshot: InsertTreasurySnapshot): Promise<TreasurySnapshot> {
    const [snapshot] = await db
      .insert(treasurySnapshots)
      .values(insertSnapshot)
      .returning();
    return snapshot;
  }
}

export const storage = new DatabaseStorage();
