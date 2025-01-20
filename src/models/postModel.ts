import mongoose, { Document, Schema } from "mongoose";

interface IPost extends Document {
    title: string;
    content: string;
    sender: string;
    numLikes: number;
    Likes: mongoose.Types.ObjectId[];
    image: string;
    createdAt: Date;
    updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
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
    Likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    numLikes: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost>("Post", postSchema);
export default Post;
