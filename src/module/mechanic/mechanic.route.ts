import Router from "express";
import * as MechanicController from "./mechanic.controller";
import { FETCH_MAX_LIMIT, FETCH_MIN_LIMIT } from "./mechanic.type";
import { validateLimit } from "../../middleware/validate.middleware";

const router = Router();
const limitValidation = validateLimit(FETCH_MIN_LIMIT, FETCH_MAX_LIMIT);

/**
 * @swagger
 * /mechanics/list:
 *   get:
 *     summary: Get all mechanics with optional limit
 *     tags: [Mechanics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of mechanics to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of mechanics with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mechanic'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/list", limitValidation, MechanicController.list);

/**
 * @swagger
 * /mechanics/get/{bgg_id}:
 *   get:
 *     summary: Get mechanics using bgg_ids
 *     tags: [Mechanics]
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
 *         description: List of mechanics based on inserted bgg_ids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mechanic'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get("/get/:bgg_id", MechanicController.get);
export default router;
