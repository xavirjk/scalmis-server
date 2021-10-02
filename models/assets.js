const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const { ObjectId } = Types;

const assetSchema = new Schema({
  stockId: {
    type: ObjectId,
    ref: 'Stock',
  },
  itemId: {
    type: ObjectId,
    required: true,
    ref: 'Item',
  },
  description: {
    type: String,
    required: false,
  },
  amountAdded: {
    type: Number,
    required: true,
  },
  assetValue: {
    type: Number,
    required: false,
  },
});

const { statics, methods } = assetSchema;

statics.createAsset = async function (details) {
  const asset = new this(details);
  return await asset.save();
};

module.exports = model('Assets', assetSchema);
