import express from "express";
import * as StatsController from "./stats.controller";
import { FETCH_MAX_LIMIT, FETCH_MIN_LIMIT } from "../game/game.type";
import { validateLimit } from "../../middleware/validate.middleware";

const router = express.Router();
const gameLimitValidation = validateLimit(FETCH_MIN_LIMIT, FETCH_MAX_LIMIT);

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

/**
 * @swagger
 * /stats/top-rated:
 *   get:
 *     summary: Get top rated games
 *     tags: [Statistics]
 *     description: Returns the highest rated games
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of games to return
 *     responses:
 *       200:
 *         description: Top rated games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Internal server error
 */
router.get("/top-rated", gameLimitValidation, StatsController.getTopRatedGames);

/**
 * @swagger
 * /stats/most-complex:
 *   get:
 *     summary: Get most complex games
 *     tags: [Statistics]
 *     description: Returns games with the highest complexity weight
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minumum: 1
 *           maximum: 50
 *         description: Number of games to return
 *     responses:
 *       200:
 *         description: Most complex games retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/most-complex",
  gameLimitValidation,
  StatsController.getMostComplexGames,
);

/**
 * @swagger
 * /stats/best-for-players/{number}:
 *   get:
 *     summary: Get best games for a specific number of players
 *     tags: [Statistics]
 *     description: Returns the highest rated games that support a specific number of players
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *         description: Number of players
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of games to return
 *     responses:
 *       200:
 *         description: Best games for players retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 *       500:
 *         description: Internal server error
 */
router.get(
  "/best-for-players/:number",
  gameLimitValidation,
  StatsController.getBestGamesForPlayers,
);

export default router;
