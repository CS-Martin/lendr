import React from 'react';
import { motion } from 'framer-motion';

interface HolographicTextInterface {
    children: React.ReactNode;
    className: string;
}

export const HolographicText = ({
    children,
    className = '',
}: HolographicTextInterface) => {
    return (
        <motion.div
            className={`relative ${className}`}
            whileHover={{
                textShadow: [
                    '0 0 10px #dcf347',
                    '0 0 20px #dcf347',
                    '0 0 30px #dcf347',
                    '0 0 40px #dcf347',
                ],
            }}
            transition={{ duration: 0.3 }}>
            <motion.div
                className='absolute inset-0 bg-gradient-to-r from-lendr-400 via-cyan-400 to-lendr-400 bg-clip-text text-transparent opacity-50'
                animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                }}
                style={{
                    backgroundSize: '200% 200%',
                }}>
                {children}
            </motion.div>
            {children}
        </motion.div>
    );
};
