import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/userModel"
import { Request, Response } from 'express';
import * as dotenv from "dotenv";

dotenv.config()
// jwt
const generateToken = (id): string => {
    return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: '1h' });
};

class AuthController {
    // Register a user
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, email, password, gender, profileImage} = req.body;

            const userExists_email = await User.findOne({ email });
            const userExists_name = await User.findOne({ username });
            if (userExists_email) {
                res.status(400).json({ message: 'Email already exists' });
                return;
            }

            if (userExists_name) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword, gender, profileImage});
            await user.save();

            res.status(201).json({
                id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profileImage: user.profileImage,
                token: generateToken(user._id.toString()),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // Login user
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }
            const matchPassword = await bcrypt.compare(password, user.password);
            if (!matchPassword) {
                res.status(401).json({ message: "Invalid email or password" });
                return;
            }

            const refreshToken = jwt.sign({ id: user._id, email: user.email }, "1234", { expiresIn: "7d" });
            user.refreshToken = refreshToken;
            await user.save();
            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profileImage: user.profileImage,
                accessToken: generateToken(user._id.toString()),
                refreshToken: refreshToken,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // Refresh access token
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        const refreshToken: any = req.params.refreshToken;
        
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.status(403).json({ error: 'Invalid refresh token' });
            return;
        }

        jwt.verify(refreshToken, process.env.SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ error: 'Invalid refresh token' });
                return;
            }
 
            const accessToken = generateToken(user._id.toString());

            res.status(200).json({ accessToken });
        });
    };

    payload = async (req: Request, res: Response): Promise<void> => {
        const Token: any = req.params.token;

        jwt.verify(Token, process.env.SECRET_KEY, (err: any, decoded: any) => {
            if (err) {
                res.status(403).json({ error: 'Invalid refresh token' });
                return;
            }
            
            res.status(200).json({ message: 'Token is valid', data: decoded });
        });
    };

    // Logout user
    logout = async (req: Request, res: Response): Promise<void> => {
        const { refreshToken }: { refreshToken: string } = req.body;

        if (!refreshToken) {
            res.status(401).json({ error: 'Refresh token is required' });
            return;
        }

        const user = await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        if (!user) {
            res.status(403).json({ error: 'Invalid refresh token' });
            return;
        }

        res.json({ message: 'User logged out successfully' });
    };
    
    // get user
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId: string = req.params.id;

            const user = await User.findById(userId);
    
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.json({
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                gender: user.gender,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
}

export default new AuthController();
