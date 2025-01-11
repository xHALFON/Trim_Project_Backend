import mongoose, { Document, Schema } from "mongoose";

interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>({
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    image:{
      type: String,
      required :true
    },
}, { timestamps: true });


const Post = mongoose.model<IPost>('Post', postSchema);
export default Post;
