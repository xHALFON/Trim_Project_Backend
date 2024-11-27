import Comment from "../models/commentModel.js";

// Create a comment
export const createComment = async (req, res) => {
    try {
        const { content, user, postId } = req.body;
        const comment = await Comment.create({ content, user, postId });
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all comments
export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find();
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get comments for a specific post
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get comments by a specific user
export const getCommentsByUser = async (req, res) => {
    try {
        const { user } = req.params; 
        const comments = await Comment.find({ user }); 
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

