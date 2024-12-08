import express from "express";
import { login, register, logout, refreshToken } from "../controllers/AuthController.js"
const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the new user
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password for the user account
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The user's password
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for user authentication (register and login)
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Create New User
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input data
 */
router.post('/register',register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Logs out the user by invalidating their refresh token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to be invalidated.
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZDE0Yzg0LTU3NjktNGJlYy1iOGY5LTg"
 *     responses:
 *       200:
 *         description: User successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User logged out successfully'
 *       401:
 *         description: No refresh token provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Refresh token is required'
 *       403:
 *         description: Invalid refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid refresh token'
 */
router.post('/logout', logout);


/**
 * @swagger
 * /auth/{refreshToken}:
 *   post:
 *     summary: refreshToken a user
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: refreshToken
 *         schema:
 *           type: string
 *         description: The refreshToken of user
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 */
router.post('/:refreshToken', refreshToken);
export default router;