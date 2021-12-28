const request = require('supertest');
const { startUpProdn, closeApp, clearDb } = require('../utils');

const PORT = 7182;
/***
 * Creates A default Admin
 * Other test migt fail
 */
describe('Admin controllers Default', () => {
  let app;
  const admin = {
    fullName: 'John  Doe',
    pjno: 22222,
    email: 'johntexavir@gmail.com',
    office: 'ICT',
    password: '123456@Jk',
  };
  const signupAdminDef = '/auth/sign-up/admin';
  const loginAdmin = '/auth/sign-in/admin';

  var token = '';
  beforeAll(async () => {
    app = await startUpProdn(PORT);
    await clearDb();
  });
  afterAll(async () => {
    await closeApp();
  });
  it('creates a test admin successfully', async () => {
    const res = await makeAPostRequest(signupAdminDef, token, admin);
    expect(res.status).toEqual(201);
  });
  it('logs in test admin successfully', async () => {
    const res = await makeAPostRequest(loginAdmin, token, {
      pjno: admin.pjno,
      password: admin.password,
    });
    expect(res.status).toEqual(200);
    expect(res.body.success).toBeTruthy();
    token = res.body.token;
  });
  async function makeAPostRequest(url, tk, data) {
    return await request(app).post(url).set('Authorization', tk).send(data);
  }
});
