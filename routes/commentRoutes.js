import express from "express";
import {
    createComment,
    getAllComments,
    getCommentsByPost,
    getCommentsByUser,
    getCommentByID,
    updateComment,
    deleteComment,
    deleteAllComments
} from "../controllers/commentController.js";
import { protect } from '../middleware/middleware.js';

const router = express.Router();

// Create a comment
router.post("/",protect, createComment);

// Get all comments
router.get("/",protect, getAllComments);

// Get comments for a specific post by id
router.get("/:postId",protect, getCommentsByPost);

// Get comments for a specific user by user name
router.get("/user/:user",protect, getCommentsByUser);

//Get comments for a specific comment id
router.get("/getComment/:id",protect, getCommentByID)

// Update a comment
router.put("/:id",protect, updateComment);

// Delete a comment
router.delete("/:id",protect, deleteComment);

// Delete all comments
router.delete("/",protect, deleteAllComments)

export default router;
