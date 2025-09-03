import dotenv from "dotenv";
import fs from "fs";
// Load env file depending on environment
dotenv.config({ path: ".env" });

if (fs.existsSync(".local.env")) {
  dotenv.config({ path: ".local.env", override: true });
}

import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
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

// DB Connection
const mongoUri = process.env.MONGO_URI || "";
connectDB(mongoUri);

export default app;
