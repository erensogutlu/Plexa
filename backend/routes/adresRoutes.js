const express = require('express');
const router = express.Router();
const { adresleriGetir, adresEkle, adresSil } = require('../controllers/adresController');
const dogrula = require('../middleware/auth');

router.get('/', dogrula, adresleriGetir);
router.post('/', dogrula, adresEkle);
router.delete('/:id', dogrula, adresSil);

module.exports = router;
