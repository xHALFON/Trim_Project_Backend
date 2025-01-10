import Comment from "../models/commentModel";
import Post from "../models/postModel";
import { Request, Response } from 'express';

class CommentController {
    // Create a comment
    createComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content, user, postId } = req.body;
            const post = await Post.findOne({ _id: postId });
            if (!post) {
                res.status(404).json({ error: "Post does not exist!" });
                return;
            }
            const comment = await Comment.create({ content, user, postId });
            res.status(201).json(comment);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get all comments
    getAllComments = async (req: Request, res: Response): Promise<void> => {
        try {
            const comments = await Comment.find();
            res.status(200).json(comments);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get comments for a specific post
    getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { postId } = req.params;
            const comments = await Comment.find({ postId });
            if (comments.length === 0) {
                res.status(404).json({ message: "Comment doesn't exist" });
                return;
            }
            res.status(200).json(comments);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get comments by a specific user
    getCommentsByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { user } = req.params;
            const comments = await Comment.find({ user });
            res.status(200).json(comments);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get a specific comment by ID
    getCommentByID = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const comment = await Comment.findById(id);
            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }
            res.status(200).json(comment);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Update a comment
    updateComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
            if (!updatedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }
            res.status(200).json(updatedComment);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Delete a comment
    deleteComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const deletedComment = await Comment.findByIdAndDelete(id);
            if (!deletedComment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }
            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Delete all comments
    deleteAllComments = async (req: Request, res: Response): Promise<void> => {
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
}

export default new CommentController();