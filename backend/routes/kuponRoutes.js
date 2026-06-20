const express = require('express');
const router = express.Router();
const { kuponDogrula } = require('../controllers/kuponController');
const dogrula = require('../middleware/auth');

router.post('/dogrula', dogrula, kuponDogrula);

module.exports = router;
