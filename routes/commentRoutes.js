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

const router = express.Router();

// Create a comment
router.post("/", createComment);

// Get all comments
router.get("/", getAllComments);

// Get comments for a specific post by id
router.get("/:postId", getCommentsByPost);

// Get comments for a specific user by user name
router.get("/user/:user", getCommentsByUser);

//Get comments for a specific comment id
router.get("/getComment/:id", getCommentByID)

// Update a comment
router.put("/:id", updateComment);

// Delete a comment
router.delete("/:id", deleteComment);

// Delete all comments
router.delete("/",deleteAllComments)

export default router;
