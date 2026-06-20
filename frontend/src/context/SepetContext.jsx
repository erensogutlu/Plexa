import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const SepetContext = createContext();

export const SepetProvider = ({ children }) => {
  const [sepet, setSepet] = useState([]);
  const [favoriler, setFavoriler] = useState([]);
  const { kullanici } = useContext(AuthContext);

  useEffect(() => {
    if (kullanici) {
      sepetiGetir();
      favorileriGetir();
    } else {
      setSepet([]);
      setFavoriler([]);
    }
  }, [kullanici]);

  const sepetiGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/sepet', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setSepet(veri);
      }
    } catch (hata) {
      console.error('Sepet getirme hatası:', hata);
    }
  };

  const favorileriGetir = async () => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/favoriler', {
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        const veri = await cevap.json();
        setFavoriler(veri);
      }
    } catch (hata) {
      console.error('Favori getirme hatası:', hata);
    }
  };

  const sepeteEkle = async (urunId, adet = 1) => {
    if (!kullanici) return alert('Lütfen önce giriş yapın');
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch('http://localhost:5000/api/sepet', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ urunId, adet })
      });
      if (cevap.ok) {
        sepetiGetir();
      }
    } catch (hata) {
      console.error('Sepete ekleme hatası:', hata);
    }
  };

  const sepettenCikar = async (sepetId) => {
    const token = localStorage.getItem('token');
    try {
      const cevap = await fetch(`http://localhost:5000/api/sepet/${sepetId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        sepetiGetir();
      }
    } catch (hata) {
      console.error('Sepetten çıkarma hatası:', hata);
    }
  };

  const favoriEkleCikar = async (urunId) => {
    if (!kullanici) return alert('Lütfen önce giriş yapın');
    const token = localStorage.getItem('token');
    const isFavori = favoriler.some(f => f.id === urunId);
    const method = isFavori ? 'DELETE' : 'POST';
    
    try {
      const cevap = await fetch(`http://localhost:5000/api/favoriler/${urunId}`, {
        method: method,
        headers: { 'x-auth-token': token }
      });
      if (cevap.ok) {
        favorileriGetir();
      }
    } catch (hata) {
      console.error('Favori işlemi hatası:', hata);
    }
  };

  return (
    <SepetContext.Provider value={{ sepet, favoriler, sepeteEkle, sepettenCikar, favoriEkleCikar, sepetiGetir }}>
      {children}
    </SepetContext.Provider>
  );
};
