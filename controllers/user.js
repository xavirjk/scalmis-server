const { Item } = require('../models');
const { requestedItemsCanBeIssued } = require('./utils');

/**
 * @Brief Public protected methods
 */

exports.postRequestItem = async (req, res, next) => {
  try {
    const { user, body } = req;
    const response = await requestedItemsCanBeIssued(user, body);
    res.status(response.status).send(response.data);
  } catch (err) {
    next(err);
  }
};

exports.getItemsInStock = async (req, res, next) => {
  try {
    const items = await Item.find({});
    res.status(200).send(items);
  } catch (err) {
    next(err);
  }
};
