'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HolographicText } from '../../../components/shared/holographic-text';
import LendrButton from '@/components/shared/lendr-btn';
import { ArrowRight, Cpu, Database, Globe } from 'lucide-react';
import { Card3D } from '../../../components/shared/card-3d';
import { FloatingElement } from '../../../components/shared/floating-element';

export function HeroSection() {
  return (
    <section className='container mx-auto px-4 py-20 relative mt-20'>
      <motion.div className='text-center max-w-6xl mx-auto relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className='mb-8'>
          <div className='flex items-center justify-center font-bold leading-tight'>
            <HolographicText className='text-4xl md:text-6xl font-bold leading-tight'>
              <motion.span
                className='block bg-gradient-to-r from-white via-lendr-400 to-cyan-400 bg-clip-text text-transparent'
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}>
                <span className='text-white'>A </span>Smarter
                <span className='text-white'> way </span>
                <span className='text-white'>to rent NFTs.</span>
              </motion.span>
            </HolographicText>
          </div>
        </motion.div>

        <motion.p
          className='text-sm md:text-lg font-mono text-slate-300 mb-6 md:mb-12 max-w-3xl mx-auto leading-relaxed'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}>
          The first{' '}
          <span className='text-lendr-400 font-semibold'>
            decentralized marketplace
          </span>{' '}
          for lending NFT assets. Unlock utility from your digital collectibles
          with <span className='text-cyan-400'>advanced DeFi protocols</span>.
        </motion.p>

        <motion.div
          className='flex flex-col md:flex-row gap-2 md:gap-6 justify-center md:mb-16'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}>
          <LendrButton
            size='lg'
            className='p-3 md:p-6.5 w-full'
            icon={<ArrowRight className='ml-2 w-5 h-5' />}>
            Explore Now!
          </LendrButton>

          <LendrButton
            size='lg'
            className='p-3 md:p-6.5 w-full bg-white text-black border-none'
            variant='outline'>
            Rent your first NFT
          </LendrButton>
        </motion.div>

        {/* Stats with 3D effect */}
        <motion.div
          className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-20'
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}>
          {[
            {
              value: '$2.4M+',
              label: 'Total Volume Locked',
              icon: Database,
            },
            { value: '15K+', label: 'Active Protocols', icon: Cpu },
            { value: '8.5K+', label: 'DeFi Users', icon: Globe },
          ].map((stat, index) => (
            <Card3D
              key={index}
              className='group'>
              <motion.div
                className='bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-lendr-400/20 rounded-2xl p-5 shadow-2xl shadow-lendr-400/10 hover:shadow-lendr-400/30 transition-all duration-500'
                whileHover={{
                  borderColor: 'rgba(220, 243, 71, 0.5)',
                  boxShadow: '0 0 50px rgba(220, 243, 71, 0.3)',
                }}>
                <motion.div
                  className='flex items-center justify-center mb-4'
                  transition={{
                    duration: 8,
                    ease: 'linear',
                  }}>
                  <div className='p-4 bg-gradient-to-br from-lendr-400/20 to-lendr-500/20 rounded-xl'>
                    <stat.icon className='w-8 h-8 text-lendr-400' />
                  </div>
                </motion.div>
                <motion.div
                  className='text-4xl font-bold text-white mb-2 font-mono'
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(220, 243, 71, 0.3)',
                      '0 0 20px rgba(220, 243, 71, 0.5)',
                      '0 0 10px rgba(220, 243, 71, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}>
                  {stat.value}
                </motion.div>
                <div className='text-slate-400 font-medium'>{stat.label}</div>
              </motion.div>
            </Card3D>
          ))}
        </motion.div>
      </motion.div>

      {/* 3D floating elements around hero */}
      <FloatingElement
        delay={1.5}
        duration={8}
        className='top-32 right-10 w-32 h-32 opacity-30'>
        <div className='w-full h-full bg-gradient-to-br from-lendr-400/20 to-cyan-400/20 rounded-3xl backdrop-blur-sm border border-lendr-400/10 shadow-2xl shadow-lendr-400/20 transform rotate-12 flex items-center justify-center'>
          <motion.div
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotateY: {
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
              scale: {
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              },
            }}>
            <svg
              className='w-16 h-16 text-lendr-400'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M12 0L9.798 8.202 0 12l9.798 3.798L12 24l2.202-9.798L24 12l-9.798-3.798L12 0z' />
            </svg>
          </motion.div>
        </div>
      </FloatingElement>

      <FloatingElement
        delay={2}
        duration={10}
        className='bottom-20 left-10 w-24 h-24 opacity-40'>
        <div className='w-full h-full bg-gradient-to-br from-purple-400/20 to-lendr-400/20 rounded-2xl backdrop-blur-sm border border-purple-400/10 shadow-2xl shadow-purple-400/20 transform -rotate-12 flex items-center justify-center'>
          <motion.div
            animate={{
              rotateZ: [0, 360],
              rotateX: [0, 180, 360],
            }}
            transition={{
              rotateZ: {
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
              rotateX: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
            }}>
            <svg
              className='w-12 h-12 text-purple-400'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z' />
            </svg>
          </motion.div>
        </div>
      </FloatingElement>

      <FloatingElement
        delay={2.5}
        duration={12}
        className='top-96 left-1/4 w-18 h-18 opacity-50'>
        <div className='w-full h-full bg-gradient-to-br from-cyan-400/25 to-blue-400/25 rounded-full backdrop-blur-sm border border-cyan-400/15 shadow-2xl shadow-cyan-400/20 flex items-center justify-center'>
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.3, 1],
            }}
            transition={{
              rotate: {
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
              scale: {
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              },
            }}>
            <svg
              className='w-10 h-10 text-cyan-400'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z' />
            </svg>
          </motion.div>
        </div>
      </FloatingElement>

      <FloatingElement
        delay={4}
        duration={9}
        className='bottom-32 right-1/3 w-20 h-20 opacity-35'>
        <div className='w-full h-full bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-2xl backdrop-blur-sm border border-orange-400/10 shadow-2xl shadow-orange-400/20 transform rotate-45 flex items-center justify-center'>
          <motion.div
            className='-rotate-45'
            animate={{
              rotateY: [0, -360],
              rotateZ: [0, 180, 0],
            }}
            transition={{
              rotateY: {
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              },
              rotateZ: {
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              },
            }}>
            <svg
              className='w-10 h-10 text-orange-400'
              fill='currentColor'
              viewBox='0 0 24 24'>
              <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
            </svg>
          </motion.div>
        </div>
      </FloatingElement>
    </section>
  );
}
