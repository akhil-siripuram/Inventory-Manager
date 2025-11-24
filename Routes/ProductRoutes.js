const express = require('express');
const Authenticate = require('../Middleware/AuthMiddleware');
const router = express.Router();
const {
    createProduct,
    getProductsByLocation,
    getProductsByUser,
    deleteProduct
} = require('../Controllers/ProductController');

router.route('/').post(Authenticate,createProduct);
router.route('/by-location').post(Authenticate,getProductsByLocation);
router.route('/by-user').post(Authenticate,getProductsByUser);
router.route('/:id').delete(Authenticate,deleteProduct); // Plac

module.exports = router;