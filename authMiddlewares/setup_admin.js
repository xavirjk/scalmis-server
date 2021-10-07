const passportJWT = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJWT;
const { Admin } = require('../models');
const { SESSION_SECRET } = require('../context/env');

const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SESSION_SECRET;

const local = new Strategy(opts, async (payload, done) => {
  const query = await Admin.findById(payload.id);
  const id = query.id;
  const data = { id };
  done(null, data);
});

module.exports = (passport) => {
  passport.use('admin', local);
};
