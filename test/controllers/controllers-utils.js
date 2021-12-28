const request = require('supertest');
const testData = require('../controllers/testdata/admin.json');
let app;
const admin = {
  fullname: 'Jack Bauer',
  pjno: 22222,
  email: 'jack.BauerAdmin@court.go.ke',
  office: 'my office',
  password: 'p@&&word',
};
const member = {
  fullname: 'Jack Bauer',
  pjno: 11111,
  email: 'jack.Bauer@court.go.ke',
  office: 'my office',
  password: 'p@&&w0rd',
};
const signupAdminDef = '/auth/sign-up/admin';
const loginAdmin = '/auth/sign-in/admin';
const signup = '/admin/create-user/user';
const createNew = '/admin/new-stock/';
let token = '';

exports.initializeSuite = async (api) => {
  app = api;
  await makeAPostRequest(signupAdminDef, '', admin);
  let res = await makeAPostRequest(loginAdmin, token, {
    pjno: admin.pjno,
    password: admin.password,
  });
  token = res.body.token;
  await makeAPostRequest(signup, token, member);
  await makeAPostRequest(createNew, token, testData);
};

async function makeAPostRequest(url, tk, data) {
  return await request(app).post(url).set('Authorization', tk).send(data);
}
