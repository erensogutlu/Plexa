const havuz = require('../db');

// @desc    favorileri getir
// @route   GET /api/favoriler
exports.favorileriGetir = async (istek, cevap) => {
  try {
    const favoriler = await havuz.query(
      'SELECT u.* FROM favoriler f JOIN urunler u ON f.urun_id = u.id WHERE f.kullanici_id = $1',
      [istek.kullanici.id]
    );
    cevap.json(favoriler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    favoriye ekle
// @route   POST /api/favoriler/:urunId
exports.favoriEkle = async (istek, cevap) => {
  try {
    await havuz.query(
      'INSERT INTO favoriler (kullanici_id, urun_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [istek.kullanici.id, istek.params.urunId]
    );
    cevap.json({ mesaj: 'Favorilere eklendi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    favoriden çıkar
// @route   DELETE /api/favoriler/:urunId
exports.favoriCikar = async (istek, cevap) => {
  try {
    await havuz.query(
      'DELETE FROM favoriler WHERE kullanici_id = $1 AND urun_id = $2',
      [istek.kullanici.id, istek.params.urunId]
    );
    cevap.json({ mesaj: 'Favorilerden çıkarıldı' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
