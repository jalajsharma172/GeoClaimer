import { type User, type InsertUser, type Claim, type InsertClaim, type CompletedCircle, type InsertCompletedCircle, type UserPath, type InsertUserPath, type MapViewPreferences, type InsertMapViewPreferences, type UserNFT, type InsertUserNFT, type LeaderTable, type InsertLeaderTable } from "@shared/schema";
// Database storage implementation using Drizzle ORM
import { users, claims, completedCircles, userPaths, mapViewPreferences, userNFTs, leaderTable } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Claim operations
  getClaim(id: string): Promise<Claim | undefined>;
  getClaimsByUser(userId: string): Promise<Claim[]>;
  getAllClaims(): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  
  // User Path operations
  getUserPath(id: string): Promise<UserPath | undefined>;
  getUserPaths(userId: string): Promise<UserPath[]>;
  getUserPathsByUsername(username: string): Promise<UserPath[]>;
  getActiveUserPath(userId: string): Promise<UserPath | undefined>;
  getAllUserPaths(): Promise<UserPath[]>;
  createUserPath(userPath: InsertUserPath): Promise<UserPath>;
  updateUserPath(id: string, updates: Partial<UserPath>): Promise<UserPath | undefined>;
  
  // Completed Circle operations
  getCompletedCircle(id: string): Promise<CompletedCircle | undefined>;
  getCompletedCirclesByUser(userId: string): Promise<CompletedCircle[]>;
  getAllCompletedCircles(): Promise<CompletedCircle[]>;
  createCompletedCircle(completedCircle: InsertCompletedCircle): Promise<CompletedCircle>;
  
  // Leaderboard operations
  getLeaderboard(scope: 'district' | 'city' | 'country', location: string): Promise<User[]>;
  getUserRank(userId: string, scope: 'district' | 'city' | 'country', location: string): Promise<number>;
  
  // MapView preferences operations
  getMapViewPreferences(userId: string): Promise<MapViewPreferences | undefined>;
  createMapViewPreferences(preferences: InsertMapViewPreferences): Promise<MapViewPreferences>;
  updateMapViewPreferences(userId: string, updates: Partial<MapViewPreferences>): Promise<MapViewPreferences | undefined>;
  
  // UserNFT operations
  getUserNFT(id: string): Promise<UserNFT | undefined>;
  getUserNFTsByUsername(username: string): Promise<UserNFT[]>;
  getAllUserNFTs(): Promise<UserNFT[]>;
  createUserNFT(userNFT: InsertUserNFT): Promise<UserNFT>;
  updateUserNFT(id: string, updates: Partial<UserNFT>): Promise<UserNFT | undefined>;
  
  // LeaderTable operations
  getLeaderTableEntry(id: string): Promise<LeaderTable | undefined>;
  getLeaderTableByUsername(username: string): Promise<LeaderTable[]>;
  getAllLeaderTableEntries(): Promise<LeaderTable[]>;
  createLeaderTableEntry(entry: InsertLeaderTable): Promise<LeaderTable>;
  updateLeaderTableEntry(id: string, updates: Partial<LeaderTable>): Promise<LeaderTable | undefined>;
}

// MapView preferences operations added to interface and implemented below

import { db } from "./db";

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async getClaimsByUser(userId: string): Promise<Claim[]> {
    return await db.select().from(claims).where(eq(claims.userId, userId)).orderBy(desc(claims.createdAt));
  }

  async getAllClaims(): Promise<Claim[]> {
    return await db.select().from(claims).orderBy(desc(claims.createdAt));
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const [claim] = await db.insert(claims).values(insertClaim).returning();

    // Update user's total area and claims count
    const user = await this.getUser(insertClaim.userId);
    if (user) {
      await this.updateUser(user.id, {
        totalArea: (user.totalArea || 0) + insertClaim.area,
        totalClaims: (user.totalClaims || 0) + 1,
      });
    }

    return claim;
  }

  async getUserPath(id: string): Promise<UserPath | undefined> {
    const [userPath] = await db.select().from(userPaths).where(eq(userPaths.id, id));
    return userPath || undefined;
  }

  async getUserPaths(userId: string): Promise<UserPath[]> {
    return await db.select().from(userPaths).where(eq(userPaths.userId, userId)).orderBy(desc(userPaths.createdAt));
  }

  async getUserPathsByUsername(username: string): Promise<UserPath[]> {
    return await db.select().from(userPaths).where(eq(userPaths.username, username)).orderBy(desc(userPaths.createdAt));
  }

  async getActiveUserPath(userId: string): Promise<UserPath | undefined> {
    const [userPath] = await db.select().from(userPaths).where(eq(userPaths.userId, userId));
    return userPath?.isActive === 1 ? userPath : undefined;
  }

  async getAllUserPaths(): Promise<UserPath[]> {
    return await db.select().from(userPaths).orderBy(desc(userPaths.createdAt));
  }

  async createUserPath(insertUserPath: InsertUserPath): Promise<UserPath> {
    const [userPath] = await db.insert(userPaths).values(insertUserPath).returning();

    // Update user's total path length and area
    const user = await this.getUser(insertUserPath.userId);
    if (user) {
      await this.updateUser(user.id, {
        totalPathLength: (user.totalPathLength || 0) + (insertUserPath.pathLength || 0),
        totalArea: (user.totalArea || 0) + (insertUserPath.area || 0),
      });
    }

    return userPath;
  }

  async updateUserPath(id: string, updates: Partial<UserPath>): Promise<UserPath | undefined> {
    const existingPath = await this.getUserPath(id);
    if (!existingPath) return undefined;

    const [updatedPath] = await db
      .update(userPaths)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPaths.id, id))
      .returning();

    // Update user's total area if area changed
    if (updates.area !== undefined || updates.pathLength !== undefined) {
      const user = await this.getUser(existingPath.userId);
      if (user) {
        const oldArea = existingPath.area || 0;
        const newArea = updatedPath.area || 0;
        const oldLength = existingPath.pathLength || 0;
        const newLength = updatedPath.pathLength || 0;
        
        await this.updateUser(user.id, {
          totalArea: (user.totalArea || 0) - oldArea + newArea,
          totalPathLength: (user.totalPathLength || 0) - oldLength + newLength,
        });
      }
    }

    return updatedPath || undefined;
  }

  async getCompletedCircle(id: string): Promise<CompletedCircle | undefined> {
    const [circle] = await db.select().from(completedCircles).where(eq(completedCircles.id, id));
    return circle || undefined;
  }

  async getCompletedCirclesByUser(userId: string): Promise<CompletedCircle[]> {
    return await db.select().from(completedCircles).where(eq(completedCircles.userId, userId)).orderBy(desc(completedCircles.createdAt));
  }

  async getAllCompletedCircles(): Promise<CompletedCircle[]> {
    return await db.select().from(completedCircles).orderBy(desc(completedCircles.createdAt));
  }

  async createCompletedCircle(insertCompletedCircle: InsertCompletedCircle): Promise<CompletedCircle> {
    const [completedCircle] = await db.insert(completedCircles).values(insertCompletedCircle).returning();

    // Update user's total area and completed circles count
    const user = await this.getUser(insertCompletedCircle.userId);
    if (user) {
      await this.updateUser(user.id, {
        totalArea: (user.totalArea || 0) + insertCompletedCircle.area,
        totalCompletedCircles: (user.totalCompletedCircles || 0) + 1,
      });
    }

    return completedCircle;
  }

  async getLeaderboard(scope: 'district' | 'city' | 'country', location: string): Promise<User[]> {
    let whereCondition;
    switch (scope) {
      case 'district':
        whereCondition = eq(users.district, location);
        break;
      case 'city':
        whereCondition = eq(users.city, location);
        break;
      case 'country':
        whereCondition = eq(users.country, location);
        break;
    }

    return await db
      .select()
      .from(users)
      .where(whereCondition)
      .orderBy(desc(users.totalArea))
      .limit(50);
  }

  async getUserRank(userId: string, scope: 'district' | 'city' | 'country', location: string): Promise<number> {
    const leaderboard = await this.getLeaderboard(scope, location);
    const userIndex = leaderboard.findIndex(user => user.id === userId);
    return userIndex >= 0 ? userIndex + 1 : -1;
  }

  async getMapViewPreferences(userId: string): Promise<MapViewPreferences | undefined> {
    const [preferences] = await db.select().from(mapViewPreferences).where(eq(mapViewPreferences.userId, userId));
    return preferences || undefined;
  }

  async createMapViewPreferences(insertPreferences: InsertMapViewPreferences): Promise<MapViewPreferences> {
    const [preferences] = await db.insert(mapViewPreferences).values(insertPreferences).returning();
    return preferences;
  }

  async updateMapViewPreferences(userId: string, updates: Partial<MapViewPreferences>): Promise<MapViewPreferences | undefined> {
    const [preferences] = await db
      .update(mapViewPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mapViewPreferences.userId, userId))
      .returning();
    return preferences || undefined;
  }

  async getUserNFT(id: string): Promise<UserNFT | undefined> {
    const [userNFT] = await db.select().from(userNFTs).where(eq(userNFTs.id, id));
    return userNFT || undefined;
  }

  async getUserNFTsByUsername(username: string): Promise<UserNFT[]> {
    try {
      // Try with created_at ordering first
      return await db.select().from(userNFTs).where(eq(userNFTs.username, username)).orderBy(desc(userNFTs.createdAt));
    } catch (error) {
      // If created_at column doesn't exist, fetch without ordering
      console.log("created_at column not found, fetching without ordering");
      return await db.select().from(userNFTs).where(eq(userNFTs.username, username));
    }
  }

  async getAllUserNFTs(): Promise<UserNFT[]> {
    try {
      // Try with created_at ordering first
      return await db.select().from(userNFTs).orderBy(desc(userNFTs.createdAt));
    } catch (error) {
      // If created_at column doesn't exist, fetch without ordering
      console.log("created_at column not found, fetching without ordering");
      return await db.select().from(userNFTs);
    }
  }

  async createUserNFT(insertUserNFT: InsertUserNFT): Promise<UserNFT> {
    const [userNFT] = await db.insert(userNFTs).values(insertUserNFT).returning();
    return userNFT;
  }

  async updateUserNFT(id: string, updates: Partial<UserNFT>): Promise<UserNFT | undefined> {
    const [userNFT] = await db
      .update(userNFTs)
      .set(updates)
      .where(eq(userNFTs.id, id))
      .returning();
    return userNFT || undefined;
  }

  // LeaderTable operations implementation
  async getLeaderTableEntry(id: string): Promise<LeaderTable | undefined> {
    const [entry] = await db.select().from(leaderTable).where(eq(leaderTable.id, id));
    return entry || undefined;
  }

  async getLeaderTableByUsername(username: string): Promise<LeaderTable[]> {
    try {
      return await db.select().from(leaderTable).where(eq(leaderTable.username, username)).orderBy(desc(leaderTable.createdAt));
    } catch (error) {
      console.log("Error fetching leader table entries, fetching without ordering");
      return await db.select().from(leaderTable).where(eq(leaderTable.username, username));
    }
  }

  async getAllLeaderTableEntries(): Promise<LeaderTable[]> {
    try {
      return await db.select().from(leaderTable).orderBy(desc(leaderTable.rank), desc(leaderTable.createdAt));
    } catch (error) {
      console.log("Error fetching leader table entries, fetching without ordering");
      return await db.select().from(leaderTable);
    }
  }

  async createLeaderTableEntry(insertEntry: InsertLeaderTable): Promise<LeaderTable> {
    const [entry] = await db.insert(leaderTable).values(insertEntry).returning();
    return entry;
  }

  async updateLeaderTableEntry(id: string, updates: Partial<LeaderTable>): Promise<LeaderTable | undefined> {
    const [entry] = await db
      .update(leaderTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(leaderTable.id, id))
      .returning();
    return entry || undefined;
  }
}

export const storage = new DatabaseStorage();
