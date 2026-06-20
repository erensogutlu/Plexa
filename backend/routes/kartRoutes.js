const express = require('express');
const router = express.Router();
const { kartlariGetir, kartEkle, kartSil } = require('../controllers/kartController');
const dogrula = require('../middleware/auth');

router.get('/', dogrula, kartlariGetir);
router.post('/', dogrula, kartEkle);
router.delete('/:id', dogrula, kartSil);

module.exports = router;
