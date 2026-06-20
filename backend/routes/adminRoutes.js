const express = require('express');
const router = express.Router();
const { 
  getIstatistikler, 
  getKullanicilar, 
  kullaniciSil, 
  kullaniciRolGuncelle, 
  getTumSiparisler, 
  getTumIadeler, 
  adminUrunSil 
} = require('../controllers/adminController');
const { getYorumlarim, getGelenYorumlar } = require('../controllers/yorumController');
const { ayarGuncelle, kategoriEkle, kategoriSil } = require('../controllers/ayarController');
const dogrula = require('../middleware/auth');

// admin yetkisi kontrolü middleware
const adminMi = (istek, cevap, sonraki) => {
  if (istek.kullanici && istek.kullanici.rol === 'admin') {
    sonraki();
  } else {
    cevap.status(403).json({ mesaj: 'Bu işlem için admin yetkisi gerekiyor' });
  }
};

router.use(dogrula);

// bunlar /api/admin altında ama admin yetkisi gerektirmiyor
router.get('/yorumlarim', getYorumlarim);
router.get('/gelen-yorumlar', getGelenYorumlar);

// bundan sonrakiler admin yetkisi gerektirir
router.use(adminMi);

router.get('/istatistikler', getIstatistikler);
router.get('/kullanicilar', getKullanicilar);
router.delete('/kullanicilar/:id', kullaniciSil);
router.put('/kullanicilar/:id/rol', kullaniciRolGuncelle);
router.get('/tum-siparisler', getTumSiparisler);
router.get('/tum-iadeler', getTumIadeler);
router.delete('/urunler/:id', adminUrunSil);

// ayar ve kategori yönetimi
router.put('/ayarlar/:anahtar', ayarGuncelle);
router.post('/kategoriler', kategoriEkle);
router.delete('/kategoriler/:id', kategoriSil);

module.exports = router;
