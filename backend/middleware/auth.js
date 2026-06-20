const jwt = require('jsonwebtoken');

const dogrula = (istek, cevap, sonraki) => {
  const token = istek.header('x-auth-token');

  if (!token) {
    return cevap.status(401).json({ mesaj: 'Token yok, yetkilendirme reddedildi' });
  }

  try {
    const cozulen = jwt.verify(token, process.env.JWT_SECRET || 'plexa_gizli_anahtar');
    istek.kullanici = cozulen.kullanici;
    sonraki();
  } catch (hata) {
    cevap.status(401).json({ mesaj: 'Token geçersiz' });
  }
};

module.exports = dogrula;
