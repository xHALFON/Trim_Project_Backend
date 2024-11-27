import express from 'express';
import {addPost, getAllPosts_senderId, getPostById,updatePost} from '../controllers/postController.js'
import { protect } from '../middleware/middleware.js';
const router = express.Router();

router.post('/', protect, addPost);
router.get('/', protect, getAllPosts_senderId)
router.get('/:id', protect, getPostById)
router.put('/:id', protect, updatePost)
export default router;