import express from "express";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { communityRoutes } from "./routes/community";
import { createServer } from "http";
import { spawn } from "child_process";

const app = express();
app.use(express.json());

(async () => {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.use("/api/community", communityRoutes);

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    const viteProcess = spawn("npx", ["vite", "--host", "0.0.0.0", "--port", "5173"], {
      stdio: "inherit",
    });

    viteProcess.on("error", (err) => {
      console.error("Failed to start Vite:", err);
    });

    const { createProxyMiddleware } = await import("http-proxy-middleware");
    app.use(
      createProxyMiddleware({
        target: "http://localhost:5173",
        changeOrigin: true,
        ws: true,
      })
    );
  } else {
    const path = await import("path");
    app.use(express.static(path.resolve("dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve("dist", "index.html"));
    });
  }

  const server = createServer(app);
  server.listen(5000, "0.0.0.0", () => {
    console.log(`Server running on port 5000`);
  });
})();
