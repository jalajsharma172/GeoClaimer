import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClaimSchema, insertCompletedCircleSchema, insertUserPathSchema, insertMapViewPreferencesSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
