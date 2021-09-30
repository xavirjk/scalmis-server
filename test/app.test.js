const request = require('supertest');

const PORT = 8080;

const { startUp, closeApp } = require('./utils');

describe('App Starting-up', () => {
  let app;
  beforeAll(async () => {
    app = await startUp(PORT);
  });

  afterAll(async () => {
    await closeApp();
  });

  it('return error 404 for invalid URI', async () => {
    const notFound = '/user/get';
    const res = await request(app).get(notFound);
    expect(res.status).toEqual(404);
  });
});
