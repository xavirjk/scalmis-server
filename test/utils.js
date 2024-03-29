const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const models = require('../models');

require('dotenv').config();
const assert = require('assert');

const app = require('../app');
const { establishConnection } = require('../models/utils');
const MONGO_TEST_URI = process.env.MONGO_TEST_URI;
const MONGO_URI = process.env.MONGO_URI;

const connectToDb = async () => {
  try {
    await establishConnection(MONGO_TEST_URI);
  } catch (error) {
    throw new Error(error);
  }
};

const connectToProdnDb = async () => {
  try {
    await establishConnection(MONGO_URI);
  } catch (error) {
    throw new Error(error);
  }
};

const closeConnectionToDb = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    throw new Error(error);
  }
};
let server;

exports.startUp = async (PORT) => {
  await connectToDb();
  server = app.listen(PORT);
  return server;
};

exports.startUpProdn = async (PORT) => {
  await connectToProdnDb();
  server = app.listen(PORT);
  return server;
};

exports.closeApp = async () => {
  if (!server) throw new Error('Error Server Not Started cant be closed');
  server.close((err) => {
    if (err) throw new Error(err);
  });
  await closeConnectionToDb();
};

exports.doSetupAndTearDown = async () => {
  beforeAll(async () => {
    await connectToDb();
  });
  afterAll(async () => {
    await closeConnectionToDb();
  });
};

exports.checkMatch = (plainTextPassword, hash) => {
  return bcrypt.compare(plainTextPassword, hash);
};

exports.clearModel = async (model) => {
  const noOfDocs = async () => {
    return await model.countDocuments({}).exec();
  };
  try {
    await model.deleteMany();
    const afterDeletion = await noOfDocs();
    assert.strictEqual(
      afterDeletion,
      0,
      `model ${model.modelName} not cleared completely`
    );
  } catch (error) {
    throw new Error(error);
  }
};

exports.clearDb = async () => {
  try {
    for (const modelName in models) {
      const model = models[modelName];
      const noOfDocs = await model.countDocuments({}).exec();
      if (noOfDocs > 0) {
        await this.clearModel(model);
      }
    }
  } catch (err) {
    throw new Error(err);
  }
};
