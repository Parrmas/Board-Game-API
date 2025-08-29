import { Router, Request, Response } from "express";
import userRoutes from "./user.route";
import gameRoutes from "./game.route";

const router = Router();

// Mount feature routes
router.use("/users", userRoutes);
router.use("/games", gameRoutes);

export default router;
