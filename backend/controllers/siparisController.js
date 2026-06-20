const havuz = require('../db');

// @desc    sipariş oluştur
// @route   POST /api/siparisler
exports.siparisOlustur = async (istek, cevap) => {
  const { toplam_tutar, adres_id, kalemler, adres_detaylari, odeme_detaylari, kupon_kodu } = istek.body;
  
  try {
    let uygulamaKuponu = null;
    if (kupon_kodu) {
      const kuponSonuc = await havuz.query('SELECT * FROM kuponlar WHERE kod = $1 AND aktif = true', [kupon_kodu.toUpperCase()]);
      if (kuponSonuc.rows.length > 0) {
        uygulamaKuponu = kuponSonuc.rows[0];
      }
    }

    const yeniSiparis = await havuz.query(
      'INSERT INTO siparisler (kullanici_id, toplam_tutar, adres_id, adres_detaylari, odeme_detaylari, kupon_kodu) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [istek.kullanici.id, toplam_tutar, adres_id, JSON.stringify(adres_detaylari), JSON.stringify(odeme_detaylari), kupon_kodu?.toUpperCase()]
    );
    
    const siparisId = yeniSiparis.rows[0].id;
    
    for (const kalem of kalemler) {
      let finalFiyat = kalem.fiyat;
      
      if (uygulamaKuponu && uygulamaKuponu.satici_id === kalem.satici_id) {
        finalFiyat = Number(kalem.fiyat) * (1 - uygulamaKuponu.indirim_yuzdesi / 100);
      }

      await havuz.query(
        'INSERT INTO siparis_kalemleri (siparis_id, urun_id, adet, fiyat, satici_id) VALUES ($1, $2, $3, $4, $5)',
        [siparisId, kalem.id, kalem.adet, finalFiyat, kalem.satici_id]
      );
    }

    await havuz.query('DELETE FROM sepet WHERE kullanici_id = $1', [istek.kullanici.id]);
    
    cevap.json({ mesaj: 'Sipariş başarıyla oluşturuldu', siparisId });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    kullanıcının siparişlerini getir
// @route   GET /api/siparisler
exports.siparisleriGetir = async (istek, cevap) => {
  try {
    const siparisler = await havuz.query(`
      SELECT 
        s.*,
        json_agg(json_build_object(
          'id', u.id, 
          'isim', u.isim, 
          'adet', sk.adet, 
          'fiyat', sk.fiyat, 
          'resim_url', u.resim_url,
          'satici_id', sk.satici_id,
          'iade_durumu', (SELECT durum FROM iadeler WHERE siparis_id = s.id AND urun_id = u.id LIMIT 1)
        )) as urunler
      FROM siparisler s
      JOIN siparis_kalemleri sk ON s.id = sk.siparis_id
      JOIN urunler u ON sk.urun_id = u.id
      WHERE s.kullanici_id = $1
      GROUP BY s.id
      ORDER BY s.olusturulma_tarihi DESC
    `, [istek.kullanici.id]);
    cevap.json(siparisler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    satıcının siparişlerini getir
// @route   GET /api/satici/siparisler
exports.saticiSiparisleriGetir = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  
  try {
    const siparisler = await havuz.query(`
      SELECT 
        s.id as siparis_id,
        s.durum,
        s.olusturulma_tarihi,
        s.toplam_tutar,
        s.adres_detaylari,
        s.odeme_detaylari,
        s.kupon_kodu,
        k.isim as alici_isim,
        k.email as alici_email,
        json_agg(json_build_object(
          'id', u.id, 
          'isim', u.isim, 
          'adet', sk.adet, 
          'fiyat', sk.fiyat, 
          'resim_url', u.resim_url,
          'kategori', u.kategori,
          'gorunur', sk.satici_gorunur
        )) as urunler
      FROM siparis_kalemleri sk
      JOIN siparisler s ON sk.siparis_id = s.id
      JOIN urunler u ON sk.urun_id = u.id
      JOIN kullanicilar k ON s.kullanici_id = k.id
      WHERE sk.satici_id = $1
      GROUP BY s.id, k.isim, k.email
      ORDER BY s.olusturulma_tarihi DESC
    `, [istek.kullanici.id]);
    
    cevap.json(siparisler.rows);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    sipariş durumunu güncelle
// @route   PUT /api/satici/siparisler/:id
exports.siparisDurumuGuncelle = async (istek, cevap) => {
  const { durum } = istek.body;
  try {
    await havuz.query('UPDATE siparisler SET durum = $1 WHERE id = $2', [durum, istek.params.id]);
    cevap.json({ mesaj: 'Durum güncellendi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    siparişi gizle (satıcı için)
// @route   DELETE /api/satici/siparisler/:id
exports.siparisGizle = async (istek, cevap) => {
  if (istek.kullanici.rol !== 'satici') return cevap.status(403).send('Yetkiniz yok');
  
  try {
    await havuz.query(
      'UPDATE siparis_kalemleri SET satici_gorunur = false WHERE siparis_id = $1 AND satici_id = $2',
      [istek.params.id, istek.kullanici.id]
    );
    
    cevap.json({ mesaj: 'Sipariş gizlendi' });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
