const request = require('supertest');
const { startUp, closeApp, clearDb } = require('../utils');
const { initializeSuite } = require('./controllers-utils');

const PORT = 7184;

describe.skip('User controllers', () => {
  let app;
  const member = {
    fullname: 'Jack Bauer',
    pjno: 11111,
    email: 'jack.Bauer@court.go.ke',
    office: 'my office',
    password: 'p@&&w0rd',
  };
  const login = '/auth/sign-in/user';
  const itemsAll = '/public/items-in-stock/';
  const requestItem = '/public/request-items/';
  var token = '';
  beforeAll(async () => {
    app = await startUp(PORT);
    await initializeSuite(app);
  });
  afterAll(async () => {
    await clearDb();
    await closeApp();
  });
  it('logs in a test user successfully', async () => {
    const res = await makeAPostRequest(login, token, {
      pjno: member.pjno,
      password: member.password,
    });
    expect(res.status).toEqual(200);
    expect(res.body.success).toBeTruthy();
    token = res.body.token;
  });
  it('Issues item to a registered System user ', async () => {
    const items = await makeAGetRequest(itemsAll, token, '');
    expect(items.body.items.length).toBeTruthy();
    const item = [];
    item.push({
      itemId: items.body.items[2]._id,
      description: 'desc3',
      quantity: 1,
    });
    const requested = await makeAPostRequest(requestItem, token, {
      refMember: {},
      items: item,
    });
    expect(requested.status).toBe(200);
  });
  it('fails to issue item that does not exist in stock', async () => {
    const items = await makeAGetRequest(itemsAll, token, '');
    expect(items.body.items.length).toBeTruthy();
    const item = [];
    item.push({
      itemId: items.body.items[2]._id,
      description: 'desc3',
      quantity: 1,
    });
    const requested = await makeAPostRequest(requestItem, token, {
      refMember: {},
      items: item,
    });
    expect(requested.status).toBe(409);
  });

  async function makeAPostRequest(url, tk, data) {
    return await request(app).post(url).set('Authorization', tk).send(data);
  }
  async function makeAGetRequest(url, tk, ref) {
    return await request(app).get(url).set('Authorization', tk).set('ref', ref);
  }
  async function makeAQueryRequest(url, tk, query) {
    return await request(app).get(url).set('Authorization', tk).query(query);
  }
});
