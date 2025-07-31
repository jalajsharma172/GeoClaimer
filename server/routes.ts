import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertClaimSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1),
  isAnonymous: z.boolean().default(false),
});

const claimSchema = insertClaimSchema.extend({
  district: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, username, isAnonymous } = loginSchema.parse(req.body);
      
      let user;
      if (email && !isAnonymous) {
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
      res.status(400).json({ message: "Invalid login data" });
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

  const httpServer = createServer(app);
  return httpServer;
}
