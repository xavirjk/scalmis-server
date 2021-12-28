const express = require('express');
const admin = require('./admin');
const user = require('./user');

const { authClient, authAdmin } = require('../authMiddlewares');

const adminRouter = express.Router();
const userRouter = express.Router();

exports.admin = adminRouter.use(authAdmin, admin);
exports.user = userRouter.use(authClient, user);
