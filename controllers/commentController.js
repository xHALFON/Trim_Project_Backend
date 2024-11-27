import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";

// Create a comment
export const createComment = async (req, res) => {
    try {
        const { content, user, postId } = req.body;
        const post = await Post.findOne({_id: postId});
        if(!post){
            return res.status(404).json({error: "Post does not exists!"});
        }
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

// Get comments for a specific commentID
export const getCommentByID = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await Comment.findById(id);
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Update a comment
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
        if (!updatedComment) return res.status(404).json({ message: "Comment not found" });
        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) return res.status(404).json({ message: "Comment not found" });
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete all comments
export const deleteAllComments = async (req, res) => {
    try {
        const result = await Comment.deleteMany({});
        res.status(200).json({
            message: "All comments deleted successfully",
            deletedCount: result.deletedCount, 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


