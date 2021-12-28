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
    trim: true,
    lowercase: true,
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
  dsassetValue: Number,
  dsamountAdded: Number,
  pricing: Number,
  quantifier: Number,
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
    .populate('itemId', 'item code  -_id')
    .exec();
  return assets;
};

methods.editConstants = async function (details) {
  this.quantifier = details.quantifier;
  this.pricing = details.pricing;
  return await this.save();
};
methods.editVariables = async function (details) {
  var ref = details.amountAdded + this.amountAdded;
  if (details.quantifier !== this.quantifier) {
    let mod = ref % details.quantifier;
    if (mod) {
      details.quantifier = 1;
      details.dsassetValue = Math.round(
        details.assetValue / details.amountAdded
      );
    } else ref = ref / details.quantifier;
  }
  const variables = {
    amountAdded: details.amountAdded,
    assetValue: details.assetValue,
    dsamountAdded: ref,
    dsassetValue: details.dsassetValue,
  };
  for (const field in variables) {
    await this.editField(field, variables[field]);
  }
  await this.editProgressCount(-details.amountAdded);
};
methods.editProgressCount = async function (val) {
  this.progressCount -= val;
  return await this.save();
};
methods.deleteAsset = async function () {
  return await this.deleteOne();
};

methods.editAsset = async function (stockItem) {
  await this.editVariables(stockItem);
  return await this.editConstants(stockItem);
};
methods.updateProduct = async function (product) {
  for (const field in product) await this.updateField(field, product[field]);
};
methods.editField = async function (field, data) {
  if (field == 'dsassetValue')
    this[field] = Math.round((this.dsassetValue + data) / 2);
  else if (field == 'dsamountAdded') this[field] = data;
  else this[field] += data;
  return await this.save();
};

methods.updateField = async function (field, data) {
  this[field] = data;
  return await this.save();
};
module.exports = model('Assets', assetSchema);
