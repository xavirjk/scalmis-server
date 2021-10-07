const express = require('express');
const admin = require('./admin');
const user = require('./user');

const { authClient, authAdmin } = require('../authMiddlewares');

const sysRouter = express.Router();
//const userRouter = express.Router();

exports.admin = sysRouter.use(authAdmin, admin);
exports.user = sysRouter.use(authClient, user);
