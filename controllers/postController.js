import Post from '../models/postModel.js';


export const addPost = async (req,res) => {
    try{
        const post = new Post(req.body);
        await post.save();
        return res.status(201).json(post)
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
};

export const getAllPosts_senderId = async (req,res) => {
    try{
        const senderId = req.query.sender;
        if(senderId){
            const posts = await Post.find({ sender: senderId });
            if (!posts || posts.length === 0) {
                return res.status(404).json({ error: 'No posts found for this sender' });
            }
            return res.json(posts);
        }
        const allPosts = await Post.find();
        return res.status(201).json(allPosts)
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
};

export const getPostById = async (req,res) => {
    try{
        const post = await Post.find({_id: req.params.id});
        if (post.length == 0){ 
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
};

export const updatePost = async (req,res) => {
    try{
        const post = await Post.findOneAndUpdate({_id: req.params.id}, req.body, {new: true});
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        return res.status(200).json(post)
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
};