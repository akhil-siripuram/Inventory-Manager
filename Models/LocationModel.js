const mongoose = require('mongoose');
const Users = require('./UserModel');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required']   
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'User reference is required']
    },
}, { timestamps: true });

module.exports = mongoose.model('Locations', LocationSchema);