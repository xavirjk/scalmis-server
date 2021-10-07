const passport = require('passport');
const setUpClient = require('./setup_client');

const config = {
  session: false,
};

setUpClient(passport);

module.exports = passport.authenticate('client', config);
