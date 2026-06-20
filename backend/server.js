require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const uygulama = express();
const port = process.env.PORT || 5000;

// 1. güvenlik başlıkları (helmet)
uygulama.use(helmet());

// 2. cors ayarları
uygulama.use(cors());

// 3. genel hız sınırlama (tüm isteklere 15 dakikada maks 100 istek)
const genelLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: { mesaj: 'Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});
uygulama.use('/api/', genelLimit);

// 4. giriş ve kayıt için daha sıkı limitler (brute-force önlemi)
const authLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,
  message: { mesaj: 'Çok fazla giriş denemesi yaptınız, lütfen bir saat sonra tekrar deneyin.' }
});
uygulama.use('/api/auth/giris', authLimit);
uygulama.use('/api/auth/kayit', authLimit);

// 5. istek gövdesi boyut sınırı (payload denial of service önlemi)
uygulama.use(express.json({ limit: '10kb' }));
uygulama.use(express.urlencoded({ limit: '10kb', extended: true }));

// rotalar
uygulama.get('/', (req, res) => {
  res.status(200).json({ mesaj: 'Plexa API Sunucusu Aktif', durum: 'çalışıyor' });
});
uygulama.use('/api', require('./routes/genelRoutes'));
uygulama.use('/api/auth', require('./routes/authRoutes'));
uygulama.use('/api/kartlar', require('./routes/kartRoutes'));
uygulama.use('/api/favoriler', require('./routes/favoriRoutes'));
uygulama.use('/api/sepet', require('./routes/sepetRoutes'));
uygulama.use('/api/adresler', require('./routes/adresRoutes'));
uygulama.use('/api/urunler', require('./routes/urunRoutes'));
uygulama.use('/api/siparisler', require('./routes/siparisRoutes'));
uygulama.use('/api/iadeler', require('./routes/iadeRoutes'));
uygulama.use('/api/kuponlar', require('./routes/kuponRoutes'));
uygulama.use('/api/satici', require('./routes/saticiRoutes'));
uygulama.use('/api/admin', require('./routes/adminRoutes'));
uygulama.use('/api/yorumlar', require('./routes/yorumRoutes'));

// sunucuyu başlat
uygulama.listen(port, () => {
  console.log(`sunucu ${port} portunda çalışıyor`);
});
