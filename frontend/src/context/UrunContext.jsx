import { createContext, useState, useEffect } from 'react';

export const UrunContext = createContext();

export const UrunProvider = ({ children }) => {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    const urunleriGetir = async () => {
      try {
        const cevap = await fetch('http://localhost:5000/api/urunler');
        if (!cevap.ok) {
          throw new Error('veriler alinamadi');
        }
        const veri = await cevap.json();
        setUrunler(veri);
      } catch (h) {
        setHata(h.message);
      } finally {
        setYukleniyor(false);
      }
    };

    urunleriGetir();
  }, []);

  return (
    <UrunContext.Provider value={{ urunler, yukleniyor, hata }}>
      {children}
    </UrunContext.Provider>
  );
};
