const router = require('express').Router();

const { admin, auth } = require('../controllers');

router.post('/create-user/:type', auth.postSignup);
router.post('/save-user/', auth.postSaveUser);
router.post('/delete-user/', admin.postDeleteUser);
router.post('/new-stock/', admin.postNewStock);
router.post('/new-service/', admin.postNewService);
router.post('/save/stock-item/', admin.saveStockItem);
router.post('/delete/stock-item/', admin.deleteStockItem);
router.get('/stock-entry/', admin.getQueriedStock);
router.get('/stock/assets/', admin.getStockAssets);
router.get('/get-auths/', admin.getOffices);
router.get('/generate/all-items/', admin.getGenerateAllItems);
router.post('/generate/invoice/', admin.postGenerateRequest);
router.post('/generate/invoice-period', admin.postGenerateInvoice);
router.get('/approve-request/', admin.getApproveRequest);
router.post('/update/server/', admin.postUpdateServer);
router.get('/server/version/', admin.getVersion);
module.exports = router;
