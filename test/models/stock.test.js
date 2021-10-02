const { Stock } = require('../../models');
const { doSetupAndTearDown, clearModel } = require('../utils');

describe('Stock module', () => {
  const date = new Date().toLocaleString();
  doSetupAndTearDown();
  afterAll(async () => {
    await clearModel(Stock);
  });
  it('Creates a New Stock entry', async () => {
    const stock = await Stock.newStock(date);
    expect(stock.timecreated).toEqual(date);
  });
  it('updates invoice array for a stock entry', async () => {
    const arr = ['1nvoice1.pdf', 'invoice2.jpg', 'invoice3.pdf'];
    const stock = await Stock.findByTimeCreated(date);
    const collection = await stock.updateInvoices(arr);
    expect(collection.invoices.length).toEqual(arr.length);
  });
  it('successfully updates already initialized invoice array', async () => {
    const arr = ['invoice4.pdf'];
    const stock = await Stock.findByTimeCreated(date);
    const collection = await stock.updateInvoices(arr);
    expect(collection.invoices.length).toEqual(4);
  });
});
