const router = require('express').Router();

const { user } = require('../controllers');

router.post('/request-items/', user.postRequestItem);
router.get('/items-in-stock/', user.getItemsInStock);

module.exports = router;
