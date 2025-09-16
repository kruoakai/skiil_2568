    const router = require('express').Router();
    const auth = require('../middlewares/auth');
    const ctrl = require('../controllers/users.controller');
    const ctrl2 = require('../controllers/users.controller2');

    // ทางเลือกใช้ controller ตัวที่ 2
    //enum('admin', 'evaluator', 'evaluatee')
    //http://localhost:7000/api/users/list2
    router.get('/list2',   auth('admin','evaluator','evaluatee'), ctrl2.list2);

    //http://localhost:7000/api/users/server2
    router.get('/server2', auth('admin','evaluator','evaluatee'), ctrl2.listServer);
    // router.get('/', auth('admin'),ctrl.list);
    // http://localhost:7000/api/users/3
    // router.get('/:id', auth('admin','evaluator','user'), ctrl.get);
    router.get('/list2/:id', ctrl2.get);
    // http://localhost:7000/api/users

    //
    // ทางเลือกใช้ controller ตัวที่ 1

    //enum('admin', 'evaluator', 'evaluatee')
    router.get('/server', auth('admin','evaluator','evaluatee'), ctrl.listServer);
    // http://localhost:7000/api/users/server

    //http://localhost:7000/api/users/
    router.get('/', auth('admin','evaluator','evaluatee'), ctrl.list);
    // router.get('/', auth('admin'),ctrl.list);
    // http://localhost:7000/api/users/3
    // router.get('/:id', auth('admin','evaluator','user'), ctrl.get);
    router.get('/:id', ctrl.get);
    // http://localhost:7000/api/users
    // router.get('/', auth('admin'), ctrl.list);
    router.post('/', ctrl.create);
    // router.post('/', auth('admin'), ctrl.create);
    // http://localhost:7000/api/users/3
    router.put('/:id?', ctrl.update);
    // router.put('/:id', auth('admin'), ctrl.update);
    //http://localhost:7000/api/users/3
    router.delete('/:id', ctrl.remove);
    // router.delete('/:id', auth('admin'), ctrl.remove);




    module.exports = router;
