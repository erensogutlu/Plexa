import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Mail, Shield, Plus, Trash2, Edit3, X, CreditCard, Package, Star, MessageSquare } from 'lucide-react';

const Profil = () => {
  const { kullanici } = useContext(AuthContext);
  const [adresler, setAdresler] = useState([]);
  const [modalAcik, setModalAcik] = useState(false);
  const [profilModalAcik, setProfilModalAcik] = useState(false);
  const [yeniAdres, setYeniAdres] = useState({ baslik: '', sehir: '', ilce: '', adres_detay: '' });
  const [profilVeri, setProfilVeri] = useState({ isim: '', email: '' });
  const [kartlar, setKartlar] = useState([]);
  const [yeniKart, setYeniKart] = useState({ kart_sahibi: '', kart_no: '', skt: '' });
  const [kartModalAcik, setKartModalAcik] = useState(false);
  const [siparisler, setSiparisler] = useState([]);
  const [iadeModalAcik, setIadeModalAcik] = useState(false);
  const [seciliSiparis, setSeciliSiparis] = useState(null);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [iadeNedeni, setIadeNedeni] = useState('');
  const [yorumlar, setYorumlar] = useState([]);

  useEffect(() => {
    if (kullanici) {
      adresleriGetir();
      kartlariGetir();
      siparisleriGetir();
      yorumlariGetir();
      setProfilVeri({ isim: kullanici.isim, email: kullanici.email });
    }
  }, [kullanici]);

  const adresleriGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/adresler', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setAdresler(veri);
      }
    } catch (hata) {
      console.error('Adres getirme hatası:', hata);
    }
  };

  const kartlariGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/kartlar', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setKartlar(veri);
      }
    } catch (hata) {
      console.error('Kart getirme hatası:', hata);
    }
  };

  const handleKartEkle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/kartlar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(yeniKart)
      });
      if (cevap.ok) {
        setKartModalAcik(false);
        setYeniKart({ kart_sahibi: '', kart_no: '', skt: '' });
        kartlariGetir();
      }
    } catch (hata) {
      console.error('Kart ekleme hatası:', hata);
    }
  };

  const handleKartSil = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`http://localhost:5000/api/kartlar/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        kartlariGetir();
      }
    } catch (hata) {
      console.error('Kart silme hatası:', hata);
    }
  };

  const handleProfilGuncelle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/auth/profil', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(profilVeri)
      });
      if (cevap.ok) {
        setProfilModalAcik(false);
        window.location.reload(); // AuthContext'i güncellemek için en temiz yol
      }
    } catch (hata) {
      console.error('Profil güncelleme hatası:', hata);
    }
  };

  const handleAdresEkle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/adresler', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(yeniAdres)
      });
      if (cevap.ok) {
        setModalAcik(false);
        setYeniAdres({ baslik: '', sehir: '', ilce: '', adres_detay: '' });
        adresleriGetir();
      }
    } catch (hata) {
      console.error('Adres ekleme hatası:', hata);
    }
  };

  const handleAdresSil = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`http://localhost:5000/api/adresler/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        adresleriGetir();
      }
    } catch (hata) {
      console.error('Adres silme hatası:', hata);
    }
  };

  const siparisleriGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/siparisler', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setSiparisler(veri);
      }
    } catch (hata) {
      console.error('Sipariş getirme hatası:', hata);
    }
  };

  const yorumlariGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/admin/yorumlarim', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        setYorumlar(await cevap.json());
      }
    } catch (hata) {
      console.error('Yorum getirme hatası:', hata);
    }
  };

  const yorumSil = async (id) => {
    if (!window.confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`http://localhost:5000/api/yorumlar/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        yorumlariGetir();
      }
    } catch (hata) {
      console.error('Yorum silme hatası:', hata);
    }
  };

  const handleIadeTalebi = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/iadeler', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          siparis_id: seciliSiparis.id,
          satici_id: seciliUrun.satici_id,
          urun_id: seciliUrun.id,
          neden: iadeNedeni
        })
      });
      if (cevap.ok) {
        alert('İade talebiniz başarıyla alındı.');
        setIadeModalAcik(false);
        setIadeNedeni('');
      }
    } catch (hata) {
      console.error('İade talebi hatası:', hata);
    }
  };

  if (!kullanici) return <div className="yukleniyor">Giriş yapmalısınız.</div>;

  return (
    <div className="kapsayici" style={{ padding: '60px 0' }}>
      <div className="profil-ana-izgara">
        
        {/* sol kolon: kullanıcı bilgileri */}
        <div>
          <h2 className="profil-bolum-baslik">Profil Bilgilerim</h2>
          <motion.div 
            className="ozellik-karti"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'var(--vurgu-gradyan)', borderRadius: '12px' }}>
                  <User color="white" size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>Ad Soyad</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{kullanici.isim}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--kart-sinir)' }}>
                  <Mail color="var(--metin-ikincil)" size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>E-posta</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{kullanici.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid var(--kart-sinir)' }}>
                  <Shield color="var(--metin-ikincil)" size={24} />
                </div>
                <div>
                  <div style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>Hesap Türü</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', textTransform: 'capitalize' }}>{kullanici.rol === 'alici' ? 'Alıcı' : 'Satıcı'}</div>
                </div>
              </div>
              
              <button onClick={() => setProfilModalAcik(true)} className="btn-ana" style={{ marginTop: '20px', justifyContent: 'center' }}>
                <Edit3 size={18} /> Bilgilerimi Güncelle
              </button>
            </div>
          </motion.div>
        </div>

        {/* sağ kolon: adresler */}
        <div>
          <div className="profil-baslik-grup">
            <h2 className="profil-bolum-baslik">Kayıtlı Adreslerim</h2>
            <button onClick={() => setModalAcik(true)} className="btn-ana" style={{ padding: '10px 20px', borderRadius: '12px' }}>
              <Plus size={18} /> Yeni Adres
            </button>
          </div>

          <div className="adres-izgara">
            {adresler.map(adres => (
              <motion.div 
                key={adres.id}
                className="ozellik-karti"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--vurgu-rengi)' }}>
                  <MapPin size={20} />
                  <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{adres.baslik}</span>
                </div>
                <p style={{ color: 'var(--metin-ana)', marginBottom: '5px', fontWeight: '600' }}>{adres.sehir} / {adres.ilce}</p>
                <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>{adres.adres_detay}</p>
                
                <button 
                  onClick={() => handleAdresSil(adres.id)}
                  style={{ position: 'absolute', top: '20px', right: '20px', color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}

            {adresler.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--kart-arka-plan)', borderRadius: '20px', border: '1px dashed var(--kart-sinir)' }}>
                <MapPin size={40} color="var(--metin-ikincil)" style={{ marginBottom: '15px', opacity: 0.5 }} />
                <p style={{ color: 'var(--metin-ikincil)' }}>Henüz kayıtlı bir adresiniz bulunmuyor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '60px' }}>
        <div className="profil-baslik-grup">
          <h2 className="profil-bolum-baslik">Kayıtlı Kartlarım</h2>
          <button onClick={() => setKartModalAcik(true)} className="btn-ana" style={{ padding: '10px 20px', borderRadius: '12px' }}>
            <Plus size={18} /> Yeni Kart
          </button>
        </div>
        <div className="kart-izgara">
          {kartlar.map(kart => (
            <motion.div 
              key={kart.id}
              className="ozellik-karti"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                position: 'relative', 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '30px',
                border: '1px solid rgba(255,255,255,0.05)',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}><CreditCard size={120} /></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>
                    {kart.kart_no.startsWith('4') ? 'VISA' : 'Mastercard'}
                  </div>
                  <button onClick={() => handleKartSil(kart.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '3px', marginBottom: '20px', color: 'white' }}>
                  **** **** **** {kart.kart_no.slice(-4)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Kart Sahibi</div>
                    <div style={{ fontWeight: '600', color: 'white' }}>{kart.kart_sahibi}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>S.K.T</div>
                    <div style={{ fontWeight: '600', color: 'white' }}>{kart.skt}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {kartlar.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--kart-arka-plan)', borderRadius: '20px', border: '1px dashed var(--kart-sinir)' }}>
              <CreditCard size={40} color="var(--metin-ikincil)" style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p style={{ color: 'var(--metin-ikincil)' }}>Henüz kayıtlı bir kartınız bulunmuyor.</p>
            </div>
          )}
        </div>
      </div>

      {/* alt bölüm: siparişlerim */}
      <div style={{ marginTop: '60px' }}>
        <h2 className="profil-bolum-baslik big">Siparişlerim</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {siparisler.map(siparis => (
            <motion.div 
              key={siparis.id}
              className="ozellik-karti"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ padding: '30px' }}
            >
              <div className="siparis-baslik-alani">
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white' }}>Sipariş #{siparis.id}</div>
                  <div style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>{new Date(siparis.olusturulma_tarihi).toLocaleDateString('tr-TR')}</div>
                </div>
                <div className="siparis-durum-fiyat">
                  <div style={{ 
                    padding: '6px 15px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: '700',
                    background: siparis.durum === 'Hazırlanıyor' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    color: siparis.durum === 'Hazırlanıyor' ? '#f59e0b' : '#22c55e'
                  }}>
                    {siparis.durum}
                  </div>
                  <div className="siparis-fiyat">₺{Number(siparis.toplam_tutar).toLocaleString('tr-TR')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {siparis.urunler.map((urun, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <img src={urun.resim_url} alt={urun.isim} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: 'white' }}>{urun.isim}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--metin-ikincil)' }}>{urun.adet} Adet x ₺{Number(urun.fiyat).toLocaleString('tr-TR')}</div>
                      </div>
                    </div>
                    {urun.iade_durumu ? (
                      <div style={{ 
                        padding: '6px 12px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: '700',
                        background: urun.iade_durumu === 'Beklemede' ? 'rgba(245, 158, 11, 0.1)' : urun.iade_durumu === 'Onaylandı' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: urun.iade_durumu === 'Beklemede' ? '#f59e0b' : urun.iade_durumu === 'Onaylandı' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${urun.iade_durumu === 'Beklemede' ? 'rgba(245, 158, 11, 0.2)' : urun.iade_durumu === 'Onaylandı' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                      }}>
                        İade: {urun.iade_durumu}
                      </div>
                    ) : (
                      siparis.durum === 'Teslim Edildi' && (
                        <button 
                          onClick={() => {
                            setSeciliSiparis(siparis);
                            setSeciliUrun(urun);
                            setIadeModalAcik(true);
                          }}
                          style={{ padding: '8px 15px', borderRadius: '10px', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.85rem', fontWeight: '600' }}
                        >
                          İade Talebi
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {siparisler.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px', background: 'var(--kart-arka-plan)', borderRadius: '30px', border: '1px dashed var(--kart-sinir)' }}>
              <Plus size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--metin-ikincil)' }}>Henüz bir siparişiniz bulunmuyor.</h3>
            </div>
          )}
        </div>
      </div>

      {/* profil güncelleme modalı */}
      <AnimatePresence>
        {profilModalAcik && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="profil-modal-icerik"
            >
              <button onClick={() => setProfilModalAcik(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'var(--metin-ikincil)' }}>
                <X size={30} />
              </button>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Bilgilerimi Güncelle</h3>
              <form onSubmit={handleProfilGuncelle}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Ad Soyad</label>
                  <input value={profilVeri.isim} onChange={e => setProfilVeri({...profilVeri, isim: e.target.value})} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>E-posta</label>
                  <input type="email" value={profilVeri.email} onChange={e => setProfilVeri({...profilVeri, email: e.target.value})} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', justifyContent: 'center' }}>Değişiklikleri Kaydet</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* adres ekleme modalı */}
      <AnimatePresence>
        {modalAcik && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="profil-modal-icerik"
            >
              <button onClick={() => setModalAcik(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'var(--metin-ikincil)' }}>
                <X size={30} />
              </button>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Yeni Adres Ekle</h3>
               <form onSubmit={handleAdresEkle}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Adres Başlığı (Örn: Ev, İş)</label>
                  <input value={yeniAdres.baslik} onChange={e => setYeniAdres({...yeniAdres, baslik: e.target.value})} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <div className="modal-izgara">
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Şehir</label>
                    <input value={yeniAdres.sehir} onChange={e => setYeniAdres({...yeniAdres, sehir: e.target.value})} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>İlçe</label>
                    <input value={yeniAdres.ilce} onChange={e => setYeniAdres({...yeniAdres, ilce: e.target.value})} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Tam Adres</label>
                  <textarea value={yeniAdres.adres_detay} onChange={e => setYeniAdres({...yeniAdres, adres_detay: e.target.value})} required rows={3} style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', resize: 'none' }} />
                </div>
                <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', justifyContent: 'center' }}>Adresi Kaydet</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iade talebi modalı */}
      <AnimatePresence>
        {iadeModalAcik && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="profil-modal-icerik"
            >
              <button onClick={() => setIadeModalAcik(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'var(--metin-ikincil)' }}>
                <X size={30} />
              </button>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>İade Talebi Oluştur</h3>
              <p style={{ color: 'var(--metin-ikincil)', marginBottom: '25px' }}>{seciliUrun?.isim} ürünü için iade nedeninizi belirtin.</p>
              
              <form onSubmit={handleIadeTalebi}>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>İade Nedeni</label>
                  <textarea 
                    value={iadeNedeni} 
                    onChange={e => setIadeNedeni(e.target.value)} 
                    required 
                    rows={4} 
                    placeholder="Lütfen iade nedeninizi detaylıca açıklayın..."
                    style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', resize: 'none' }} 
                  />
                </div>
                <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', justifyContent: 'center', background: '#ef4444' }}>Talebi Gönder</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* yeni kart ekleme modalı */}
      <AnimatePresence>
        {kartModalAcik && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="profil-modal-icerik"
            >
              <button onClick={() => setKartModalAcik(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'var(--metin-ikincil)' }}>
                <X size={30} />
              </button>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>Yeni Kart Ekle</h3>
              <form onSubmit={handleKartEkle}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kart Üzerindeki İsim</label>
                  <input value={yeniKart.kart_sahibi} onChange={e => setYeniKart({...yeniKart, kart_sahibi: e.target.value.toUpperCase()})} required placeholder="AD SOYAD" style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kart Numarası</label>
                  <input value={yeniKart.kart_no} onChange={e => setYeniKart({...yeniKart, kart_no: e.target.value.replace(/\s/g, '')})} required maxLength={16} placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Son Kullanma Tarihi</label>
                  <input value={yeniKart.skt} onChange={e => setYeniKart({...yeniKart, skt: e.target.value})} required placeholder="AA/YY" style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                </div>
                <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', justifyContent: 'center' }}>Kartı Kaydet</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* yorumlarım bölümü */}
      <div style={{ marginTop: '60px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>Yorumlarım</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {yorumlar.map(yorum => (
            <motion.div 
              key={yorum.id}
              className="ozellik-karti"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ position: 'relative', padding: '25px' }}
            >
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <img src={yorum.resim_url} alt={yorum.urun_isim} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '5px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{yorum.urun_isim}</div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(p => (
                      <Star 
                        key={p} 
                        size={12} 
                        fill={p <= yorum.puan ? "#fbbf24" : "none"}
                        color={p <= yorum.puan ? "#fbbf24" : "var(--metin-ikincil)"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{yorum.yorum}</p>
              
              {/* satıcı cevabı */}
              {yorum.cevap && (
                <div style={{ marginTop: '15px', padding: '10px 15px', background: 'rgba(99, 102, 241, 0.03)', borderRadius: '12px', borderLeft: '3px solid var(--vurgu-rengi)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--vurgu-rengi)', marginBottom: '5px', textTransform: 'uppercase' }}>Satıcı Yanıtı</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--metin-ana)', lineHeight: '1.4' }}>{yorum.cevap}</p>
                </div>
              )}

              <div style={{ marginTop: '15px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{new Date(yorum.olusturulma_tarihi).toLocaleDateString('tr-TR')}</span>
                <button onClick={() => yorumSil(yorum.id)} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Trash2 size={14} /> Sil
                </button>
              </div>
            </motion.div>
          ))}
          {yorumlar.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--kart-arka-plan)', borderRadius: '20px', border: '1px dashed var(--kart-sinir)' }}>
              <MessageSquare size={40} color="var(--metin-ikincil)" style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p style={{ color: 'var(--metin-ikincil)' }}>Henüz bir ürün için yorum yapmadınız.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profil;
