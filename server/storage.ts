import { type User, type InsertUser, type Claim, type InsertClaim, type CompletedCircle, type InsertCompletedCircle, type UserPath, type InsertUserPath } from "@shared/schema";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, claims, completedCircles, userPaths } from "@shared/schema";
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private claims: Map<string, Claim>;
  private userPaths: Map<string, UserPath>;
  private completedCircles: Map<string, CompletedCircle>;

  constructor() {
    this.users = new Map();
    this.claims = new Map();
    this.userPaths = new Map();
    this.completedCircles = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      email: insertUser.email || null,
      isAnonymous: insertUser.isAnonymous || null,
      district: insertUser.district || null,
      city: insertUser.city || null,
      country: insertUser.country || null,
      id, 
      createdAt: new Date(),
      totalArea: 0,
      totalClaims: 0,
      totalCompletedCircles: 0,
      totalPathLength: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserPath(id: string): Promise<UserPath | undefined> {
    return this.userPaths.get(id);
  }

  async getUserPaths(userId: string): Promise<UserPath[]> {
    return Array.from(this.userPaths.values()).filter(
      (path) => path.userId === userId,
    );
  }

  async getActiveUserPath(userId: string): Promise<UserPath | undefined> {
    return Array.from(this.userPaths.values()).find(
      (path) => path.userId === userId && path.isActive === 1,
    );
  }

  async getAllUserPaths(): Promise<UserPath[]> {
    return Array.from(this.userPaths.values());
  }

  async createUserPath(insertUserPath: InsertUserPath): Promise<UserPath> {
    const id = randomUUID();
    const userPath: UserPath = { 
      ...insertUserPath,
      district: insertUserPath.district || null,
      city: insertUserPath.city || null,
      country: insertUserPath.country || null,
      area: insertUserPath.area || null,
      pathLength: insertUserPath.pathLength || null,
      isActive: insertUserPath.isActive || null,
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userPaths.set(id, userPath);

    // Update user's total path length and area
    const user = this.users.get(insertUserPath.userId);
    if (user) {
      user.totalPathLength = (user.totalPathLength || 0) + (insertUserPath.pathLength || 0);
      user.totalArea = (user.totalArea || 0) + (insertUserPath.area || 0);
      this.users.set(user.id, user);
    }

    return userPath;
  }

  async updateUserPath(id: string, updates: Partial<UserPath>): Promise<UserPath | undefined> {
    const userPath = this.userPaths.get(id);
    if (!userPath) return undefined;
    
    const updatedUserPath = { ...userPath, ...updates, updatedAt: new Date() };
    this.userPaths.set(id, updatedUserPath);

    // Update user's total area if area changed
    if (updates.area !== undefined || updates.pathLength !== undefined) {
      const user = this.users.get(userPath.userId);
      if (user) {
        const oldArea = userPath.area || 0;
        const newArea = updatedUserPath.area || 0;
        const oldLength = userPath.pathLength || 0;
        const newLength = updatedUserPath.pathLength || 0;
        
        user.totalArea = (user.totalArea || 0) - oldArea + newArea;
        user.totalPathLength = (user.totalPathLength || 0) - oldLength + newLength;
        this.users.set(user.id, user);
      }
    }

    return updatedUserPath;
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getClaimsByUser(userId: string): Promise<Claim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) => claim.userId === userId,
    );
  }

  async getAllClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values());
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = randomUUID();
    const claim: Claim = { 
      ...insertClaim,
      district: insertClaim.district || null,
      city: insertClaim.city || null,
      country: insertClaim.country || null,
      radius: insertClaim.radius || 100,
      id, 
      createdAt: new Date(),
    };
    this.claims.set(id, claim);

    // Update user's total area and claims count
    const user = this.users.get(insertClaim.userId);
    if (user) {
      user.totalArea = (user.totalArea || 0) + insertClaim.area;
      user.totalClaims = (user.totalClaims || 0) + 1;
      this.users.set(user.id, user);
    }

    return claim;
  }

  async getCompletedCircle(id: string): Promise<CompletedCircle | undefined> {
    return this.completedCircles.get(id);
  }

  async getCompletedCirclesByUser(userId: string): Promise<CompletedCircle[]> {
    return Array.from(this.completedCircles.values()).filter(
      (circle) => circle.userId === userId,
    );
  }

  async getAllCompletedCircles(): Promise<CompletedCircle[]> {
    return Array.from(this.completedCircles.values());
  }

  async createCompletedCircle(insertCompletedCircle: InsertCompletedCircle): Promise<CompletedCircle> {
    const id = randomUUID();
    const completedCircle: CompletedCircle = {
      ...insertCompletedCircle,
      district: insertCompletedCircle.district || null,
      city: insertCompletedCircle.city || null,
      country: insertCompletedCircle.country || null,
      completionTime: insertCompletedCircle.completionTime || null,
      id,
      createdAt: new Date(),
    };
    this.completedCircles.set(id, completedCircle);

    // Update user's total area and completed circles count
    const user = this.users.get(insertCompletedCircle.userId);
    if (user) {
      user.totalArea = (user.totalArea || 0) + insertCompletedCircle.area;
      user.totalCompletedCircles = (user.totalCompletedCircles || 0) + 1;
      this.users.set(user.id, user);
    }

    return completedCircle;
  }

  async getLeaderboard(scope: 'district' | 'city' | 'country', location: string): Promise<User[]> {
    const users = Array.from(this.users.values());
    const filteredUsers = users.filter(user => {
      switch (scope) {
        case 'district': return user.district === location;
        case 'city': return user.city === location;
        case 'country': return user.country === location;
        default: return true;
      }
    });
    
    return filteredUsers
      .sort((a, b) => (b.totalArea || 0) - (a.totalArea || 0))
      .slice(0, 50); // Top 50 players
  }

  async getUserRank(userId: string, scope: 'district' | 'city' | 'country', location: string): Promise<number> {
    const leaderboard = await this.getLeaderboard(scope, location);
    const userIndex = leaderboard.findIndex(user => user.id === userId);
    return userIndex >= 0 ? userIndex + 1 : -1;
  }
}

// Database storage implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getClaim(id: string): Promise<Claim | undefined> {
    const result = await this.db.select().from(claims).where(eq(claims.id, id)).limit(1);
    return result[0];
  }

  async getClaimsByUser(userId: string): Promise<Claim[]> {
    return await this.db.select().from(claims).where(eq(claims.userId, userId)).orderBy(desc(claims.createdAt));
  }

  async getAllClaims(): Promise<Claim[]> {
    return await this.db.select().from(claims).orderBy(desc(claims.createdAt));
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const result = await this.db.insert(claims).values(insertClaim).returning();
    const claim = result[0];

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

  async getCompletedCircle(id: string): Promise<CompletedCircle | undefined> {
    const result = await this.db.select().from(completedCircles).where(eq(completedCircles.id, id)).limit(1);
    return result[0];
  }

  async getCompletedCirclesByUser(userId: string): Promise<CompletedCircle[]> {
    return await this.db.select().from(completedCircles).where(eq(completedCircles.userId, userId)).orderBy(desc(completedCircles.createdAt));
  }

  async getAllCompletedCircles(): Promise<CompletedCircle[]> {
    return await this.db.select().from(completedCircles).orderBy(desc(completedCircles.createdAt));
  }

  async createCompletedCircle(insertCompletedCircle: InsertCompletedCircle): Promise<CompletedCircle> {
    const result = await this.db.insert(completedCircles).values(insertCompletedCircle).returning();
    const completedCircle = result[0];

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

    return await this.db
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

  async getUserPath(id: string): Promise<UserPath | undefined> {
    const result = await this.db.select().from(userPaths).where(eq(userPaths.id, id)).limit(1);
    return result[0];
  }

  async getUserPaths(userId: string): Promise<UserPath[]> {
    return await this.db.select().from(userPaths).where(eq(userPaths.userId, userId)).orderBy(desc(userPaths.createdAt));
  }

  async getActiveUserPath(userId: string): Promise<UserPath | undefined> {
    const result = await this.db.select().from(userPaths).where(eq(userPaths.userId, userId)).limit(1);
    return result.find(path => path.isActive === 1);
  }

  async getAllUserPaths(): Promise<UserPath[]> {
    return await this.db.select().from(userPaths).orderBy(desc(userPaths.createdAt));
  }

  async createUserPath(insertUserPath: InsertUserPath): Promise<UserPath> {
    const result = await this.db.insert(userPaths).values(insertUserPath).returning();
    return result[0];
  }

  async updateUserPath(id: string, updates: Partial<UserPath>): Promise<UserPath | undefined> {
    const result = await this.db.update(userPaths).set(updates).where(eq(userPaths.id, id)).returning();
    return result[0];
  }
}

// Use memory storage for now to ensure the app works
// Database storage can be enabled once connection issues are resolved
console.log("Using memory storage for demo purposes");
export const storage = new MemStorage();

// Uncomment the following when database connection is working:
/*
let storage: IStorage;
try {
  if (process.env.DATABASE_URL) {
    console.log("Attempting to connect to database...");
    storage = new DbStorage();
  } else {
    console.log("No DATABASE_URL found, using memory storage");
    storage = new MemStorage();
  }
} catch (error) {
  console.error("Database connection failed, falling back to memory storage:", error);
  storage = new MemStorage();
}
export { storage };
*/
