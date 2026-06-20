const havuz = require('../db');

// @desc    kullanıcının kartlarını getir
// @route   GET /api/kartlar
exports.kartlariGetir = async (istek, cevap) => {
  try {
    const kartlar = await havuz.query('SELECT * FROM kartlar WHERE kullanici_id = $1', [istek.kullanici.id]);
    cevap.json(kartlar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kart ekle
// @route   POST /api/kartlar
exports.kartEkle = async (istek, cevap) => {
  const { kart_sahibi, kart_no, skt } = istek.body;
  try {
    const yeniKart = await havuz.query(
      'INSERT INTO kartlar (kullanici_id, kart_sahibi, kart_no, skt) VALUES ($1, $2, $3, $4) RETURNING *',
      [istek.kullanici.id, kart_sahibi, kart_no, skt]
    );
    cevap.json(yeniKart.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kart sil
// @route   DELETE /api/kartlar/:id
exports.kartSil = async (istek, cevap) => {
  try {
    await havuz.query('DELETE FROM kartlar WHERE id = $1 AND kullanici_id = $2', [istek.params.id, istek.kullanici.id]);
    cevap.json({ mesaj: 'Kart silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
