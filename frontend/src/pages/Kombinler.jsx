import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UrunContext } from '../context/UrunContext';
import { API_URL } from '../config';
import UrunKarti from '../components/UrunKarti';
import { motion } from 'framer-motion';
import { Sun, Snowflake, Sparkles, Wind, Umbrella, Coffee, Shirt } from 'lucide-react';
import Loader from '../components/Loader';

const Kombinler = () => {
  const { tip } = useParams(); // 'yaz' veya 'kis'
  const { urunler } = useContext(UrunContext);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [ayarVerisi, setAyarVerisi] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ayarlar`)
      .then(res => res.json())
      .then(data => {
        if (data.kombinler) setAyarVerisi(data.kombinler);
      })
      .catch(err => console.error(err))
      .finally(() => setYukleniyor(false));
  }, []);

  const isYaz = tip === 'yaz';
  const mevsimVerisi = ayarVerisi ? (isYaz ? ayarVerisi.yaz : ayarVerisi.kis) : [];
  
  const modaUrunleri = urunler.filter(u => u.kategori === 'Moda' || u.kategori === 'Aksesuar');
  
  const mevsimRenkleri = isYaz 
    ? { ana: '#fbbf24', koyu: '#f59e0b', hafif: 'rgba(251, 191, 36, 0.1)', gradyan: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }
    : { ana: '#60a5fa', koyu: '#1d4ed8', hafif: 'rgba(96, 165, 250, 0.1)', gradyan: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)' };

  if (yukleniyor) return <Loader fullPage />;

  return (
    <div style={{ background: isYaz ? 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.05), transparent)' : 'radial-gradient(circle at top right, rgba(96, 165, 250, 0.05), transparent)', minHeight: '100vh' }}>
      <div className="kapsayici" style={{ padding: '80px 0' }}>
        
        {/* hero bölümü */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="kombin-hero"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="kombin-hero-ikon"
          >
            {isYaz ? <Sun size={120} color={mevsimRenkleri.ana} /> : <Snowflake size={120} color={mevsimRenkleri.ana} />}
          </motion.div>
          <h1 className="kombin-baslik">
            {isYaz ? 'Yaz Koleksiyonu' : 'Kış Koleksiyonu'}
          </h1>
          <p className="kombin-alt-baslik">
            {isYaz 
              ? 'Güneşin enerjisini stilinize yansıtın. Keten dokular, canlı renkler ve ferah kesimlerle yazın tadını çıkarın.' 
              : 'Soğuk havalarda stilinizden ödün vermeyin. Yün dokular, koyu tonlar ve ikonik katmanlarla kışı karşılayın.'}
          </p>
        </motion.div>

        {/* içerik bölümleri - dinamik */}
        <div className="kombin-icerik-alani">
          
          {mevsimVerisi.map((kombin, idx) => (
            <section key={kombin.id}>
              <div className="kombin-bolum-izgara">
                <motion.div whileHover={{ scale: 1.02 }} className="kombin-bolum-resim">
                  <img src={kombin.resim} alt={kombin.isim} />
                </motion.div>
                <div>
                  <div className="mevsim-etiket" style={{ color: mevsimRenkleri.ana }}>
                    <Sparkles size={20} />
                    <span>Özel Seçki</span>
                  </div>
                  <h2 className="kombin-bolum-baslik">{kombin.isim}</h2>
                  <p className="kombin-bolum-metin">
                    Bu koleksiyon, {isYaz ? 'yazın ferahlığını' : 'kışın asaletini'} en iyi yansıtan özel parçalardan oluşturulmuştur. 
                    Plexa ekibi tarafından özenle seçilen bu {kombin.isim} stili ile fark yaratın.
                  </p>
                  <div className="kombin-stats">
                    <div className="stat-kart">
                      <span className="stat-etiket">Ürün Sayısı</span>
                      <span className="stat-deger">12+ Parça</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="urun-izgara">
                {modaUrunleri.slice(idx * 3, (idx + 1) * 3).map(urun => (
                  <UrunKarti key={urun.id} urun={urun} />
                ))}
              </div>
            </section>
          ))}

          {/* mevsim tanıtım afişi */}
          <motion.div 
            className="kombin-promo-banner"
            style={{ background: mevsimRenkleri.gradyan }}
          >
            <div className="promo-ikonlar">
              <div style={{ position: 'absolute', top: '10%', left: '10%' }}>{isYaz ? <Sun size={100} /> : <Snowflake size={100} />}</div>
              <div style={{ position: 'absolute', bottom: '10%', right: '10%' }}>{isYaz ? <Sun size={80} /> : <Snowflake size={80} />}</div>
            </div>
            
            <h2 className="kombin-promo-baslik">
              {isYaz ? 'Güneşin Tadını Çıkarın' : 'Soğuğa Tarzınızla Meydan Okuyun'}
            </h2>
            <p className="kombin-promo-metin">
              {isYaz 
                ? 'Sezonun en hit parçalarında kaçırılmayacak fırsatlar başladı.' 
                : 'Kış gardırobunuzu yenilemek için en doğru zaman.'}
            </p>
            <div className="promo-buton-grup">
              <button className="promo-ana-buton">
                {isYaz ? 'Yazı Keşfet' : 'Kışı Keşfet'} <Sparkles size={18} />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Kombinler;
