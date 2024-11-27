import express from "express";
import {
    createComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Create a comment
router.post("/", createComment);



export default router;
