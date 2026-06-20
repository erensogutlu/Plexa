const express = require('express');
const router = express.Router();
const { getAyarlar, getKategoriler } = require('../controllers/ayarController');

router.get('/ayarlar', getAyarlar);
router.get('/kategoriler', getKategoriler);

module.exports = router;
