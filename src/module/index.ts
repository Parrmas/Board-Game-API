import { Router, Request, Response } from "express";
import gameRoutes from "./game/game.route";
import categoryRoutes from "./category/category.route";
import mechanicRoutes from "./mechanic/mechanic.route";
import designerRoutes from "./designer/designer.route";
import publisherRoutes from "./publisher/publisher.route";
import statsRoutes from "./stats/stats.route";

const router = Router();

// Mount feature routes
router.use("/stats", statsRoutes);
router.use("/games", gameRoutes);
router.use("/categories", categoryRoutes);
router.use("/designers", designerRoutes);
router.use("/mechanics", mechanicRoutes);
router.use("/publishers", publisherRoutes);

export default router;
