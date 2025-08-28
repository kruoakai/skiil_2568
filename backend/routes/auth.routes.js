const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');

// POST /api/auth/login
// Login user
// Body: { email, password }
// Response: { success, accessToken, user: { id, name, email, role } }
// Roles: all
router.post('/login', ctrl.login);

module.exports = router;
