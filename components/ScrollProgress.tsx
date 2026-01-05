import React from 'react';
import { motion, useScroll } from 'framer-motion';

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      style={{
        scaleX: scrollYProgress,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        originX: 0,
        background: 'linear-gradient(90deg, #f49221, #ff6b35)',
        zIndex: 9999,
      }}
    />
  );
};

export default ScrollProgress;
