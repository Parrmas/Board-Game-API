import { Router } from "express";
import * as AuthController from "./auth.controller";
import { authenticateToken } from "../../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /auth/get-token:
 *   post:
 *     summary: Get JWT token from a hardcoded user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successful getting token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/AlreadyLoggedInError'
 */
router.post("/get-token", AuthController.login);

/**
 * @swagger
 * /auth/invalidate-token:
 *   post:
 *     summary: Example for JWT token invalidation
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful invalidation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token invalidated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post("/invalidate-token", authenticateToken, AuthController.logout);

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get user details
 *     tags: [Authentication]
 *     description: Returns user details if not logged in, otherwise returns error
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: User is already logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/AlreadyLoggedInError'
 */
router.get("/user", AuthController.getUser);

/**
 * @swagger
 * /auth/profile-games:
 *   get:
 *     summary: Get user's saved games
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     description: Returns saved games if user is logged in
 *     responses:
 *       200:
 *         description: List of saved games
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileGamesResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/profile-games", authenticateToken, AuthController.getProfileGames);

export default router;
