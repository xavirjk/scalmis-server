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
  progressCount: Number,
});

const { statics, methods } = assetSchema;

statics.createAsset = async function (details) {
  const asset = new this(details);
  asset.progressCount = asset.amountAdded;
  return await asset.save();
};

statics.findByReferences = async function (info) {
  const asset = await this.findOne(info);
  return asset;
};
statics.findAllByRef = async function (ref) {
  const assets = await this.find(ref)
    .populate('stockId')
    .populate('itemId')
    .exec();
  return assets;
};
methods.editNumerals = async function (details) {
  const { amountAdded, assetValue } = details;
  this.amountAdded += amountAdded;
  this.assetValue += assetValue;
  this.progressCount += amountAdded;
  return await this.save();
};

methods.editProgressCount = async function (val) {
  this.progressCount -= val;
  return await this.save();
};

module.exports = model('Assets', assetSchema);
