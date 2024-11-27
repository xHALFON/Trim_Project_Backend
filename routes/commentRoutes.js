import express from "express";
import {
    createComment,
    getAllComments
} from "../controllers/commentController.js";

const router = express.Router();

// Create a comment
router.post("/", createComment);

// Get all comments
router.get("/", getAllComments);



export default router;
