import { Camera, MessageCircle, Play, Share2, Mail, MapPin, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = ({ siteBasligi, destekEmail }) => {
  return (
    <footer className="footer" style={{ marginTop: '80px', background: 'var(--panel-arka-plan)', borderTop: '1px solid var(--kart-sinir)', paddingTop: '50px', paddingBottom: '30px' }}>
      <div className="kapsayici">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          
          {/* logo ve kısa bilgi */}
          <div className="footer-kolon">
            <Link to="/" className="logo" style={{ marginBottom: '15px', display: 'flex', fontSize: '1.4rem' }}>
              <div className="logo-simge">
                <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#mini_logo_grad)" fillOpacity="0.1" />
                  <path d="M12 10V30M12 10H22C26.4183 10 30 13.5817 30 18C30 22.4183 26.4183 26 22 26H12" stroke="url(#mini_logo_grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <defs>
                    <linearGradient id="mini_logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366f1" />
                      <stop offset="1" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {siteBasligi?.toUpperCase() || 'PLEXA'}
            </Link>
            <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Geleceğin teknolojisi ve tarzı {siteBasligi || 'Plexa'}'da buluşuyor. Premium e-ticaret deneyimi.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#" style={{ color: 'var(--metin-ikincil)' }}><Camera size={18} /></a>
              <a href="#" style={{ color: 'var(--metin-ikincil)' }}><MessageCircle size={18} /></a>
              <a href="#" style={{ color: 'var(--metin-ikincil)' }}><Play size={18} /></a>
              <a href="#" style={{ color: 'var(--metin-ikincil)' }}><Share2 size={18} /></a>
            </div>
          </div>

          {/* kurumsal */}
          <div className="footer-kolon">
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', color: 'white' }}>Hızlı Menü</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '10px' }}><Link to="/" style={{ color: 'var(--metin-ikincil)' }}>Ana Sayfa</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/kombinler/yaz" style={{ color: 'var(--metin-ikincil)' }}>Yaz Kombinleri</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/kombinler/kis" style={{ color: 'var(--metin-ikincil)' }}>Kış Kombinleri</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/satici-paneli" style={{ color: 'var(--vurgu-rengi)' }}>Satıcı Paneli</Link></li>
            </ul>
          </div>

          {/* yardım ve destek */}
          <div className="footer-kolon">
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', color: 'white' }}>Destek</h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
              <li style={{ marginBottom: '10px' }}><Link to="/yardim" style={{ color: 'var(--metin-ikincil)' }}>Yardım Merkezi</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/iade" style={{ color: 'var(--metin-ikincil)' }}>İade Şartları</Link></li>
              <li style={{ marginBottom: '10px' }}><Link to="/gizlilik" style={{ color: 'var(--metin-ikincil)' }}>Gizlilik Politikası</Link></li>
            </ul>
          </div>

          {/* iletişim bilgileri */}
          <div className="footer-kolon">
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', color: 'white' }}>İletişim</h4>
            <div style={{ color: 'var(--metin-ikincil)', fontSize: '0.85rem' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Mail size={14} color="var(--vurgu-rengi)" /> {destekEmail || 'destek@plexa.com'}
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} color="var(--vurgu-rengi)" /> İstanbul, Türkiye
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--metin-ikincil)', fontSize: '0.8rem', marginBottom: '10px' }}>
            &copy; {new Date().getFullYear()} <strong>{siteBasligi?.toUpperCase() || 'PLEXA'}</strong>. Tüm Hakları Saklıdır.
          </p>
          <a 
            href="https://github.com/erensogutlu" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--metin-ikincil)', 
              fontSize: '0.75rem',
              transition: '0.3s'
            }}
            className="github-link"
          >
            <Code size={14} /> Developed by <span style={{ color: 'var(--vurgu-rengi)', fontWeight: '600' }}>erensogutlu</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
