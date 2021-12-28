const router = require('express').Router();

const { user } = require('../controllers');

router.post('/request-items/', user.postRequestItem);
router.post('/confirm-code/', user.postConfirmPassword);
router.post('/reset-password/', user.postResetPassword);
router.get('/items-in-stock/', user.getItemsInStock);
router.get('/item-descriptives/', user.getItemDescriptives);
router.get('/get-services/', user.getServices);
router.get('/items/issued/', user.getIssueList);

module.exports = router;
