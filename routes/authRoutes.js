const express = require('express');
const router = express.Router();
const loginLimiter = require('../middlewares/rateLimitMiddleware');
const {loginAdmin,logoutAdmin,getCsrfToken} = require('../controller/authController');
const { protect } = require('../middlewares/authMiddleware');


router.post('/login',loginLimiter, loginAdmin);
router.post('/logout',logoutAdmin);
router.get('/csrf-token', protect, getCsrfToken);

module.exports = router;
