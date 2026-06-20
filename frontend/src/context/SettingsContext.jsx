import { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [ayarlar, setAyarlar] = useState({
    siteBasligi: 'Plexa Premium',
    indirimOrani: 0,
    bakimModu: false,
    paraBirimi: 'TL',
    kargoSiniri: 500,
    destekEmail: 'destek@plexa.com'
  });
  const [yukleniyor, setYukleniyor] = useState(true);

  const ayarGetir = async () => {
    try {
      const cevap = await fetch(`${API_URL}/api/ayarlar`);
      const data = await cevap.json();
      if (data.genel_ayarlar) {
        setAyarlar(onceki => ({ ...onceki, ...data.genel_ayarlar }));
      }
    } catch (err) {
      console.error('Ayarlar yüklenemedi:', err);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    ayarGetir();
  }, []);

  {/* para birimi sembolü yardımcı fonksiyonu */}
  const getParaSembol = () => {
    switch (ayarlar.paraBirimi) {
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '₺';
    }
  };

  {/* fiyatı formatlama (indirim dahil) */}
  const formatFiyat = (fiyat) => {
    const indirimliFiyat = fiyat * (1 - ayarlar.indirimOrani / 100);
    return `${indirimliFiyat.toLocaleString('tr-TR')} ${getParaSembol()}`;
  };

  return (
    <SettingsContext.Provider value={{ ayarlar, setAyarlar, yukleniyor, ayarGetir, formatFiyat, getParaSembol }}>
      {children}
    </SettingsContext.Provider>
  );
};
