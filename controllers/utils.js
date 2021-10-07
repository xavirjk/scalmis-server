const { Item, Stock, Asset, Issued, Admin } = require('../models');

exports.requestedItemsCanBeIssued = async (user, body) => {
  const { refMember, items } = body;
  const stock = await Stock.find({});
  const notFound = [];
  for (item of items) {
    const quantity = item.quantity;
    delete item.quantity;
    for (let i = stock.length - 1; i >= 0; i--) {
      const asset = await Asset.findOne({ stockId: stock[i].id, ...item });
      if (!asset) continue;
      if (asset.progressCount >= quantity) {
        asset.editProgressCount(quantity);
        const editItem = await Item.findById(item.itemId);
        await editItem.updateTotalValue(-quantity);
        const isAdmin = await checkIsAdmin(user.id);
        await Issued.saveIssued({
          member: user.id,
          refMember: refMember,
          itemId: item.itemId,
          assetId: asset.id,
          quantity: quantity,
          approved: isAdmin ? true : false,
        });

        break;
      }
      if (!i) notFound.push(item);
    }
  }
  if (notFound.length == items.length) return { status: 404, data: notFound };
  return { status: 200, data: notFound };
};

const checkIsAdmin = async (id) => {
  return await Admin.findById(id);
};
