const router = require('express').Router();

const { admin, auth } = require('../controllers');

router.post('/create-user/:type', auth.postSignup);
router.post('/delete-user/', auth.postDeleteUser);
router.post('/new-stock/', admin.postNewStock);
router.post('/add/items-to-stock/', () => {});
router.post('/delete/stock/', () => {}); //Risky , cannot be undone
router.post('/delete/stock-item/', () => {});
router.get('/stock-entry/', admin.getQueriedStock);
router.get('/stock/assets/', admin.getStockAssets);
router.get('/items/issued/', admin.getIssueList);
router.get('/items/requisition-general/', admin.getItemsReqisitionGeneral); //Return in details items requisited in a given time period per station
module.exports = router;
