import Router from "express";
import * as PublisherController from "./publisher.controller";
import { validateSchema } from "../../middleware/validateSchema.middleware";
import { bggIdParamSchema } from "../../utils/crudSchema.factory";
import { publisherListQuerySchema } from "./publisher.schema";

const router = Router();

/**
 * @swagger
 * /publishers/list:
 *   get:
 *     summary: Get all publishers with optional limit
 *     tags: [Publishers]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Maximum number of publishers to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of publishers with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Publisher'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get(
  "/list",
  validateSchema(publisherListQuerySchema, "query"),
  PublisherController.list,
);

/**
 * @swagger
 * /publishers/get/{bgg_id}:
 *   get:
 *     summary: Get publishers using bgg_ids
 *     tags: [Publishers]
 *     parameters:
 *       - in: path
 *         name: bgg_id
 *         required: bgg_id
 *         schema:
 *           type: string
 *           default: 0
 *         description: Can query for multiple records using [bgg_id1], [bgg_id2],...
 *     responses:
 *       200:
 *         description: List of publishers based on inserted bgg_ids
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Publisher'
 *       400:
 *         description: Invalid limit or page parameter
 *       500:
 *         description: Internal server error
 */
router.get(
  "/get/:bgg_id",
  validateSchema(bggIdParamSchema, "params"),
  PublisherController.get,
);
export default router;
