const havuz = require('../db');

// @desc    sepeti getir
// @route   GET /api/sepet
exports.sepetiGetir = async (istek, cevap) => {
  try {
    const sepet = await havuz.query(
      'SELECT s.id as sepet_id, s.adet, u.* FROM sepet s JOIN urunler u ON s.urun_id = u.id WHERE s.kullanici_id = $1',
      [istek.kullanici.id]
    );
    cevap.json(sepet.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    sepete ekle
// @route   POST /api/sepet
exports.sepeteEkle = async (istek, cevap) => {
  const { urunId, adet } = istek.body;
  try {
    const yeniSepetItem = await havuz.query(
      'INSERT INTO sepet (kullanici_id, urun_id, adet) VALUES ($1, $2, $3) RETURNING *',
      [istek.kullanici.id, urunId, adet || 1]
    );
    cevap.json(yeniSepetItem.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    sepetten çıkar
// @route   DELETE /api/sepet/:id
exports.sepettenCikar = async (istek, cevap) => {
  try {
    await havuz.query('DELETE FROM sepet WHERE id = $1 AND kullanici_id = $2', [istek.params.id, istek.kullanici.id]);
    cevap.json({ mesaj: 'Ürün sepetten çıkarıldı' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
