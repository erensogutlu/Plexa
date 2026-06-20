const havuz = require('../db');

// @desc    adresleri getir
// @route   GET /api/adresler
exports.adresleriGetir = async (istek, cevap) => {
  try {
    const adresler = await havuz.query('SELECT * FROM adresler WHERE kullanici_id = $1', [istek.kullanici.id]);
    cevap.json(adresler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    adres ekle
// @route   POST /api/adresler
exports.adresEkle = async (istek, cevap) => {
  const { baslik, sehir, ilce, adres_detay } = istek.body;
  try {
    const yeniAdres = await havuz.query(
      'INSERT INTO adresler (kullanici_id, baslik, sehir, ilce, adres_detay) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [istek.kullanici.id, baslik, sehir, ilce, adres_detay]
    );
    cevap.json(yeniAdres.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    adres sil
// @route   DELETE /api/adresler/:id
exports.adresSil = async (istek, cevap) => {
  try {
    await havuz.query('DELETE FROM adresler WHERE id = $1 AND kullanici_id = $2', [istek.params.id, istek.kullanici.id]);
    cevap.json({ mesaj: 'Adres silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
