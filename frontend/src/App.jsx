import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { SettingsContext, SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import UrunDetay from './pages/UrunDetay';
import Giris from './pages/Giris';
import Kayit from './pages/Kayit';
import SaticiPaneli from './pages/SaticiPaneli';
import Profil from './pages/Profil';
import Favoriler from './pages/Favoriler';
import Sepet from './pages/Sepet';
import Kombinler from './pages/Kombinler';
import YardimMerkezi from './pages/YardimMerkezi';
import IadeSartlari from './pages/IadeSartlari';
import GizlilikPolitikasi from './pages/GizlilikPolitikasi';
import AdminPaneli from './pages/AdminPaneli';
import BakimSayfasi from './pages/BakimSayfasi';
import { UrunProvider } from './context/UrunContext';
import { SepetProvider } from './context/SepetContext';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SepetProvider>
          <UrunProvider>
            <Router>
              <AppContent />
            </Router>
          </UrunProvider>
        </SepetProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { kullanici, yukleniyor: authYukleniyor } = useContext(AuthContext);
  const { ayarlar, yukleniyor: settingsYukleniyor } = useContext(SettingsContext);
  const location = useLocation();
  const isAdminPath = location.pathname === '/admin';

  useEffect(() => {
    if (ayarlar.siteBasligi) {
      document.title = ayarlar.siteBasligi;
    }
  }, [ayarlar.siteBasligi]);

  const isAuthPath = location.pathname === '/giris' || location.pathname === '/kayit';

  if (authYukleniyor || settingsYukleniyor) return null;

  {/* bakım modu kontrolü (adminler, admin paneli ve giriş/kayıt sayfaları hariç) */}
  if (ayarlar.bakimModu && kullanici?.rol !== 'admin' && !isAdminPath && !isAuthPath) {
    return <BakimSayfasi />;
  }

  return (
    <>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAdminPath && <Navbar siteBasligi={ayarlar.siteBasligi} />}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/urun/:id" element={<UrunDetay />} />
            <Route path="/giris" element={<Giris />} />
            <Route path="/kayit" element={<Kayit />} />
            <Route path="/satici-paneli" element={<SaticiPaneli />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/favoriler" element={<Favoriler />} />
            <Route path="/sepet" element={<Sepet />} />
            <Route path="/kombinler/:tip" element={<Kombinler />} />
            <Route path="/yardim" element={<YardimMerkezi />} />
            <Route path="/iade" element={<IadeSartlari />} />
            <Route path="/gizlilik" element={<GizlilikPolitikasi />} />
            <Route 
              path="/admin" 
              element={kullanici?.rol === 'admin' ? <AdminPaneli /> : <Navigate to="/giris" />} 
            />
          </Routes>
        </main>
        {!isAdminPath && <Footer siteBasligi={ayarlar.siteBasligi} destekEmail={ayarlar.destekEmail} />}
      </div>
    </>
  );
}

export default App;
