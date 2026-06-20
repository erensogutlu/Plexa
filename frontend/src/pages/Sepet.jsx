import { useContext, useState, useEffect } from 'react';
import { SepetContext } from '../context/SepetContext';
import { API_URL } from '../config';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, CreditCard, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
import { SettingsContext } from '../context/SettingsContext';

const Sepet = () => {
  const { sepet, sepettenCikar, sepetiGetir } = useContext(SepetContext);
  const { ayarlar, formatFiyat, getParaSembol } = useContext(SettingsContext);
  const [adresler, setAdresler] = useState([]);
  const [kartlar, setKartlar] = useState([]);
  const [seciliAdresId, setSeciliAdresId] = useState(null);
  const [seciliKartId, setSeciliKartId] = useState(null);
  const [kartKaydet, setKartKaydet] = useState(false);
  const [odemeAdimi, setOdemeAdimi] = useState(1); // 1: sepet, 2: adres ve ödeme
  const [yukleniyor, setYukleniyor] = useState(false);
  const [kuponKodu, setKuponKodu] = useState('');
  const [uygulananKupon, setUygulananKupon] = useState(null);
  const [kuponHata, setKuponHata] = useState('');

  const [siparisTamam, setSiparisTamam] = useState(false);
  const [kartBilgileri, setKartBilgileri] = useState({
    kartNo: '',
    kartSahibi: '',
    skt: '',
    cvv: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    adresleriGetir();
    kartlariGetir();
  }, []);

  useEffect(() => {
    if (siparisTamam) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [siparisTamam, navigate]);

  if (yukleniyor) return <Loader fullPage />;

  const adresleriGetir = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const cevap = await fetch(`${API_URL}/api/adresler`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setAdresler(veri);
        if (veri.length > 0) setSeciliAdresId(veri[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const kartlariGetir = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const cevap = await fetch(`${API_URL}/api/kartlar`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setKartlar(veri);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKartChange = (e) => {
    setSeciliKartId(null);
    setKartBilgileri({ ...kartBilgileri, [e.target.name]: e.target.value });
  };

  const handleSeciliKart = (kart) => {
    setSeciliKartId(kart.id);
    setKartBilgileri({
      kartNo: kart.kart_no,
      kartSahibi: kart.kart_sahibi,
      skt: kart.skt,
      cvv: '***'
    });
  };

  const handleKuponDogrula = async () => {
    if (!kuponKodu.trim()) return;
    setYukleniyor(true);
    setKuponHata('');
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/kuponlar/dogrula`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ kod: kuponKodu })
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setUygulananKupon(veri);
        setKuponHata('');
      } else {
        const veri = await cevap.json();
        setKuponHata(veri.mesaj || 'Geçersiz kupon');
        setUygulananKupon(null);
      }
    } catch (err) {
      setKuponHata('Kupon doğrulanırken bir hata oluştu');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleOdeme = async () => {
    if (sepet.length === 0) return;
    
    if (odemeAdimi === 1) {
      setOdemeAdimi(2);
      return;
    }

    if (!seciliAdresId) {
      alert('Lütfen bir teslimat adresi seçin veya profilinizden ekleyin.');
      return;
    }

    if (!kartBilgileri.kartNo || !kartBilgileri.kartSahibi || !kartBilgileri.skt) {
      alert('Lütfen kart bilgilerini eksiksiz doldurun.');
      return;
    }

    setYukleniyor(true);
    const token = localStorage.getItem('token');
    
    {/* eğer yeni kartsa ve kaydet seçiliyse kaydet */}
    if (!seciliKartId && kartKaydet) {
      try {
        await fetch(`${API_URL}/api/kartlar`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({
            kart_sahibi: kartBilgileri.kartSahibi,
            kart_no: kartBilgileri.kartNo,
            skt: kartBilgileri.skt
          })
        });
      } catch (err) { console.error('Kart kaydetme hatası:', err); }
    }
    const indirimliTutar = sepet.reduce((toplam, urun) => {
      let f = Number(urun.fiyat) * (1 - ayarlar.indirimOrani / 100);
      if (uygulananKupon && uygulananKupon.satici_id === urun.satici_id) {
        f = f * (1 - uygulananKupon.indirim_yuzdesi / 100);
      }
      return toplam + (f * urun.adet);
    }, 0);
    const kargoUcreti = (indirimliTutar > 0 && indirimliTutar < ayarlar.kargoSiniri) ? 50 : 0;
    const toplamTutar = indirimliTutar + kargoUcreti;

    const seciliAdres = adresler.find(a => a.id === seciliAdresId);

    try {
      const cevap = await fetch(`${API_URL}/api/siparisler`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          toplam_tutar: toplamTutar,
          adres_id: seciliAdresId,
          adres_detaylari: seciliAdres,
          kupon_kodu: uygulananKupon?.kod,
          odeme_detaylari: {
            kartSahibi: kartBilgileri.kartSahibi,
            kartNo: `**** **** **** ${kartBilgileri.kartNo.slice(-4)}`
          },
          kalemler: sepet.map(item => ({
            id: item.id,
            adet: item.adet,
            fiyat: Number(item.fiyat) * (1 - ayarlar.indirimOrani / 100),
            satici_id: item.satici_id
          }))
        })
      });

      if (cevap.ok) {
        setSiparisTamam(true);
        sepetiGetir();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const araToplam = sepet.reduce((toplam, urun) => {
    let indirimliFiyat = Number(urun.fiyat) * (1 - ayarlar.indirimOrani / 100);
    if (uygulananKupon && uygulananKupon.satici_id === urun.satici_id) {
      indirimliFiyat = indirimliFiyat * (1 - uygulananKupon.indirim_yuzdesi / 100);
    }
    return toplam + (indirimliFiyat * urun.adet);
  }, 0);
  const kuponIndirimi = sepet.reduce((toplam, urun) => {
    if (uygulananKupon && uygulananKupon.satici_id === urun.satici_id) {
      const normalFiyat = Number(urun.fiyat) * (1 - ayarlar.indirimOrani / 100);
      const indirimliFiyat = normalFiyat * (1 - uygulananKupon.indirim_yuzdesi / 100);
      return toplam + ((normalFiyat - indirimliFiyat) * urun.adet);
    }
    return toplam;
  }, 0);
  const kargoUcreti = (araToplam > 0 && araToplam < ayarlar.kargoSiniri) ? 50 : 0;
  const genelToplam = araToplam + kargoUcreti;

  if (siparisTamam) {
    return (
      <div className="kapsayici" style={{ padding: '100px 0', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '20px' }} />
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>Siparişiniz Alındı!</h1>
          <p style={{ color: 'var(--metin-ikincil)', marginTop: '10px' }}>Ödemeniz başarıyla onaylandı. Ana sayfaya yönlendiriliyorsunuz...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="kapsayici" style={{ padding: '60px 0' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '40px' }}>
        {odemeAdimi === 1 ? 'Alışveriş Sepeti' : 'Teslimat ve Ödeme'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {odemeAdimi === 1 ? (
            <>
              {sepet.map(item => (
                <div 
                  key={item.sepet_id} 
                  style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    background: 'var(--kart-arka-plan)', 
                    padding: '20px', 
                    borderRadius: '24px', 
                    border: '1px solid var(--kart-sinir)',
                    alignItems: 'center'
                  }}
                >
                  <img src={item.resim_url} alt={item.isim} style={{ width: '100px', height: '100px', borderRadius: '15px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '5px' }}>{item.isim}</h4>
                    <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Adet: {item.adet}</p>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', marginTop: '5px' }}>₺{Number(item.fiyat).toLocaleString('tr-TR')}</div>
                  </div>
                  <button 
                    onClick={() => sepettenCikar(item.sepet_id)}
                    style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}

              {sepet.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px', background: 'var(--kart-arka-plan)', borderRadius: '30px' }}>
                  <ShoppingBag size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
                  <h3>Sepetiniz boş</h3>
                  <Link to="/" style={{ color: 'var(--vurgu-rengi)', marginTop: '10px', display: 'inline-block' }}>Keşfetmeye başla</Link>
                </div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              {/* adres bölümü */}
              <section style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   Teslimat Adresi
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {adresler.map(adres => (
                    <div 
                      key={adres.id}
                      onClick={() => setSeciliAdresId(adres.id)}
                      style={{ 
                        padding: '20px', 
                        borderRadius: '20px', 
                        background: 'var(--kart-arka-plan)', 
                        border: seciliAdresId === adres.id ? '2px solid var(--vurgu-rengi)' : '1px solid var(--kart-sinir)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <h4 style={{ fontWeight: '700', marginBottom: '5px' }}>{adres.baslik}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--metin-ikincil)' }}>{adres.adres_detay}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--metin-ikincil)' }}>{adres.ilce} / {adres.sehir}</p>
                    </div>
                  ))}
                    <Link to="/profil" style={{ 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '2px dashed var(--kart-sinir)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--metin-ikincil)',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}>
                    + Yeni Adres
                  </Link>
                </div>
              </section>

              {/* kart seçimi bölümü */}
              <section style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Ödeme Yöntemi</h3>
                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {kartlar.map(kart => (
                    <div 
                      key={kart.id}
                      onClick={() => handleSeciliKart(kart)}
                      style={{ 
                        minWidth: '240px',
                        padding: '20px', 
                        borderRadius: '20px', 
                        background: seciliKartId === kart.id ? 'linear-gradient(135deg, var(--vurgu-rengi) 0%, #4338ca 100%)' : 'var(--kart-arka-plan)', 
                        border: seciliKartId === kart.id ? 'none' : '1px solid var(--kart-sinir)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800' }}>{kart.kart_no.startsWith('4') ? 'VISA' : 'MASTER'}</span>
                        <CheckCircle size={16} style={{ opacity: seciliKartId === kart.id ? 1 : 0 }} />
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', marginBottom: '10px' }}>**** {kart.kart_no.slice(-4)}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{kart.kart_sahibi}</div>
                    </div>
                  ))}
                  <div 
                    onClick={() => {
                      setSeciliKartId(null);
                      setKartBilgileri({ kartNo: '', kartSahibi: '', skt: '', cvv: '' });
                    }}
                    style={{ 
                      minWidth: '240px',
                      padding: '20px', 
                      borderRadius: '20px', 
                      background: !seciliKartId ? 'rgba(255,255,255,0.05)' : 'var(--kart-arka-plan)', 
                      border: !seciliKartId ? '2px solid var(--vurgu-rengi)' : '1px solid var(--kart-sinir)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: !seciliKartId ? 'white' : 'var(--metin-ikincil)'
                    }}
                  >
                    <Plus size={18} /> Yeni Kart Kullan
                  </div>
                </div>
              </section>

              {/* ödeme bölümü */}
              <section>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   Kart Bilgileri
                </h3>
                <div style={{ 
                  background: 'var(--kart-arka-plan)', 
                  padding: '30px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--kart-sinir)'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kart Üzerindeki İsim</label>
                    <input 
                      name="kartSahibi"
                      value={kartBilgileri.kartSahibi}
                      onChange={handleKartChange}
                      placeholder="AD SOYAD"
                      style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kart Numarası</label>
                    <input 
                      name="kartNo"
                      value={kartBilgileri.kartNo}
                      onChange={handleKartChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={16}
                      style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Son Kullanma</label>
                      <input 
                        name="skt"
                        value={kartBilgileri.skt}
                        onChange={handleKartChange}
                        placeholder="AA/YY"
                        maxLength={5}
                        style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>CVV</label>
                      <input 
                        name="cvv"
                        type="password"
                        value={kartBilgileri.cvv}
                        onChange={handleKartChange}
                        placeholder="000"
                        maxLength={3}
                        style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                      />
                    </div>
                  </div>
                  {!seciliKartId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setKartKaydet(!kartKaydet)}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '6px', 
                        border: '2px solid var(--vurgu-rengi)',
                        background: kartKaydet ? 'var(--vurgu-rengi)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {kartKaydet && <CheckCircle size={14} color="white" />}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--metin-ikincil)' }}>Bu kartı sonraki alışverişlerim için güvenli bir şekilde kaydet.</span>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </div>

        <div>
          <div className="ozellik-karti" style={{ position: 'sticky', top: '120px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '25px' }}>Sipariş Özeti</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--metin-ikincil)' }}>
              <span>Ara Toplam</span>
              <span>{formatFiyat(sepet.reduce((t, u) => t + (Number(u.fiyat) * u.adet), 0))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--metin-ikincil)' }}>
              <span>Kargo</span>
              <span style={{ color: kargoUcreti === 0 ? '#22c55e' : 'var(--metin-ana)' }}>
                {kargoUcreti === 0 ? 'Ücretsiz' : `${kargoUcreti} ${getParaSembol()}`}
              </span>
            </div>
            
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Kupon Kodu" 
                  value={kuponKodu}
                  onChange={(e) => setKuponKodu(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white', fontSize: '0.9rem' }}
                />
                <button 
                  onClick={handleKuponDogrula}
                  style={{ padding: '0 15px', background: 'var(--vurgu-rengi)', color: 'white', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                >
                  Uygula
                </button>
              </div>
              {kuponHata && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{kuponHata}</p>}
              {uygulananKupon && <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '5px' }}>Kupon uygulandı: %{uygulananKupon.indirim_yuzdesi} indirim</p>}
            </div>

            {uygulananKupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#22c55e' }}>
                <span>Kupon İndirimi</span>
                <span>-{formatFiyat(kuponIndirimi)}</span>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--kart-sinir)', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.5rem', fontWeight: '800' }}>
              <span>Toplam</span>
              <span>{formatFiyat(genelToplam)}</span>
            </div>
            <button 
              disabled={yukleniyor || sepet.length === 0}
              onClick={handleOdeme}
              className="btn-ana" 
              style={{ width: '100%', padding: '18px', borderRadius: '15px', justifyContent: 'center', fontSize: '1.1rem', opacity: (yukleniyor || sepet.length === 0) ? 0.5 : 1 }}
            >
              {yukleniyor ? 'İşleniyor...' : (
                odemeAdimi === 1 ? <>Ödemeye Geç <ArrowRight size={20} /></> : <>Siparişi Onayla <CheckCircle size={20} /></>
              )}
            </button>
            {odemeAdimi === 2 && (
              <button 
                onClick={() => setOdemeAdimi(1)}
                style={{ width: '100%', marginTop: '15px', color: 'var(--metin-ikincil)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sepete Geri Dön
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sepet;
