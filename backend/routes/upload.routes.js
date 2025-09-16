// const router = require('express').Router();
// const auth = require('../middlewares/auth');
// const upload = require('../middlewares/upload');
// const ctrl = require('../controllers/upload.controller');

// // router.post('/', auth('admin','evaluator','user'), upload.single('file'), ctrl.single);

// router.post('/', upload.single('file'), ctrl.single);

// module.exports = router;
//
const router = require('express').Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/upload.controller');

// ===== Evaluatee =====
router.post('/evidence', auth('evaluatee'), upload.single('file'), ctrl.uploadEvidence);
router.get('/mine', auth('evaluatee'), ctrl.listMine);
router.delete('/:id', auth('evaluatee'), ctrl.deleteMine);
router.put('/:id/file', auth('evaluatee'), upload.single('file'), ctrl.updateFileMine);
router.patch('/:id', auth('evaluatee'), ctrl.updateMetaMine);

// ===== Evaluator =====
router.get('/evaluatee/:evaluateeId', auth('evaluator'), ctrl.listForEvaluator);

// ===== Admin =====
router.post('/admin/evidence', auth('admin'), upload.single('file'), ctrl.adminUploadOnBehalf);
router.get('/admin', auth('admin'), ctrl.adminList);
router.delete('/admin/:id', auth('admin'), ctrl.adminDelete);
router.put('/admin/:id/file', auth('admin'), upload.single('file'), ctrl.adminUpdateFile);
router.patch('/admin/:id', auth('admin'), ctrl.adminUpdateMeta);

module.exports = router;
