import express, { Router } from "express";
import CommentController from "../controllers/commentController.js";
import { protect } from '../middleware/middleware.js';

const router: Router = express.Router();

// Create a comment
router.post("/",protect, CommentController.createComment);

// Get all comments
router.get("/",protect, CommentController.getAllComments);

// Get comments for a specific post by id
router.get("/:postId",protect, CommentController.getCommentsByPost);

// Get comments for a specific user by user name
router.get("/user/:user",protect, CommentController.getCommentsByUser);

//Get comments for a specific comment id
router.get("/getComment/:id",protect, CommentController.getCommentByID)

// Update a comment
router.put("/:id",protect, CommentController.updateComment);

// Delete a comment
router.delete("/:id",protect, CommentController.deleteComment);

// Delete all comments
router.delete("/",protect, CommentController.deleteAllComments)

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - userId
 *         - postId
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         user:
 *           type: string
 *           description: ID of the user who created the comment
 *         postId:
 *           type: string
 *           description: ID of the post the comment is associated with
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time the comment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last time the comment was updated
 */

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get comments by post ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: List of comments for the given post
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /comments/user/{user}:
 *   get:
 *     summary: Get comments by user name
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user
 *     responses:
 *       200:
 *         description: List of comments by the specified user
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /comments/getComment/{id}:
 *   get:
 *     summary: Get a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Details of the comment
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */

/**
 * @swagger
 * /comments:
 *   delete:
 *     summary: Delete all comments
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All comments deleted successfully
 *       401:
 *         description: Unauthorized
 */

export default router;
