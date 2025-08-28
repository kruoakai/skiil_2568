const router = require('express').Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/users.controller');

router.get('/server', auth('admin','evaluator','user'), ctrl.listServer);
router.get('/', auth('admin','evaluator','user'), ctrl.list);
router.get('/:id', auth('admin','evaluator','user'), ctrl.get);
router.post('/', auth('admin'), ctrl.create);
router.put('/:id', auth('admin'), ctrl.update);
router.delete('/:id', auth('admin'), ctrl.remove);

module.exports = router;
