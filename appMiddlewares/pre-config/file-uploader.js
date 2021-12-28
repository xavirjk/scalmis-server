const fileUpload = require('express-fileupload');

module.exports = (app) => {
  app.use(fileUpload());
};
