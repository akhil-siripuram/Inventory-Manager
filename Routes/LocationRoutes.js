const express = require('express');
const router = express.Router();
const {
    getLocationsByUser,
    createLocation,
    deleteLocation
} = require('../Controllers/LocationController');

router.route('/user').post(getLocationsByUser);
router.route('/').post(createLocation);
router.route('/').delete(deleteLocation);

module.exports = router;