const express = require('express');
const path = require('path');
const {protect} = require('../middlewares/authMiddleware')
const router = express.Router();

router.use(protect);

router.use(express.static(
    path.join(__dirname, '../views/admin'),
    {index:false}
));

module.exports = router;