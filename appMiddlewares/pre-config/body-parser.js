const { json, urlencoded } = require('express');

const config = urlencoded({
  extended: false,
  limit: '50MB',
});

module.exports = (app) => {
  app.use(config);
  app.use(json());
};
