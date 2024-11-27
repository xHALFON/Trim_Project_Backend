import express from "express";
import {
    createComment,
    getAllComments,
    getCommentsByPost,
    getCommentsByUser
} from "../controllers/commentController.js";

const router = express.Router();

// Create a comment
router.post("/", createComment);

// Get all comments
router.get("/", getAllComments);

// Get comments for a specific post by id
router.get("/:postId", getCommentsByPost);

// Get comments for a specific user by user name
router.get("/user/:user", getCommentsByUser);


export default router;
