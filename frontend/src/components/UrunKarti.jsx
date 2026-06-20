import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useContext } from 'react';
import { SepetContext } from '../context/SepetContext';
import { SettingsContext } from '../context/SettingsContext';

const UrunKarti = ({ urun }) => {
  const { sepeteEkle, favoriler, favoriEkleCikar } = useContext(SepetContext);
  const { formatFiyat } = useContext(SettingsContext);
  const isFavori = favoriler.some(f => f.id === urun.id);

  return (
    <div className="urun-karti">
      <div className="urun-resim-alani">
        <Link to={`/urun/${urun.id}`}>
          <img src={urun.resim_url} alt={urun.isim} className="urun-resim" />
        </Link>
        <button 
          onClick={() => favoriEkleCikar(urun.id)}
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px', 
            background: isFavori ? '#ef4444' : 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)', 
            padding: '8px', 
            borderRadius: '10px', 
            color: isFavori ? 'white' : 'white',
            zIndex: 10,
            transition: 'var(--gecis-hizi)'
          }}
        >
          <Heart size={18} fill={isFavori ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="urun-bilgi">
        <Link to={`/urun/${urun.id}`}>
          <h3 className="urun-baslik">{urun.isim}</h3>
        </Link>
        <p className="urun-aciklama">{urun.aciklama}</p>
        <div className="urun-alt">
          <span className="urun-fiyat">{formatFiyat(urun.fiyat)}</span>
          <button onClick={() => sepeteEkle(urun.id)} className="btn-ana">
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UrunKarti;
