const auth = require('./auth');
const client = require('./client');
const { admin, user } = require('./conf-client');

module.exports = (app) => {
  app.use('/auth', auth);
  app.use('/admin', admin);
  app.use('/user', user);
  app.use('/public', user);
  app.use('/scalmis', client);
};
