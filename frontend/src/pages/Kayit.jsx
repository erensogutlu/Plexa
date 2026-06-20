import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, AlertCircle, ShoppingBag, Store } from 'lucide-react';

const Kayit = () => {
  const [formData, setFormData] = useState({
    isim: '',
    email: '',
    sifre: '',
    rol: 'alici'
  });
  const [hata, setHata] = useState('');
  const { kayitOl } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    const sonuc = await kayitOl(formData.isim, formData.email, formData.sifre, formData.rol);
    if (sonuc.basarili) {
      navigate('/');
    } else {
      setHata(sonuc.mesaj);
    }
  };

  return (
    <div className="kapsayici" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '40px 0' }}>
      <motion.div 
        className="ozellik-karti" 
        style={{ width: '100%', maxWidth: '500px', padding: '40px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            background: 'var(--vurgu-gradyan)', 
            borderRadius: '15px', 
            display: 'inline-flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <UserPlus color="white" size={30} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Yeni Hesap Oluştur</h2>
          <p style={{ color: 'var(--metin-ikincil)' }}>Plexa ailesine katılın</p>
        </div>

        {hata && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            color: '#ef4444', 
            padding: '12px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Ad Soyad</label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} size={20} />
              <input 
                type="text" 
                value={formData.isim}
                onChange={(e) => setFormData({...formData, isim: e.target.value})}
                required
                style={{ 
                  width: '100%', 
                  padding: '15px 15px 15px 45px', 
                  background: 'var(--kart-arka-plan)', 
                  border: '1px solid var(--kart-sinir)', 
                  borderRadius: '12px', 
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="Adınız Soyadınız"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>E-posta</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} size={20} />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{ 
                  width: '100%', 
                  padding: '15px 15px 15px 45px', 
                  background: 'var(--kart-arka-plan)', 
                  border: '1px solid var(--kart-sinir)', 
                  borderRadius: '12px', 
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="ornek@email.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} size={20} />
              <input 
                type="password" 
                value={formData.sifre}
                onChange={(e) => setFormData({...formData, sifre: e.target.value})}
                required
                style={{ 
                  width: '100%', 
                  padding: '15px 15px 15px 45px', 
                  background: 'var(--kart-arka-plan)', 
                  border: '1px solid var(--kart-sinir)', 
                  borderRadius: '12px', 
                  color: 'white',
                  outline: 'none'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '15px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Hesap Türü</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div 
                onClick={() => setFormData({...formData, rol: 'alici'})}
                style={{ 
                  padding: '15px', 
                  borderRadius: '12px', 
                  border: `2px solid ${formData.rol === 'alici' ? 'var(--vurgu-rengi)' : 'var(--kart-sinir)'}`,
                  background: formData.rol === 'alici' ? 'rgba(99, 102, 241, 0.1)' : 'var(--kart-arka-plan)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'var(--gecis-hizi)'
                }}
              >
                <ShoppingBag size={24} style={{ marginBottom: '8px', color: formData.rol === 'alici' ? 'var(--vurgu-rengi)' : 'var(--metin-ikincil)' }} />
                <div style={{ fontWeight: '600', color: formData.rol === 'alici' ? 'white' : 'var(--metin-ikincil)' }}>Alıcı</div>
              </div>
              <div 
                onClick={() => setFormData({...formData, rol: 'satici'})}
                style={{ 
                  padding: '15px', 
                  borderRadius: '12px', 
                  border: `2px solid ${formData.rol === 'satici' ? 'var(--vurgu-rengi)' : 'var(--kart-sinir)'}`,
                  background: formData.rol === 'satici' ? 'rgba(99, 102, 241, 0.1)' : 'var(--kart-arka-plan)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'var(--gecis-hizi)'
                }}
              >
                <Store size={24} style={{ marginBottom: '8px', color: formData.rol === 'satici' ? 'var(--vurgu-rengi)' : 'var(--metin-ikincil)' }} />
                <div style={{ fontWeight: '600', color: formData.rol === 'satici' ? 'white' : 'var(--metin-ikincil)' }}>Satıcı</div>
              </div>
            </div>
          </div>

          <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', justifyContent: 'center' }}>
            Kayıt Ol
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', color: 'var(--metin-ikincil)' }}>
          Zaten hesabın var mı? <Link to="/giris" style={{ color: 'var(--vurgu-rengi)', fontWeight: '600' }}>Giriş Yap</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Kayit;
