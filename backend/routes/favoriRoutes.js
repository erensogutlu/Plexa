const express = require('express');
const router = express.Router();
const { favorileriGetir, favoriEkle, favoriCikar } = require('../controllers/favoriController');
const dogrula = require('../middleware/auth');

router.get('/', dogrula, favorileriGetir);
router.post('/:urunId', dogrula, favoriEkle);
router.delete('/:urunId', dogrula, favoriCikar);

module.exports = router;
