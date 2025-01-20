import mongoose from 'mongoose';
import Post from '../models/postModel';
import User from '../models/userModel';
import { Request, Response } from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import  * as dotenv from 'dotenv'

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

interface RetrievePost{
    id: any,
    title: string;
    content: string;
    sender: string;
    numLikes: number;
    Likes: mongoose.Types.ObjectId[];
    image: string;
    senderImg: string;
    senderName: string;
}
class PostController {
    addPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = new Post(req.body);  // טיפוס של req.body כבר מתאמה למודל IPost
            const user = await User.findOne({_id: post.sender})
            await post.save();
            const result: RetrievePost =  {
                id: post._id,
                title: post.title,
                content: post.content,
                sender: post.sender,
                numLikes: post.numLikes,
                Likes: post.Likes,
                image: post.image,
                senderImg: user.profileImage,
                senderName: user.username,
            }
            res.status(201).json(result);
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
                            id: post._id,
                            sender: post.sender,
                            content: post.content,
                            title: post.title,
                            numLikes: post.numLikes,
                            Likes: post.Likes,
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
                            id: post._id,
                            sender: post.sender,
                            content: post.content,
                            title: post.title,
                            numLikes: post.numLikes,
                            Likes: post.Likes,
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
            const post = await Post.findOne({ _id: req.params.id });
            if (!post) {
                res.status(404).json({ error: 'Post not found' });
                return;
            }
            const user = await User.findOne({ _id: post.sender });
            const result: RetrievePost =  {
                id: post._id,
                title: post.title,
                content: post.content,
                sender: post.sender,
                numLikes: post.numLikes,
                Likes: post.Likes,
                image: post.image,
                senderImg: user.profileImage,
                senderName: user.username,
            }
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    updatePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.body.sender;
            const user = await User.findOne({ _id: id });
            if(!user){
                res.status(400).json({error: "No user found"})
                return;
            }
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
    
    deletePost = async (req: Request, res: Response): Promise<void> => {
        try {
            const postId = req.params.id;
            const post = await Post.findOneAndDelete({ _id: postId });
    
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }
    
            res.status(200).json({ message: "Post deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    handleLike = async (req: Request, res: Response): Promise<void> => {
        const { postId, userId } = req.body;
      
        try {
          const post = await Post.findById(postId);
          if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
          }
      
          const alreadyLiked = post.Likes.includes(userId);
      
          const updatedPost = await Post.findOneAndUpdate(
            { _id: postId },
            alreadyLiked
              ? {
                  $pull: { Likes: userId },
                }
              : {
                  $addToSet: { Likes: userId },
                },
            { new: true }
          );
      
          updatedPost.numLikes = updatedPost.Likes.length;
      
          await updatedPost.save();
      
          res.status(200).json({
            Likes: updatedPost.Likes,
            numLikes: updatedPost.numLikes,
          });
          return;
        } catch (error) {
          console.error("Error in handleLike:", error);
          res.status(500).json({ message: "Internal server error" });
          return;
        }
      };

    generateText = async (req: Request, res: Response): Promise<void> => {
        const { prompt } = req.body;

        if (!prompt) {
          res.status(400).json({ error: 'Prompt is required' });
          return;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        try {
            const result = await model.generateContent(prompt)
            const response = await result.response;
            let generatedText = response.text() || 'No text generated.';
          
          res.status(200).json({ generatedText });
        } catch (error) {
          console.error('Error generating text:', error);
          res.status(500).json({ error: 'Failed to generate text' });
        }
    };
};

export default new PostController();