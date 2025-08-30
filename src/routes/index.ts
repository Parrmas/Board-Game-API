import { Router, Request, Response } from "express";
import gameRoutes from "./game.route";
import categoryRoutes from "./category.route";
import mechanicRoutes from "./mechanic.route";
import designerRoutes from "./designer.route";

const router = Router();

// Mount feature routes
router.use("/games", gameRoutes);
router.use("/categories", categoryRoutes);
router.use("/designers", designerRoutes);
router.use("/mechanics", mechanicRoutes);

export default router;
