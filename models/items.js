const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const baseOptions = {
  discriminatorKeys: 'Item Type',
  collection: '',
};

const itemSchema = new Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 10,
    maxlength: 40,
    uppercase: true,
  },
  item: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 80,
    trim: true,
    lowercase: true,
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

statics.itemExists = async function (entry) {
  const byCode = await this.findOne({ code: entry.code.trim().toUpperCase() });
  const byName = await this.findItem(entry.item.trim().toLowerCase());
  if (!byCode) {
    if (byName) return { failed: true, message: 'invalid item Code ' };
    return null;
  } else {
    if (byCode.item == entry.item.trim().toLowerCase()) return byCode;
    return { failed: true, message: 'code already in use' };
  }
};

methods.updateTotalValue = async function (val) {
  this.totalValue += val;
  return await this.save();
};

methods.deleteItem = async function () {
  return await this.deleteOne();
};
methods.editItem = async function (details) {
  for (const field in details) await this.editField(field, details[field]);
};
methods.editField = async function (field, data) {
  this[field] = data;
  await this.save();
};

module.exports = model('Item', itemSchema);
