const mongoose = require('mongoose');
const options = require('./options');

exports.establishConnection = (mongo_uri) =>
  new Promise((resolve, reject) => {
    mongoose.connect(mongo_uri, options).then(
      (fulfilled) => {
        resolve(fulfilled);
      },
      (err) => {
        reject(err);
      }
    );
  });
