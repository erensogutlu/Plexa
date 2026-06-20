const express = require('express');
const router = express.Router();
const { siparisOlustur, siparisleriGetir } = require('../controllers/siparisController');
const dogrula = require('../middleware/auth');

router.post('/', dogrula, siparisOlustur);
router.get('/', dogrula, siparisleriGetir);

module.exports = router;
