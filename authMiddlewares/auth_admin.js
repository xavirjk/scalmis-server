const passport = require('passport');
const setUpAdmin = require('./setup_admin');

const config = {
  session: false,
};

setUpAdmin(passport);

module.exports = passport.authenticate('admin', config);
