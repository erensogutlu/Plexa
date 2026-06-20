const express = require('express');
const router = express.Router();
const { iadeTalebiOlustur } = require('../controllers/iadeController');
const dogrula = require('../middleware/auth');

router.post('/', dogrula, iadeTalebiOlustur);

module.exports = router;
