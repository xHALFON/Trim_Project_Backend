import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sender: {
        type: String, // יש לוודא שזה String ולא ObjectId
        required: true,
    },
},{ timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;
