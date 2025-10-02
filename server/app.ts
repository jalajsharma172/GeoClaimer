import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase } from "./dbInit";
import { createServer, type Server } from "http";

export async function createExpressApp(): Promise<{ app: express.Express; server: Server }> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    } as any;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          try {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          } catch {}
        }
        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }
        console.log(logLine);
        log(logLine);
      }
    });

    next();
  });

  await initializeDatabase();
  const httpServer = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return { app, server: httpServer };
}

export async function attachFrontend(app: express.Express, server: Server) {
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
}


