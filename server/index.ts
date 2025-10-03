import { type Request, Response, NextFunction } from "express";
import { attachFrontend, createExpressApp } from "./app";
import { log } from "./vite";

<<<<<<< HEAD
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// User Auth Checking ki First Time hai toh DB me add kro varna access do.
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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
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

// Initialize database tables first
=======
>>>>>>> 19e52aa7ffe4b48b2865e00fc0378e2f8d1b1c20
(async () => {
  try {
    const { app, server } = await createExpressApp();

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    await attachFrontend(app, server);

    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();


