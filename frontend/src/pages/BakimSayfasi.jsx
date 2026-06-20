import { motion } from 'framer-motion';
import { Settings, Wrench, Clock, ArrowLeft } from 'lucide-react';

const BakimSayfasi = () => {
  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'var(--arka-plan)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ marginBottom: '30px', color: 'var(--vurgu-rengi)' }}
      >
        <Settings size={80} />
      </motion.div>
      
      <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>
        Şu An Bakımdayız
      </h1>
      
      <p style={{ color: 'var(--metin-ikincil)', maxWidth: '500px', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '40px' }}>
        Sizlere daha iyi bir deneyim sunabilmek için Plexa'yı güncelliyoruz. 
        Kısa süre sonra çok daha güçlü bir şekilde döneceğiz.
      </p>

      <div style={{ display: 'flex', gap: '20px', color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} /> Yakında Döneceğiz
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wrench size={16} /> Altyapı Güncellemesi
        </div>
      </div>
    </div>
  );
};

export default BakimSayfasi;
