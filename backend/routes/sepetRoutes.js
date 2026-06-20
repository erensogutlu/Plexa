const express = require('express');
const router = express.Router();
const { sepetiGetir, sepeteEkle, sepettenCikar } = require('../controllers/sepetController');
const dogrula = require('../middleware/auth');

router.get('/', dogrula, sepetiGetir);
router.post('/', dogrula, sepeteEkle);
router.delete('/:id', dogrula, sepettenCikar);

module.exports = router;
