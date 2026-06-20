import { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UrunContext } from '../context/UrunContext';
import { SepetContext } from '../context/SepetContext';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, X, Heart, Star, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import UrunKarti from '../components/UrunKarti';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

const UrunDetay = () => {
  const { id } = useParams();
  const { urunler, yukleniyor, hata } = useContext(UrunContext);
  const { sepeteEkle, favoriler, favoriEkleCikar } = useContext(SepetContext);
  const { kullanici } = useContext(AuthContext);
  const { formatFiyat } = useContext(SettingsContext);
  const [seciliResim, setSeciliResim] = useState(null);
  const [lightboxAcik, setLightboxAcik] = useState(false);
  const [yorumlar, setYorumlar] = useState([]);
  const [yeniYorum, setYeniYorum] = useState('');
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yorumGonderiliyor, setYorumGonderiliyor] = useState(false);
  const [yorumYetkisi, setYorumYetkisi] = useState({ yorumYapabilir: false, zatenYorumYapti: false, satinAlmadi: true });
  const [tumYorumlarAcik, setTumYorumlarAcik] = useState(false);

  const urun = urunler.find(u => u.id === parseInt(id));
  const isFavori = favoriler.some(f => f.id === parseInt(id));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (urun) {
      setSeciliResim(urun.resim_url);
      yorumlarıGetir();
    }
  }, [id, urun]);

  const yorumlarıGetir = async () => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/yorumlar/urun/${id}`);
      if (cevap.ok) {
        setYorumlar(await cevap.json());
      }
      if (kullanici) yetkiKontrol();
    } catch (err) { console.error(err); }
  };

  const yetkiKontrol = async () => {
    try {
      const cevap = await fetch(`http://localhost:5000/api/yorumlar/kontrol/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (cevap.ok) {
        setYorumYetkisi(await cevap.json());
      }
    } catch (err) { console.error(err); }
  };

  const yorumEkle = async (e) => {
    e.preventDefault();
    if (!kullanici) return alert('Lütfen önce giriş yapın');
    setYorumGonderiliyor(true);
    try {
      const cevap = await fetch('http://localhost:5000/api/yorumlar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ urunId: id, puan: yeniPuan, yorum: yeniYorum })
      });
      if (cevap.ok) {
        setYeniYorum('');
        setYeniPuan(5);
        yorumlarıGetir();
        yetkiKontrol();
      }
    } catch (err) { console.error(err); } finally { setYorumGonderiliyor(false); }
  };

  if (yukleniyor) return <Loader fullPage />;
  if (hata) return <div className="yukleniyor">Hata: {hata}</div>;
  if (!urun) return <div className="yukleniyor">Ürün bulunamadı.</div>;

  const tumResimler = [urun.resim_url, ...(urun.ek_resimler || [])];

  const benzerUrunler = urunler
    .filter(u => u.kategori === urun.kategori && u.id !== urun.id)
    .slice(0, 3);

  return (
    <motion.div 
      className="kapsayici" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingBottom: '100px' }}
    >
      <Link to="/" className="geri-don-link" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '8px', 
        marginTop: '40px', 
        color: 'var(--metin-ikincil)',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'var(--gecis-hizi)',
        marginBottom: '20px'
      }}>
        <ArrowLeft size={20} /> Mağazaya Dön
      </Link>
      
      <div className="detay-kapsayici">
        <motion.div 
          className="galeri-kapsayici"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mini-resim-listesi">
            {tumResimler.map((resim, index) => (
              <div 
                key={index} 
                className={`mini-resim ${seciliResim === resim ? 'aktif' : ''}`}
                onClick={() => setSeciliResim(resim)}
              >
                <img src={resim} alt={`${urun.isim}-${index}`} />
              </div>
            ))}
          </div>
          
          <div className="ana-resim-kapsayici" onClick={() => setLightboxAcik(true)}>
            <motion.img 
              key={seciliResim}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={seciliResim} 
              alt={urun.isim} 
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="detay-bilgi"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="detay-kategori">{urun.kategori}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{urun.isim}</h1>
            <button 
              onClick={() => favoriEkleCikar(urun.id)}
              style={{ 
                background: isFavori ? '#ef4444' : 'rgba(255, 255, 255, 0.05)', 
                padding: '12px', 
                borderRadius: '15px',
                color: 'white',
                border: '1px solid var(--kart-sinir)'
              }}
            >
              <Heart size={24} fill={isFavori ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="detay-aciklama" style={{ fontSize: '1.1rem', lineHeight: '1.7' }}>{urun.aciklama}</p>
          
          <div className="detay-ozellikler" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="ozellik-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--metin-ikincil)' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)' }}>
                <ShieldCheck size={20} color="var(--vurgu-rengi)" />
              </div>
              <span>{urun.ozellikler?.garanti || '2 Yıl Resmi Distribütör Garantili'}</span>
            </div>
            <div className="ozellik-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--metin-ikincil)' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)' }}>
                <Truck size={20} color="var(--vurgu-rengi)" />
              </div>
              <span>{urun.ozellikler?.teslimat || 'Ücretsiz ve Hızlı Teslimat'}</span>
            </div>
            <div className="ozellik-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--metin-ikincil)' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)' }}>
                <RotateCcw size={20} color="var(--vurgu-rengi)" />
              </div>
              <span>{urun.ozellikler?.iade || '30 Gün İçinde Kolay İade'}</span>
            </div>
          </div>

          <div className="detay-fiyat" style={{ fontSize: '3rem', color: 'var(--metin-ana)', marginBottom: '30px' }}>{formatFiyat(urun.fiyat)}</div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button 
              onClick={() => sepeteEkle(urun.id)}
              className="btn-ana" 
              style={{ padding: '20px 50px', fontSize: '1.2rem', borderRadius: '20px', flex: 1 }}
            >
              <ShoppingCart size={24} />
              Sepete Ekle
            </button>
            <button 
              className={`kalp-butonu ${isFavori ? 'aktif' : ''}`}
              onClick={() => favoriEkleCikar(urun.id)}
            >
              <Heart size={28} fill={isFavori ? "currentColor" : "none"} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* teknik detaylar bölümü */}
      <div style={{ marginTop: '80px' }}>
        <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Teknik Detaylar</h3>
        <div className="detay-ozellikler" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {(urun.teknik_detaylar || [
            { baslik: 'Malzeme', icerik: 'Yüksek kaliteli sürdürülebilir materyaller kullanılarak Plexa standartlarında üretilmiştir.' },
            { baslik: 'Teknoloji', icerik: 'En son nesil işlemci ve optimize edilmiş yazılım mimarisi ile maksimum performans.' },
            { baslik: 'Bağlantı', icerik: 'Ultra hızlı veri transferi ve düşük gecikme süreli kablosuz bağlantı protokolleri.' }
          ]).map((detay, index) => (
            <div key={index} className="ozellik-karti">
              <h5 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{detay.baslik}</h5>
              <p style={{ color: 'var(--metin-ikincil)' }}>{detay.icerik}</p>
            </div>
          ))}
        </div>
      </div>

      {/* yorumlar bölümü */}
      <div style={{ marginTop: '80px', marginBottom: '80px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800' }}>
          <MessageSquare size={32} color="var(--vurgu-rengi)" /> Müşteri Yorumları ({yorumlar.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          {/* yorum yap formu */}
          <div>
            <div className="ozellik-karti" style={{ padding: '30px', position: 'sticky', top: '120px' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Deneyiminizi Paylaşın</h3>
              {kullanici ? (
                yorumYetkisi.yorumYapabilir ? (
                  <form onSubmit={yorumEkle}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', color: 'var(--metin-ikincil)' }}>Puanınız</label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4, 5].map(p => (
                          <Star 
                            key={p} 
                            size={24} 
                            style={{ cursor: 'pointer' }}
                            fill={p <= yeniPuan ? "#fbbf24" : "none"}
                            color={p <= yeniPuan ? "#fbbf24" : "var(--metin-ikincil)"}
                            onClick={() => setYeniPuan(p)}
                          />
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '10px', color: 'var(--metin-ikincil)' }}>Yorumunuz</label>
                      <textarea 
                        value={yeniYorum}
                        onChange={(e) => setYeniYorum(e.target.value)}
                        placeholder="Ürün hakkındaki düşüncelerinizi yazın..."
                        required
                        style={{ 
                          width: '100%', 
                          minHeight: '120px', 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid var(--kart-sinir)', 
                          borderRadius: '15px', 
                          padding: '15px',
                          color: 'white',
                          resize: 'none',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button 
                      disabled={yorumGonderiliyor}
                      className="btn-ana" 
                      style={{ width: '100%', justifyContent: 'center', padding: '15px' }}
                    >
                      {yorumGonderiliyor ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <AlertCircle size={32} color="var(--vurgu-rengi)" style={{ marginBottom: '10px' }} />
                      <p style={{ color: 'var(--metin-ana)', fontWeight: '600', marginBottom: '5px' }}>
                        {yorumYetkisi.zatenYorumYapti 
                          ? 'Zaten bir yorumunuz bulunuyor.' 
                          : 'Sadece ürünü satın alan ve teslim alan müşteriler yorum yapabilir.'}
                      </p>
                      <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>
                        {yorumYetkisi.zatenYorumYapti 
                          ? 'Dürüst değerlendirmeniz için teşekkür ederiz.' 
                          : 'Ürünü satın aldıysanız siparişinizin "Teslim Edildi" olarak güncellenmesini bekleyin.'}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p style={{ color: 'var(--metin-ikincil)', marginBottom: '15px' }}>Yorum yapmak için giriş yapmalısınız.</p>
                  <Link to="/giris" className="btn-ana" style={{ display: 'inline-flex', padding: '10px 25px' }}>Giriş Yap</Link>
                </div>
              )}
            </div>
          </div>

          {/* yorum listesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {yorumlar.length > 0 ? (
              <>
                <AnimatePresence mode="popLayout">
                  {(tumYorumlarAcik ? yorumlar : yorumlar.slice(0, 3)).map(yorum => (
                    <motion.div 
                      key={yorum.id}
                      className="ozellik-karti" 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      viewport={{ once: true }}
                      style={{ padding: '25px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{yorum.kullanici_isim}</div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(p => (
                            <Star 
                              key={p} 
                              size={14} 
                              fill={p <= yorum.puan ? "#fbbf24" : "none"}
                              color={p <= yorum.puan ? "#fbbf24" : "var(--metin-ikincil)"}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.6' }}>{yorum.yorum}</p>
                      <div style={{ marginTop: '15px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{new Date(yorum.olusturulma_tarihi).toLocaleDateString('tr-TR')}</span>
                      </div>

                      {/* satıcı cevabı */}
                      {yorum.cevap && (
                        <div style={{ 
                          marginTop: '20px', 
                          padding: '15px 20px', 
                          background: 'rgba(99, 102, 241, 0.03)', 
                          borderRadius: '15px', 
                          borderLeft: '4px solid var(--vurgu-rengi)',
                          position: 'relative'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 8px', background: 'var(--vurgu-gradyan)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', color: 'white', textTransform: 'uppercase' }}>Satıcı Yanıtı</div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--metin-ikincil)' }}>{new Date(yorum.cevap_tarihi).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <p style={{ color: 'var(--metin-ana)', fontSize: '0.95rem', lineHeight: '1.5' }}>{yorum.cevap}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {yorumlar.length > 3 && (
                  <button 
                    onClick={() => setTumYorumlarAcik(!tumYorumlarAcik)}
                    style={{ 
                      marginTop: '10px',
                      padding: '15px',
                      borderRadius: '15px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--kart-sinir)',
                      color: 'var(--vurgu-rengi)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    {tumYorumlarAcik ? (
                      <>Daha Az Göster <X size={18} /></>
                    ) : (
                      <>Tüm Yorumları Gör ({yorumlar.length}) <ChevronRight size={18} /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '2px dashed var(--kart-sinir)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--metin-ikincil)' }}>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* benzer ürünler bölümü */}
      {benzerUrunler.length > 0 && (
        <div className="benzer-urunler">
          <h3 style={{ fontSize: '2rem', marginBottom: '40px', fontWeight: '800' }}>Benzer Ürünler</h3>
          <div className="urun-izgara">
            {benzerUrunler.map(u => (
              <UrunKarti key={u.id} urun={u} />
            ))}
          </div>
        </div>
      )}

      {/* lightbox modalı */}
      <AnimatePresence>
        {lightboxAcik && (
          <motion.div 
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxAcik(false)}
          >
            <motion.div 
              className="lightbox-kapat"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} />
            </motion.div>
            <motion.img 
              src={seciliResim} 
              alt={urun.isim} 
              className="lightbox-resim"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UrunDetay;
