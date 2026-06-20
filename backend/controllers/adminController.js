const havuz = require('../db');

// @desc    admin istatistiklerini getir
// @route   GET /api/admin/istatistikler
exports.getIstatistikler = async (istek, cevap) => {
  try {
    const toplamSatis = await havuz.query('SELECT SUM(toplam_tutar) FROM siparisler');
    const toplamKullanici = await havuz.query('SELECT COUNT(*) FROM kullanicilar');
    const toplamSiparis = await havuz.query('SELECT COUNT(*) FROM siparisler');
    const toplamUrun = await havuz.query('SELECT COUNT(*) FROM urunler');

    const satisGrafik = await havuz.query(`
      SELECT 
        to_char(olusturulma_tarihi, 'Dy') as name,
        SUM(toplam_tutar) as satis
      FROM siparisler 
      WHERE olusturulma_tarihi >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY name, olusturulma_tarihi
      ORDER BY olusturulma_tarihi ASC
    `);

    cevap.json({
      toplamSatis: toplamSatis.rows[0].sum || 0,
      toplamKullanici: toplamKullanici.rows[0].count,
      toplamSiparis: toplamSiparis.rows[0].count,
      toplamUrun: toplamUrun.rows[0].count,
      grafikVerisi: satisGrafik.rows
    });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    tüm kullanıcıları getir
// @route   GET /api/admin/kullanicilar
exports.getKullanicilar = async (istek, cevap) => {
  try {
    const kullanicilar = await havuz.query('SELECT id, isim, email, rol, olusturulma_tarihi FROM kullanicilar ORDER BY olusturulma_tarihi DESC');
    cevap.json(kullanicilar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kullanıcı sil
// @route   DELETE /api/admin/kullanicilar/:id
exports.kullaniciSil = async (istek, cevap) => {
  try {
    const { id } = istek.params;
    if (id == istek.kullanici.id) return cevap.status(400).json({ mesaj: 'Kendinizi silemezsiniz' });
    
    await havuz.query('DELETE FROM kullanicilar WHERE id = $1', [id]);
    cevap.json({ mesaj: 'Kullanıcı başarıyla silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kullanıcı rolü güncelle
// @route   PUT /api/admin/kullanicilar/:id/rol
exports.kullaniciRolGuncelle = async (istek, cevap) => {
  const { rol } = istek.body;
  try {
    await havuz.query('UPDATE kullanicilar SET rol = $1 WHERE id = $2', [rol, istek.params.id]);
    cevap.json({ mesaj: 'Rol güncellendi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    tüm siparişleri getir
// @route   GET /api/admin/tum-siparisler
exports.getTumSiparisler = async (istek, cevap) => {
  try {
    const siparisler = await havuz.query(`
      SELECT s.*, k.isim as alici_isim, k.email as alici_email
      FROM siparisler s
      JOIN kullanicilar k ON s.kullanici_id = k.id
      ORDER BY s.olusturulma_tarihi DESC
    `);
    cevap.json(siparisler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    tüm iadeleri getir
// @route   GET /api/admin/tum-iadeler
exports.getTumIadeler = async (istek, cevap) => {
  try {
    const iadeler = await havuz.query(`
      SELECT i.*, u.isim as urun_isim, k.isim as kullanici_isim
      FROM iadeler i
      JOIN urunler u ON i.urun_id = u.id
      JOIN kullanicilar k ON i.kullanici_id = k.id
      ORDER BY i.olusturulma_tarihi DESC
    `);
    cevap.json(iadeler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ürünü sil (herhangi biri)
// @route   DELETE /api/admin/urunler/:id
exports.adminUrunSil = async (istek, cevap) => {
  try {
    const { id } = istek.params;
    await havuz.query('DELETE FROM iadeler WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM sepet WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM favoriler WHERE urun_id = $1', [id]);
    await havuz.query('DELETE FROM siparis_kalemleri WHERE urun_id = $1', [id]);
    
    await havuz.query('DELETE FROM urunler WHERE id = $1', [id]);
    cevap.json({ mesaj: 'Ürün admin tarafından silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
