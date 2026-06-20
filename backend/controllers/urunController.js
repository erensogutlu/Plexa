const havuz = require('../db');

// @desc    tüm ürünleri getir
// @route   GET /api/urunler
exports.tumUrunleriGetir = async (istek, cevap) => {
  try {
    const sorguSonucu = await havuz.query('SELECT * FROM urunler ORDER BY id DESC');
    cevap.json(sorguSonucu.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ürün ekle
// @route   POST /api/urunler
exports.urunEkle = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') {
    return cevap.status(403).json({ mesaj: 'Sadece satıcılar ürün ekleyebilir' });
  }

  const { isim, aciklama, fiyat, resim_url, ek_resimler, kategori, ozellikler, teknik_detaylar } = istek.body;

  try {
    const yeniUrun = await havuz.query(
      'INSERT INTO urunler (isim, aciklama, fiyat, resim_url, ek_resimler, kategori, satici_id, ozellikler, teknik_detaylar) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [isim, aciklama, fiyat, resim_url, ek_resimler, kategori, istek.kullanici.id, JSON.stringify(ozellikler), JSON.stringify(teknik_detaylar)]
    );
    cevap.json(yeniUrun.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ürün güncelle
// @route   PUT /api/urunler/:id
exports.urunGuncelle = async (istek, cevap) => {
  const { id } = istek.params;
  const { isim, aciklama, fiyat, resim_url, ek_resimler, kategori, ozellikler, teknik_detaylar } = istek.body;

  try {
    const urun = await havuz.query('SELECT * FROM urunler WHERE id = $1', [id]);
    if (urun.rows.length === 0) return cevap.status(404).json({ mesaj: 'Ürün bulunamadı' });

    if (urun.rows[0].satici_id !== istek.kullanici.id) {
      return cevap.status(403).json({ mesaj: 'Bu işlemi yapmak için yetkiniz yok' });
    }

    const guncelUrun = await havuz.query(
      'UPDATE urunler SET isim = $1, aciklama = $2, fiyat = $3, resim_url = $4, ek_resimler = $5, kategori = $6, ozellikler = $7, teknik_detaylar = $8 WHERE id = $9 RETURNING *',
      [isim, aciklama, fiyat, resim_url, ek_resimler, kategori, JSON.stringify(ozellikler), JSON.stringify(teknik_detaylar), id]
    );
    cevap.json(guncelUrun.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ürün sil
// @route   DELETE /api/urunler/:id
exports.urunSil = async (istek, cevap) => {
  const { id } = istek.params;
  try {
    const urun = await havuz.query('SELECT * FROM urunler WHERE id = $1', [id]);
    if (urun.rows.length === 0) return cevap.status(404).json({ mesaj: 'Ürün bulunamadı' });

    if (urun.rows[0].satici_id !== istek.kullanici.id) {
      return cevap.status(403).json({ mesaj: 'Bu işlemi yapmak için yetkiniz yok' });
    }

    // ilişkili kayıtları temizle
    await havuz.query('DELETE FROM iadeler WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM sepet WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM favoriler WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM siparis_kalemleri WHERE urun_id = $1', [id]);

    await havuz.query('DELETE FROM urunler WHERE id = $1', [id]);
    cevap.json({ mesaj: 'Ürün başarıyla silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
