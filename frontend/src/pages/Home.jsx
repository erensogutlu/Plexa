import { useContext, useState, useMemo, useEffect } from 'react';
import { UrunContext } from '../context/UrunContext';
import { API_URL } from '../config';
import UrunKarti from '../components/UrunKarti';
import Slider from '../components/Slider';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronRight, Truck, ShieldCheck, Headphones, RotateCcw, Zap, Sparkles } from 'lucide-react';

const Home = () => {
  const { urunler, yukleniyor: urunlerYukleniyor, hata } = useContext(UrunContext);
  const [sliderYukleniyor, setSliderYukleniyor] = useState(true);
  const [sliderVerisi, setSliderVerisi] = useState([]);
  
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliKategori, setSeciliKategori] = useState('Hepsi');
  const [fiyatAraligi, setFiyatAraligi] = useState(100000);

  const [veritabaniKategorileri, setVeritabaniKategorileri] = useState(['Hepsi']);

  useEffect(() => {
    // Slider verisi
    fetch(`${API_URL}/api/ayarlar`)
      .then(res => res.json())
      .then(data => {
        if (data.ana_slider) setSliderVerisi(data.ana_slider);
      })
      .catch(err => console.error(err))
      .finally(() => setSliderYukleniyor(false));

    // Kategori verisi
    fetch(`${API_URL}/api/kategoriler`)
      .then(res => res.json())
      .then(data => {
        const katIsimleri = data.map(k => k.isim);
        setVeritabaniKategorileri(['Hepsi', ...katIsimleri]);
      })
      .catch(err => console.error(err));
  }, []);

  const kategoriler = veritabaniKategorileri;

  const filtrelenmişUrunler = useMemo(() => {
    return urunler.filter(urun => {
      const aramaUyumu = urun.isim.toLowerCase().includes(aramaMetni.toLowerCase()) || 
                         urun.aciklama.toLowerCase().includes(aramaMetni.toLowerCase());
      const kategoriUyumu = seciliKategori === 'Hepsi' || urun.kategori === seciliKategori;
      const fiyatUyumu = Number(urun.fiyat) <= fiyatAraligi;
      return aramaUyumu && kategoriUyumu && fiyatUyumu;
    });
  }, [urunler, aramaMetni, seciliKategori, fiyatAraligi]);

  if (urunlerYukleniyor || sliderYukleniyor) return <Loader fullPage />;
  if (hata) return <div className="yukleniyor">Hata: {hata}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* slider bolumu */}
      <Slider slaytlar={sliderVerisi} />

      {/* güven çubuğu - her zaman görünür ve ortalı */}
      <div className="kapsayici" style={{ marginTop: '40px' }}>
        <div className="guven-cubugu">
          {[
            { icon: <Truck size={24} />, title: 'Hızlı Teslimat', desc: 'Aynı gün kargo imkanı' },
            { icon: <ShieldCheck size={24} />, title: 'Güvenli Ödeme', desc: '256-bit SSL koruması' },
            { icon: <Headphones size={24} />, title: '7/24 Destek', desc: 'Canlı yardım hattı' },
            { icon: <RotateCcw size={24} />, title: 'Kolay İade', desc: '30 gün içinde iade' }
          ].map((item, idx) => (
            <div key={idx} className="guven-kart">
              <div className="guven-ikon-kapsayici">{item.icon}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* kategorileri keşfet */}
      <div className="kapsayici" style={{ marginTop: '60px', textAlign: 'center' }}>
        <h3 className="bolum-baslik">Kategorileri Keşfet</h3>
        <div className="kategori-kesif">
          {kategoriler.filter(k => k !== 'Hepsi').map((kat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.1 }}
              onClick={() => setSeciliKategori(kat)}
              className="kategori-item"
            >
              <motion.div 
                whileHover={{ rotate: 5 }}
                className={`kategori-ikon-kapsayici ${seciliKategori === kat ? 'aktif' : ''}`}
              >
                {kat === 'Elektronik' ? <Zap size={35} /> : kat === 'Moda' ? <Sparkles size={35} /> : <SlidersHorizontal size={35} />}
              </motion.div>
              <h5 className={`kategori-isim ${seciliKategori === kat ? 'aktif' : ''}`}>{kat}</h5>
            </motion.div>
          ))}
        </div>
      </div>

      {/* kampanya afişleri */}
      <div className="kapsayici" style={{ marginTop: '60px' }}>
        <div className="kampanya-izgara">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="kampanya-kart teknoloji"
          >
            <div className="kampanya-kart-icerik">
              <span className="kampanya-etiket">SINIRLI SÜRE</span>
              <h3 className="kampanya-baslik">Plexa Exclusive</h3>
              <p className="kampanya-metin">Teknoloji ürünlerinde %30 indirim fırsatı.</p>
              <button className="kampanya-buton" style={{ color: '#6366f1' }}>Fırsatları Gör</button>
            </div>
            <Zap size={150} className="kampanya-ikon" style={{ transform: 'rotate(-20deg)' }} />
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="kampanya-kart moda"
          >
            <div className="kampanya-kart-icerik">
              <span className="kampanya-etiket">YENİ SEZON</span>
              <h3 className="kampanya-baslik">Moda Rüzgarı</h3>
              <p className="kampanya-metin">Yazın en hit parçaları koleksiyonumuzda.</p>
              <button className="kampanya-buton" style={{ color: '#a855f7' }}>Keşfet</button>
            </div>
            <Sparkles size={150} className="kampanya-ikon" style={{ transform: 'rotate(10deg)' }} />
          </motion.div>
        </div>
      </div>
      
      {/* ana içerik: filtreler ve ürünler */}
      <div className="kapsayici" style={{ marginTop: '60px' }}>
        <div className="ana-icerik-izgara">
          
          <aside className="filtre-paneli">
            <div className="ozellik-karti filtre-paneli-icerik">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
                <SlidersHorizontal size={20} color="var(--vurgu-rengi)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Filtrele</h3>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Ürün Ara</label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} />
                  <input 
                    type="text" 
                    placeholder="Kelime yazın..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', marginBottom: '15px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Kategoriler</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {kategoriler.map(kat => (
                    <button 
                      key={kat}
                      onClick={() => setSeciliKategori(kat)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px', borderRadius: '10px', 
                        background: seciliKategori === kat ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        color: seciliKategori === kat ? 'var(--vurgu-rengi)' : 'var(--metin-ikincil)',
                        border: seciliKategori === kat ? '1px solid var(--vurgu-rengi)' : '1px solid transparent',
                        transition: '0.2s', textAlign: 'left'
                      }}
                    >
                      {kat}
                      {seciliKategori === kat && <ChevronRight size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <label style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Maks. Fiyat</label>
                  <span style={{ color: 'var(--vurgu-rengi)', fontWeight: '700' }}>₺{fiyatAraligi.toLocaleString()}</span>
                </div>
                <input 
                  type="range" min="0" max="100000" step="1000"
                  value={fiyatAraligi}
                  onChange={(e) => setFiyatAraligi(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--vurgu-rengi)', cursor: 'pointer' }}
                />
              </div>
            </div>
          </aside>

          <main>
            <div className="urun-liste-baslik-alani">
              <h2 className="urun-liste-baslik">
                {seciliKategori === 'Hepsi' ? 'Tüm Ürünler' : seciliKategori}
              </h2>
              <span style={{ color: 'var(--metin-ikincil)' }}>{filtrelenmişUrunler.length} Ürün Listeleniyor</span>
            </div>

            {filtrelenmişUrunler.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px' }}>
                <Search size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                <h3>Sonuç Bulunamadı</h3>
                <button onClick={() => { setAramaMetni(''); setSeciliKategori('Hepsi'); setFiyatAraligi(100000); }} className="btn-ana" style={{ marginTop: '20px', marginInline: 'auto' }}>
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <motion.div className="urun-izgara" layout>
                <AnimatePresence>
                  {/* ürün listesi */}
                  {filtrelenmişUrunler.map((urun) => (
                    <motion.div key={urun.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <UrunKarti urun={urun} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
