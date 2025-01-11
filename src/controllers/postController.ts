import Post from '../models/postModel';
import User from '../models/userModel';
import { Request, Response } from 'express';

interface RetrievePost{
    title: string;
    content: string;
    sender: string;
    image: string;
    senderImg: string;
    senderName: string;
}
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
                const senderDetails = await User.findOne({ _id: senderId });
                
                const postResult = await Promise.all(
                    posts.map(async (post) => {
                        const retPost: RetrievePost = {
                            sender: post.sender,
                            content: post.content,
                            title: post.title,
                            image: post.image,
                            senderImg: senderDetails?.profileImage || "",
                            senderName: senderDetails?.username || "",
                        };
                        return retPost;
                    })
                );
    
                res.json(postResult);
                return;
            } else {
                const posts = await Post.find();
    
                const postResult = await Promise.all(
                    posts.map(async (post) => {
                        const senderDetails = await User.findOne({ _id: post.sender });
                        const retPost: RetrievePost = {
                            sender: post.sender,
                            content: post.content,
                            title: post.title,
                            image: post.image,
                            senderImg: senderDetails?.profileImage || "",
                            senderName: senderDetails?.username || "",
                        };
                        return retPost;
                    })
                );
    
                res.json(postResult);
            }
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