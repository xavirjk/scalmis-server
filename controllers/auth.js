const { Auth, Admin, User } = require('../models');
const { signin } = require('../context/config');

exports.postLogin = async (req, res, next) => {
  try {
    const { body, params } = req;
    const type = params.type;
    const member = await findByType(type, body);
    if (!member) {
      res.status(401).send('Credentials failed to match');
      return;
    }
    const cb = (err, token) => {
      try {
        if (err) return next(err);
        const data = {
          success: true,
          token: 'Bearer ' + token,
        };
        res.status(200).send(data);
      } catch (error) {
        next(error);
      }
    };
    return signin({ id: member.id }, cb, { expiresIn: 3600 });
  } catch (err) {
    next(err);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const { body, params } = req;
    const type = params.type;
    const pjnoPresent = await Auth.findByPjno(body.pjno);
    const emailPresent = await Auth.findByEmail(body.email);
    if (pjnoPresent || emailPresent) {
      res.status(401).send('Not created, entered email or pjno exists');
      return;
    }
    const created = await createForType(type, body);
    if (!created) {
      res.status(401).send('Error processing the request. Try again Later');
      return;
    }
    res.status(201).send('successfully created user');
  } catch (err) {
    next(err);
  }
};
exports.postDeleteUser = async (req, res, next) => {};

async function createForType(type, body) {
  switch (type) {
    case 'admin':
      return await Admin.createOne(body);
    case 'user':
      return await User.createOne(body);
    default:
      break;
  }
}

async function findByType(type, body) {
  switch (type) {
    case 'admin':
      return await Admin.findOneForCredentials(body);
    case 'user':
      return await User.findOneForCredentials(body);
    default:
      break;
  }
}
