import app from "./src/app.js";
import path from "node:path";
import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  // Support both /admin and /admin.html route mapping seamlessly
  app.get("/admin", (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== "production") {
      req.url = "/admin.html";
      next();
    } else {
      res.sendFile(path.join(process.cwd(), "dist", "admin.html"));
    }
  });

  // Mount Vite middleware for asset bundling in local dev, or static asset server in prod
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "ℹ️ Starting Express Server in DEVELOPMENT mode with dynamic Vite middleware..."
    );

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    console.log(
      "🚀 Starting Express Server in Standalone PRODUCTION mode..."
    );

    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🔥 Standalone engine active and listening on: http://localhost:${PORT}`
    );
  });
}

bootstrap().catch((err: unknown) => {
  console.error("🚨 Critical failure during Express boot:", err);
});