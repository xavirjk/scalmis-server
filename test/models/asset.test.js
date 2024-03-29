const { Asset, Stock, Item } = require('../../models');
const { doSetupAndTearDown, clearDb } = require('../utils');
describe.skip('Asset Module', () => {
  let date;
  const details = { item: 'Item', totalValue: 0 };
  const assetDetails = {
    stockId: '',
    itemId: '',
    description: '18.9l',
    amountAdded: 10,
    assetValue: 250,
  };
  doSetupAndTearDown();
  afterAll(async () => {
    await clearDb();
  });
  it('Successfully creates a new Asset', async () => {
    const stock = await Stock.newStock();
    const item = await Item.createNewItem(details);
    assetDetails.stockId = stock.id;
    assetDetails.itemId = item.id;
    const asset = await Asset.createAsset(assetDetails);
    expect(asset.amountAdded).toEqual(assetDetails.amountAdded);
  });
  it('Successfully updates Item totalValue on mapping an asset', async () => {
    const item = await Item.findItem(details.item);
    const updated = await item.updateTotalValue(assetDetails.amountAdded);
    expect(updated.totalValue).toEqual(assetDetails.amountAdded);
  });
});
