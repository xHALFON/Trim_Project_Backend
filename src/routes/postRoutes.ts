import express, { Router } from 'express';
import PostController from '../controllers/postController'
import { protect } from '../middleware/middleware';

const router: Router = express.Router();

router.post('/', protect, PostController.addPost);
router.post('/handleLikes', protect, PostController.handleLike);
router.post('/generateText', protect, PostController.generateText);
router.get('/', protect, PostController.getAllPosts_senderId);
router.get('/:id', protect, PostController.getPostById);
router.put('/:id', protect, PostController.updatePost);
router.delete('/:id', protect, PostController.deletePost);


/**
 * @swagger
 * /post/generateText:
 *   post:
 *     summary: generateText content
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The ID of the post
 *     responses:
 *       200:
 *         description: generated text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generatedText:
 *                   type: string
 *                   description: Confirmation message
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /post/handleLikes:
 *   post:
 *     summary: Handle likes for a post (add/remove user like)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postId
 *               - userId
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *     responses:
 *       200:
 *         description: Like status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *                 numLikes:
 *                   type: number
 *                   description: The total number of likes on the post
 *                 Likes:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: IDs of users who liked the post
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
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
 *         - image
 *       properties:
 *         sender:
 *           type: string
 *           description: The ID of the user who created the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         image:
 *           type: string
 *           description: the Image of the post
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