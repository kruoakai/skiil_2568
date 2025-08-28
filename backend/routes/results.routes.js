const router = require('express').Router();
const requireAuth = require('../middlewares/requireAuth');
const ctrl = require('../controllers/results.controller');

router.get('/', requireAuth, ctrl.list);
router.patch('/:id/submit', requireAuth, ctrl.submit);

module.exports = router;
