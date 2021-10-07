const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const { ObjectId } = Types;

const issuedSchema = new Schema({
  member: {
    type: ObjectId,
    ref: 'Auth',
  },
  itemId: {
    type: ObjectId,
    required: true,
    ref: 'Item',
  },
  assetId: {
    type: ObjectId,
    required: true,
    ref: 'Asset',
  },
  refMember: Object,
  issuedAt: Date,
  quantity: Number,
  approved: Boolean,
});

const { statics } = issuedSchema;

statics.saveIssued = async function (issued) {
  issued.issuedAt = new Date();
  const issue = new this(issued);
  return await issue.save();
};
module.exports = model('Issued', issuedSchema);
