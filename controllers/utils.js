const { Items, Stock, Asset, Issued, Admin } = require('../models');

exports.requestedItemsCanBeIssued = async (user, body) => {
  const { refMember, items, isItem } = body;
  const stock = await Stock.getAll();
  if (stock.length < 1)
    return { status: 409, data: [], message: 'stock Empty' };
  const notFound = [];
  const base = { member: user.id, refMember: refMember };
  for (item of items) {
    let obj = { ...base, itemId: item.itemId, quantity: item.quantity };
    if (isItem) {
      delete item.quantity;
      const asset = await Asset.findOne({ stockId: stock[0].id, ...item });
      if (!asset) {
        notFound.push(item);
        continue;
      }
      if (asset.progressCount >= obj.quantity && obj.quantity !== 0) {
        asset.editProgressCount(obj.quantity);
        const editItem = await Items.findById(item.itemId);
        await editItem.updateTotalValue(-obj.quantity);
        await saveRequest({ ...obj, ...{ assetId: asset.id } });
      } else notFound.push(item);
    } else await saveRequest(obj);
  }
  if (notFound.length == items.length)
    return { status: 409, data: notFound, message: 'Request failed' };
  else if (!notFound.length)
    return { status: 201, data: notFound, message: 'request success' };
  else return { status: 206, data: notFound, message: 'partially processed' };
};

const checkIsAdmin = async (id) => {
  return await Admin.findById(id);
};
const saveRequest = async (data) => {
  const isAdmin = await checkIsAdmin(data.member);
  const admin = { approved: isAdmin ? true : false };
  return await Issued.saveIssued({ ...data, ...admin });
};
