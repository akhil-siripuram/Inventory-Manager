const express = require('express');
const Router = express.Router();
const {Register, Login, Logout, Refresh} = require('../Controllers/authController');

Router.route('/register').post( Register );

Router.route('/login').post( Login );

Router.route('/logout').post( Logout );

Router.route('/refresh').post( Refresh );

module.exports = Router;



