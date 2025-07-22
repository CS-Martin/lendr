import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Coins,
  CreditCard,
  Search,
  Upload,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

export const StepsToRentAndList = () => {
  const [activeTab, setActiveTab] = useState<'rent' | 'list'>('rent');

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-16 items-center my-20'>
      {/* Left side - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className='relative'>
        <div className='mb-8'>
          <h2 className='text-3xl text-center md:text-left md:text-5xl font-bold text-white mb-6'>
            Easy Steps to{' '}
            <span className='bg-gradient-to-r from-lendr-400 to-cyan-400 bg-clip-text text-transparent'>
              Rent & List NFTs{' '}
            </span>
            in our Marketplace
          </h2>
          <p className='text-slate-400 text-sm text-center md:text-left md:text-[16px] font-mono leading-relaxed'>
            Our decentralized platform enables seamless NFT rentals with
            advanced DeFi protocols, smart contract security, and automated
            yield optimization for maximum returns.
          </p>
        </div>
        {/* Main visual container */}
        <div className='relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-lendr-400/20 rounded-3xl p-8 shadow-2xl shadow-lendr-400/20'>
          {/* Holographic NFT visualization */}

          <div className='relative h-80 bg-gradient-to-br from-lendr-400/10 to-cyan-400/10 rounded-2xl overflow-hidden'>
            {/* Animated grid */}
            <div className='absolute inset-0 opacity-30'>
              <div
                className='absolute inset-0'
                style={{
                  backgroundImage: `
                      linear-gradient(rgba(220, 243, 71, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(220, 243, 71, 0.3) 1px, transparent 1px)
                    `,
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            {/* 3D NFT representation */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <motion.div
                className='relative'
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
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                  },
                }}
                style={{ transformStyle: 'preserve-3d' }}>
                {/* Main NFT card */}
                <div className='w-48 h-48 bg-gradient-to-br from-lendr-400/30 to-cyan-400/30 rounded-2xl backdrop-blur-sm border border-lendr-400/40 shadow-2xl shadow-lendr-400/30 flex items-center justify-center'>
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}>
                    <svg
                      className='w-20 h-20 text-lendr-400'
                      fill='currentColor'
                      viewBox='0 0 24 24'>
                      <path d='M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z' />
                      <path d='M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' />
                    </svg>
                  </motion.div>
                </div>

                {/* Floating elements around NFT */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className='absolute w-4 h-4 bg-lendr-400/60 rounded-full'
                    style={{
                      top: `${20 + Math.sin((i * Math.PI) / 3) * 60}%`,
                      left: `${50 + Math.cos((i * Math.PI) / 3) * 60}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Scanning lines */}
            <motion.div
              className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lendr-400 to-transparent'
              animate={{
                y: [0, 320, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          </div>

          {/* Holographic overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-lendr-400/5 via-transparent to-cyan-400/5 rounded-3xl pointer-events-none' />
        </div>

        {/* Floating stats */}
        <motion.div
          className='absolute top-70 md:top-65 -right-4 bg-gradient-to-br from-green-400/90 to-emerald-400/90 backdrop-blur-xl border border-green-400/30 rounded-2xl p-4 shadow-lg'
          animate={{
            y: [0, -10, 0],
            boxShadow: [
              '0 10px 30px rgba(34, 197, 94, 0.3)',
              '0 20px 40px rgba(34, 197, 94, 0.5)',
              '0 10px 30px rgba(34, 197, 94, 0.3)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}>
          <div className='text-slate-950 font-bold text-sm'>+15.2% APY</div>
        </motion.div>

        <motion.div
          className='absolute -bottom-4 -left-4 bg-gradient-to-br from-lendr-400/90 to-yellow-400/90 backdrop-blur-xl border border-lendr-400/30 rounded-2xl p-4 shadow-lg'
          animate={{
            y: [0, 10, 0],
            boxShadow: [
              '0 10px 30px rgba(220, 243, 71, 0.3)',
              '0 20px 40px rgba(220, 243, 71, 0.5)',
              '0 10px 30px rgba(220, 243, 71, 0.3)',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
            delay: 1,
          }}>
          <div className='text-slate-950 font-bold text-sm'>2.4K Rentals</div>
        </motion.div>
      </motion.div>

      {/* Right side - Steps */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}>
        {/* Tab switcher */}
        <div className='flex mb-8 bg-slate-800/50 rounded-2xl p-2 backdrop-blur-sm border border-slate-700/50'>
          <Button
            onClick={() => setActiveTab('rent')}
            className={`flex-1 cursor-pointer py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'rent'
                ? 'bg-gradient-to-r from-lendr-400 to-lendr-500 text-slate-950 shadow-lg shadow-lendr-400/30'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}>
            How to Rent
          </Button>
          <Button
            onClick={() => setActiveTab('list')}
            className={`flex-1 cursor-pointer py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-lendr-400 to-lendr-500 text-slate-950 shadow-lg shadow-lendr-400/30'
                : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}>
            How to List
          </Button>
        </div>

        {/* Steps */}
        <div className='space-y-6'>
          {(activeTab === 'rent' ? rentalSteps : listingSteps).map(
            (step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className='flex items-start space-x-6 group'>
                {/* Step number and icon */}
                <div className='flex-shrink-0'>
                  <motion.div
                    className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${step.color} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{
                      scale: 1.1,
                      rotateY: 180,
                    }}
                    style={{
                      transformStyle: 'preserve-3d',
                    }}>
                    <div className='text-slate-950'>{step.icon}</div>
                  </motion.div>
                  <div className='text-lendr-400/60 text-4xl md:text-6xl font-bold font-mono mt-2 leading-none'>
                    {step.number}
                  </div>
                </div>

                {/* Step content */}
                <div className='flex-1 pt-2'>
                  <h3 className='text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-lendr-400 transition-colors duration-300'>
                    {step.title}
                  </h3>
                  <p className='text-slate-400 text-sm md:text-[16px] leading-relaxed font-mono'>
                    {step.description}
                  </p>

                  {/* Progress line */}
                  <motion.div
                    className='w-full h-0.5 bg-slate-700 mt-6 overflow-hidden rounded-full'
                    whileInView={{ scaleX: 1 }}
                    initial={{ scaleX: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.2,
                    }}
                    viewport={{ once: true }}>
                    <motion.div
                      className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'linear',
                        delay: index * 0.5,
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ),
          )}
        </div>
      </motion.div>
    </div>
  );
};

const rentalSteps = [
  {
    number: '01',
    title: 'Connect Your Wallet',
    description:
      'Connect your Web3 wallet to access the decentralized marketplace and browse available NFT rentals.',
    icon: <Wallet className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-lendr-400 to-yellow-400',
  },
  {
    number: '02',
    title: 'Browse & Search NFTs',
    description:
      'Explore our curated collection of rental NFTs. Filter by category, price, and rental duration.',
    icon: <Search className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-cyan-400 to-blue-400',
  },
  {
    number: '03',
    title: 'Rent & Enjoy',
    description:
      'Pay the rental fee and collateral through smart contracts. Use the NFT for your desired duration.',
    icon: <CreditCard className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-purple-400 to-pink-400',
  },
];

const listingSteps = [
  {
    number: '01',
    title: 'Upload Your NFT',
    description:
      'Connect your wallet and select the NFT you want to list for rental from your collection.',
    icon: <Upload className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-green-400 to-emerald-400',
  },
  {
    number: '02',
    title: 'Set Rental Terms',
    description:
      'Configure rental duration, pricing, collateral requirements, and any special conditions.',
    icon: <Coins className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-orange-400 to-red-400',
  },
  {
    number: '03',
    title: 'Earn Passive Income',
    description:
      'Your NFT is now live! Earn rental fees automatically through our secure smart contract system.',
    icon: <CheckCircle className='w-6 h-6 md:w-8 md:h-8' />,
    color: 'from-indigo-400 to-purple-400',
  },
];
