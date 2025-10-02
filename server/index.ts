import { type Request, Response, NextFunction } from "express";
import { attachFrontend, createExpressApp } from "./app";
import { log } from "./vite";

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
