import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js"

// jwt
const generateToken = (id) => {
    return jwt.sign({ id }, "1234", { expiresIn: '1h' });
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({message: "Invalid email or password"});
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const refreshToken = jwt.sign({ id: user._id, email: user.email }, "1234", { expiresIn: "7d" });
        user.refreshToken = refreshToken;
        await user.save();
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            accessToken: generateToken(user._id),
            refreshToken: refreshToken,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.params;

    const user = await User.findOne({ refreshToken });
    if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(refreshToken, "1234", (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const accessToken = generateToken(user._id);

        res.status(200).json({ accessToken });
    });
};

export const logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required' });
    }

    const user = await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
    }

    res.json({ message: 'User logged out successfully' });
};