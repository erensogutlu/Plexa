const express = require('express');
const router = express.Router();
const { kayitOl, girisYap, mevcutKullaniciGetir, profilGuncelle } = require('../controllers/authController');
const dogrula = require('../middleware/auth');

router.post('/kayit', kayitOl);
router.post('/giris', girisYap);
router.get('/me', dogrula, mevcutKullaniciGetir);
router.put('/profil', dogrula, profilGuncelle);

module.exports = router;
