import Comment from "../models/commentModel";
import Post from "../models/postModel";
import User from "../models/userModel";
import { Request, Response } from 'express';

interface RetrieveComment {
    id: any,
    content: string;
    sender: string;
    senderImg: string;
    senderName: string;
}

class CommentController {
    // Create a comment
    createComment = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content, sender, postId } = req.body;
            const post = await Post.findOne({ _id: postId });
            const user = await User.findOne({ _id: sender });
            if (!user) {
                res.status(404).json({ error: "User does not exist!" });
                return;
            }
            if (!post) {
                res.status(404).json({ error: "Post does not exist!" });
                return;
            }
            const comment = await Comment.create({ content, sender, postId });
            const result: RetrieveComment = {
                id: comment._id,
                content: comment.content,
                sender: comment.sender,
                senderImg: user.profileImage,
                senderName: user.username
            }
            res.status(201).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get all comments
    getAllComments = async (req: Request, res: Response): Promise<void> => {
        try {
            const comments = await Comment.find();
            const commentPromises = comments.map(async (comment) => {
                const user = await User.findOne({ _id: comment.sender });
                return {
                    id: comment._id,
                    content: comment.content,
                    sender: comment.sender,
                    senderImg: user?.profileImage || '',
                    senderName: user?.username || 'Unknown Sender'
                };
            });
            const result = await Promise.all(commentPromises);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get comments for a specific post
    getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const { postId } = req.params;
            const comments = await Comment.find({ postId });
            const commentPromises = comments.map(async (comment) => {
                const user = await User.findOne({ _id: comment.sender });
                return {
                    id: comment._id,
                    content: comment.content,
                    sender: comment.sender,
                    senderImg: user?.profileImage || '',
                    senderName: user?.username || 'Unknown Sender'
                };
            });
            const result = await Promise.all(commentPromises);
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    // Get comments by a specific user
    getCommentsByUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { sender } = req.params;
            const comments = await Comment.find({ sender });
            const commentPromises = comments.map(async (comment) => {
                const user = await User.findOne({ _id: comment.sender });
                return {
                    id: comment._id,
                    content: comment.content,
                    sender: comment.sender,
                    senderImg: user?.profileImage || '',
                    senderName: user?.username || 'Unknown Sender'
                };
            });
            const result = await Promise.all(commentPromises);
            res.status(200).json(result);
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
            const user = await User.findOne({ _id: comment.sender });
            const result: RetrieveComment = {
                id: comment._id,
                content: comment.content,
                sender: comment.sender,
                senderImg: user?.profileImage || '',
                senderName: user?.username || 'Unknown Sender'
            }
            res.status(200).json(result);
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
            const user = await User.findOne({ _id: updatedComment.sender });
            const result: RetrieveComment = {
                id: updatedComment._id,
                content: updatedComment.content,
                sender: updatedComment.sender,
                senderImg: user?.profileImage || '',
                senderName: user?.username || 'Unknown Sender'
            }
            res.status(200).json(result);
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
