import type express from "express";
import { setupVite } from "./vite";
import type { Server } from "http";

export async function setupViteDev(app: express.Express, server: Server) {
  // Thin wrapper to keep API parity with app.attachFrontend dev path
  await setupVite(app, server);
}


