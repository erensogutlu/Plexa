import { motion } from 'framer-motion';

const Loader = ({ fullPage = false }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: fullPage ? '100vh' : '400px',
      width: '100%',
      background: 'transparent'
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* dış halka */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            border: '3px solid rgba(99, 102, 241, 0.1)',
            borderTop: '3px solid var(--vurgu-rengi)',
            borderRadius: '50%',
            position: 'absolute'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Ic Halka */}
        <motion.div
          style={{
            width: '60px',
            height: '60px',
            border: '2px solid rgba(168, 85, 247, 0.1)',
            borderBottom: '2px solid #a855f7',
            borderRadius: '50%',
            position: 'absolute',
            top: '10px',
            left: '10px'
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Merkez Parlama */}
        <motion.div
          style={{
            width: '12px',
            height: '12px',
            background: 'var(--vurgu-gradyan)',
            borderRadius: '50%',
            position: 'absolute',
            top: '34px',
            left: '34px',
            boxShadow: '0 0 20px var(--vurgu-rengi)'
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ 
          marginTop: '30px', 
          color: 'white', 
          fontSize: '1.4rem', 
          fontWeight: '900',
          letterSpacing: '4px',
          fontFamily: "'Space Grotesk', sans-serif",
          background: 'var(--logo-gradyan)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px rgba(99, 102, 241, 0.4))',
          textTransform: 'uppercase'
        }}
      >
        PLEXA
      </motion.p>
    </div>
  );
};

export default Loader;
