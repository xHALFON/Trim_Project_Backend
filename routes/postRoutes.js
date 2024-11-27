import express from 'express';
import {addPost, getAllPosts_senderId, getPostById,updatePost} from '../controllers/postController.js'
import { protect } from '../middleware/middleware.js';
const router = express.Router();

router.post('/', protect, addPost);
router.get('/', protect, getAllPosts_senderId)
router.get('/:id', protect, getPostById)
router.put('/:id', protect, updatePost)

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - senderId
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the post
 *         senderId:
 *           type: string
 *           description: The ID of the user who created the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last time the post was updated
 */

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API for managing posts
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts or filter posts by sender ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         required: false
 *         schema:
 *           type: string
 *         description: The ID of the sender to filter posts by.
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       201:
 *         description: Successfully fetched posts
 *       404:
 *         description: No posts found for this sender
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: Details of the post
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */

export default router;