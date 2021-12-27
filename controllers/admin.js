const {
  Stock,
  Items,
  Asset,
  Issued,
  Auth,
  Service,
  Item,
} = require('../models');
const { Types } = require('mongoose');
var pjson = require('../package.json');
const { pdf, extract } = require('../services');
exports.postNewStock = async (req, res, next) => {
  try {
    var { body } = req;
    var stock;
    /**
     * @Brief Method quite Long but caters for Both new Stock Creation and Stock Addition
     * initializing new Stock if not created already ============ @Done by first else Block
     */
    stock = await Stock.getAll();
    if (stock.length) stock = stock[0];
    else stock = await Stock.newStock();
    /**
     * Loop through the entire body.. and process each request respectively
     * At this stage Item , Assets models collection have the capabilities of being created
     */
    for (const entry of body) {
      var item = await Items.itemExists(entry);
      if (!item) {
        const details = { item: entry.item, totalValue: 0, code: entry.code };

        item = await Items.createNewItem(details);
        if (!item) {
          res.status(401).send('Error unable to create an Item ...');
          return;
        }
      } else if (item.failed) {
        res.status(401).send(item);
        return;
      }
      const updated = await item.updateTotalValue(entry.amountAdded);
      if (!updated) {
        res.status(401).send('Error processing request ...');
        return;
      }

      /**
       * @Brief in the occurrence we find the item exists in the database and the description is similar
       * @only edit the asset
       *
       */
      const mutated = { stockId: stock.id, itemId: item.id };
      const desc = { description: entry.description.toLowerCase() };
      let asset = await Asset.findByReferences({ ...mutated, ...desc });
      if (asset) {
        const edited = await asset.editAsset(entry);
        if (!edited) {
          res.status(401).send('Error!! Could not edit asset ...');
          return;
        }
      } else asset = await Asset.createAsset({ ...mutated, ...entry });
      if (!asset) {
        res.status(401).send('Error!! Could not create an asset ...');
        return;
      }
    }

    /**@Brief End of For loop */

    res.status(201).send({ message: 'stock success', stock: stock });
  } catch (err) {
    next(err);
  }
};

exports.postNewService = async (req, res, next) => {
  try {
    const { body } = req;
    for (const entry of body) {
      var service = await Service.itemExists(entry);
      if (!service) {
        const details = { item: entry.item, totalValue: 0, code: entry.code };
        service = await Service.createNewItem(details);
        if (!service) {
          res.status(401).send('Error unable to create a service ...');
          return;
        }
      } else if (service.failed) {
        res.status(401).send(service);
        return;
      }
      const updated = await service.updateTotalValue(entry.amountAdded);
      if (!updated) {
        res.status(401).send('Error processing request ...');
        return;
      }
    }
    res.status(201).send({ message: 'stock success' });
  } catch (err) {
    next(err);
  }
};

exports.postDeleteUser = async (req, res, next) => {
  try {
    const { user, body } = req;
    const id = body._id;
    if (id == user.id) {
      res.status(409).send({ message: 'Cannot delete Default User' });
      return;
    }
    const auth = await Auth.findById(body._id);
    if (!auth) {
      res.status(409).send({ message: 'UnExpected Error Occured' });
      return;
    }
    const deleted = await auth.deleteMember();
    if (!deleted) {
      res.status(409).send({ message: 'Could not Handle Request' });
      return;
    }
    res.status(201).send({ message: 'Deletion Success' });
  } catch (err) {
    next(err);
  }
};

exports.getQueriedStock = async (req, res, next) => {
  try {
    const stock = await Stock.getAll();
    res.status(200).send({ message: 'all stock', stock: stock });
  } catch (err) {
    next(err);
  }
};

exports.getStockAssets = async (req, res, next) => {
  try {
    const { headers } = req;
    const { ref } = headers;
    const assets = await Asset.findAllByRef({ stockId: ref });
    if (assets.length < 1) {
      res.status(404).send('Stock uninitialized');
      return;
    }
    let result = assets.map((obj) => {
      obj = obj.toObject();
      obj['item'] = obj.itemId.item;
      obj['code'] = obj.itemId.code;
      delete obj.itemId;
      return obj;
    });
    res.status(200).send({ message: 'stock assets', result: result });
  } catch (err) {
    next(err);
  }
};

exports.getApproveRequest = async (req, res, next) => {
  try {
    const { ref } = req.headers;
    const data = JSON.parse(ref);
    const issued = await Issued.findById(data.id);
    if (!issued) {
      res.status(404).send({ message: 'could not handle your Request' });
      return;
    }
    await issued.approval(!data.approve);
    if (data.approve) {
      const item = await Item.findById(issued.itemId);
      if (!item) {
        res.status(409).send('ref item not found');
        return;
      }
      await item.updateTotalValue(issued.quantity);
      if (item.__t === 'item') {
        const asset = await Asset.findById(issued.assetId);
        await asset.editProgressCount(-issued.quantity);
      }
      await issued.deleteReq();
    }
    res.status(200).send({ message: 'Request Approved' });
  } catch (err) {
    next(err);
  }
};
exports.getGenerateAllItems = async (req, res, next) => {
  try {
    const path = 'Data/assets/stock.pdf';
    const data1 = await Asset.findAllByRef({ progressCount: { $gte: 0 } });
    const data2 = await Service.find({});
    let result = sanitizeAsset(data1);
    const filestream = await pdf.createStockListing(result, data2, path);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', Buffer.byteLength(filestream));
    res.setHeader('Content-Disposition', 'attachment; filename=stock.pdf');
    res.status(200);
    res.end(filestream, 'binary');
  } catch (err) {
    next(err);
  }
};

exports.postGenerateRequest = async (req, res, next) => {
  try {
    const path = 'Data/assets/invoice.pdf';
    const { body } = req;
    const filestream = await pdf.generateInvoice(body, path);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', Buffer.byteLength(filestream));
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.status(200);
    res.end(filestream, 'binary');
  } catch (err) {
    next(err);
  }
};

exports.postGenerateInvoice = async (req, res, next) => {
  try {
    const { body, user } = req;
    let query = {
      issuedAt: {
        $gte: new Date(`${body.from} 00:00:00`),
        $lte: new Date(`${body.to} 00:00:00`),
      },
      'refMember.office': body.office,
    };
    let final;
    if (body.office === '') {
      delete query['refMember.office'];
      final = query;
    } else {
      let auth;
      let mult = await Auth.find({ office: body.office });
      if (body.pjno) auth = await Auth.findByPjno(body.pjno);
      else auth = await Auth.findOne({ fullName: body.fullname });
      if (auth) {
        if (auth.id === user.id) {
          query['refMember.pjno'] = auth.pjno.toString();
          final = query;
        } else {
          let query2 = {
            issuedAt: query.issuedAt,
            member: Types.ObjectId(auth.id),
          };
          if (mult.length === 1) final = { $or: [query, query2] };
          else if (mult.length > 1) {
            let query3 = {
              issuedAt: query2.issuedAt,
              member: Types.ObjectId(user.id),
            };
            query3['refMember.pjno'] = auth.pjno.toString();
            final = { $or: [query3, query2] };
          }
        }
      } else if (body.fullname === '' || body.pjno === '') final = query;
      else {
        body.pjno
          ? (query['refMember.pjno'] = body.pjno)
          : (query['refMember.fullname'] = body.fullname);
        final = query;
      }
    }
    let results = await Issued.findByQuery(final);
    if (!results.length) {
      res.status(404).send({ message: 'Could not generate an Invoice' });
      return;
    }
    let fileStream;
    if (body.office && (body.pjno || body.fullname))
      fileStream = await pdf.generateOfficeInvoicePeriod(results);
    else fileStream = await pdf.generateInvoicePeriod(results);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', Buffer.byteLength(fileStream));
    res.setHeader('Content-Disposition', 'attachment; filename=oinv.pdf');
    res.status(200);
    res.end(fileStream, 'binary');
  } catch (err) {
    next(err);
  }
};
exports.getOffices = async (req, res, next) => {
  try {
    const auths = await Auth.find({});
    res.status(200).send({ message: 'auths', auths: auths });
  } catch (err) {
    next(err);
  }
};

exports.deleteStockItem = async (req, res, next) => {
  try {
    const { body } = req;
    const asset = await Asset.findById(body.id);
    if (!asset) {
      res.status(409).send({ message: 'failed to get requested' });
      return;
    }
    if (asset.progressCount != asset.amountAdded) {
      res.status(405).send({ message: 'Action Rejected' });
      return;
    }
    const item = await Items.findById(asset.itemId);
    await item.updateTotalValue(-asset.amountAdded);
    await asset.deleteAsset();
    res.status(200).send({ message: 'Delete Success' });
  } catch (err) {
    next(err);
  }
};
exports.saveStockItem = async (req, res, next) => {
  try {
    const { body } = req;
    const asset = await Asset.findById(body.id);
    const item = await Items.findById(asset.itemId);
    if (!asset) {
      res.status(409).send({ message: 'failed to get requested' });
      return;
    }
    let { stockItems } = body.item;
    console.log(body.update);
    if (body.update) {
      stockItems[0].amountAdded += asset.amountAdded;
      stockItems[0].assetValue += asset.assetValue;
      stockItems[0].dsamountAdded += asset.dsamountAdded;
    }
    const cde = stockItems[0].code.toUpperCase();
    const itm = stockItems[0].item.toLowerCase();

    if (item.item !== itm || item.code != cde) {
      const nm = await Items.findItem(itm);
      const cd = await Items.findOne({ code: cde });
      if (nm === null) await item.editField('item', itm);
      if (cd === null) await item.editField('code', cde);
      if (nm || cd) {
        res.status(409).send({ message: 'failed to Edit item/code exists' });
        return;
      }
    }
    if (asset.description != stockItems[0].description) {
      const exists = await Asset.findByReferences({
        description: stockItems[0].description,
        itemId: item.id,
      });
      if (exists) {
        res
          .status(401)
          .send({ message: 'An item with similar description exists' });
        return;
      }
    }

    await item.updateTotalValue(stockItems[0].amountAdded - asset.amountAdded);
    await asset.updateProduct(stockItems[0]);
    await asset.updateField('progressCount', asset.amountAdded);
    res.status(201).send({ message: 'Saved successfully' });
  } catch (err) {
    next(err);
  }
};
exports.postUpdateServer = async (req, res, next) => {
  try {
    const { body } = req;
    console.log('version', body.version);
    await extract.downloadAndUpdate(next, body, pjson);
    let message = 'Updating server... This can take A while. Please Be patient';
    res.status(201).send({ message: message });
  } catch (error) {
    next(error);
  }
};
exports.getVersion = async (req, res, next) => {
  try {
    res.status(200).send({ message: 'version', version: pjson.version });
  } catch (err) {
    next(err);
  }
};
function sanitizeAsset(assets) {
  let result = assets.map((obj) => {
    obj = obj.toObject();
    obj['item'] = obj.itemId.item;
    obj['code'] = obj.itemId.code;
    delete obj.itemId;
    return obj;
  });
  return result;
}
