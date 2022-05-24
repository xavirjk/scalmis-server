const { Auth, Admin, User } = require('../models');
const { mailer } = require('../services');
const { signin } = require('../context/config');

exports.postLogin = async (req, res, next) => {
  try {
    const { body, params } = req;
    const type = params.type;
    const member = await findByType(type, body);
    if (!member) {
      res.status(401).send({ message: 'Credentials failed to match' });
      return;
    }
    const cb = (err, token) => {
      try {
        if (err) return next(err);
        const data = {
          success: true,
          message: 'loggedIn',
          auth: type,
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
    if (!body.password) {
      body['password'] = genCode();
      mailer(body.fullName, body.email, body.password)
        .then((res) => {
          await createForType(type, body);
          res.status(201).send({ message: 'successfully created user' });
        })
        .catch((err) => {
          res.status(401).send('Not created, Mailing failed');
          return null;
        });
    }
  } catch (err) {
    next(err);
  }
};

exports.postSaveUser = async (req, res, next) => {
  try {
    const { user, body } = req;
    var { type, data } = body;
    const pjnoPresent = await Auth.findByPjno(data.pjno);
    const emailPresent = await Auth.findByEmail(data.email);
    const auth = await Auth.findById(type.id);
    type.type ? (data['__t'] = 'Admin') : (data['__t'] = 'User');
    if (user.id === auth.id && auth.__t !== data.__t) {
      res.status(401).send('Cannot Edit Default Admin');
      return;
    }
    if (pjnoPresent && auth.id !== pjnoPresent.id) {
      res.status(401).send('entered pjno exists');
      return;
    }
    if (emailPresent && auth.id !== emailPresent.id) {
      res.status(401).send('entered Email exists');
      return;
    }
    delete data.password;
    const edited = await auth.editOne(data);
    res.status(201).send({ message: 'success' });
  } catch (err) {
    next(err);
  }
};
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

const genCode = () => {
  var sym = ['!', '@', '#', '$', '%', '^', '&', '*', '=', '-', '_'];
  var Alphabets = 'abcdefghijklmnopqrstuvwzyz';
  var pwdChars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var pwdLen = 5;
  var randPassword = Array(pwdLen)
    .fill(pwdChars)
    .map(function (x) {
      return x[Math.floor(Math.random() * x.length)];
    })
    .join('');
  let randSym = sym[getRand(sym.length)];
  let randNum = getRand(10);
  let randAlpha = Alphabets[getRand(Alphabets.length)];
  return (
    randPassword + `${randAlpha.toUpperCase()}${randSym}${randNum}${randAlpha}`
  );
};

function getRand(max) {
  return Math.floor(Math.random() * max);
}
