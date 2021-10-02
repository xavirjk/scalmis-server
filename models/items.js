const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const itemSchema = new Schema({
  item: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 80,
  },
  totalValue: {
    type: Number,
    required: true,
  },
});

const { statics, methods } = itemSchema;

statics.createNewItem = async function (data) {
  const details = new this(data);
  return await details.save();
};

statics.findItem = async function (item) {
  return await this.findOne({ item });
};
methods.updateTotalValue = async function (val) {
  this.totalValue += val;
  return await this.save();
};

module.exports = model('Item', itemSchema);
