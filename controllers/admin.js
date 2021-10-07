const { Stock, Item, Asset, Issued } = require('../models');
exports.postNewStock = async (req, res, next) => {
  try {
    var { body } = req;
    var stock;

    /**
     * @Brief Method quite Long but caters for Both new Stock Creation and Stock Addition
     * initializing new Stock if not created already ============ @Done by first else Block
     */
    if (body.stock) {
      stock = body.stock;
      body = body.data;
    } else {
      stock = await Stock.newStock();
      if (!stock) {
        res.status(401).send('Error could not initiate your request');
        return;
      }
    }
    /**
     * Loop through the entire body.. and process each request respectively
     * At this stage Item , Assets models collection have the capabilities of being created
     */
    for (const entry of body) {
      var item = await Item.findItem(entry.item);
      if (!item) {
        const details = { item: entry.item, totalValue: 0 };

        item = await Item.createNewItem(details);
        if (!item) {
          res.status(401).send('Error unable to create an Item ...');
          return;
        }
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
      const mutated = { stockId: stock.id || stock._id, itemId: item.id };
      let asset = await Asset.findByReferences(mutated);
      if (asset) {
        if (asset.description === entry.description) {
          const edited = await asset.editNumerals(entry);
          if (!edited) {
            res.status(401).send('Error!! Could not edit asset ...');
            return;
          }
        }
      } else {
        asset = await Asset.createAsset({ ...mutated, ...entry });
        if (!asset) {
          res.status(401).send('Error!! Could not create an asset ...');
          return;
        }
      }
    }

    /**@Brief End of For loop */

    res.status(201).send({ stock });
  } catch (err) {
    next(err);
  }
};

exports.getIssueList = async (req, res, next) => {
  try {
    const { query } = req;
    const issued = await Issued.find(query);
    res.status(200).send(issued);
  } catch (err) {
    next(err);
  }
};
exports.getItemsReqisitionGeneral = async (req, res, next) => {
  try {
    const { query } = req;
    const { from, to } = query;
    console.log(from);
    console.log(to);
  } catch (error) {}
};

exports.getQueriedStock = async (req, res, next) => {
  try {
    const stock = await Stock.getAll();
    res.status(200).send(stock);
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
    res.status(200).send(assets);
  } catch (err) {
    next(err);
  }
};
