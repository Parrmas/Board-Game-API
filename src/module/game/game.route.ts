import express from "express";
import * as GameController from "./game.controller";
import { FETCH_MAX_LIMIT, FETCH_MIN_LIMIT } from "./game.type";
import { validateLimit } from "../../middleware/validate.middleware";

const router = express.Router();
const limitValidation = validateLimit(FETCH_MIN_LIMIT, FETCH_MAX_LIMIT);

/**
 * @swagger
 * /games/list:
 *   get:
 *     summary: Get list of games with filtering and pagination
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *         description: Number of games to return (maximum = 50)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by game name (case-insensitive partial match)
 *       - in: query
 *         name: min_players
 *         schema:
 *           type: integer
 *         description: Minimum number of players
 *       - in: query
 *         name: max_players
 *         schema:
 *           type: integer
 *         description: Maximum number of players
 *       - in: query
 *         name: min_playtime
 *         schema:
 *           type: integer
 *         description: Minimum playtime in minutes
 *       - in: query
 *         name: max_playtime
 *         schema:
 *           type: integer
 *         description: Maximum playtime in minutes
 *       - in: query
 *         name: min_rating
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum average rating
 *       - in: query
 *         name: max_rating
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum average rating
 *       - in: query
 *         name: min_complexity
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum complexity weight
 *       - in: query
 *         name: max_complexity
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum complexity weight
 *       - in: query
 *         name: categories
 *         schema:
 *           type: string
 *         description: Comma-separated list of category bbg_ids
 *       - in: query
 *         name: mechanics
 *         schema:
 *           type: string
 *         description: Comma-separated list of mechanic bbg_ids
 *       - in: query
 *         name: designers
 *         schema:
 *           type: string
 *         description: Comma-separated list of designer bbg_ids
 *       - in: query
 *         name: publishers
 *         schema:
 *           type: string
 *         description: Comma-separated list of publisher bbg_ids
 *     responses:
 *       200:
 *         description: List of games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get("/list", limitValidation, GameController.list);

/**
 * @swagger
 * /games/get/{bgg_id}:
 *   get:
 *     summary: Get games using bgg_ids
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: bgg_id
 *         required: true
 *         schema:
 *           type: string
 *           default: 0
 *         description: Can query for multiple records using [bgg_id1], [bgg_id2],...
 *     responses:
 *       200:
 *         description: List of games based on inserted bgg_ids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Game'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/get/:bgg_id", GameController.get);

export default router;
