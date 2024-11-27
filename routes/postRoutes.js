import express from 'express';
import {addPost, getAllPosts_senderId, getPostById,updatePost} from '../controllers/postController.js'

const router = express.Router();

router.post('/', addPost);
router.get('/', getAllPosts_senderId)
router.get('/:id', getPostById)
router.put('/:id', updatePost)
export default router;