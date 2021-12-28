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
    ref: 'Assets',
  },
  refMember: Object,
  issuedAt: Date,
  quantity: Number,
  approved: Boolean,
});

const { statics, methods } = issuedSchema;

statics.saveIssued = async function (issued) {
  issued.issuedAt = new Date();
  const issue = new this(issued);
  return await issue.save();
};

statics.findByQuery = async function (query) {
  return await this.find(query)
    .populate('member', 'fullName office -_id')
    .populate('itemId', 'item -_id')
    .populate('assetId', 'description -_id')
    .sort([['_id', -1]])
    .exec();
};
methods.approval = async function (approval) {
  this.approved = approval;
  return await this.save();
};
methods.deleteReq = async function () {
  return await this.deleteOne();
};
module.exports = model('Issued', issuedSchema);
