import { motion } from 'framer-motion';
import { RotateCcw, ShieldCheck, Clock, CheckCircle } from 'lucide-react';

const IadeSartlari = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kapsayici" style={{ padding: '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <RotateCcw size={60} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>İade ve Değişim Şartları</h1>
        <p style={{ color: 'var(--metin-ikincil)' }}>Plexa olarak müşteri memnuniyeti önceliğimizdir.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--kart-arka-plan)', padding: '50px', borderRadius: '40px', border: '1px solid var(--kart-sinir)' }}>
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--vurgu-rengi)' }}>
            <Clock size={20} /> 14 Günlük İade Hakkı
          </h3>
          <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
            Satın aldığınız ürünleri, teslim aldığınız tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin iade edebilirsiniz. İade edilecek ürünün orijinal kutusunda, kullanılmamış ve satılabilirlik özelliğini yitirmemiş olması gerekmektedir.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--vurgu-rengi)' }}>
            <ShieldCheck size={20} /> Ücretsiz İade Süreci
          </h3>
          <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
            Anlaşmalı kargo firmalarımız aracılığıyla iadelerinizi ücretsiz olarak gönderebilirsiniz. İade talebinizi profil sayfanızdaki "Siparişlerim" bölümünden başlatabilirsiniz.
          </p>
        </section>

        <section>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--vurgu-rengi)' }}>
            <CheckCircle size={20} /> Geri Ödeme
          </h3>
          <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
            İadeniz onaylandıktan sonra, ödemeniz 3-7 iş günü içerisinde orijinal ödeme yönteminize geri yüklenir. Bankanızın yansıtma süresi bu sürece dahil değildir.
          </p>
        </section>
      </div>
    </motion.div>
  );
};

export default IadeSartlari;
