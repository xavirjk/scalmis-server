const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const stockSchema = new Schema({
  timecreated: {
    type: Date,
    required: true,
  },
  invoices: [String],
});

const { statics, methods } = stockSchema;

statics.newStock = async function () {
  const timecreated = new Date();
  const stock = new this({ timecreated });
  return await stock.save();
};

statics.findByTimeCreated = async function (timecreated) {
  return await this.findOne({ timecreated });
};

statics.getAll = async function () {
  return await this.find({});
};

methods.updateInvoices = async function (names) {
  this.invoices = this.invoices.concat(names);
  return await this.save();
};

module.exports = model('Stock', stockSchema);
