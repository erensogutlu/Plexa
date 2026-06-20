const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const havuz = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'plexa_gizli_anahtar';

// @desc    kayıt ol
// @route   POST /api/auth/kayit
exports.kayitOl = async (istek, cevap) => {
  const { isim, email, sifre, rol } = istek.body;

  try {
    let kullanici = await havuz.query('SELECT * FROM kullanicilar WHERE email = $1', [email]);
    if (kullanici.rows.length > 0) {
      return cevap.status(400).json({ mesaj: 'Bu email zaten kullanımda' });
    }

    const tuz = await bcrypt.genSalt(10);
    const sifreHashed = await bcrypt.hash(sifre, tuz);

    const yeniKullanici = await havuz.query(
      'INSERT INTO kullanicilar (isim, email, sifre, rol) VALUES ($1, $2, $3, $4) RETURNING id, isim, email, rol',
      [isim, email, sifreHashed, rol]
    );

    const payload = {
      kullanici: {
        id: yeniKullanici.rows[0].id,
        rol: yeniKullanici.rows[0].rol
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (hata, token) => {
      if (hata) throw hata;
      cevap.json({ token, kullanici: yeniKullanici.rows[0] });
    });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    giriş yap
// @route   POST /api/auth/giris
exports.girisYap = async (istek, cevap) => {
  const { email, sifre } = istek.body;

  try {
    const kullanici = await havuz.query('SELECT * FROM kullanicilar WHERE email = $1', [email]);
    if (kullanici.rows.length === 0) {
      return cevap.status(400).json({ mesaj: 'Geçersiz bilgiler' });
    }

    const sifreDogru = await bcrypt.compare(sifre, kullanici.rows[0].sifre);
    if (!sifreDogru) {
      return cevap.status(400).json({ mesaj: 'Geçersiz bilgiler' });
    }

    const payload = {
      kullanici: {
        id: kullanici.rows[0].id,
        rol: kullanici.rows[0].rol
      }
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' }, (hata, token) => {
      if (hata) throw hata;
      cevap.json({ 
        token, 
        kullanici: {
          id: kullanici.rows[0].id,
          isim: kullanici.rows[0].isim,
          email: kullanici.rows[0].email,
          rol: kullanici.rows[0].rol
        } 
      });
    });
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    mevcut kullanıcıyı getir
// @route   GET /api/auth/me
exports.mevcutKullaniciGetir = async (istek, cevap) => {
  try {
    const kullanici = await havuz.query('SELECT id, isim, email, rol FROM kullanicilar WHERE id = $1', [istek.kullanici.id]);
    cevap.json(kullanici.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};

// @desc    profil güncelle
// @route   PUT /api/auth/profil
exports.profilGuncelle = async (istek, cevap) => {
  const { isim, email } = istek.body;
  try {
    const guncelKullanici = await havuz.query(
      'UPDATE kullanicilar SET isim = $1, email = $2 WHERE id = $3 RETURNING id, isim, email, rol',
      [isim, email, istek.kullanici.id]
    );
    cevap.json(guncelKullanici.rows[0]);
  } catch (hata) {
    console.error(hata.message);
    cevap.status(500).send('sunucu hatası');
  }
};
