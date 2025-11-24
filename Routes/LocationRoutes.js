const express = require('express');
const Authenticate = require('../Middleware/AuthMiddleware');
const router = express.Router();
const {
    getLocationsByUser,
    createLocation,
    deleteLocation
} = require('../Controllers/LocationController');

router.route('/user').post(Authenticate,getLocationsByUser);
router.route('/').post(Authenticate,createLocation);
router.route('/').delete(Authenticate,deleteLocation);

module.exports = router;