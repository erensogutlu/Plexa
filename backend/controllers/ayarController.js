const havuz = require('../db');

// @desc    tüm ayarları getir
// @route   GET /api/ayarlar
exports.getAyarlar = async (istek, cevap) => {
  try {
    const ayarlar = await havuz.query('SELECT anahtar, deger FROM site_ayarlari');
    const ayarObj = {};
    ayarlar.rows.forEach(row => {
      ayarObj[row.anahtar] = row.deger;
    });
    cevap.json(ayarObj);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ayar güncelle
// @route   PUT /api/admin/ayarlar/:anahtar
exports.ayarGuncelle = async (istek, cevap) => {
  const { anahtar } = istek.params;
  const { deger } = istek.body;
  try {
    await havuz.query(
      'INSERT INTO site_ayarlari (anahtar, deger) VALUES ($1, $2) ON CONFLICT (anahtar) DO UPDATE SET deger = EXCLUDED.deger',
      [anahtar, JSON.stringify(deger)]
    );
    cevap.json({ mesaj: 'Ayar güncellendi' });
  } catch (hata) {
    console.error('AYAR GUNCELLEME HATASI:', hata);
    cevap.status(500).json({ mesaj: 'Sunucu hatası', detay: hata.message });
  }
};

// @desc    kategorileri getir
// @route   GET /api/kategoriler
exports.getKategoriler = async (istek, cevap) => {
  try {
    const kats = await havuz.query('SELECT * FROM kategoriler ORDER BY isim ASC');
    cevap.json(kats.rows);
  } catch (hata) {
    console.error(hata);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kategori ekle
// @route   POST /api/admin/kategoriler
exports.kategoriEkle = async (istek, cevap) => {
  const { isim } = istek.body;
  try {
    const yeniKat = await havuz.query('INSERT INTO kategoriler (isim) VALUES ($1) RETURNING *', [isim]);
    cevap.json(yeniKat.rows[0]);
  } catch (hata) {
    console.error(hata);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kategori sil
// @route   DELETE /api/admin/kategoriler/:id
exports.kategoriSil = async (istek, cevap) => {
  try {
    await havuz.query('DELETE FROM kategoriler WHERE id = $1', [istek.params.id]);
    cevap.json({ mesaj: 'Kategori silindi' });
  } catch (hata) {
    console.error(hata);
    cevap.status(500).send('sunucu hatası');
  }
};
