import express from "express";
import AuthController from "../controllers/AuthController"
import { protect } from "../middleware/middleware";
import passport from 'passport';

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
 *         - gender
 *         - profileImage
 *         - profileImageTop
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
 *         gender:
 *           type: string
 *           description: The gender of the user account
 *         profileImage:
 *           type: string
 *           description: The image of the user account
 *         profileImageTop:
 *           type: string
 *           description: The image top of the user account
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
router.post('/register', AuthController.register);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',passport.authenticate('google', { session: false }), AuthController.googleRegister);

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
router.post('/login', AuthController.login);

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
router.post('/logout', AuthController.logout);

/**
 * @swagger
 * /auth/update/{id}:
 *   put:
 *     summary: Update user profile
 *     description: Updates the user information like username, email, password, gender, profile image, and profile image top.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: "john_doe"
 *               gender:
 *                 type: string
 *                 description: The gender of the user.
 *                 example: "male"
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User updated successfully'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Bad request'
 */
router.put('/update/:id', AuthController.updateUser);

/**
 * @swagger
 * /auth/delete/{id}:
 *   delete:
 *     summary: delete user profile
 *     description: delete the user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'User updated successfully'
 *       400:
 *         description: Invalid request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Bad request'
 */
router.delete('/delete/:id', AuthController.deleteUser);

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh the access token for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the user
 *               accessToken:
 *                 type: string
 *                 description: The current access token
 *           example:
 *             id: "string"
 *             accessToken: "string"
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *               example:
 *                 accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       403:
 *         description: Invalid user ID or refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example:
 *                 error: "Invalid user id in refresh token"
 */
router.post('/refreshToken', AuthController.refreshToken);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: User ID
 *                   username:
 *                     type: string
 *                     description: Username
 *                   email:
 *                     type: string
 *                     description: User's email
 *                   profileImage:
 *                     type: string
 *                     description: Profile image URL
 *       404:
 *         description: No users found
 *       500:
 *         description: Server error
 */
router.get('/users', protect,AuthController.getUsers);


/**
 * @swagger
 * /auth/{id}:
 *   get:
 *     summary: get user by id
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: The id of user
 *     responses:
 *       200:
 *         description: Get user by id
 *       401:
 *         description: Invalid id
 */
router.get('/:id', protect,AuthController.getUserById);

/**
 * @swagger
 * /auth/getUserByName/{username}:
 *   get:
 *     summary: Get user by name
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 username:
 *                   type: string
 *                   description: User's username
 *                 email:
 *                   type: string
 *                   description: User's email
 *                 profileImage:
 *                   type: string
 *                   description: User's profile image
 *                 profileImageTop:
 *                   type: string
 *                   description: User's profile image top position
 *                 gender:
 *                   type: string
 *                   description: User's gender
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/getUserByName/:username', protect,AuthController.getUserByName);

/**
 * @swagger
 * /auth/payload/{token}:
 *   post:
 *     summary: payload a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         description: The token of user
 *     responses:
 *       200:
 *         description: User verified
 *       401:
 *         description: Invalid token
 */
router.post('/payload/:token', AuthController.payload);


/**
 * @swagger
 * /auth/updateProfileImage:
 *   post:
 *     summary: Update a profile image for a user
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
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: 1234567890abcdef
 *               filename:
 *                 type: string
 *                 description: The name of the image file
 *                 example: profile-picture.jpg
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile image updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/UserRegistration'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post('/updateProfileImage', protect, AuthController.updateProfileImage);

export default router;