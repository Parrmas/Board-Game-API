import Router from "express";
import * as CategoryController from "./category.controller";
import { FETCH_MAX_LIMIT, FETCH_MIN_LIMIT } from "./category.type";
import { validateLimit } from "../../middleware/validate.middleware";

const router = Router();
const limitValidation = validateLimit(FETCH_MIN_LIMIT, FETCH_MAX_LIMIT);

/**
 * @swagger
 * /categories/list:
 *   get:
 *     summary: Get all categories with optional limit
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of categories to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of categories with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/list", limitValidation, CategoryController.list);

/**
 * @swagger
 * /categories/get:
 *   get:
 *     summary: Get categories using bgg_ids
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: bgg_id
 *         schema:
 *           type: string
 *           default: 0
 *         description: Can query for multiple records using [bgg_id1], [bgg_id2],...
 *     responses:
 *       200:
 *         description: List of categories with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/get", CategoryController.get);

/**
 * @swagger
 * /categories/popular:
 *   get:
 *     summary: Get most popular categories based on game count
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of categories to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of popular categories with game counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       bgg_id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       gameCount:
 *                         type: number
 *                         description: Number of games in this category
 *                 total:
 *                   type: number
 *                   description: Total number of categories with games
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/popular", limitValidation, CategoryController.getPopular);

export default router;
