const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProductsByLocation,
    getProductsByUser,
    deleteProduct
} = require('../Controllers/ProductController');

router.route('/').post(createProduct);
router.route('/by-location').post(getProductsByLocation);
router.route('/by-user').post(getProductsByUser);
router.route('/:id').delete(deleteProduct); // Plac

module.exports = router;