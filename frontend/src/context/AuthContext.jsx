import { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [kullanici, setKullanici] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      mevcutKullaniciyiGetir(token);
    } else {
      setYukleniyor(false);
    }
  }, []);

  const mevcutKullaniciyiGetir = async (token) => {
    try {
      const cevap = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setKullanici(veri);
      } else {
        localStorage.removeItem('token');
      }
    } catch (hata) {
      console.error('Kullanıcı getirme hatası:', hata);
    } finally {
      setYukleniyor(false);
    }
  };

  const girisYap = async (email, sifre) => {
    const cevap = await fetch(`${API_URL}/api/auth/giris`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, sifre })
    });
    const veri = await cevap.json();
    if (cevap.ok) {
      localStorage.setItem('token', veri.token);
      setKullanici(veri.kullanici);
      return { basarili: true };
    }
    return { basarili: false, mesaj: veri.mesaj };
  };

  const kayitOl = async (isim, email, sifre, rol) => {
    const cevap = await fetch(`${API_URL}/api/auth/kayit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isim, email, sifre, rol })
    });
    const veri = await cevap.json();
    if (cevap.ok) {
      localStorage.setItem('token', veri.token);
      setKullanici(veri.kullanici);
      return { basarili: true };
    }
    return { basarili: false, mesaj: veri.mesaj };
  };

  const cikisYap = () => {
    localStorage.removeItem('token');
    setKullanici(null);
  };

  return (
    <AuthContext.Provider value={{ kullanici, yukleniyor, girisYap, kayitOl, cikisYap }}>
      {children}
    </AuthContext.Provider>
  );
};
