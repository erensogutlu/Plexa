import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogIn, User, LogOut, Store, Heart, Shield, Menu, X } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SepetContext } from '../context/SepetContext';

const Navbar = ({ siteBasligi }) => {
  const { kullanici, cikisYap } = useContext(AuthContext);
  const { sepet, favoriler } = useContext(SepetContext);
  const [menuAcik, setMenuAcik] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="kapsayici">
        <Link to="/" className="logo">
          <div className="logo-simge">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="12" fill="url(#logo_grad)" fillOpacity="0.1" />
              <path d="M12 10V30M12 10H22C26.4183 10 30 13.5817 30 18C30 22.4183 26.4183 26 22 26H12" stroke="url(#logo_grad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 18H22" stroke="url(#logo_grad)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <defs>
                <linearGradient id="logo_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {siteBasligi?.toUpperCase() || 'PLEXA'}
        </Link>

        {/* sağ taraf (arama, sepet, profil) */}
        <button 
          className="mobil-toggle" 
          onClick={() => setMenuAcik(!menuAcik)}
        >
          {menuAcik ? <X size={32} /> : <Menu size={32} />}
        </button>

        <div className={`nav-linkler ${menuAcik ? 'aktif' : ''}`}>
          <div className="nav-orta-linkler">
            <Link to="/" className="nav-link" onClick={() => setMenuAcik(false)}>Keşfet</Link>
            <Link to="/kombinler/yaz" className="nav-link" style={{ color: '#fbbf24' }} onClick={() => setMenuAcik(false)}>Yaz Kombinleri</Link>
            <Link to="/kombinler/kis" className="nav-link" style={{ color: '#60a5fa' }} onClick={() => setMenuAcik(false)}>Kış Kombinleri</Link>
          </div>
          
          <div className="nav-sag-eylemler">
            {kullanici ? (
              <>
                {kullanici.rol === 'satici' && (
                  <Link to="/satici-paneli" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--vurgu-rengi)' }} onClick={() => setMenuAcik(false)}>
                    <Store size={18} /> Satıcı Paneli
                  </Link>
                )}
                {kullanici.rol === 'admin' && (
                  <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#10b981' }} onClick={() => setMenuAcik(false)}>
                    <Shield size={18} /> Admin Paneli
                  </Link>
                )}
                <Link to="/favoriler" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setMenuAcik(false)}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Heart size={22} />
                    {favoriler.length > 0 && (
                      <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid #030303' }}></span>
                    )}
                  </div>
                  <span className="mobil-menu-metin" style={{ display: 'none' }}>Favorilerim</span>
                </Link>
                <div className="kullanici-menu-grubu">
                  <Link to="/profil" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--metin-ana)', fontWeight: '700' }} onClick={() => setMenuAcik(false)}>
                    <User size={20} /> {kullanici.isim}
                  </Link>
                  <button onClick={() => { cikisYap(); setMenuAcik(false); navigate('/giris'); }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 16px', borderRadius: '10px', fontWeight: '600' }}>
                    <LogOut size={18} /> Çıkış
                  </button>
                </div>
              </>
            ) : (
              <div className="giris-kayit-grubu">
                <Link to="/giris" className="giris-btn" onClick={() => setMenuAcik(false)}>
                  <LogIn size={20} /> <span>Giriş Yap</span>
                </Link>
                <Link to="/kayit" className="kayit-btn" onClick={() => setMenuAcik(false)}>
                  Kayıt Ol
                </Link>
              </div>
            )}

            <Link to="/sepet" className="btn-ana sepet-btn" style={{ padding: '10px 24px', borderRadius: '14px', textDecoration: 'none' }} onClick={() => setMenuAcik(false)}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={20} />
                {/* masaüstü menüsü */}
                {sepet.length > 0 && (
                  <span style={{ 
                    position: 'absolute', 
                    top: '-14px', 
                    right: '-14px', 
                    background: 'white', 
                    color: 'var(--vurgu-rengi)', 
                    fontSize: '0.75rem', 
                    padding: '2px 6px', 
                    borderRadius: '100px', 
                    fontWeight: '900',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    border: '2px solid var(--vurgu-rengi)'
                  }}>{sepet.length}</span>
                )}
              </div>
              <span>Sepetim</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
