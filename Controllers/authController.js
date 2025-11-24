const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const Users = require('../Models/UserModel');


const Register = async (req, res,next) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await Users.create({name: username,email,password: hashedPassword});
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        next(error);
    }    
}

const Login = async (req, res,next) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
}

const Logout = async (req, res, next) => {
   console.log("Logout user:");
    try {
        
        const decoded = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET);
        const UserId = decoded.id;
        const user = await Users.findByIdAndUpdate(UserId, { refreshToken: '' }, { new: true });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.cookie('refreshToken', '', {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 0 // Expire the cookie immediately
        });
        res.status(200).json({ message: 'Logout successful' });

    } catch (error) {
        next(error);
    }
}

const Refresh = async(req, res, next) => {
    console.log("Refresh token called");
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await Users.findById(decoded.id);
        console.log("1",user);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({ token: newToken });
    } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
}

module.exports = {
    Register,
    Login,
    Logout,
    Refresh
};