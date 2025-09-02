import express from "express";
import * as StatsController from "../controllers/stats.controller";

const router = express.Router();

/**
 * @swagger
 * /stats/overall:
 *   get:
 *     summary: Get comprehensive overview statistics for the games collection
 *     tags: [Statistics]
 *     description: Returns summary totals, player count distribution, playtime distribution, and games published per year.
 *     responses:
 *       200:
 *         description: Overall statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalGames:
 *                       type: integer
 *                       example: 25000
 *                     totalDesigners:
 *                       type: integer
 *                       example: 8500
 *                     totalPublishers:
 *                       type: integer
 *                       example: 4200
 *                     totalCategories:
 *                       type: integer
 *                       example: 120
 *                     totalMechanics:
 *                       type: integer
 *                       example: 180
 *                     averageRating:
 *                       type: number
 *                       format: float
 *                       example: 6.8
 *                     averageComplexity:
 *                       type: number
 *                       format: float
 *                       example: 2.3
 *                     yearRange:
 *                       type: object
 *                       properties:
 *                         min:
 *                           type: integer
 *                           example: 1950
 *                         max:
 *                           type: integer
 *                           example: 2023
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       playerCount:
 *                         type: integer
 *                         example: 4
 *                       gameCount:
 *                         type: integer
 *                         example: 4500
 *                 playtime:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       range:
 *                         type: string
 *                         example: "1-2 hrs"
 *                       gameCount:
 *                         type: integer
 *                         example: 8000
 *                 byYear:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 2020
 *                       gameCount:
 *                         type: integer
 *                         example: 1200
 *       500:
 *         description: Internal server error
 */
router.get("/overall", StatsController.getOverallStats);

export default router;
