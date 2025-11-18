const mongoose = require('mongoose');
const Locations = require('./LocationModel');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Locations',
        required: [true, 'Location reference is required']
    },
}, { timestamps: true });

module.exports = mongoose.model('Products', ProductSchema);