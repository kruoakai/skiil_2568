const router = require('express').Router();
const requireAuth = require('../middlewares/requireAuth');
const ctrl = require('../controllers/reports.controller');

router.get('/normalized', requireAuth, ctrl.normalized);
router.get('/progress', requireAuth, ctrl.progress);

module.exports = router;
