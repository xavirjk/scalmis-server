const auth = require('./auth');
const { admin, user } = require('./conf-client');

module.exports = (app) => {
  app.use('/auth', auth);
  app.use('/admin', admin);
  app.use('/user', user);
  app.use('/public', user);
};
