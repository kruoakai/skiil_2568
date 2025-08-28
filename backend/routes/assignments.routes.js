const router = require('express').Router();
const requireAuth = require('../middlewares/requireAuth');
const ctrl = require('../controllers/assignments.controller');

router.post('/', requireAuth, ctrl.create);

module.exports = router;
