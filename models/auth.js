const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema, model } = mongoose;

const baseOptions = {
  discriminatorKeys: 'Auth User',
  collection: '',
};
const authSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 40,
      trim: true,
    },
    pjno: {
      type: Number,
      required: true,
      trim: true,
      lenght: 5,
      unique: true,
    },
    office: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 11,
      maxlenght: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 80,
    },
  },
  baseOptions
);

const { statics, methods } = authSchema;

statics.createOne = async function (data) {
  const { fullName, pjno, office, email, password } = data;
  const hashed = await hashedPassword(password);
  const member = new this({
    fullName,
    pjno,
    office,
    email,
    password: hashed,
  });
  return await member.save();
};

statics.findByPjno = async function (pjno) {
  return await this.findOne({ pjno });
};

statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};

statics.findOneForCredentials = async function (details) {
  const { pjno, password } = details;
  const member = await this.findByPjno(pjno);
  if (!member) return member;
  const match = await member.checkMatch(password);
  if (match) return member;
  return null;
};

methods.deleteMember = async function () {
  return await this.deleteOne();
};

methods.checkMatch = async function (plainTextPassword) {
  return await bcrypt.compare(plainTextPassword, this.password);
};
methods.ResetCode = async function (details) {
  const pass = { password: await hashedPassword(details.password) };
  await this.editOne(pass);
};
methods.editOne = async function (details) {
  for (const field in details) await this.editField(field, details[field]);
};
methods.editField = async function (field, data) {
  this[field] = data;
  return await this.save();
};
async function hashedPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainTextPassword, salt);
}
module.exports = model('Auth', authSchema);
