const havuz = require('../db');

// @desc    satıcının kuponlarını getir
// @route   GET /api/satici/kuponlar
exports.saticiKuponlariGetir = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  try {
    const kuponlar = await havuz.query('SELECT * FROM kuponlar WHERE satici_id = $1 ORDER BY olusturulma_tarihi DESC', [istek.kullanici.id]);
    cevap.json(kuponlar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kupon ekle
// @route   POST /api/satici/kuponlar
exports.kuponEkle = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  const { kod, indirim_yuzdesi } = istek.body;
  try {
    const yeniKupon = await havuz.query(
      'INSERT INTO kuponlar (kod, indirim_yuzdesi, satici_id) VALUES ($1, $2, $3) RETURNING *',
      [kod.toUpperCase(), indirim_yuzdesi, istek.kullanici.id]
    );
    cevap.json(yeniKupon.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    if (hata.code === '23505') return cevap.status(400).json({ mesaj: 'Bu kupon kodu zaten mevcut' });
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kupon sil
// @route   DELETE /api/satici/kuponlar/:id
exports.kuponSil = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  try {
    await havuz.query('DELETE FROM kuponlar WHERE id = $1 AND satici_id = $2', [istek.params.id, istek.kullanici.id]);
    cevap.json({ mesaj: 'Kupon silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kupon doğrula
// @route   POST /api/kuponlar/dogrula
exports.kuponDogrula = async (istek, cevap) => {
  const { kod } = istek.body;
  try {
    const kupon = await havuz.query('SELECT * FROM kuponlar WHERE kod = $1 AND aktif = true', [kod.toUpperCase()]);
    if (kupon.rows.length === 0) return cevap.status(404).json({ mesaj: 'Geçersiz veya süresi dolmuş kupon' });
    cevap.json(kupon.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
