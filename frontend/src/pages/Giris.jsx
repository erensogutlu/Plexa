import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

const Giris = () => {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [hata, setHata] = useState('');
  const { girisYap } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHata('');
    const sonuc = await girisYap(email, sifre);
    if (sonuc.basarili) {
      navigate('/');
    } else {
      setHata(sonuc.mesaj);
    }
  };

  return (
    <div className="kapsayici" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', marginTop: '40px' }}>
      <motion.div 
        className="ozellik-karti" 
        style={{ width: '100%', maxWidth: '450px', padding: '40px' }}
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
            <LogIn color="white" size={30} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Tekrar Hoş Geldin</h2>
          <p style={{ color: 'var(--metin-ikincil)' }}>Plexa dünyasına giriş yapın</p>
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>E-posta</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>Şifre</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--metin-ikincil)' }} size={20} />
              <input 
                type="password" 
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
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

          <button className="btn-ana" style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', justifyContent: 'center' }}>
            Giriş Yap
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', color: 'var(--metin-ikincil)' }}>
          Hesabın yok mu? <Link to="/kayit" style={{ color: 'var(--vurgu-rengi)', fontWeight: '600' }}>Kayıt Ol</Link>
        </div>

        {/* demo hesaplar bölümü */}
        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--kart-sinir)' }}>
          <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>
            Hızlı Test İçin Demo Hesaplar
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button 
              type="button"
              onClick={() => { setEmail('eren@plexa.com'); setSifre('123456'); }}
              style={{ 
                padding: '10px 5px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                border: '1px solid rgba(99, 102, 241, 0.2)', 
                borderRadius: '10px', 
                color: 'var(--vurgu-rengi)', 
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: '0.3s'
              }}
            >
              Alıcı Demo
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('satici@plexa.com'); setSifre('123456'); }}
              style={{ 
                padding: '10px 5px', 
                background: 'rgba(168, 85, 247, 0.1)', 
                border: '1px solid rgba(168, 85, 247, 0.2)', 
                borderRadius: '10px', 
                color: '#a855f7', 
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: '0.3s'
              }}
            >
              Satıcı Demo
            </button>
            <button 
              type="button"
              onClick={() => { setEmail('admin@plexa.com'); setSifre('123456'); }}
              style={{ 
                padding: '10px 5px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.2)', 
                borderRadius: '10px', 
                color: '#10b981', 
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: '0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Giris;
