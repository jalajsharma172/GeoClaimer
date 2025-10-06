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
  
  // Handle the specific NFT format: {recipient, tokenURI, tokenId}
  if (jsonData.recipient || jsonData.tokenURI || jsonData.tokenId) {
    metadata.recipient = jsonData.recipient || '';
    metadata.tokenURI = jsonData.tokenURI || '';
    metadata.tokenId = jsonData.tokenId || '';
    metadata.nftData = true; // Flag to indicate this is NFT data
  }
  
  // Common metadata fields that might be relevant
  const relevantFields = [
    'username', 'user', 'name', 'id', 'userId',
    'timestamp', 'createdAt', 'updatedAt', 'date', 'time',
    'score', 'points', 'level', 'rank', 'position',
    'area', 'location', 'coordinates', 'lat', 'lng', 'latitude', 'longitude',
    'type', 'category', 'status', 'state',
    'metadata', 'data', 'info', 'details',
    'nft', 'token', 'hash', 'contract', 'blockchain',
    'game', 'achievement', 'progress', 'stats',
    'recipient', 'tokenURI', 'tokenId' // Added NFT specific fields
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
  // For NFT data format, use recipient as username if available
  if (jsonData.recipient && typeof jsonData.recipient === 'string' && jsonData.recipient.trim() !== '') {
    // If recipient is a wallet address, create a shortened version
    if (jsonData.recipient.startsWith('0x') && jsonData.recipient.length === 42) {
      return `user_${jsonData.recipient.slice(0, 6)}...${jsonData.recipient.slice(-4)}`;
    }
    return jsonData.recipient;
  }
  
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
  
  // NFT specific scoring
  if (metadata.nftData) {
    score += 100; // Base score for NFT creation
    
    // Bonus for having tokenURI
    if (metadata.tokenURI && metadata.tokenURI.trim() !== '') {
      score += 50;
    }
    
    // Bonus for having tokenId
    if (metadata.tokenId && metadata.tokenId.trim() !== '') {
      score += 30;
    }
    
    // Bonus for having recipient
    if (metadata.recipient && metadata.recipient.trim() !== '') {
      score += 20;
    }
  }
  
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

  // Test endpoint to generate sample data for testing (GET)
  app.get("/api/test-data", async (req, res) => {
    try {
      // Generate sample data in NFT format
      const nftSampleData = {
        recipient: "0x742d35" + Math.random().toString(16).substr(2, 8) + "1234567890abcdef",
        tokenURI: `https://ipfs.io/ipfs/Qm${Math.random().toString(36).substr(2, 44)}`,
        tokenId: Math.floor(Math.random() * 10000).toString()
      };
      
      // Also provide general format sample
      const generalSampleData = {
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
        nftFormatSample: nftSampleData,
        generalFormatSample: generalSampleData,
        instruction: "POST either sample data to /api/submit-data to test the API"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate test data" });
    }
  });

  // Test endpoint to receive NFT data for testing (POST)
  app.post("/api/test-data", async (req, res) => {
    try {
      console.log("Received test NFT data:", JSON.stringify(req.body, null, 2));
      
      const { recipient, tokenURI, tokenId } = req.body;
      
      // Validate NFT format
      if (!recipient || !tokenURI || !tokenId) {
        return res.status(400).json({ 
          message: "Invalid NFT data format", 
          error: "Missing required fields: recipient, tokenURI, or tokenId",
          received: req.body
        });
      }

      // Process the data (same as submit-data but for testing)
      const metadata = filterMetadata(req.body);
      const username = extractUsername(req.body);
      const score = calculateScore(metadata);

      res.json({ 
        message: "Test NFT data received and processed successfully",
        originalData: req.body,
        processedData: {
          username: username,
          score: score,
          metadata: metadata
        },
        note: "This is a test endpoint. Use POST /api/submit-data to actually save to database."
      });

    } catch (error) {
      console.error("Test data error:", error);
      res.status(500).json({ 
        message: "Failed to process test data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });




















  
  // Main POST API endpoint to accept NFT JSON data and save to database
  app.post("/api/submit-data", async (req, res) => {
    try {
      console.log("Received NFT data:", JSON.stringify(req.body, null, 2));
      
      const { recipient, tokenURI, tokenId } = req.body;
      
      // Validate NFT format - all three fields are required
      if (!recipient || !tokenURI || !tokenId) {
        return res.status(400).json({ 
          message: "Invalid NFT data format", 
          error: "Missing required fields: recipient, tokenURI, and tokenId are all required",
          received: req.body,
          expectedFormat: {
            recipient: "0x...",
            tokenURI: "https://ipfs.io/ipfs/...",
            tokenId: "string"
          }
        });
      }

      // Validate recipient format (should be an Ethereum address)
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        return res.status(400).json({ 
          message: "Invalid recipient format", 
          error: "Recipient must be a valid Ethereum address (0x... with 42 characters)",
          received: recipient
        });
      }

      // Validate tokenURI format (should be a valid URI)```
      if (!tokenURI.startsWith('http')) {
        return res.status(400).json({ 
          message: "Invalid tokenURI format", 
          error: "TokenURI must be a valid HTTP/HTTPS URL",
          received: tokenURI
        });
      }

      // Filter and extract metadata
      const metadata = filterMetadata(req.body);
      
      // Extract username from recipient
      const username = extractUsername(req.body);
      
      // Calculate score based on NFT data
      const score = calculateScore(metadata);

      // Create LeaderTable entry
      const leaderEntry = {
        username: username,
        metadata: JSON.stringify(metadata),
        score: score,
        rank: 0 // Will be calculated later if needed
      };

      console.log("Processed NFT data:");
      console.log("- Recipient:", recipient);
      console.log("- TokenURI:", tokenURI);
      console.log("- TokenId:", tokenId);
      console.log("- Generated username:", username);
      console.log("- Calculated score:", score);

      // Validate the entry before saving
      const validatedEntry = insertLeaderTableSchema.parse(leaderEntry);
      
      // Save to database
      const savedEntry = await storage.createLeaderTableEntry(validatedEntry);
      
      console.log("NFT data saved to LeaderTable with ID:", savedEntry.id);

      res.json({ 
        message: "NFT data processed and saved successfully",
        entryId: savedEntry.id,
        nftData: {
          recipient: recipient,
          tokenURI: tokenURI,
          tokenId: tokenId
        },
        processedData: {
          username: username,
          score: score,
          metadata: metadata
        }
      });

    } catch (error) {
      console.error("Submit NFT data error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        message: "Failed to process and save NFT data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
