import { useState, useContext, useEffect, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config';
import { UrunContext } from '../context/UrunContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Package, Tag, CreditCard, Image as ImageIcon, X, ShoppingBag, Clock, CheckCircle, Truck, AlertCircle, ChevronRight, ExternalLink, TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, BarChart as BarChartIcon, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Cell, Pie, Legend } from 'recharts';
import Loader from '../components/Loader';

const SaticiPaneli = () => {
  const { kullanici } = useContext(AuthContext);
  const { urunler, yukleniyor, hata } = useContext(UrunContext);
  const [saticiUrunleri, setSaticiUrunleri] = useState([]);
  const [siparisler, setSiparisler] = useState([]);
  const [iadeler, setIadeler] = useState([]);
  const [yorumlar, setYorumlar] = useState([]);
  const [cevapFormlari, setCevapFormlari] = useState({});
  const [aktifSekme, setAktifSekme] = useState('urunler');
  const [kuponlar, setKuponlar] = useState([]);
  const [kuponFormAcik, setKuponFormAcik] = useState(false);
  const [yeniKupon, setYeniKupon] = useState({ kod: '', indirim_yuzdesi: '' });
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [yukleniyorSiparis, setYukleniyorSiparis] = useState(false);

  {/* istatistikleri dinamik hesapla */}
  const istatistikVerileri = useMemo(() => {
    const simdi = new Date();
    const birHaftaOnce = new Date(simdi.getTime() - 7 * 24 * 60 * 60 * 1000);
    const ikiHaftaOnce = new Date(simdi.getTime() - 14 * 24 * 60 * 60 * 1000);

    const buHaftaSiparisler = siparisler.filter(s => new Date(s.olusturulma_tarihi) >= birHaftaOnce);
    const gecenHaftaSiparisler = siparisler.filter(s => {
      const tarih = new Date(s.olusturulma_tarihi);
      return tarih >= ikiHaftaOnce && tarih < birHaftaOnce;
    });

    const buHaftaCiro = buHaftaSiparisler.reduce((toplam, s) => toplam + Number(s.toplam_tutar), 0);
    const gecenHaftaCiro = gecenHaftaSiparisler.reduce((toplam, s) => toplam + Number(s.toplam_tutar), 0);

    const ciroDegisim = gecenHaftaCiro === 0 ? (buHaftaCiro > 0 ? 100 : 0) : Math.round(((buHaftaCiro - gecenHaftaCiro) / gecenHaftaCiro) * 100);
    const siparisDegisim = gecenHaftaSiparisler.length === 0 ? (buHaftaSiparisler.length > 0 ? 100 : 0) : Math.round(((buHaftaSiparisler.length - gecenHaftaSiparisler.length) / gecenHaftaSiparisler.length) * 100);

    const ciro = siparisler.reduce((toplam, s) => toplam + Number(s.toplam_tutar), 0);
    const bekleyen = siparisler.filter(s => s.durum !== 'Teslim Edildi').length;
    const bekleyenDegisim = siparisler.filter(s => s.durum === 'Teslim Edildi').length === 0 ? 0 : Math.round((bekleyen / (siparisler.length || 1)) * 100);

    {/* satış trendi (son 7 gün - hassas tarih eşleşmesi) */}
    const son7GunDizisi = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        tamTarih: d.toLocaleDateString('tr-TR'),
        gunAdi: d.toLocaleDateString('tr-TR', { weekday: 'short' })
      };
    }).reverse();

    const trend = son7GunDizisi.map(gunObje => {
      const gunlukSatis = siparisler.filter(s => {
        const sTarih = new Date(s.olusturulma_tarihi).toLocaleDateString('tr-TR');
        return sTarih === gunObje.tamTarih;
      });
      return {
        gun: gunObje.gunAdi,
        satis: gunlukSatis.reduce((toplam, s) => toplam + Number(s.toplam_tutar), 0)
      };
    });

    {/* kategori dağılımı */}
    const katMap = {};
    siparisler.forEach(s => {
      if (s.urunler && Array.isArray(s.urunler)) {
        s.urunler.forEach(u => {
          const miktar = Number(u.adet || 1) * Number(u.fiyat || 0);
          katMap[u.kategori || 'Diğer'] = (katMap[u.kategori || 'Diğer'] || 0) + miktar;
        });
      }
    });
    const kategoriler = Object.keys(katMap).map(k => ({
      isim: k,
      oran: Math.round((katMap[k] / (ciro || 1)) * 100),
      deger: katMap[k],
      renk: k === 'Elektronik' ? '#6366f1' : k === 'Aksesuar' ? '#a855f7' : '#22c55e'
    })).sort((a, b) => b.deger - a.deger);

    {/* iade istatistikleri */}
    const onaylanmisIadeler = iadeler.filter(i => i.durum === 'Onaylandı');
    const iadeSayisi = onaylanmisIadeler.length;
    const iadeOrani = siparisler.length === 0 ? 0 : Math.round((iadeSayisi / siparisler.length) * 100);

    {/* sipariş durumları */}
    const durumlar = [
      { name: 'Teslim Edildi', value: siparisler.filter(s => s.durum === 'Teslim Edildi').length },
      { name: 'Bekleyen', value: siparisler.filter(s => s.durum === 'Hazırlanıyor' || s.durum === 'Kargoya Verildi').length },
      { name: 'İadeler', value: onaylanmisIadeler.length }
    ];

    return { trend, kategoriler, durumlar, ciro, bekleyen, ciroDegisim, siparisDegisim, bekleyenDegisim, iadeSayisi, iadeOrani };
  }, [siparisler, iadeler]);

  const [formVeri, setFormVeri] = useState({
    isim: '',
    aciklama: '',
    fiyat: '',
    resim_url: '',
    ek_resimler: [],
    kategori: 'Elektronik',
    ozellikler: {
      garanti: '2 Yıl Resmi Distribütör Garantili',
      teslimat: 'Ücretsiz ve Hızlı Teslimat',
      iade: '30 Gün İçinde Kolay İade'
    },
    teknik_detaylar: [
      { baslik: 'Malzeme', icerik: 'Yüksek kaliteli materyal' },
      { baslik: 'Teknoloji', icerik: 'En son teknoloji' },
      { baslik: 'Bağlantı', icerik: 'Gelişmiş bağlantı' }
    ]
  });

  useEffect(() => {
    if (urunler && kullanici) {
      setSaticiUrunleri(urunler.filter(u => u.satici_id === kullanici.id));
    }
  }, [urunler, kullanici]);

  useEffect(() => {
    if (aktifSekme === 'siparisler' || aktifSekme === 'bildirimler' || aktifSekme === 'istatistik' || aktifSekme === 'yorumlar' || aktifSekme === 'kuponlar') {
      siparisleriGetir();
      iadeleriGetir();
      if (aktifSekme === 'yorumlar') yorumlarıGetir();
      if (aktifSekme === 'kuponlar') kuponlariGetir();
    }
  }, [aktifSekme]);

  const siparisleriGetir = async () => {
    setYukleniyorSiparis(true);
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/siparisler`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setSiparisler(veri);
      }
    } catch (err) {
      console.error('Sipariş getirme hatası:', err);
    } finally {
      setYukleniyorSiparis(false);
    }
  };

  const iadeleriGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/iadeler`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setIadeler(veri);
      }
    } catch (err) {
      console.error('İade getirme hatası:', err);
    }
  };

  const yorumlarıGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/admin/gelen-yorumlar`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        setYorumlar(await cevap.json());
      }
    } catch (err) {
      console.error('Yorum getirme hatası:', err);
    }
  };

  const kuponlariGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/kuponlar`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        setKuponlar(await cevap.json());
      }
    } catch (err) {
      console.error('Kupon getirme hatası:', err);
    }
  };

  const kuponEkle = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/kuponlar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(yeniKupon)
      });
      if (cevap.ok) {
        setYeniKupon({ kod: '', indirim_yuzdesi: '' });
        setKuponFormAcik(false);
        kuponlariGetir();
      } else {
        const hataVeri = await cevap.json();
        alert(hataVeri.mesaj || 'Kupon eklenirken hata oluştu');
      }
    } catch (err) {
      console.error('Kupon ekleme hatası:', err);
    }
  };

  const kuponSil = async (id) => {
    if (!window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/kuponlar/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        kuponlariGetir();
      }
    } catch (err) {
      console.error('Kupon silme hatası:', err);
    }
  };

  const cevapGonder = async (yorumId) => {
    const mesaj = cevapFormlari[yorumId];
    if (!mesaj?.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/yorumlar/${yorumId}/cevap`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ cevap: mesaj })
      });

      if (cevap.ok) {
        setCevapFormlari({ ...cevapFormlari, [yorumId]: '' });
        yorumlarıGetir();
      }
    } catch (err) {
      console.error('Cevap gönderme hatası:', err);
    }
  };

  const iadeGuncelle = async (iadeId, durum) => {
    if (!window.confirm(`İade talebini ${durum.toLowerCase()} yapmak istediğinize emin misiniz?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/iadeler/${iadeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ durum })
      });
      
      if (cevap.ok) {
        iadeleriGetir();
        siparisleriGetir();
      }
    } catch (err) {
      console.error('İade güncelleme hatası:', err);
    }
  };

  const iadeGizle = async (iadeId) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/iadeler/${iadeId}/gizle`, {
        method: 'PUT',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        iadeleriGetir();
      }
    } catch (err) {
      console.error('İade gizleme hatası:', err);
    }
  };

  const bildirimleriTemizle = async () => {
    if (!window.confirm('Tüm bildirimleri temizlemek istediğinize emin misiniz?')) return;
    
    {/* her bir bildirimi sırayla gizle */}
    for (const iade of iadeler) {
      await iadeGizle(iade.id);
    }
  };

  const durumGuncelle = async (siparisId, yeniDurum) => {
    if (!window.confirm(`Sipariş durumunu "${yeniDurum}" olarak güncellemek istediğinize emin misiniz?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/siparisler/${siparisId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ durum: yeniDurum })
      });
      if (cevap.ok) {
        siparisleriGetir();
      }
    } catch (err) {
      console.error('Durum güncelleme hatası:', err);
    }
  };

  const siparisSil = async (siparisId) => {
    if (!window.confirm('Bu siparişi listenizden kaldırmak istediğinize emin misiniz?')) return;

    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`${API_URL}/api/satici/siparisler/${siparisId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        siparisleriGetir();
      }
    } catch (err) {
      console.error('Sipariş silme hatası:', err);
    }
  };

  const handleFormChange = (e) => {
    if (e.target.name.startsWith('ozellik_')) {
      const field = e.target.name.replace('ozellik_', '');
      setFormVeri({
        ...formVeri,
        ozellikler: { ...formVeri.ozellikler, [field]: e.target.value }
      });
    } else if (e.target.name.startsWith('teknik_')) {
      const index = parseInt(e.target.name.split('_')[1]);
      const field = e.target.name.split('_')[2];
      const yeniTeknik = [...formVeri.teknik_detaylar];
      yeniTeknik[index][field] = e.target.value;
      setFormVeri({ ...formVeri, teknik_detaylar: yeniTeknik });
    } else {
      setFormVeri({ ...formVeri, [e.target.name]: e.target.value });
    }
  };

  const handleEkResimEkle = () => {
    setFormVeri({
      ...formVeri,
      ek_resimler: [...formVeri.ek_resimler, '']
    });
  };

  const handleEkResimChange = (index, value) => {
    const yeniResimler = [...formVeri.ek_resimler];
    yeniResimler[index] = value;
    setFormVeri({ ...formVeri, ek_resimler: yeniResimler });
  };

  const handleEkResimSil = (index) => {
    const yeniResimler = formVeri.ek_resimler.filter((_, i) => i !== index);
    setFormVeri({ ...formVeri, ek_resimler: yeniResimler });
  };

  const handleModalAc = (urun = null) => {
    if (urun) {
      setSeciliUrun(urun);
      
      {/* veritabanından gelen ek_resimler verisinin dizi olduğundan emin olalım */}
      let baslangicEkResimler = [];
      if (urun.ek_resimler) {
        baslangicEkResimler = Array.isArray(urun.ek_resimler) 
          ? urun.ek_resimler 
          : (typeof urun.ek_resimler === 'string' ? JSON.parse(urun.ek_resimler) : []);
      }

      setFormVeri({
        isim: urun.isim,
        aciklama: urun.aciklama,
        fiyat: urun.fiyat,
        resim_url: urun.resim_url,
        ek_resimler: baslangicEkResimler,
        kategori: urun.kategori,
        ozellikler: urun.ozellikler || {
          garanti: '2 Yıl Resmi Distribütör Garantili',
          teslimat: 'Ücretsiz ve Hızlı Teslimat',
          iade: '30 Gün İçinde Kolay İade'
        },
        teknik_detaylar: urun.teknik_detaylar || [
          { baslik: 'Malzeme', icerik: '' },
          { baslik: 'Teknoloji', icerik: '' },
          { baslik: 'Bağlantı', icerik: '' }
        ]
      });
      setDuzenlemeModu(true);
    } else {
      setSeciliUrun(null);
      setFormVeri({
        isim: '',
        aciklama: '',
        fiyat: '',
        resim_url: '',
        ek_resimler: [],
        kategori: 'Elektronik',
        ozellikler: {
          garanti: '2 Yıl Resmi Distribütör Garantili',
          teslimat: 'Ücretsiz ve Hızlı Teslimat',
          iade: '30 Gün İçinde Kolay İade'
        },
        teknik_detaylar: [
          { baslik: 'Malzeme', icerik: '' },
          { baslik: 'Teknoloji', icerik: '' },
          { baslik: 'Bağlantı', icerik: '' }
        ]
      });
      setDuzenlemeModu(false);
    }
    setModalAcik(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = duzenlemeModu ? `${API_URL}/api/urunler/${seciliUrun.id}` : `${API_URL}/api/urunler`;
    const method = duzenlemeModu ? 'PUT' : 'POST';

    try {
      const cevap = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(formVeri)
      });

      if (cevap.ok) {
        setModalAcik(false);
        window.location.reload();
      }
    } catch (hata) {
      console.error('Ürün işlemi hatası:', hata);
    }
  };

  const handleSil = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      const token = localStorage.getItem('token');
      try {
        const cevap = await fetch(`${API_URL}/api/urunler/${id}`, {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });
        if (cevap.ok) {
          window.location.reload();
        }
      } catch (hata) {
        console.error('Ürün silme hatası:', hata);
      }
    }
  };

  if (!kullanici || kullanici.rol !== 'satici') {
    return <div className="yukleniyor">Bu sayfaya erişim yetkiniz yok.</div>;
  }

  if (yukleniyor) return <Loader fullPage />;

  return (
    <div className="kapsayici" style={{ padding: '60px 0' }}>
      <div className="satici-paneli-baslik">
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>Satıcı Paneli</h1>
          <p style={{ color: 'var(--metin-ikincil)' }}>İşletmenizi ve siparişlerinizi buradan yönetin</p>
        </div>
        <div className="satici-paneli-sekmeler">
          <button 
            onClick={() => setAktifSekme('urunler')} 
            className={`btn-ikincil ${aktifSekme === 'urunler' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'urunler' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white' }}
          >
            Ürünlerim
          </button>
          <button 
            onClick={() => setAktifSekme('siparisler')} 
            className={`btn-ikincil ${aktifSekme === 'siparisler' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'siparisler' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white' }}
          >
            Siparişler
          </button>
          <button 
            onClick={() => setAktifSekme('istatistik')} 
            className={`btn-ikincil ${aktifSekme === 'istatistik' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'istatistik' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white' }}
          >
            İstatistikler
          </button>
          <button 
            onClick={() => setAktifSekme('bildirimler')} 
            className={`btn-ikincil ${aktifSekme === 'bildirimler' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'bildirimler' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white', position: 'relative' }}
          >
            Bildirimler
            {iadeler.filter(i => i.durum === 'Beklemede').length > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '800', border: '2px solid var(--arka-plan)' }}>
                {iadeler.filter(i => i.durum === 'Beklemede').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setAktifSekme('yorumlar')} 
            className={`btn-ikincil ${aktifSekme === 'yorumlar' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'yorumlar' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white' }}
          >
            Gelen Yorumlar
          </button>
          <button 
            onClick={() => setAktifSekme('kuponlar')} 
            className={`btn-ikincil ${aktifSekme === 'kuponlar' ? 'aktif' : ''}`}
            style={{ borderRadius: '15px', padding: '12px 25px', background: aktifSekme === 'kuponlar' ? 'var(--vurgu-gradyan)' : 'var(--kart-arka-plan)', color: 'white' }}
          >
            Kuponlarım
          </button>
        </div>
      </div>

      {aktifSekme === 'urunler' ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={() => handleModalAc()} className="btn-ana" style={{ padding: '12px 25px', borderRadius: '12px' }}>
              <Plus size={20} /> Yeni Ürün Ekle
            </button>
          </div>

          {saticiUrunleri.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
              <Package size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Henüz ürününüz yok</h3>
            </div>
          ) : (
            <div className="urun-izgara">
              {saticiUrunleri.map(urun => (
                <motion.div key={urun.id} className="urun-karti" layout>
                  <div className="urun-resim-alani">
                    <img src={urun.resim_url} alt={urun.isim} className="urun-resim" />
                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px', zIndex: 10 }}>
                      <button onClick={() => handleModalAc(urun)} style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '10px', borderRadius: '12px', color: 'white' }}><Edit2 size={18} /></button>
                      <button onClick={() => handleSil(urun.id)} style={{ background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', padding: '10px', borderRadius: '12px', color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <div className="urun-bilgi">
                    <Link to={`/urun/${urun.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="urun-baslik">{urun.isim}</div>
                      <ExternalLink size={16} color="var(--metin-ikincil)" />
                    </Link>
                    <div className="urun-fiyat">₺{Number(urun.fiyat).toLocaleString('tr-TR')}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : aktifSekme === 'istatistik' ? (
        <div className="istatistik-paneli">
          {/* üst özet kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ background: 'var(--panel-arka-plan)', padding: '25px', borderRadius: '24px', border: '1px solid var(--kart-sinir)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '15px', color: 'var(--vurgu-rengi)' }}><DollarSign size={24} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: istatistikVerileri.ciroDegisim >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
                  {istatistikVerileri.ciroDegisim >= 0 ? <TrendingUp size={16} /> : <ArrowDownRight size={16} />} 
                  %{Math.abs(istatistikVerileri.ciroDegisim)}
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Toplam Ciro</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'white' }}>₺{istatistikVerileri.ciro.toLocaleString('tr-TR')}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--panel-arka-plan)', padding: '25px', borderRadius: '24px', border: '1px solid var(--kart-sinir)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '15px', color: '#22c55e' }}><ShoppingBag size={24} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: istatistikVerileri.siparisDegisim >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.85rem', fontWeight: '700' }}>
                  {istatistikVerileri.siparisDegisim >= 0 ? <TrendingUp size={16} /> : <ArrowDownRight size={16} />} 
                  %{Math.abs(istatistikVerileri.siparisDegisim)}
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Toplam Sipariş</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'white' }}>{siparisler.length}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--panel-arka-plan)', padding: '25px', borderRadius: '24px', border: '1px solid var(--kart-sinir)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '15px', color: '#f59e0b' }}><Clock size={24} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: '700' }}>
                  <Clock size={16} /> %{istatistikVerileri.bekleyenDegisim} Oran
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Bekleyen Siparişler</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'white' }}>{istatistikVerileri.bekleyen}</h3>
              </div>
            </div>

            <div style={{ background: 'var(--panel-arka-plan)', padding: '25px', borderRadius: '24px', border: '1px solid var(--kart-sinir)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '15px', color: '#ef4444' }}><AlertCircle size={24} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--metin-ikincil)', fontSize: '0.85rem' }}>{istatistikVerileri.iadeSayisi} İade</div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>İade Oranı</p>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '5px', color: 'white' }}>%{istatistikVerileri.iadeOrani}</h3>
              </div>
            </div>
          </div>

          {/* grafikler alanı */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '40px' }}>
            <div style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>Satış Trendi</h4>
                <select style={{ background: '#1a1a1a', border: '1px solid var(--kart-sinir)', color: 'white', padding: '8px 15px', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}>
                  <option style={{ background: '#1a1a1a', color: 'white' }}>Son 7 Gün</option>
                  <option style={{ background: '#1a1a1a', color: 'white' }}>Son 30 Gün</option>
                </select>
              </div>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={istatistikVerileri.trend}>
                    <defs>
                      <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--vurgu-rengi)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--vurgu-rengi)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="gun" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: 'white' }}
                      formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']}
                    />
                    <Area type="monotone" dataKey="satis" stroke="var(--vurgu-rengi)" strokeWidth={3} fillOpacity={1} fill="url(#colorSatis)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '30px' }}>Sipariş Durumu</h4>
              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={istatistikVerileri.durumlar}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={10}
                      dataKey="value"
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: 'white' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Dönüşüm Oranı</span>
                  <span style={{ fontWeight: '700', color: 'white' }}>%3.4</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '34%', height: '100%', background: 'var(--vurgu-gradyan)' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
             <div style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '25px' }}>Kategori Performansı</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   {istatistikVerileri.kategoriler.length > 0 ? istatistikVerileri.kategoriler.map((item, idx) => (
                     <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>{item.isim}</span>
                          <span style={{ color: 'var(--metin-ikincil)', fontSize: '0.85rem' }}>%{item.oran}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.oran}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            style={{ height: '100%', background: item.renk }} 
                          />
                        </div>
                     </div>
                   )) : (
                     <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Kategori verisi henüz yok</p>
                   )}
                </div>
             </div>

             <div style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '25px' }}>Hızlı Muhasebe</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>Net Kar</p>
                    <h5 style={{ fontSize: '1.2rem', color: '#22c55e', marginTop: '5px' }}>₺{(istatistikVerileri.ciro * 0.7).toLocaleString('tr-TR')}</h5>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>Kesintiler</p>
                    <h5 style={{ fontSize: '1.2rem', color: '#ef4444', marginTop: '5px' }}>₺{(istatistikVerileri.ciro * 0.3).toLocaleString('tr-TR')}</h5>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', gridColumn: 'span 2' }}>
                    <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem' }}>Gelecek Ödemeler</p>
                    <h5 style={{ fontSize: '1.2rem', color: 'white', marginTop: '5px' }}>₺{(siparisler.filter(s => s.durum !== 'Teslim Edildi').reduce((toplam, s) => toplam + Number(s.toplam_tutar), 0) * 0.7).toLocaleString('tr-TR')}</h5>
                  </div>
                </div>
             </div>
          </div>
        </div>
      ) : aktifSekme === 'bildirimler' ? (
        <div className="bildirim-paneli">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white' }}>Bildirimler & İade Talepleri</h3>
            {iadeler.length > 0 && (
              <button 
                onClick={bildirimleriTemizle}
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--metin-ikincil)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--kart-sinir)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Trash2 size={18} /> Tümünü Temizle
              </button>
            )}
          </div>
          
          {iadeler.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
              <AlertCircle size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--metin-ikincil)' }}>Henüz bildirim yok</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {iadeler.map(iade => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={iade.id} 
                  style={{ background: 'var(--panel-arka-plan)', padding: '25px', borderRadius: '25px', border: '1px solid var(--kart-sinir)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img src={iade.resim_url} alt={iade.urun_isim} style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '-10px', left: '-10px', background: '#ef4444', color: 'white', padding: '5px', borderRadius: '50%' }}><Package size={16} /></div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white', marginBottom: '5px' }}>{iade.urun_isim} - İade Talebi</h4>
                      <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem', marginBottom: '8px' }}>
                        <Users size={14} style={{ marginRight: '5px' }} /> <strong>{iade.kullanici_isim}</strong> ({iade.kullanici_email})
                      </p>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 15px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--metin-ikincil)' }}><strong>Sebep:</strong> {iade.neden}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: '700',
                        background: iade.durum === 'Beklemede' ? 'rgba(245, 158, 11, 0.1)' : iade.durum === 'Onaylandı' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: iade.durum === 'Beklemede' ? '#f59e0b' : iade.durum === 'Onaylandı' ? '#22c55e' : '#ef4444'
                      }}>
                        {iade.durum}
                      </span>
                    </div>
                    
                    {iade.durum === 'Beklemede' ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => iadeGuncelle(iade.id, 'Reddedildi')}
                          style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' }}
                        >
                          Reddet
                        </button>
                        <button 
                          onClick={() => iadeGuncelle(iade.id, 'Onaylandı')}
                          style={{ padding: '10px 20px', borderRadius: '12px', background: '#22c55e', color: 'white', fontSize: '0.9rem', fontWeight: '600' }}
                        >
                          Onayla
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => iadeGizle(iade.id)}
                        style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--metin-ikincil)', fontSize: '0.9rem', fontWeight: '600', border: '1px solid var(--kart-sinir)' }}
                      >
                        Kaldır
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : aktifSekme === 'yorumlar' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '30px' }}>Ürünlerime Gelen Yorumlar</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
            {yorumlar.map(yorum => (
              <div key={yorum.id} className="ozellik-karti" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--vurgu-rengi)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {yorum.urun_isim}
                  </div>
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
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', color: 'white' }}>"{yorum.yorum}"</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--kart-sinir)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--vurgu-gradyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800' }}>
                      {yorum.kullanici_isim[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '600' }}>{yorum.kullanici_isim}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--metin-ikincil)' }}>
                    {new Date(yorum.olusturulma_tarihi).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                {/* Cevap Bolumu */}
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed var(--kart-sinir)' }}>
                  {yorum.cevap ? (
                    <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--vurgu-rengi)' }}>Cevabınız</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--metin-ikincil)' }}>{new Date(yorum.cevap_tarihi).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--metin-ana)' }}>{yorum.cevap}</p>
                    </div>
                  ) : (
                    <div>
                      {cevapFormlari[yorum.id] !== undefined ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <textarea 
                            value={cevapFormlari[yorum.id]}
                            onChange={(e) => setCevapFormlari({ ...cevapFormlari, [yorum.id]: e.target.value })}
                            placeholder="Cevabınızı yazın..."
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', padding: '12px', color: 'white', resize: 'none', fontSize: '0.9rem' }}
                            rows={3}
                          />
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => cevapGonder(yorum.id)}
                              className="btn-ana" 
                              style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                            >
                              Gönder
                            </button>
                            <button 
                              onClick={() => setCevapFormlari({ ...cevapFormlari, [yorum.id]: undefined })}
                              style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '10px', color: 'var(--metin-ikincil)', fontSize: '0.85rem' }}
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setCevapFormlari({ ...cevapFormlari, [yorum.id]: '' })}
                          className="btn-ikincil" 
                          style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--vurgu-rengi)', fontSize: '0.9rem', fontWeight: '700' }}
                        >
                          Cevap Yaz
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {yorumlar.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px', border: '1px dashed var(--kart-sinir)' }}>
                <MessageSquare size={48} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                <h3>Henüz yorum yok</h3>
                <p style={{ color: 'var(--metin-ikincil)' }}>Ürünleriniz için herhangi bir müşteri yorumu bulunmuyor.</p>
              </div>
            )}
          </div>
        </motion.div>
      ) : aktifSekme === 'kuponlar' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>İndirim Kuponlarım</h2>
            <button 
              onClick={() => setKuponFormAcik(!kuponFormAcik)} 
              className="btn-ana" 
              style={{ padding: '12px 25px', borderRadius: '12px' }}
            >
              {kuponFormAcik ? 'İptal Et' : <><Plus size={20} /> Yeni Kupon Oluştur</>}
            </button>
          </div>

          {kuponFormAcik && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '24px', border: '1px solid var(--vurgu-rengi)', marginBottom: '40px', overflow: 'hidden' }}
            >
              <form onSubmit={kuponEkle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Kupon Kodu (Örn: PLEXA20)</label>
                  <input 
                    required
                    type="text"
                    value={yeniKupon.kod}
                    onChange={(e) => setYeniKupon({ ...yeniKupon, kod: e.target.value.toUpperCase() })}
                    placeholder="KUPON KODU"
                    style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>İndirim Yüzdesi (%)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    max="100"
                    value={yeniKupon.indirim_yuzdesi}
                    onChange={(e) => setYeniKupon({ ...yeniKupon, indirim_yuzdesi: e.target.value })}
                    placeholder="20"
                    style={{ width: '100%', padding: '15px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}
                  />
                </div>
                <button type="submit" className="btn-ana" style={{ height: '52px', padding: '0 30px', borderRadius: '12px' }}>Kuponu Kaydet</button>
              </form>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {kuponlar.map(kupon => (
              <div 
                key={kupon.id} 
                style={{ 
                  background: 'var(--panel-arka-plan)', 
                  padding: '25px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--kart-sinir)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '10px 15px', background: 'var(--vurgu-gradyan)', color: 'white', fontWeight: '800', borderRadius: '0 0 0 15px', fontSize: '0.9rem' }}>
                  %{kupon.indirim_yuzdesi} İNDİRİM
                </div>
                <div style={{ marginTop: '10px' }}>
                  <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>KUPON KODU</p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '2px', margin: '5px 0' }}>{kupon.kod}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--metin-ikincil)' }}>
                      {new Date(kupon.olusturulma_tarihi).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                    </div>
                    <button 
                      onClick={() => kuponSil(kupon.id)}
                      style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: '#ef4444' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {kuponlar.length === 0 && !kuponFormAcik && (
            <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px' }}>
              <Tag size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3 style={{ color: 'var(--metin-ikincil)' }}>Henüz bir kupon oluşturmadınız</h3>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="siparis-paneli">
          {yukleniyorSiparis ? (
            <Loader />
          ) : siparisler.filter(s => s.urunler.some(u => u.gorunur !== false)).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px' }}>
              <ShoppingBag size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3>Görüntülenecek aktif sipariş yok</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {siparisler
                .filter(s => s.urunler.some(u => u.gorunur !== false))
                .map(siparis => (
                <div key={siparis.siparis_id} style={{ background: 'var(--panel-arka-plan)', padding: '30px', borderRadius: '25px', border: '1px solid var(--kart-sinir)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                        <h4 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff' }}>Sipariş #{siparis.siparis_id}</h4>
                        <span style={{
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: siparis.durum === 'Hazırlanıyor' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: siparis.durum === 'Hazırlanıyor' ? '#f59e0b' : '#10b981'
                        }}>
                          {siparis.durum}
                        </span>
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={14} />
                        {new Date(siparis.olusturulma_tarihi).toLocaleString('tr-TR')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--vurgu-rengi)' }}>₺{Number(siparis.toplam_tutar).toLocaleString('tr-TR')}</div>
                      {siparis.kupon_kodu && (
                        <div style={{ 
                          marginTop: '8px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          background: 'rgba(99, 102, 241, 0.1)', 
                          color: '#6366f1', 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}>
                          <Tag size={12} /> KUPON: {siparis.kupon_kodu}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '25px' }}>
                    {/* Müşteri ve Adres Bilgileri */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#6366f1' }}>
                        <Package size={16} /> Müşteri & Teslimat
                      </h5>
                      <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                        <p style={{ fontWeight: '700', marginBottom: '5px', color: '#ffffff' }}>{siparis.alici_isim}</p>
                        <p style={{ color: '#cbd5e1', marginBottom: '10px' }}>{siparis.alici_email}</p>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '10px 0' }} />
                        {siparis.adres_detaylari ? (
                          <>
                            <p style={{ fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>{siparis.adres_detaylari.baslik}</p>
                            <p style={{ color: '#cbd5e1' }}>{siparis.adres_detaylari.adres_detay}</p>
                            <p style={{ color: '#cbd5e1' }}>{siparis.adres_detaylari.ilce} / {siparis.adres_detaylari.sehir}</p>
                          </>
                        ) : (
                          <p style={{ color: '#ef4444' }}>Adres bilgisi bulunamadı</p>
                        )}
                      </div>
                    </div>

                    {/* Ödeme Bilgileri */}
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#6366f1' }}>
                        <CreditCard size={16} /> Ödeme Bilgileri
                      </h5>
                      <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>
                        {siparis.odeme_detaylari ? (
                          <>
                            <p style={{ marginBottom: '8px', color: '#ffffff' }}><span style={{ color: '#cbd5e1' }}>Kart Sahibi:</span> {siparis.odeme_detaylari.kartSahibi}</p>
                            <p style={{ marginBottom: '8px', color: '#ffffff' }}><span style={{ color: '#cbd5e1' }}>Kart No:</span> {siparis.odeme_detaylari.kartNo}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#22c55e', marginTop: '12px', fontWeight: '600' }}>
                              <CheckCircle size={14} /> Ödeme Onaylandı
                            </p>
                          </>
                        ) : (
                          <p style={{ color: '#cbd5e1' }}>Ödeme detayları mevcut değil</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
                    <h5 style={{ marginBottom: '15px', opacity: 0.9, color: '#ffffff', fontWeight: '700' }}>Sipariş İçeriği</h5>
                    {siparis.urunler.map((u, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px', padding: '12px 0', borderBottom: idx === siparis.urunler.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                        <img src={u.resim_url} alt={u.isim} style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '1rem', color: '#ffffff' }}>{u.isim}</div>
                          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{u.adet} adet x ₺{Number(u.fiyat).toLocaleString('tr-TR')}</div>
                        </div>
                        <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '1.1rem' }}>₺{Number(u.fiyat * u.adet).toLocaleString('tr-TR')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Aksiyon Butonları Alt Kısım */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {siparis.durum === 'Hazırlanıyor' && (
                      <button 
                        onClick={() => durumGuncelle(siparis.siparis_id, 'Kargoya Verildi')}
                        className="btn-ana" 
                        style={{ padding: '12px 25px', fontSize: '0.9rem', borderRadius: '15px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'white' }}
                      >
                        <Truck size={18} /> Kargoya Ver
                      </button>
                    )}
                    {siparis.durum !== 'Teslim Edildi' && (
                      <button 
                        onClick={() => durumGuncelle(siparis.siparis_id, 'Teslim Edildi')}
                        className="btn-ana" 
                        style={{ padding: '12px 25px', fontSize: '0.9rem', borderRadius: '15px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'white' }}
                      >
                        <CheckCircle size={18} /> Teslim Et
                      </button>
                    )}
                    {siparis.durum === 'Teslim Edildi' && (
                      <button 
                        onClick={() => siparisSil(siparis.siparis_id)}
                        className="btn-ikincil" 
                        style={{ padding: '12px 25px', fontSize: '0.9rem', borderRadius: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Trash2 size={18} /> Siparişi Listeden Kaldır
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalAcik && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ background: 'var(--arka-plan)', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '30px', border: '1px solid var(--kart-sinir)', padding: '40px', position: 'relative' }}>
              <button onClick={() => setModalAcik(false)} style={{ position: 'absolute', top: '25px', right: '25px', color: 'var(--metin-ikincil)' }}><X size={30} /></button>
              <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{duzenlemeModu ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>

              <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Ürün Adı</label>
                    <input name="isim" value={formVeri.isim} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Fiyat (₺)</label>
                    <input name="fiyat" type="number" value={formVeri.fiyat} onChange={handleFormChange} required style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Ana Resim URL</label>
                  <input name="resim_url" value={formVeri.resim_url} onChange={handleFormChange} required placeholder="https://..." style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }} />
                </div>

                <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--kart-sinir)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <label style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Ek Ürün Resimleri</label>
                    <button type="button" onClick={handleEkResimEkle} style={{ color: 'var(--vurgu-rengi)', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Plus size={16} /> Resim Ekle
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formVeri.ek_resimler.map((resim, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          value={resim} 
                          onChange={(e) => handleEkResimChange(idx, e.target.value)} 
                          placeholder="Ek resim URL..."
                          style={{ flex: 1, padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', fontSize: '0.85rem' }} 
                        />
                        <button type="button" onClick={() => handleEkResimSil(idx)} style={{ color: '#ef4444', padding: '5px' }}><Trash2 size={18} /></button>
                      </div>
                    ))}
                    {formVeri.ek_resimler.length === 0 && (
                      <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem', textAlign: 'center', opacity: 0.5 }}>Henüz ek resim eklenmedi.</p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kategori</label>
                  <select name="kategori" value={formVeri.kategori} onChange={handleFormChange} style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white' }}>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Moda">Moda</option>
                    <option value="Aksesuar">Aksesuar</option>
                    <option value="Yasam">Yaşam</option>
                    <option value="Ofis">Ofis</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)' }}>Kısa Açıklama</label>
                  <textarea name="aciklama" value={formVeri.aciklama} onChange={handleFormChange} required rows={3} style={{ width: '100%', padding: '12px', background: 'var(--kart-arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '12px', color: 'white', resize: 'none' }} />
                </div>

                {/* Rozet Seçenekleri */}
                <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--kart-sinir)' }}>
                  <h4 style={{ marginBottom: '15px', fontSize: '1rem', color: 'var(--vurgu-rengi)' }}>Hızlı Bilgi Rozetleri</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input name="ozellik_garanti" value={formVeri.ozellikler.garanti} onChange={handleFormChange} placeholder="Garanti" style={{ padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                    <input name="ozellik_teslimat" value={formVeri.ozellikler.teslimat} onChange={handleFormChange} placeholder="Teslimat" style={{ padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white' }} />
                    <input name="ozellik_iade" value={formVeri.ozellikler.iade} onChange={handleFormChange} placeholder="İade" style={{ padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', gridColumn: 'span 2' }} />
                  </div>
                </div>

                {/* Teknik Detaylar */}
                <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h4 style={{ marginBottom: '15px', fontSize: '1rem', color: 'var(--vurgu-rengi)' }}>Teknik Özellikler</h4>
                  {formVeri.teknik_detaylar.map((detay, idx) => (
                    <div key={idx} style={{ marginBottom: '15px' }}>
                      <input
                        name={`teknik_${idx}_baslik`}
                        value={detay.baslik}
                        onChange={handleFormChange}
                        placeholder="Başlık (örn: Malzeme)"
                        style={{ width: '100%', marginBottom: '5px', padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', fontWeight: '600' }}
                      />
                      <textarea
                        name={`teknik_${idx}_icerik`}
                        value={detay.icerik}
                        onChange={handleFormChange}
                        placeholder="İçerik açıklaması..."
                        rows={2}
                        style={{ width: '100%', padding: '10px', background: 'var(--arka-plan)', border: '1px solid var(--kart-sinir)', borderRadius: '10px', color: 'white', resize: 'none' }}
                      />
                    </div>
                  ))}
                </div>

                <button className="btn-ana" style={{ width: '100%', padding: '18px', borderRadius: '15px', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '700' }}>
                  {duzenlemeModu ? 'Değişiklikleri Uygula' : 'Ürünü Satışa Çıkar'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaticiPaneli;
