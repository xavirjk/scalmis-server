const mongoose = require('mongoose');
const { Schema } = mongoose;
const Base = require('./auth');
const Admin = Base.discriminator('Admin', new Schema({}));
module.exports = Admin;
