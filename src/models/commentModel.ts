import mongoose, { Document, Schema } from "mongoose";

interface IComment extends Document {
    content: string;
    sender: string;
    postId: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
}

const commentSchema = new Schema<IComment>({
    content: { type: String, required: true },
    sender: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model<IComment>('Comment', commentSchema);
export default Comment;