import mongoose, { Document, Schema } from "mongoose"

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profileImage: string;
    gender: string;
    refreshToken: String;
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    profileImage: { type: String, required: true },
    refreshToken: String,
});

const Post = mongoose.model<IUser>('User', userSchema);
export default Post;