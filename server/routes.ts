import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClaimSchema, insertCompletedCircleSchema, insertUserPathSchema, insertMapViewPreferencesSchema, insertUserNFTSchema, insertLeaderTableSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().optional().refine((val) => !val || val === "" || z.string().email().safeParse(val).success, {
    message: "Invalid email format"
  }),
  username: z.string().min(1),
  isAnonymous: z.boolean().default(false),
});

const claimSchema = insertClaimSchema.extend({
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
}).transform((data) => ({
  ...data,
  district: data.district || undefined,
  city: data.city || undefined,
  country: data.country || undefined,
}));

const userPathSchema = insertUserPathSchema.extend({
  district: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
}).transform((data) => ({
  ...data,
  district: data.district || undefined,
  city: data.city || undefined,
  country: data.country || undefined,
}));

// Helper functions for data processing
function filterMetadata(jsonData: any): any {
  // Extract relevant metadata fields
  // You can customize this based on your data structure
  const metadata: any = {};
  
  // Common metadata fields that might be relevant
  const relevantFields = [
    'username', 'user', 'name', 'id', 'userId',
    'timestamp', 'createdAt', 'updatedAt', 'date', 'time',
    'score', 'points', 'level', 'rank', 'position',
    'area', 'location', 'coordinates', 'lat', 'lng', 'latitude', 'longitude',
    'type', 'category', 'status', 'state',
    'metadata', 'data', 'info', 'details',
    'nft', 'token', 'hash', 'contract', 'blockchain',
    'game', 'achievement', 'progress', 'stats'
  ];
  
  // Extract fields that exist in the data
  for (const field of relevantFields) {
    if (jsonData.hasOwnProperty(field) && jsonData[field] !== null && jsonData[field] !== undefined) {
      metadata[field] = jsonData[field];
    }
  }
  
  // Also check nested objects
  if (jsonData.metadata && typeof jsonData.metadata === 'object') {
    metadata.nestedMetadata = jsonData.metadata;
  }
  
  if (jsonData.data && typeof jsonData.data === 'object') {
    metadata.nestedData = jsonData.data;
  }
  
  // Add processing timestamp
  metadata.processedAt = new Date().toISOString();
  
  return metadata;
}

function extractUsername(jsonData: any): string {
  // Try to extract username from various possible fields
  const possibleUsernameFields = [
    'username', 'user', 'userName', 'user_name',
    'name', 'displayName', 'display_name',
    'id', 'userId', 'user_id', 'playerId', 'player_id',
    'email', 'account', 'accountName'
  ];
  
  for (const field of possibleUsernameFields) {
    if (jsonData[field] && typeof jsonData[field] === 'string') {
      return jsonData[field];
    }
  }
  
  // Check nested objects
  if (jsonData.user && typeof jsonData.user === 'object') {
    for (const field of possibleUsernameFields) {
      if (jsonData.user[field] && typeof jsonData.user[field] === 'string') {
        return jsonData.user[field];
      }
    }
  }
  
  if (jsonData.metadata && typeof jsonData.metadata === 'object') {
    for (const field of possibleUsernameFields) {
      if (jsonData.metadata[field] && typeof jsonData.metadata[field] === 'string') {
        return jsonData.metadata[field];
      }
    }
  }
  
  // Fallback to 'anonymous' if no username found
  return 'anonymous_' + Date.now();
}

function calculateScore(metadata: any): number {
  // Calculate score based on metadata
  // You can customize this logic based on your requirements
  let score = 0;
  
  // Basic scoring logic
  if (metadata.score && typeof metadata.score === 'number') {
    score += metadata.score;
  }
  
  if (metadata.points && typeof metadata.points === 'number') {
    score += metadata.points;
  }
  
  if (metadata.level && typeof metadata.level === 'number') {
    score += metadata.level * 10;
  }
  
  if (metadata.area && typeof metadata.area === 'number') {
    score += Math.floor(metadata.area / 100); // 1 point per 100 area units
  }
  
  // Bonus points for having complete data
  const dataCompletenessBonuses = [
    'username', 'location', 'timestamp', 'coordinates'
  ];
  
  for (const field of dataCompletenessBonuses) {
    if (metadata[field]) {
      score += 5;
    }
  }
  
  return Math.max(0, score); // Ensure score is not negative
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("Login request body:", req.body);
      const { email, username, isAnonymous } = loginSchema.parse(req.body);
      
      let user;
      if (email && email.trim() !== "" && !isAnonymous) {
        user = await storage.getUserByEmail(email);
        if (!user) {
          user = await storage.createUser({
            email,
            username,
            isAnonymous: 0,
          });
        }
      } else {
        // Anonymous user
        user = await storage.createUser({
          username,
          isAnonymous: 1,
        });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ message: "Server error", error: errorMessage });
      }
    }
  });

  // User endpoints
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Claims endpoints
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getAllClaims();
      res.json({ claims });
    } catch (error) {
      res.status(500).json({ message: "Failed to get claims" });
    }
  });

  app.get("/api/claims/user/:userId", async (req, res) => {
    try {
      const claims = await storage.getClaimsByUser(req.params.userId);
      res.json({ claims });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user claims" });
    }
  });

  app.post("/api/claims", async (req, res) => {
    try {
      const claimData = claimSchema.parse(req.body);
      const claim = await storage.createClaim(claimData);
      res.json({ claim });
    } catch (error) {
      res.status(400).json({ message: "Invalid claim data" });
    }
  });

  // Completed Circles endpoints
  app.get("/api/completed-circles", async (req, res) => {
    try {
      const completedCircles = await storage.getAllCompletedCircles();
      res.json({ completedCircles });
    } catch (error) {
      res.status(500).json({ message: "Failed to get completed circles" });
    }
  });

  app.get("/api/completed-circles/user/:userId", async (req, res) => {
    try {
      const completedCircles = await storage.getCompletedCirclesByUser(req.params.userId);
      res.json({ completedCircles });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user completed circles" });
    }
  });

  app.post("/api/completed-circles", async (req, res) => {
    try {
      const completedCircleData = insertCompletedCircleSchema.parse(req.body);
      const completedCircle = await storage.createCompletedCircle(completedCircleData);
      res.json({ completedCircle });
    } catch (error) {
      res.status(400).json({ message: "Invalid completed circle data" });
    }
  });

  // User Path endpoints
  app.get("/api/user-paths", async (req, res) => {
    try {
      const userPaths = await storage.getAllUserPaths();
      res.json({ userPaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user paths" });
    }
  });

  app.get("/api/user-paths/user/:userId", async (req, res) => {
    try {
      const userPaths = await storage.getUserPaths(req.params.userId);
      res.json({ userPaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user paths" });
    }
  });

  app.get("/api/user-paths/username/:username", async (req, res) => {
    try {
      const userPaths = await storage.getUserPathsByUsername(req.params.username);
      res.json({ userPaths });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user paths by username" });
    }
  });

  app.get("/api/user-paths/active/:userId", async (req, res) => {
    try {
      const activePath = await storage.getActiveUserPath(req.params.userId);
      res.json({ activePath });
    } catch (error) {
      res.status(500).json({ message: "Failed to get active user path" });
    }
  });

  app.post("/api/user-paths", async (req, res) => {
    try {
      const userPathData = userPathSchema.parse(req.body);
      const userPath = await storage.createUserPath(userPathData);
      res.json({ userPath });
    } catch (error) {
      console.error("Path creation error:", error);
      res.status(400).json({ message: "Invalid user path data" });
    }
  });

  app.put("/api/user-paths/:id", async (req, res) => {
    try {
      const updates = req.body;
      const userPath = await storage.updateUserPath(req.params.id, updates);
      if (!userPath) {
        return res.status(404).json({ message: "User path not found" });
      }
      res.json({ userPath });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user path" });
    }
  });

  // Leaderboard endpoints
  app.get("/api/leaderboard/:scope/:location", async (req, res) => {
    try {
      const { scope, location } = req.params;
      if (!['district', 'city', 'country'].includes(scope)) {
        return res.status(400).json({ message: "Invalid scope" });
      }
      
      const leaderboard = await storage.getLeaderboard(
        scope as 'district' | 'city' | 'country',
        decodeURIComponent(location)
      );
      res.json({ leaderboard });
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  app.get("/api/leaderboard/:scope/:location/rank/:userId", async (req, res) => {
    try {
      const { scope, location, userId } = req.params;
      if (!['district', 'city', 'country'].includes(scope)) {
        return res.status(400).json({ message: "Invalid scope" });
      }
      
      const rank = await storage.getUserRank(
        userId,
        scope as 'district' | 'city' | 'country',
        decodeURIComponent(location)
      );
      res.json({ rank });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user rank" });
    }
  });

  // MapView preferences endpoints
  app.get("/api/map-preferences/:userId", async (req, res) => {
    try {
      const preferences = await storage.getMapViewPreferences(req.params.userId);
      res.json({ preferences });
    } catch (error) {
      res.status(500).json({ message: "Failed to get map preferences" });
    }
  });

  app.post("/api/map-preferences", async (req, res) => {
    try {
      const preferencesData = insertMapViewPreferencesSchema.parse(req.body);
      const preferences = await storage.createMapViewPreferences(preferencesData);
      res.json({ preferences });
    } catch (error) {
      console.error("Map preferences creation error:", error);
      res.status(400).json({ message: "Invalid map preferences data" });
    }
  });

  app.put("/api/map-preferences/:userId", async (req, res) => {
    try {
      const updates = req.body;
      const preferences = await storage.updateMapViewPreferences(req.params.userId, updates);
      if (!preferences) {
        return res.status(404).json({ message: "Map preferences not found" });
      }
      res.json({ preferences });
    } catch (error) {
      res.status(500).json({ message: "Failed to update map preferences" });
    }
  });

  // UserNFT endpoints
  app.get("/api/user-nfts", async (req, res) => {
    try {
      const userNFTs = await storage.getAllUserNFTs();
      res.json({ userNFTs });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user NFTs" });
    }
  });

  app.get("/api/user-nfts/:id", async (req, res) => {
    try {
      const userNFT = await storage.getUserNFT(req.params.id);
      if (!userNFT) {
        return res.status(404).json({ message: "User NFT not found" });
      }
      res.json({ userNFT });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user NFT" });
    }
  });

  app.get("/api/user-nfts/username/:username", async (req, res) => {
    try {
      console.log("Getting UserNFTs for username:", req.params.username);
      const userNFTs = await storage.getUserNFTsByUsername(req.params.username);
      console.log("Found UserNFTs:", userNFTs.length, "records");
      res.json({ userNFTs });
    } catch (error) {
      console.error("Error getting UserNFTs by username:", error);
      res.status(500).json({ message: "Failed to get user NFTs by username" });
    }
  });

  app.post("/api/user-nfts", async (req, res) => {
    try {
      const userNFTData = insertUserNFTSchema.parse(req.body);
      const userNFT = await storage.createUserNFT(userNFTData);
      res.json({ userNFT });
    } catch (error) {
      console.error("UserNFT creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(400).json({ message: "Invalid user NFT data" });
      }
    }
  });

  app.put("/api/user-nfts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const userNFT = await storage.updateUserNFT(req.params.id, updates);
      if (!userNFT) {
        return res.status(404).json({ message: "UserNFT not found" });
      }
      res.json({ userNFT });
    } catch (error) {
      console.error("UserNFT update error:", error);
      res.status(500).json({ message: "Failed to update UserNFT" });
    }
  });

  // LeaderTable endpoints
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const entries = await storage.getAllLeaderTableEntries();
      res.json({ leaderboard: entries });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });










  

  app.get("/api/leaderboard/user/:username", async (req, res) => {
    try {
      const entries = await storage.getLeaderTableByUsername(req.params.username);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching user leaderboard entries:", error);
      res.status(500).json({ message: "Failed to get user leaderboard entries" });
    }
  });

  // Test endpoint to generate sample data for testing
  app.get("/api/test-data", async (req, res) => {
    try {
      const sampleData = {
        username: "testUser_" + Date.now(),
        score: Math.floor(Math.random() * 1000),
        level: Math.floor(Math.random() * 50),
        area: Math.floor(Math.random() * 10000),
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1
        },
        timestamp: new Date().toISOString(),
        type: "game_completion",
        metadata: {
          gameMode: "survival",
          difficulty: "hard",
          achievements: ["explorer", "builder"]
        }
      };
      
      res.json({
        message: "Sample data for testing",
        sampleData,
        instruction: "POST this data to /api/submit-data to test the API"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate test data" });
    }
  });

  // Main POST API endpoint to accept JSON data and filter metadata
  app.post("/api/submit-data", async (req, res) => {
    try {
      console.log("Received JSON data:", JSON.stringify(req.body, null, 2));
      
      const jsonData = req.body;
      
      // Validate that we have some data
      if (!jsonData || typeof jsonData !== 'object') {
        return res.status(400).json({ 
          message: "Invalid JSON data", 
          error: "Request body must be a valid JSON object" 
        });
      }

      // Filter and extract metadata
      const metadata = filterMetadata(jsonData);
      
      // Extract username (you can modify this logic based on your data structure)
      const username = extractUsername(jsonData);
      
      // Calculate score (optional, based on your business logic)
      const score = calculateScore(metadata);

      // Create LeaderTable entry
      const leaderEntry = {
        username: username,
        metadata: JSON.stringify(metadata),
        score: score,
        rank: 0 // Will be calculated later if needed
      };

      console.log("Filtered metadata:", metadata);
      console.log("Extracted username:", username);
      console.log("Calculated score:", score);

      // Validate the entry before saving
      const validatedEntry = insertLeaderTableSchema.parse(leaderEntry);
      
      // Save to database
      const savedEntry = await storage.createLeaderTableEntry(validatedEntry);
      
      console.log("Data saved to LeaderTable:", savedEntry.id);

      res.json({ 
        message: "Data processed and saved successfully",
        entryId: savedEntry.id,
        username: username,
        score: score,
        metadata: metadata
      });

    } catch (error) {
      console.error("Submit data error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to process and save data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
