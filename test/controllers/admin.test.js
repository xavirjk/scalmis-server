const request = require('supertest');
const { startUp, closeApp, clearDb } = require('../utils');
const testData = require('./testdata/admin.json');

const PORT = 7182;

describe.skip('Admin controllers', () => {
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
  const admin2 = {
    fullname: 'Jack Bauer2',
    pjno: 22221,
    email: 'jack.BauerAdmin2@court.go.ke',
    office: 'my office',
    password: 'p@&&word',
  };
  var setDetails = [];
  setDetails = testData.slice(0, 2);
  var stock;
  var queried;
  const signup = '/admin/create-user/user';
  const signupAdmin = '/admin/create-user/admin';
  const signupAdminDef = '/auth/sign-up/admin';
  const login = '/auth/sign-in/user';
  const loginAdmin = '/auth/sign-in/admin';
  const createNew = '/admin/new-stock/';
  const queriedStock = '/admin/stock-entry/';
  const stockAssets = '/admin/stock/assets/';
  const requestItem = '/public/request-items/';
  const itemsAll = '/public/items-in-stock/';
  const issuedItems = '/admin/items/issued/';

  var token = '';
  beforeAll(async () => {
    app = await startUp(PORT);
  });
  afterAll(async () => {
    await clearDb();
    await closeApp();
  });
  it('fails to create an admin with unsigned account', async () => {
    const res = await makeAPostRequest(signupAdmin, token, admin);
    expect(res.status).toEqual(401);
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
  it('creates a user with a logged in  Admin account and a valid token', async () => {
    //let res = await makeAPostRequest(signupAdmin, token, admin2);
    let res = await makeAPostRequest(signup, token, member);
    expect(res.status).toEqual(201);
  });
  it('fails to create a user with an invalid token', async () => {
    const invalid = 'Bearer wtytywej7783yhjdhk i92euidjkjsx';
    const res = await makeAPostRequest(signupAdmin, invalid, admin2);
    expect(res.status).toEqual(401);
  });
  it('creates a new stock entry ', async () => {
    const res = await makeAPostRequest(createNew, token, setDetails);
    expect(res.status).toBe(201);
    expect(res.body.stock).toBeTruthy();
    stock = res.body.stock;
  });
  it('creates a new stock entry with same data', async () => {
    const res = await makeAPostRequest(createNew, token, setDetails);
    expect(res.status).toBe(201);
  });
  it('updates an initialized stock entry', async () => {
    const details = {
      stock: stock,
      data: testData,
    };
    const res = await makeAPostRequest(createNew, token, details);
    expect(res.status).toBe(201);
  });
  it('returns valid for stock collection ', async () => {
    queried = await makeAGetRequest(queriedStock, token, '');
    expect(queried.status).toEqual(200);
    expect(queried.body.stock.length).toBe(2);
  });
  it('returns all items created in Stock 1', async () => {
    const { _id } = queried.body.stock[0];
    const assets = await makeAGetRequest(stockAssets, token, _id);
    console.log('assets', assets.body);
    expect(assets.status).toBe(200);
  });
  it('admin issue Item to unregistered office user', async () => {
    const refMember = {
      fullname: 'unregistered user',
      pjno: 11771,
      office: 'my office unreg',
    };
    const items = await makeAGetRequest(itemsAll, token, '');
    expect(items.body.items.length).toBeTruthy();
    console.log(items.body.items);
    const item = [];
    item.push({
      itemId: items.body.items[1]._id,
      description: '500ml',
      quantity: 10,
    });
    const requested = await makeAPostRequest(requestItem, token, {
      refMember: refMember,
      items: item,
    });
    expect(requested.status).toBe(200);
    const issued = await makeAQueryRequest(issuedItems, token, {});
    expect(issued.status).toBe(200);
    expect(issued.body.length).toBe(item.length);
  });
  it('admin can view the items to approve request', async () => {
    const approveItems = await makeAQueryRequest(issuedItems, token, {
      approved: false,
    });
    expect(approveItems.body.length).toBe(0);
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
