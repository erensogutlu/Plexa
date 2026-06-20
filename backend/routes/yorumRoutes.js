const express = require('express');
const router = express.Router();
const { 
  yorumEkle, 
  yorumKontrol, 
  getUrunYorumlari, 
  yorumSil, 
  yorumCevapla 
} = require('../controllers/yorumController');
const dogrula = require('../middleware/auth');

// kamu yolları
router.get('/urun/:urunId', getUrunYorumlari);

// korumalı yollar
router.post('/', dogrula, yorumEkle);
router.get('/kontrol/:urunId', dogrula, yorumKontrol);
router.delete('/:id', dogrula, yorumSil);
router.put('/:id/cevap', dogrula, yorumCevapla);

module.exports = router;
