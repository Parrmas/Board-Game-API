import { Router, Request, Response } from "express";
import gameRoutes from "./game.route";
import categoryRoutes from "./category.route";

const router = Router();

// Mount feature routes
router.use("/games", gameRoutes);
router.use("/categories", categoryRoutes);

export default router;
