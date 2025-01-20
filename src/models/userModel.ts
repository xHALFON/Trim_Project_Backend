import mongoose, { Document, Schema } from "mongoose"

interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    profileImage: string;
    profileImageTop: string;
    gender: string;
    status: string;
    refreshToken: String;
    googleId: String,
}

const userSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    gender: { type: String, required: true },
    profileImage: { type: String, required: true },
    profileImageTop: { type: String, required: true },
    status: { type: String, required: false },
    googleId: {type: String, required: false},
    refreshToken: String,
});

const Post = mongoose.model<IUser>('User', userSchema);
export default Post;