const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const stockSchema = new Schema({
  timecreated: {
    type: String,
    required: true,
  },
  invoices: [String],
});

const { statics, methods } = stockSchema;

statics.newStock = async function (timecreated) {
  const stock = new this({ timecreated });
  return await stock.save();
};

statics.findByTimeCreated = async function (timecreated) {
  return await this.findOne({ timecreated });
};

methods.updateInvoices = async function (names) {
  this.invoices = this.invoices.concat(names);
  return await this.save();
};

module.exports = model('Stock', stockSchema);
