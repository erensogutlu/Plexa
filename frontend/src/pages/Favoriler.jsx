import { useContext } from 'react';
import { SepetContext } from '../context/SepetContext';
import UrunKarti from '../components/UrunKarti';
import { Heart } from 'lucide-react';

const Favoriler = () => {
  const { favoriler } = useContext(SepetContext);

  return (
    <div className="kapsayici" style={{ padding: '60px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
        <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '15px' }}>
          <Heart color="#ef4444" fill="#ef4444" size={30} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '800' }}>Favorilerim</h1>
      </div>

      {favoriler.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', background: 'var(--kart-arka-plan)', borderRadius: '30px', border: '1px solid var(--kart-sinir)' }}>
          <Heart size={60} color="var(--metin-ikincil)" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Favori ürününüz bulunmuyor</h3>
          <p style={{ color: 'var(--metin-ikincil)' }}>Beğendiğiniz ürünleri buraya ekleyerek daha sonra kolayca bulabilirsiniz.</p>
        </div>
      ) : (
        <div className="urun-izgara">
          {favoriler.map(urun => (
            <UrunKarti key={urun.id} urun={urun} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoriler;
