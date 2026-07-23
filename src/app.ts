import dotenv from "dotenv";
import fs from "fs";
import { Request, Response, NextFunction } from "express";
// Load env file depending on environment
dotenv.config({ path: ".env" });

if (fs.existsSync(".local.env")) {
  dotenv.config({ path: ".local.env", override: true });
}

import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./module";
import connectDB from "./config/db";
import swaggerSpec from "./config/swagger";

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// DB Connection
const mongoUri = process.env.MONGO_URI || "";
connectDB(mongoUri);

export default app;
