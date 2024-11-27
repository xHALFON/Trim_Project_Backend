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


