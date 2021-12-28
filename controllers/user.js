const { Items, Asset, Service, Issued, Auth } = require('../models');
const { requestedItemsCanBeIssued } = require('./utils');

/**
 * @Brief Public protected methods
 */

exports.postRequestItem = async (req, res, next) => {
  try {
    const { user, body } = req;
    const response = await requestedItemsCanBeIssued(user, body);
    res
      .status(response.status)
      .send({ data: response.data, message: response.message });
  } catch (err) {
    next(err);
  }
};
exports.postConfirmPassword = async (req, res, next) => {
  try {
    const { user, body } = req;
    const auth = await Auth.findById(user.id);
    const matched = await auth.checkMatch(body.password);
    if (!matched) {
      res.status(401).send({ message: 'incorrect Password' });
      return;
    }
    res.status(200).send({ confirmCode: true });
  } catch (err) {
    next(err);
  }
};
exports.postResetPassword = async (req, res, next) => {
  try {
    const { user, body } = req;
    var id;
    body.id ? (id = body.id) : (id = user.id);
    const auth = await Auth.findById(id);
    if (!auth) {
      res.status(404).send('User not Found');
      return;
    }
    await auth.ResetCode(body);
    res
      .status(201)
      .send({ message: 'password changed Successfully', password: true });
  } catch (err) {
    next(err);
  }
};
exports.getItemsInStock = async (req, res, next) => {
  try {
    const items = await Items.find({});
    res.status(200).send({ message: 'itemsreq', items: items });
  } catch (err) {
    next(err);
  }
};

exports.getItemDescriptives = async (req, res, next) => {
  try {
    const { headers } = req;
    const { ref } = headers;
    const descriptives = await Asset.findAllByRef({ itemId: ref });
    res.status(200).send({ message: 'itemDesc', descriptives: descriptives });
  } catch (err) {
    next(err);
  }
};

exports.getServices = async (req, res, next) => {
  try {
    const services = await Service.find({});
    res.status(200).send({ message: 'services', services: services });
  } catch (err) {
    next(err);
  }
};

exports.getIssueList = async (req, res, next) => {
  try {
    let { query, user } = req;
    if (query.self) {
      delete query.self;
      query['member'] = user.id;
    }
    query = generateQuery(query);
    const issued = await Issued.find(query)
      .populate('member', 'fullName office -_id')
      .populate('itemId', 'item -_id')
      .populate('assetId', 'description -_id')
      .sort([['_id', -1]])
      .exec();
    res.status(200).send({ issued: issued, message: 'issued' });
  } catch (err) {
    next(err);
  }
};

function generateQuery(query) {
  const ref = query.today;
  delete query.today;
  if (ref === 'false') {
    if (query.all) return {};
    return query;
  } else {
    let current = new Date().toISOString().split('T')[0];
    query['issuedAt'] = { $gte: new Date(`${current} 00:00:00`) };
    return query;
  }
}
