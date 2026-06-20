const havuz = require('../db');

// @desc    yorum ekle
// @route   POST /api/yorumlar
exports.yorumEkle = async (istek, cevap) => {
  const { urunId, puan, yorum } = istek.body;
  const kullaniciId = istek.kullanici.id;

  try {
    const mevcutYorum = await havuz.query(
      'SELECT id FROM yorumlar WHERE urun_id = $1 AND kullanici_id = $2',
      [urunId, kullaniciId]
    );
    if (mevcutYorum.rows.length > 0) {
      return cevap.status(400).json({ mesaj: 'Bu ürüne zaten yorum yaptınız.' });
    }

    const satinAlindi = await havuz.query(
      'SELECT s.id FROM siparisler s JOIN siparis_kalemleri sk ON s.id = sk.siparis_id WHERE s.kullanici_id = $1 AND sk.urun_id = $2 AND s.durum = \'Teslim Edildi\'',
      [kullaniciId, urunId]
    );

    if (satinAlindi.rows.length === 0) {
      return cevap.status(403).json({ mesaj: 'Yorum yapabilmek için ürünü satın almış ve teslim almış olmalısınız.' });
    }

    const yeniYorum = await havuz.query(
      'INSERT INTO yorumlar (urun_id, kullanici_id, puan, yorum) VALUES ($1, $2, $3, $4) RETURNING *',
      [urunId, kullaniciId, puan, yorum]
    );
    cevap.json(yeniYorum.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    yorum yapma yetkisi kontrolü
// @route   GET /api/yorumlar/kontrol/:urunId
exports.yorumKontrol = async (istek, cevap) => {
  const { urunId } = istek.params;
  const kullaniciId = istek.kullanici.id;

  try {
    const mevcutYorum = await havuz.query(
      'SELECT id FROM yorumlar WHERE urun_id = $1 AND kullanici_id = $2',
      [urunId, kullaniciId]
    );

    const satinAlindi = await havuz.query(
      'SELECT s.id FROM siparisler s JOIN siparis_kalemleri sk ON s.id = sk.siparis_id WHERE s.kullanici_id = $1 AND sk.urun_id = $2 AND s.durum = \'Teslim Edildi\'',
      [kullaniciId, urunId]
    );

    cevap.json({
      yorumYapabilir: satinAlindi.rows.length > 0 && mevcutYorum.rows.length === 0,
      zatenYorumYapti: mevcutYorum.rows.length > 0,
      satinAlmadi: satinAlindi.rows.length === 0
    });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    ürüne ait yorumları getir
// @route   GET /api/yorumlar/urun/:urunId
exports.getUrunYorumlari = async (istek, cevap) => {
  try {
    const yorumlar = await havuz.query(
      'SELECT y.*, k.isim as kullanici_isim FROM yorumlar y JOIN kullanicilar k ON y.kullanici_id = k.id WHERE y.urun_id = $1 ORDER BY y.olusturulma_tarihi DESC',
      [istek.params.urunId]
    );
    cevap.json(yorumlar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kullanıcının kendi yorumlarını getir (alıcı)
// @route   GET /api/admin/yorumlarim
exports.getYorumlarim = async (istek, cevap) => {
  try {
    const yorumlar = await havuz.query(
      'SELECT y.*, u.isim as urun_isim, u.resim_url FROM yorumlar y JOIN urunler u ON y.urun_id = u.id WHERE y.kullanici_id = $1 ORDER BY y.olusturulma_tarihi DESC',
      [istek.kullanici.id]
    );
    cevap.json(yorumlar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    satıcıya gelen yorumları getir
// @route   GET /api/admin/gelen-yorumlar
exports.getGelenYorumlar = async (istek, cevap) => {
  try {
    const yorumlar = await havuz.query(
      `SELECT y.*, u.isim as urun_isim, k.isim as kullanici_isim 
       FROM yorumlar y 
       JOIN urunler u ON y.urun_id = u.id 
       JOIN kullanicilar k ON y.kullanici_id = k.id 
       WHERE u.satici_id = $1 
       ORDER BY y.olusturulma_tarihi DESC`,
      [istek.kullanici.id]
    );
    cevap.json(yorumlar.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    yorum sil
// @route   DELETE /api/yorumlar/:id
exports.yorumSil = async (istek, cevap) => {
  try {
    const yorum = await havuz.query('SELECT * FROM yorumlar WHERE id = $1', [istek.params.id]);
    if (yorum.rows.length === 0) return cevap.status(404).json({ mesaj: 'Yorum bulunamadı' });
    
    if (yorum.rows[0].kullanici_id !== istek.kullanici.id && istek.kullanici.rol !== 'admin') {
      return cevap.status(401).json({ mesaj: 'Yetkisiz işlem' });
    }

    await havuz.query('DELETE FROM yorumlar WHERE id = $1', [istek.params.id]);
    cevap.json({ mesaj: 'Yorum silindi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    satıcı cevabı ekle/güncelle
// @route   PUT /api/yorumlar/:id/cevap
exports.yorumCevapla = async (istek, cevap) => {
  const { id } = istek.params;
  const { cevap: mesaj } = istek.body;
  
  if (istek.kullanici.rol !== 'satici') {
    return cevap.status(403).json({ mesaj: 'Sadece satıcılar cevap verebilir.' });
  }

  try {
    const yorum = await havuz.query(`
      SELECT y.*, u.satici_id 
      FROM yorumlar y 
      JOIN urunler u ON y.urun_id = u.id 
      WHERE y.id = $1
    `, [id]);

    if (yorum.rows.length === 0) {
      return cevap.status(404).json({ mesaj: 'Yorum bulunamadı.' });
    }

    if (yorum.rows[0].satici_id !== istek.kullanici.id) {
      return cevap.status(403).json({ mesaj: 'Sadece kendi ürününüze gelen yorumlara cevap verebilirsiniz.' });
    }

    const guncelYorum = await havuz.query(
      'UPDATE yorumlar SET cevap = $1, cevap_tarihi = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [mesaj, id]
    );

    cevap.json(guncelYorum.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
