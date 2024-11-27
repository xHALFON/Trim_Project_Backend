import express from 'express';
import {addPost, getAllPosts_senderId, getPostById} from '../controllers/postController.js'

const router = express.Router();

router.post('/', addPost);
router.get('/', getAllPosts_senderId)
router.get('/:id', getPostById)
export default router;