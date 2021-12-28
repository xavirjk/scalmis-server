const mongoose = require('mongoose');
const { Schema } = mongoose;

const Base = require('./items');
const Service = Base.discriminator('service', new Schema({}));
module.exports = Service;
