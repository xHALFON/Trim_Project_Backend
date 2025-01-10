import Post from '../models/postModel';
import { Request, Response } from 'express';

class PostController {
    addPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = new Post(req.body);  // טיפוס של req.body כבר מתאמה למודל IPost
            await post.save();
            res.status(201).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    getAllPosts_senderId = async (req: Request, res: Response): Promise<void> => {
        try {
            const senderId: string = req.query.sender as string;
            if (senderId) {
                const posts = await Post.find({ sender: senderId });
                if (!posts || posts.length === 0) {
                    res.status(404).json({ error: 'No posts found for this sender' });
                    return;
                }
                res.json(posts);
                return;
            }
            const allPosts = await Post.find();
            res.status(200).json(allPosts);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    getPostById = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await Post.find({ _id: req.params.id });
            if (post.length === 0) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            res.json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    updatePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
            res.status(200).json(post);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

export default new PostController();