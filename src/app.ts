import dotenv from "dotenv";
import { validateEnv } from "./config/validateEnv";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
// Load env file depending on environment
if (process.env.NODE_ENV !== "test") {
  dotenv.config({ path: ".env" });

  if (fs.existsSync(".local.env")) {
    dotenv.config({ path: ".local.env", override: true });
  }
}

// Validate required environment variables
validateEnv();

import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./module";
import swaggerSpec from "./config/swagger";

const app: Application = express();
const CORS_WHITELIST = process.env.CORS_WHITELIST?.split(",") || [];

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? CORS_WHITELIST
        : "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api", routes);

// 404 fallback - no route matched
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

export default app;
