const express = require('express');
const Router = express.Router();
const {Register, Login, Logout} = require('../Controllers/authController');

Router.route('/register').post( Register );

Router.route('/login').post( Login );

Router.route('/logout').post( Logout );

module.exports = Router;



