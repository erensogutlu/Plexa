const express = require('express');
const router = express.Router();
const { saticiSiparisleriGetir, siparisDurumuGuncelle, siparisGizle } = require('../controllers/siparisController');
const { saticiIadeleriGetir, iadeGizle, iadeDurumuGuncelle } = require('../controllers/iadeController');
const { saticiKuponlariGetir, kuponEkle, kuponSil } = require('../controllers/kuponController');
const dogrula = require('../middleware/auth');

router.use(dogrula);

// sipariş yolları
router.get('/siparisler', saticiSiparisleriGetir);
router.put('/siparisler/:id', siparisDurumuGuncelle);
router.delete('/siparisler/:id', siparisGizle);

// iade yolları
router.get('/iadeler', saticiIadeleriGetir);
router.put('/iadeler/:id/gizle', iadeGizle);
router.put('/iadeler/:id', iadeDurumuGuncelle);

// kupon yolları
router.get('/kuponlar', saticiKuponlariGetir);
router.post('/kuponlar', kuponEkle);
router.delete('/kuponlar/:id', kuponSil);

module.exports = router;
