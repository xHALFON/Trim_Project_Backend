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
            const { username, email, password, gender, profileImage, profileImageTop} = req.body;
            if (!password) {
                res.status(400).json({ message: 'Password must provided' });
                return;
            }
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
            const user = new User({ username, email, password: hashedPassword, gender, profileImage, profileImageTop});
            await user.save();

            res.status(201).json({
                id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profileImage: user.profileImage,
                profileImageTop: user.profileImageTop,
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

            const refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" });
            user.refreshToken = refreshToken;
            await user.save();
            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                gender: user.gender,
                profileImage: user.profileImage,
                profileImageTop: user.profileImageTop,
                accessToken: generateToken(user._id.toString()),
                refreshToken: refreshToken,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // Refresh access token
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
          const { id, accessToken } = req.body;
      
          // בדוק אם ה-token תקין
          jwt.verify(accessToken, process.env.SECRET_KEY, async (err: any) => {
            if (!err) {
              return res.status(201).json({ accessToken });
            }
      
            // אם ה-token אינו תקין
            const user = await User.findOne({ _id: id });
            if (!user) {
              return res.status(403).json({ error: 'Invalid user id in refresh token' });
            }
      
            jwt.verify(user.refreshToken.toString(), process.env.SECRET_KEY, (err: any) => {
              if (err) {
                return res.status(403).json({ error: 'Invalid refresh token' });
              }
      
              const newAccessToken = generateToken(user._id.toString());
              return res.status(200).json({ accessToken: newAccessToken });
            });
          });
        } catch (error) {
          console.error('Error in refreshToken:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
    };
    updateUser = async (req: Request, res: Response): Promise<void> => {
        const { username, gender, status } = req.body;
        const { id } = req.params;
      
        try {

          const user = await User.findById(id);
          if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
          }

          if (username) user.username = username;
          if (gender) user.gender = gender;
          if (status) user.status = status;

          await user.save();
          
          res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Server error' });
        }
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
                profileImageTop: user.profileImageTop,
                gender: user.gender,
                status: user.status,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await User.find({});
    
            if (!users) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    getUserByName = async (req: Request, res: Response): Promise<void> => {
        try {
            const userName: string = req.params.username;
            const user = await User.findOne({username: userName});
    
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
                profileImageTop: user.profileImageTop,
                gender: user.gender,
                status: user.status,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    updateProfileImage = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.body.userId;
            const filePath = req.body.filename;
            const top = req.body.top;
            if(top){
                const user = await User.findByIdAndUpdate(
                    userId,
                    { profileImageTop: filePath },
                    { new: true }
                );
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return;
                }
                res.status(200).json({ message: 'Profile top image updated successfully', userId: user._id, profileImageTop: user.profileImageTop });
                return
            }

            const user = await User.findByIdAndUpdate(
                userId,
                { profileImage: filePath },
                { new: true }
            );

            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            
            res.status(200).json({ message: 'Profile image updated successfully', userId: user._id, profileImage: user.profileImage });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.params.id
            const users = await User.findOneAndDelete({_id: userId});
    
            if (!users) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({message: "User deleted successfully"});
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
    googleRegister = (req: any, res) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication failed.' });
        }
        const token = generateToken((req.user._id).toString())
    
        // החזרת ה-JWT למשתמש
        res.cookie('accessToken', token, { httpOnly: false });
        res.cookie('user_id', (req.user._id).toString(), { httpOnly: false });
        res.redirect('http://localhost:3001/'); // ניתוב מחדש למסך דשבורד או אחר
      }
}

export default new AuthController();
