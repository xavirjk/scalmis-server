const request = require('supertest');
const { Auth } = require('../../models');
const { startUp, closeApp, clearModel } = require('../utils');

const PORT = 7181;

describe.skip('Auth controllers', () => {
  let app;
  const member = {
    fullname: 'Jack Bauer',
    pjno: 11111,
    email: 'jack.Bauer@court.go.ke',
    office: 'my office',
    password: 'p@&&w0rd',
  };
  const admin = {
    fullname: 'Jack Bauer',
    pjno: 22222,
    email: 'jack.BauerAdmin@court.go.ke',
    office: 'my office',
    password: 'p@&&word',
  };
  const signup = '/auth/sign-up/user';
  const signupAdmin = '/auth/sign-up/admin';
  const login = '/auth/sign-in/user';
  const loginAdmin = '/auth/sign-in/admin';
  beforeAll(async () => {
    app = await startUp(PORT);
  });
  afterAll(async () => {
    await clearModel(Auth);
    await closeApp();
  });

  it('creates a new user', async () => {
    const res = await request(app).post(signup).send(member);
    expect(res.status).toEqual(201);
  });

  it('fails to create a new user whose credentials already exists', async () => {
    const res = await request(app).post(signup).send(member);
    expect(res.status).toEqual(401);
  });
  it('will successfully login a user whose credentials match returning success token', async () => {
    const res = await request(app)
      .post(login)
      .send({ pjno: member.pjno, password: member.password });
    expect(res.status).toEqual(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.success).toBeTruthy();
  });
  it('fails to login a user whose credentials fail to match', async () => {
    const res = await request(app)
      .post(login)
      .send({ pjno: member.pjno, password: '11111' });
    expect(res.status).toEqual(401);
  });
  it('creates an admin successfully', async () => {
    const res = await request(app).post(signupAdmin).send(admin);
    expect(res.status).toEqual(201);
  });
  it('logs in admin successfully returning access token', async () => {
    const res = await request(app)
      .post(loginAdmin)
      .send({ pjno: admin.pjno, password: admin.password });
    expect(res.status).toEqual(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.success).toBeTruthy();
  });
  it('cannot login a normal user via admin link', async () => {
    const res = await request(app)
      .post(loginAdmin)
      .send({ pjno: member.pjno, password: member.password });
    expect(res.status).toEqual(401);
  });
});
