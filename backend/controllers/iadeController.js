const havuz = require('../db');

// @desc    iade talebi oluştur
// @route   POST /api/iadeler
exports.iadeTalebiOlustur = async (istek, cevap) => {
  const { siparis_id, satici_id, urun_id, neden } = istek.body;
  try {
    const mevcutIade = await havuz.query(
      'SELECT id FROM iadeler WHERE siparis_id = $1 AND urun_id = $2',
      [siparis_id, urun_id]
    );

    if (mevcutIade.rows.length > 0) {
      return cevap.status(400).json({ mesaj: 'Bu ürün için zaten bir iade talebiniz bulunuyor.' });
    }

    const yeniIade = await havuz.query(
      'INSERT INTO iadeler (siparis_id, satici_id, urun_id, kullanici_id, neden) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [siparis_id, satici_id, urun_id, istek.kullanici.id, neden]
    );
    cevap.json(yeniIade.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    satıcıya gelen iade taleplerini getir
// @route   GET /api/satici/iadeler
exports.saticiIadeleriGetir = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  
  try {
    const iadeler = await havuz.query(`
      SELECT 
        i.*,
        u.isim as urun_isim,
        u.resim_url,
        k.isim as kullanici_isim,
        k.email as kullanici_email
      FROM iadeler i
      JOIN urunler u ON i.urun_id = u.id
      JOIN kullanicilar k ON i.kullanici_id = k.id
      WHERE i.satici_id = $1 AND i.satici_gorunur = true
      ORDER BY i.olusturulma_tarihi DESC
    `, [istek.kullanici.id]);
    
    cevap.json(iadeler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    iade bildirimini gizle
// @route   PUT /api/satici/iadeler/:id/gizle
exports.iadeGizle = async (istek, cevap) => {
  const { id } = istek.params;
  try {
    await havuz.query('UPDATE iadeler SET satici_gorunur = false WHERE id = $1 AND satici_id = $2', [id, istek.kullanici.id]);
    cevap.json({ mesaj: 'Bildirim temizlendi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    iade talebini onayla veya reddet
// @route   PUT /api/satici/iadeler/:id
exports.iadeDurumuGuncelle = async (istek, cevap) => {
  const { id } = istek.params;
  const { durum } = istek.body;
  
  try {
    const iade = await havuz.query('SELECT * FROM iadeler WHERE id = $1', [id]);
    if (iade.rows.length === 0) return cevap.status(404).json({ mesaj: 'İade talebi bulunamadı' });
    
    if (iade.rows[0].satici_id !== istek.kullanici.id) {
      return cevap.status(403).json({ mesaj: 'Yetkiniz yok' });
    }
    
    await havuz.query('UPDATE iadeler SET durum = $1 WHERE id = $2', [durum, id]);
    
    if (durum === 'Onaylandı') {
      await havuz.query('UPDATE siparisler SET durum = \'İade Edildi\' WHERE id = $1', [iade.rows[0].siparis_id]);
    }
    
    cevap.json({ mesaj: `İade talebi ${durum.toLowerCase()}!` });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
