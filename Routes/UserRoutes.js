const express = require('express');
const Authenticate = require('../Middleware/AuthMiddleware');
const router = express.Router();
const {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
    Test
} = require('../Controllers/UserController');


router.route('/').get(Authenticate,getAllUsers).post(createUser);
router.route('/test').post(Test)


router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;