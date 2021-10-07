const router = require('express').Router();
const { auth } = require('../controllers');

router.post('/sign-in/:type', auth.postLogin);
//Remove signup
router.post('/sign-up/:type', auth.postSignup);

module.exports = router;
