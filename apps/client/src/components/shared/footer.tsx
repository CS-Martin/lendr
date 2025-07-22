'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className='border-t border-slate-800/50 bg-slate-950/90 backdrop-blur-xl relative overflow-hidden'>
      <div className='container mx-auto px-4 pb-7 pt-12 relative z-10 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}>
            <div className='flex items-center space-x-2 mb-6'>
              <motion.div
                className='w-10 h-10 bg-gradient-to-br from-lendr-400 to-lendr-500 rounded-xl flex items-center justify-center shadow-lg shadow-lendr-400/50'
                animate={{
                  rotateY: [0, 360],
                  boxShadow: [
                    '0 0 20px rgba(220, 243, 71, 0.5)',
                    '0 0 30px rgba(220, 243, 71, 0.8)',
                    '0 0 20px rgba(220, 243, 71, 0.5)',
                  ],
                }}
                transition={{
                  rotateY: {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  },
                  boxShadow: {
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  },
                }}>
                <Zap className='w-6 h-6 text-slate-950' />
              </motion.div>
              <h3 className='text-2xl font-bold text-lendr-400'>Lendr</h3>
            </div>
            <p className='text-slate-400 text-md leading-relaxed text-sm font-mono'>
              The future of NFT utility through advanced DeFi protocols and decentralized lending infrastructure.
            </p>
          </motion.div>

          {[
            {
              title: 'Protocol',
              links: ['Marketplace', 'Dashboard', 'Analytics', 'Governance'],
            },
            {
              title: 'Developers',
              links: ['Documentation', 'Smart Contracts', 'API', 'Security'],
            },
            {
              title: 'Community',
              links: ['Discord', 'Twitter', 'GitHub', 'Forum'],
            },
          ].map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}>
              <h4 className='text-white font-bold mb-6 text-lg'>{section.title}</h4>
              <div className='space-y-3'>
                {section.links.map((link) => (
                  <motion.div
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 10,
                    }}>
                    <Link
                      href='#'
                      className='text-slate-400 hover:text-lendr-400 font-mono text-sm block transition-all duration-300 relative group'>
                      {link}
                      <motion.div
                        className='absolute -bottom-1 left-0 w-0 h-0.5 bg-lendr-400'
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className='border-t border-slate-800/50 mt-12 pt-8 text-center'
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}>
          <p className='text-slate-400 text-sm'>&copy; 2025 Lendr. All rights reserved. Built on Ethereum with ❤️</p>
        </motion.div>
      </div>
    </footer>
  );
};
