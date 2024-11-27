import Post from '../models/postModel.js';


export const addPost = async (req,res) => {
    try{
        const post = new Post(req.body);
        await post.save();
        return res.status(201).json(post)
    }catch(err){
        throw res.status(500).json({ error: err.message });
    }
};