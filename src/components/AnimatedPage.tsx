import React from 'react';
import { motion } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';

interface AnimatedPageProps extends BoxProps {
  children: React.ReactNode;
}

const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <Box
        {...props}
        sx={{
          width: '100%',
          minHeight: '100vh',
          padding: { xs: 2, sm: 3, md: 4 },
          ...props.sx,
        }}
      >
        {children}
      </Box>
    </motion.div>
  );
};

export default AnimatedPage; 