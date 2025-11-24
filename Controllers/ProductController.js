const Products = require('../Models/ProductModel');
const Locations = require('../Models/LocationModel');
const Users = require('../Models/UserModel');

const createProduct = async (req, res, next) => {
    const { name, category, locationId } = req.body;
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const location = await Locations.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        if (!location.user.equals(userId)) {
            return res.status(403).json({ message: 'Location does not belong to the user' });
        }
        const newProduct = new Products({ name, category, location: locationId });
        await newProduct.save();
        res.status(201).json({ message: 'createProduct: connection OK', product: newProduct });
    } catch (error) {
        next(error);
    }
};

const getProductsByLocation = async (req, res, next) => {
    const { locationId } = req.body;
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const location = await Locations.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        if (!location.user.equals(userId)) {
            return res.status(403).json({ message: 'Location does not belong to the user' });
        }
        const products = await Products.find({ location: locationId });
        res.status(200).json({ message: 'getProductsByLocation: connection OK', products });
    } catch (error) {
        next(error);
    }
};

const getProductsByUser = async (req, res, next) => {
    const userId = req.user._id;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const locations = await Locations.find({ user: userId });
        const locationIds = locations.map(loc => loc._id);
        const products = await Products.find({ location: { $in: locationIds } });
        res.status(200).json({ message: 'getProductsByUser: connection OK', products });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    const productId = req.params.id;
    try {
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await Products.findByIdAndDelete(productId);
        res.status(200).json({ message: 'deleteProduct: connection OK', productId });
    } catch (error) {
        next(error);
    }
};

module.exports = { createProduct, getProductsByLocation, getProductsByUser, deleteProduct };