import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Server } from 'lucide-react';

const GizlilikPolitikasi = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="kapsayici" style={{ padding: '80px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Shield size={60} color="#22c55e" style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '20px' }}>Gizlilik Politikası</h1>
        <p style={{ color: 'var(--metin-ikincil)' }}>Verileriniz Plexa güvencesi altındadır.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--kart-arka-plan)', padding: '50px', borderRadius: '40px', border: '1px solid var(--kart-sinir)' }}>
        <div style={{ display: 'grid', gap: '40px' }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Eye size={20} color="var(--vurgu-rengi)" /> Veri Toplama
            </h3>
            <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
              Deneyiminizi iyileştirmek adına sadece gerekli olan temel bilgileri (ad, e-posta, teslimat adresi) topluyoruz. Çerezler aracılığıyla site trafiğimizi analiz ediyor ve size özel teklifler sunuyoruz.
            </p>
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Lock size={20} color="var(--vurgu-rengi)" /> Güvenlik
            </h3>
            <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
              Tüm verileriniz 256-bit SSL şifreleme ile korunmaktadır. Kredi kartı bilgileriniz asla sunucularımızda saklanmaz, doğrudan güvenli ödeme geçidi sağlayıcılarına iletilir.
            </p>
          </div>

          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <Server size={20} color="var(--vurgu-rengi)" /> Üçüncü Taraflar
            </h3>
            <p style={{ color: 'var(--metin-ikincil)', lineHeight: '1.8' }}>
              Bilgileriniz kargo firmaları dışında hiçbir üçüncü taraf kurum veya kuruluşla paylaşılmaz. Verileriniz sadece sipariş süreçlerini yönetmek amacıyla kullanılır.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GizlilikPolitikasi;
