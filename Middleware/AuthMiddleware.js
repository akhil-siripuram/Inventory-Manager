const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const Users = require('../Models/UserModel');

const Authenticate = async (req, res, next) => {
    try {

        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized access/ no token' });
        }
        const token = req.headers.authorization.split(' ')[1];

        //verify token from cookie

        // if (!req.cookies.accesstoken) {
        //     return res.status(401).json({ message: 'Unauthorized access/ no token' });
        // }
        // const token = req.cookies.accesstoken;
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized access/ user not found' });
        }
        req.user = user;
        
        
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(401).json({ message: 'Unauthorized access/ invalid token' });
    }
    next();
};

module.exports = Authenticate;