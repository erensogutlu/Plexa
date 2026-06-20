import { motion } from 'framer-motion';
import { HelpCircle, Search, MessageCircle, FileText, ShoppingBag, CreditCard } from 'lucide-react';

const YardimMerkezi = () => {
  const yardimKonulari = [
    { icon: <ShoppingBag />, title: 'Sipariş İşlemleri', desc: 'Sipariş takibi ve iptal süreçleri hakkında bilgiler.' },
    { icon: <CreditCard />, title: 'Ödeme ve Faturalandırma', desc: 'Ödeme yöntemleri ve taksit seçenekleri.' },
    { icon: <FileText />, title: 'Üyelik İşlemleri', desc: 'Hesap oluşturma ve profil yönetimi.' },
    { icon: <MessageCircle />, title: 'Bize Ulaşın', desc: '7/24 canlı destek ve iletişim kanallarımız.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kapsayici" style={{ padding: '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <HelpCircle size={60} color="var(--vurgu-rengi)" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Yardım Merkezi</h1>
        <p style={{ color: 'var(--metin-ikincil)', maxWidth: '600px', margin: '0 auto' }}>
          Sorularınıza hızlı cevaplar bulmak için kategorileri inceleyebilir veya arama yapabilirsiniz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {yardimKonulari.map((konu, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -10 }}
            style={{ 
              padding: '40px', 
              background: 'var(--kart-arka-plan)', 
              borderRadius: '30px', 
              border: '1px solid var(--kart-sinir)',
              textAlign: 'center'
            }}
          >
            <div style={{ color: 'var(--vurgu-rengi)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              {konu.icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{konu.title}</h3>
            <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.9rem' }}>{konu.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default YardimMerkezi;
