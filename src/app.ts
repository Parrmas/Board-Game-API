import express, { Application } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import connectDB from "./config/db";
import swaggerSpec from "./config/swagger";

// Load env file depending on environment
dotenv.config({
  path: process.env.NODE_ENV === "local" ? ".local.env" : ".env",
});

const app: Application = express();

// Middleware
app.use(express.json());

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api", routes);

// DB Connection
const mongoUri = process.env.MONGO_URI || "";
connectDB(mongoUri);

export default app;
