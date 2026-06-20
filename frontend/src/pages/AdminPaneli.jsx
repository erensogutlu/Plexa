import { 
  Users, Package, ShoppingCart, RotateCcw, TrendingUp, 
  Trash2, ShieldCheck, UserPlus, Search, MoreVertical, ArrowLeft, LogOut,
  Settings, LayoutGrid, PieChart, BarChart as BarChartIcon, Image as ImageIcon, Edit3, Plus, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { SettingsContext } from '../context/SettingsContext';
import Loader from '../components/Loader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Cell, PieChart as RePieChart, Pie
} from 'recharts';

const AdminPaneli = () => {
  const { cikisYap } = useContext(AuthContext);
  const { ayarGetir } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [sekme, setSekme] = useState('ozet');
  const [istatistikler, setIstatistikler] = useState(null);
  const [kullanicilar, setKullanicilar] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [iadeler, setIadeler] = useState([]);
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [aramaMetni, setAramaMetni] = useState('');

  const [kategoriler, setKategoriler] = useState([]);
  const [genelAyarlar, setGenelAyarlar] = useState({ 
    siteBasligi: 'Plexa Premium', 
    indirimOrani: 0, 
    bakimModu: false,
    paraBirimi: 'TL',
    kargoSiniri: 500,
    destekEmail: 'destek@plexa.com'
  });
  const [sliderVerisi, setSliderVerisi] = useState([]);
  const [kombinVerisi, setKombinVerisi] = useState({ yaz: [], kis: [] });
  const [grafikVerisi, setGrafikVerisi] = useState([]);

  useEffect(() => {
    verileriGetir();
  }, []);

  const verileriGetir = async () => {
    setYukleniyor(true);
    const token = localStorage.getItem('token');
    try {
      const [istCevap, kullCevap, sipCevap, iadeCevap, urunCevap, ayarCevap, katCevap] = await Promise.all([
        fetch(`${API_URL}/api/admin/istatistikler`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/admin/kullanicilar`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/admin/tum-siparisler`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/admin/tum-iadeler`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/urunler`),
        fetch(`${API_URL}/api/ayarlar`),
        fetch(`${API_URL}/api/kategoriler`)
      ]);

      if (istCevap.ok) {
        const istData = await istCevap.json();
        setIstatistikler(istData);
        setGrafikVerisi(istData.grafikVerisi || []);
      }
      if (kullCevap.ok) setKullanicilar(await kullCevap.json());
      if (sipCevap.ok) setSiparisler(await sipCevap.json());
      if (iadeCevap.ok) setIadeler(await iadeCevap.json());
      if (urunCevap.ok) setUrunler(await urunCevap.json());
      if (katCevap.ok) setKategoriler(await katCevap.json());
      if (ayarCevap.ok) {
        const ayarlar = await ayarCevap.json();
        setSliderVerisi(ayarlar.ana_slider || []);
        setKombinVerisi(ayarlar.kombinler || { yaz: [], kis: [] });
        if (ayarlar.genel_ayarlar) {
          setGenelAyarlar(onceki => ({
            ...onceki,
            ...ayarlar.genel_ayarlar
          }));
        }
      }
    } catch (err) { console.error(err); } finally { setYukleniyor(false); }
  };

  const kategoriEkle = async () => {
    const isim = prompt('Yeni kategori ismi:');
    if (!isim) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/kategoriler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ isim })
      });
      if (cevap.ok) {
        const yeni = await cevap.json();
        setKategoriler([...kategoriler, yeni]);
      }
    } catch (err) { console.error(err); }
  };

  const kategoriSil = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/kategoriler/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) setKategoriler(kategoriler.filter(k => k.id !== id));
    } catch (err) { console.error(err); }
  };

  const kullaniciSil = async (id) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/kullanicilar/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        setKullanicilar(kullanicilar.filter(k => k.id !== id));
        alert('Kullanıcı silindi.');
      }
    } catch (err) { console.error(err); }
  };

  const rolGuncelle = async (id, yeniRol) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/kullanicilar/${id}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ rol: yeniRol })
      });
      if (cevap.ok) {
        setKullanicilar(kullanicilar.map(k => k.id === id ? { ...k, rol: yeniRol } : k));
        alert('Kullanıcı rolü güncellendi.');
      }
    } catch (err) { console.error(err); }
  };

  const urunSil = async (id) => {
    if (!window.confirm('Bu ürünü admin yetkisiyle silmek üzeresiniz. Onaylıyor musunuz?')) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/urunler/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        setUrunler(urunler.filter(u => u.id !== id));
        alert('Ürün sistemden kaldırıldı.');
      }
    } catch (err) { console.error(err); }
  };

  const ayarGuncelle = async (anahtar, deger) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/ayarlar/${anahtar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ deger })
      });
      if (cevap.ok) {
        await ayarGetir();
        alert(`${anahtar} başarıyla güncellendi ve tüm siteye yansıtıldı!`);
      }
    } catch (err) { console.error(err); }
  };

  if (yukleniyor) return <Loader fullPage />;

  return (
    <div className="kapsayici" style={{ padding: '40px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem', marginBottom: '15px', textDecoration: 'none' }} className="geri-don-link">
            <ArrowLeft size={16} /> Siteye Dön
          </Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', background: 'var(--vurgu-gradyan)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Plexa Kontrol Merkezi
          </h1>
          <p style={{ color: 'var(--metin-ikincil)' }}>Sistemin tüm çarkları parmaklarınızın ucunda.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={verileriGetir} className="btn-ikincil" style={{ padding: '12px 24px', borderRadius: '14px', border: '1px solid var(--kart-sinir)', color: 'white' }}>
            Verileri Yenile
          </button>
          <button 
            onClick={() => { cikisYap(); navigate('/giris'); }} 
            className="btn-ikincil" 
            style={{ padding: '12px 24px', borderRadius: '14px', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* admin navigasyon */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
        {[
          { id: 'ozet', isim: 'Dashboard', icon: <PieChart size={18} /> },
          { id: 'kullanicilar', isim: 'Kullanıcılar', icon: <Users size={18} /> },
          { id: 'urunler', isim: 'Ürünler', icon: <Package size={18} /> },
          { id: 'siparisler', isim: 'Siparişler', icon: <ShoppingCart size={18} /> },
          { id: 'iadeler', isim: 'İadeler', icon: <RotateCcw size={18} /> },
          { id: 'kategoriler', isim: 'Kategoriler', icon: <LayoutGrid size={18} /> },
          { id: 'icerik', isim: 'İçerik Editörü', icon: <Edit3 size={18} /> },
          { id: 'ayarlar', isim: 'Ayarlar', icon: <Settings size={18} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSekme(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              borderRadius: '15px',
              background: sekme === t.id ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)',
              color: sekme === t.id ? 'white' : 'var(--metin-ana)',
              border: '1px solid var(--kart-sinir)',
              whiteSpace: 'nowrap',
              transition: '0.3s',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            {t.icon} {t.isim}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={sekme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* dashboard sekmesi */}
          {sekme === 'ozet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* istatistik kartları */}
              {istatistikler && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <div className="admin-ist-kart">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <TrendingUp color="var(--vurgu-rengi)" />
                      <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>+%12.5</span>
                    </div>
                    <h3>{Number(istatistikler.toplamSatis).toLocaleString('tr-TR')} TL</h3>
                    <p>Haftalık Ciro</p>
                  </div>
                  <div className="admin-ist-kart">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Users color="#3b82f6" />
                      <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 'bold' }}>+48 Yeni</span>
                    </div>
                    <h3>{istatistikler.toplamKullanici}</h3>
                    <p>Toplam Müşteri</p>
                  </div>
                  <div className="admin-ist-kart">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <ShoppingCart color="#10b981" />
                      <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 'bold' }}>12 Bekleyen</span>
                    </div>
                    <h3>{istatistikler.toplamSiparis}</h3>
                    <p>Tamamlanan Sipariş</p>
                  </div>
                </div>
              )}

              {/* grafikler */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                <div className="admin-tablo-kapsayici" style={{ padding: '25px', minHeight: '350px' }}>
                  <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChartIcon size={20} color="var(--vurgu-rengi)" /> Satış Analizi
                  </h4>
                  <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={grafikVerisi}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--metin-ikincil)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--metin-ikincil)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px' }}
                          itemStyle={{ color: 'var(--vurgu-rengi)' }}
                        />
                        <Bar dataKey="satis" fill="var(--vurgu-rengi)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="admin-tablo-kapsayici" style={{ padding: '25px', minHeight: '350px' }}>
                  <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <TrendingUp size={20} color="#a855f7" /> Performans Trendi
                  </h4>
                  <div style={{ width: '100%', height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={grafikVerisi}>
                        <defs>
                          <linearGradient id="renkSatis" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--metin-ikincil)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--metin-ikincil)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px' }}
                        />
                        <Area type="monotone" dataKey="satis" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#renkSatis)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* kategoriler sekmesi */}
          {sekme === 'kategoriler' && (
            <div className="admin-tablo-kapsayici">
              <div style={{ padding: '25px', borderBottom: '1px solid var(--kart-sinir)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Kategori Yönetimi</h3>
                <button onClick={kategoriEkle} className="btn-ana" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>+ Yeni Kategori</button>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {kategoriler.map(k => (
                  <div key={k.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid var(--kart-sinir)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{k.isim}</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => kategoriSil(k.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ayarlar sekmesi */}
          {sekme === 'ayarlar' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
              {/* genel bilgiler */}
              <div className="admin-tablo-kapsayici" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', color: 'var(--vurgu-rengi)' }}>Genel Bilgiler</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="ayar-grubu">
                    <label>Site Başlığı</label>
                    <input 
                      type="text" 
                      value={genelAyarlar.siteBasligi} 
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, siteBasligi: e.target.value})}
                      className="admin-input" 
                    />
                  </div>
                  <div className="ayar-grubu">
                    <label>Destek E-posta Adresi</label>
                    <input 
                      type="email" 
                      value={genelAyarlar.destekEmail} 
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, destekEmail: e.target.value})}
                      className="admin-input" 
                    />
                  </div>
                </div>
              </div>

              {/* finansal ayarlar */}
              <div className="admin-tablo-kapsayici" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', color: '#10b981' }}>Finansal Ayarlar</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="ayar-grubu">
                    <label>Para Birimi</label>
                    <select 
                      value={genelAyarlar.paraBirimi} 
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, paraBirimi: e.target.value})}
                      className="admin-input"
                    >
                      <option value="TL">Türk Lirası (₺)</option>
                      <option value="USD">Amerikan Doları ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div className="ayar-grubu">
                    <label>Ücretsiz Kargo Alt Limiti</label>
                    <input 
                      type="number" 
                      value={genelAyarlar.kargoSiniri} 
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, kargoSiniri: Number(e.target.value)})}
                      className="admin-input" 
                    />
                  </div>
                  <div className="ayar-grubu">
                    <label>Global İndirim Oranı (%)</label>
                    <input 
                      type="number" 
                      value={genelAyarlar.indirimOrani} 
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, indirimOrani: Number(e.target.value)})}
                      className="admin-input" 
                    />
                  </div>
                </div>
              </div>

              {/* sistem & güvenlik */}
              <div className="admin-tablo-kapsayici" style={{ padding: '30px' }}>
                <h3 style={{ marginBottom: '25px', fontSize: '1.2rem', color: '#ef4444' }}>Sistem & Güvenlik</h3>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div className="ayar-grubu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Bakım Modu</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--metin-ikincil)' }}>Siteyi ziyaretçilere kapatır.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={genelAyarlar.bakimModu}
                      onChange={(e) => setGenelAyarlar({...genelAyarlar, bakimModu: e.target.checked})}
                      style={{ width: '40px', height: '20px', cursor: 'pointer' }} 
                    />
                  </div>
                  <button 
                    className="btn-ana" 
                    onClick={() => ayarGuncelle('genel_ayarlar', genelAyarlar)}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Tüm Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* içerik editörü sekmesi */}
          {sekme === 'icerik' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {/* slider düzenleyici */}
              <div className="admin-tablo-kapsayici" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ImageIcon size={22} color="var(--vurgu-rengi)" /> Ana Sayfa Slider
                  </h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn-ikincil" 
                      onClick={() => setSliderVerisi([...sliderVerisi, { id: Date.now(), baslik: 'Yeni Slayt', aciklama: '', resim: '' }])}
                      style={{ padding: '8px 15px', fontSize: '0.8rem', color: 'white' }}
                    >
                      <Plus size={16} /> Slayt Ekle
                    </button>
                    <button 
                      className="btn-ana" 
                      onClick={() => ayarGuncelle('ana_slider', sliderVerisi)}
                      style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                    >
                      <Save size={16} /> Kaydet
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gap: '20px' }}>
                  {sliderVerisi.map((s, index) => (
                    <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 1fr 40px', gap: '15px', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--kart-sinir)' }}>
                      <img src={s.resim} alt="" style={{ width: '120px', height: '70px', borderRadius: '10px', objectFit: 'cover', background: '#333' }} />
                      <input 
                        className="admin-input" 
                        placeholder="Başlık" 
                        value={s.baslik} 
                        onChange={(e) => {
                          const yeni = [...sliderVerisi];
                          yeni[index].baslik = e.target.value;
                          setSliderVerisi(yeni);
                        }}
                      />
                      <input 
                        className="admin-input" 
                        placeholder="Açıklama" 
                        value={s.aciklama} 
                        onChange={(e) => {
                          const yeni = [...sliderVerisi];
                          yeni[index].aciklama = e.target.value;
                          setSliderVerisi(yeni);
                        }}
                      />
                      <input 
                        className="admin-input" 
                        placeholder="Resim URL" 
                        value={s.resim} 
                        onChange={(e) => {
                          const yeni = [...sliderVerisi];
                          yeni[index].resim = e.target.value;
                          setSliderVerisi(yeni);
                        }}
                      />
                      <button onClick={() => setSliderVerisi(sliderVerisi.filter((_, i) => i !== index))} style={{ color: '#ef4444' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* kombin düzenleyici */}
              <div className="admin-tablo-kapsayici" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LayoutGrid size={22} color="#a855f7" /> Kombin Sayfaları
                  </h3>
                  <button 
                    className="btn-ana" 
                    onClick={() => ayarGuncelle('kombinler', kombinVerisi)}
                    style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                  >
                    <Save size={16} /> Kaydet
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  {/* Yaz Kombinleri */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, color: '#f59e0b' }}>Yaz Kombinleri</h4>
                      <button 
                        className="btn-ikincil" 
                        onClick={() => {
                          const yeni = {...kombinVerisi};
                          yeni.yaz.push({ id: Date.now(), isim: 'Yeni Yaz Koleksiyonu', resim: '' });
                          setKombinVerisi(yeni);
                        }}
                        style={{ padding: '5px 10px', fontSize: '0.7rem', color: 'white' }}
                      >
                        <Plus size={14} /> Ekle
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {kombinVerisi.yaz.map((k, index) => (
                        <div key={k.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--kart-sinir)', position: 'relative' }}>
                          <button 
                            onClick={() => {
                              const yeni = {...kombinVerisi};
                              yeni.yaz = yeni.yaz.filter((_, i) => i !== index);
                              setKombinVerisi(yeni);
                            }}
                            style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <input 
                            className="admin-input" 
                            style={{ marginBottom: '8px', paddingRight: '40px' }}
                            placeholder="Kombin Adı" 
                            value={k.isim} 
                            onChange={(e) => {
                              const yeni = {...kombinVerisi};
                              yeni.yaz[index].isim = e.target.value;
                              setKombinVerisi(yeni);
                            }}
                          />
                          <input 
                            className="admin-input" 
                            placeholder="Resim URL" 
                            value={k.resim} 
                            onChange={(e) => {
                              const yeni = {...kombinVerisi};
                              yeni.yaz[index].resim = e.target.value;
                              setKombinVerisi(yeni);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kış Kombinleri */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, color: '#3b82f6' }}>Kış Kombinleri</h4>
                      <button 
                        className="btn-ikincil" 
                        onClick={() => {
                          const yeni = {...kombinVerisi};
                          yeni.kis.push({ id: Date.now(), isim: 'Yeni Kış Koleksiyonu', resim: '' });
                          setKombinVerisi(yeni);
                        }}
                        style={{ padding: '5px 10px', fontSize: '0.7rem', color: 'white' }}
                      >
                        <Plus size={14} /> Ekle
                      </button>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {kombinVerisi.kis.map((k, index) => (
                        <div key={k.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--kart-sinir)', position: 'relative' }}>
                          <button 
                            onClick={() => {
                              const yeni = {...kombinVerisi};
                              yeni.kis = yeni.kis.filter((_, i) => i !== index);
                              setKombinVerisi(yeni);
                            }}
                            style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444' }}
                          >
                            <Trash2 size={16} />
                          </button>
                          <input 
                            className="admin-input" 
                            style={{ marginBottom: '8px', paddingRight: '40px' }}
                            placeholder="Kombin Adı" 
                            value={k.isim} 
                            onChange={(e) => {
                              const yeni = {...kombinVerisi};
                              yeni.kis[index].isim = e.target.value;
                              setKombinVerisi(yeni);
                            }}
                          />
                          <input 
                            className="admin-input" 
                            placeholder="Resim URL" 
                            value={k.resim} 
                            onChange={(e) => {
                              const yeni = {...kombinVerisi};
                              yeni.kis[index].resim = e.target.value;
                              setKombinVerisi(yeni);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* kullanıcılar sekmesi */}
          {sekme === 'kullanicilar' && (
            <div className="admin-tablo-kapsayici">
              <div style={{ padding: '20px', borderBottom: '1px solid var(--kart-sinir)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Tüm Kullanıcılar</h3>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} />
                  <input 
                    type="text" 
                    placeholder="Kullanıcı ara..." 
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    style={{ padding: '10px 15px 10px 40px', borderRadius: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', color: 'white' }}
                  />
                </div>
              </div>
              <table className="admin-tablo">
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {kullanicilar.filter(k => k.isim.toLowerCase().includes(aramaMetni.toLowerCase())).map(k => (
                    <tr key={k.id}>
                      <td>{k.isim}</td>
                      <td>{k.email}</td>
                      <td>
                        <select 
                          value={k.rol} 
                          onChange={(e) => rolGuncelle(k.id, e.target.value)}
                          style={{ padding: '5px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--kart-sinir)' }}
                        >
                          <option value="alici">Alıcı</option>
                          <option value="satici">Satıcı</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{new Date(k.olusturulma_tarihi).toLocaleDateString('tr-TR')}</td>
                      <td>
                        <button onClick={() => kullaniciSil(k.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ürünler sekmesi */}
          {sekme === 'urunler' && (
            <div className="admin-tablo-kapsayici">
              <table className="admin-tablo">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Fiyat</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {urunler.map(u => (
                    <tr key={u.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={u.resim_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        {u.isim}
                      </td>
                      <td>{u.kategori}</td>
                      <td>{u.fiyat} TL</td>
                      <td>
                        <button onClick={() => urunSil(u.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* siparişler sekmesi */}
          {sekme === 'siparisler' && (
            <div className="admin-tablo-kapsayici">
              <table className="admin-tablo">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Alıcı</th>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {siparisler.map(s => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>
                      <td>{s.alici_isim}</td>
                      <td>{s.toplam_tutar} TL</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          background: s.durum === 'Teslim Edildi' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: s.durum === 'Teslim Edildi' ? '#10b981' : '#f59e0b'
                        }}>
                          {s.durum}
                        </span>
                      </td>
                      <td>{new Date(s.olusturulma_tarihi).toLocaleDateString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* iadeler sekmesi */}
          {sekme === 'iadeler' && (
            <div className="admin-tablo-kapsayici">
              <table className="admin-tablo">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Alıcı</th>
                    <th>Neden</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {iadeler.map(i => (
                    <tr key={i.id}>
                      <td>{i.urun_isim}</td>
                      <td>{i.kullanici_isim}</td>
                      <td>{i.neden}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem',
                          background: i.durum === 'Onaylandı' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: i.durum === 'Onaylandı' ? '#10b981' : '#ef4444'
                        }}>
                          {i.durum}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-ist-kart {
          background: var(--kart-arka-plan);
          padding: 30px;
          border-radius: 30px;
          border: 1px solid var(--kart-sinir);
          display: flex;
          flex-direction: column;
          gap: 15px;
          transition: 0.3s;
        }
        .admin-ist-kart:hover {
          border-color: var(--vurgu-rengi);
          transform: translateY(-5px);
        }
        .admin-ist-kart h3 { font-size: 1.8rem; font-weight: 900; margin: 0; }
        .admin-ist-kart p { color: var(--metin-ikincil); margin: 0; }
        
        .admin-tablo-kapsayici {
          background: var(--kart-arka-plan);
          border-radius: 30px;
          border: 1px solid var(--kart-sinir);
          overflow: hidden;
          margin-top: 20px;
        }
        .admin-tablo {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .admin-tablo th {
          text-align: left;
          padding: 20px;
          background: rgba(255,255,255,0.02);
          color: var(--metin-ikincil);
          font-weight: 600;
          border-bottom: 1px solid var(--kart-sinir);
        }
        .admin-tablo td {
          padding: 20px;
          border-bottom: 1px solid var(--kart-sinir);
          color: var(--metin-ana);
        }
        .admin-tablo tr:last-child td { border-bottom: none; }
        .admin-tablo tr:hover { background: rgba(255,255,255,0.01); }
        
        button { cursor: pointer; border: none; background: none; transition: 0.3s; }
        button:hover { opacity: 0.8; }
        .geri-don-link:hover { color: var(--vurgu-rengi) !important; }

        .admin-input {
          width: 100%;
          padding: 12px 15px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--kart-sinir);
          border-radius: 12px;
          color: white;
          outline: none;
          transition: 0.3s;
        }
        .admin-input:focus {
          border-color: var(--vurgu-rengi);
          background: rgba(255,255,255,0.05);
        }
        .ayar-grubu label {
          display: block;
          margin-bottom: 10px;
          color: var(--metin-ikincil);
          font-size: 0.9rem;
          font-weight: 500;
        }
        select option {
          background: #1a1a1a;
          color: white;
        }
        select {
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

export default AdminPaneli;
