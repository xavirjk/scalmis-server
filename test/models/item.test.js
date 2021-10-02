const { Item } = require('../../models');
const { doSetupAndTearDown, checkMatch, clearModel } = require('../utils');

describe('Item module', () => {
  const details = { item: 'Item', totalValue: 0 };
  doSetupAndTearDown();
  afterAll(async () => {
    await clearModel(Item);
  });
  it('Creates a New Item entry', async () => {
    const item = await Item.createNewItem(details);
    expect(item).toBeTruthy();
  });
  it('finds and updates  total items quantity', async () => {
    const item = await Item.findItem(details.item);
    const updated = await item.updateTotalValue(10);
    expect(updated.totalValue).toEqual(10);
  });
});
