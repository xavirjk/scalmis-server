const mongoose = require('mongoose');
const { Schema } = mongoose;

const Base = require('./items');
const Item = Base.discriminator('item', new Schema({}));
module.exports = Item;
