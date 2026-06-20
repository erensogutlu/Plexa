const express = require('express');
const router = express.Router();
const { tumUrunleriGetir, urunEkle, urunGuncelle, urunSil } = require('../controllers/urunController');
const dogrula = require('../middleware/auth');

router.get('/', tumUrunleriGetir);
router.post('/', dogrula, urunEkle);
router.put('/:id', dogrula, urunGuncelle);
router.delete('/:id', dogrula, urunSil);

module.exports = router;
