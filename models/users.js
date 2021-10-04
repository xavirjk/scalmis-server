const mongoose = require('mongoose');
const { Schema } = mongoose;

const Base = require('./auth');
const User = Base.discriminator('User', new Schema({}));
module.exports = User;
