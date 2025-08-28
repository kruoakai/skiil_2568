const router = require('express').Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/upload.controller');

router.post('/', auth('admin','evaluator','user'), upload.single('file'), ctrl.single);

module.exports = router;
