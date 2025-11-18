const Locations = require('../Models/LocationModel');
const Users = require('../Models/UserModel');
const Products = require('../Models/ProductModel');

const getLocationsByUser = async (req, res,next) => {
    const { userId } = req.body;
    try {
        const locations = await Locations.find({ user: userId });
        res.status(200).json({ message: 'getLocationsByUser: connection OK', locations });
    } catch (error) {
        next(error);
    }
};

const createLocation = async (req, res,next) => {
    const { name, userId } = req.body;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newLocation = new Locations({ name, user: userId });
        await newLocation.save();
        res.status(201).json({ message: 'createLocation: connection OK', location: newLocation });
    } catch (error) {
        next(error);
    }
};

const deleteLocation = async (req, res,next) => {
    const { locationId, userId } = req.body;
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const location = await Locations.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }
        if (location.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized user for this location' });
        }

        // Delete all products associated with this location
        await Products.deleteMany({ location: locationId });

        // Delete the location
        await Locations.findByIdAndDelete(locationId);
        res.status(200).json({ message: 'deleteLocation: connection OK', locationId });
    } catch (error) {
        next(error);
    }
};

module.exports = { getLocationsByUser, createLocation, deleteLocation };