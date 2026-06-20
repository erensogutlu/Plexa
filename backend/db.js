require('dotenv').config();
const { Pool } = require('pg');

const havuz = new Pool({
  connectionString: process.env.DATABASE_URL
});

// bağlantı testi
havuz.connect((hata, istemci, serbestBirak) => {
  if (hata) {
    return console.error('veritabanına bağlanırken hata oluştu', hata.stack);
  }
  console.log('veritabanına başarıyla bağlanıldı');
  serbestBirak();
});

module.exports = havuz;
