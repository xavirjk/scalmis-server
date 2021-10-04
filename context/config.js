const jwt = require('jsonwebtoken');
const { SESSION_SECRET } = require('./env');

exports.signin = (payload, cb, config) => {
  jwt.sign(payload, SESSION_SECRET, config, cb);
};
