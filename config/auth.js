const router = require('express').Router();
const { postLogin } = require('../controllers').auth;

router.post('/sign-in/', postLogin);

module.exports = router;
