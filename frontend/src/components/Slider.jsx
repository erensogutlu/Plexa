import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Slider = ({ slaytlar: gelenSlaytlar }) => {
  const varsayilanSlaytlar = [
    {
      id: 1,
      baslik: "Geleceğin Sesi",
      altBaslik: "Premium Kulaklık Koleksiyonu",
      aciklama: "Aktif gürültü engelleme ve eşsiz ses kalitesi ile müziği yeniden keşfedin.",
      resim: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80",
      renk: "#6366f1"
    },
    {
      id: 2,
      baslik: "Zamanın Ötesinde",
      altBaslik: "Akıllı Saat Teknolojisi",
      aciklama: "Sağlığınızı takip edin, dünyayla bağlantıda kalın. Şıklık ve zeka bir arada.",
      resim: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80",
      renk: "#a855f7"
    }
  ];

  const slaytlar = gelenSlaytlar && gelenSlaytlar.length > 0 ? gelenSlaytlar : varsayilanSlaytlar;
  const [aktifSlayt, setAktifSlayt] = useState(0);

  useEffect(() => {
    const zamanlayici = setInterval(() => {
      setAktifSlayt((prev) => (prev + 1) % slaytlar.length);
    }, 5000);
    return () => clearInterval(zamanlayici);
  }, [slaytlar.length]);

  const sonrakiSlayt = () => setAktifSlayt((prev) => (prev + 1) % slaytlar.length);
  const oncekiSlayt = () => setAktifSlayt((prev) => (prev - 1 + slaytlar.length) % slaytlar.length);

  return (
    <div className="slider-kapsayici">
      <AnimatePresence mode="wait">
        <motion.div
          key={aktifSlayt}
          className="slayt"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="slayt-resim-overlay" />
          <img src={slaytlar[aktifSlayt].resim} alt={slaytlar[aktifSlayt].baslik} className="slayt-resim" />
          
          <div className="kapsayici slayt-icerik">
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="slayt-alt-baslik"
            >
              {slaytlar[aktifSlayt].altBaslik}
            </motion.span>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {slaytlar[aktifSlayt].baslik}
            </motion.h2>
            <motion.p
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {slaytlar[aktifSlayt].aciklama}
            </motion.p>
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="btn-ana"
              style={{ padding: '15px 40px', fontSize: '1.1rem' }}
            >
              Şimdi Keşfet
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      <button className="slider-ok sol" onClick={oncekiSlayt} aria-label="Onceki">
        <ChevronLeft size={30} />
      </button>
      <button className="slider-ok sag" onClick={sonrakiSlayt} aria-label="Sonraki">
        <ChevronRight size={30} />
      </button>

      <div className="slider-noktalar">
        {slaytlar.map((_, index) => (
          <div 
            key={index} 
            className={`nokta ${index === aktifSlayt ? 'aktif' : ''}`}
            onClick={() => setAktifSlayt(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
