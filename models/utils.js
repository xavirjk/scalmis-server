const mongoose = require('mongoose');
const options = require('./options');
const { Admin } = require('./index');

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

exports.initializeUsers = () =>
  new Promise((resolve, reject) => {
    const createAdmin = async () => {
      try {
        const admin = {
          fullName: 'Jack Bauer',
          pjno: 22222,
          email: 'jack.BauerAdmin@court.go.ke',
          office: 'my office',
          password: 'p@&&word',
        };
        const admins = await Admin.find({});
        if (!admins.length) await Admin.createOne(admin);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };

    createAdmin().then(
      (fulfilled) => {
        resolve(fulfilled);
      },
      (err) => {
        reject(err);
      }
    );
  });
