import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const topLenders = [
  {
    id: 1,
    address: '0x1234...5678',
    username: 'CryptoLender',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.9,
    successfulTransactions: 247,
    totalEarned: '12.5 ETH',
    rank: 1,
  },
  {
    id: 2,
    address: '0x9876...5432',
    username: 'NFTMaster',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.8,
    successfulTransactions: 189,
    totalEarned: '9.8 ETH',
    rank: 2,
  },
  {
    id: 3,
    address: '0x5555...7777',
    username: 'DefiKing',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.7,
    successfulTransactions: 156,
    totalEarned: '8.2 ETH',
    rank: 3,
  },
  {
    id: 4,
    address: '0x3333...9999',
    username: 'BlockchainPro',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.6,
    successfulTransactions: 134,
    totalEarned: '7.1 ETH',
    rank: 4,
  },
  {
    id: 5,
    address: '0x7777...1111',
    username: 'EthLender',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.5,
    successfulTransactions: 98,
    totalEarned: '5.9 ETH',
    rank: 5,
  },
  {
    id: 6,
    address: '0x8888...2222',
    username: 'DeFiQueen',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.4,
    successfulTransactions: 87,
    totalEarned: '4.7 ETH',
    rank: 6,
  },
  {
    id: 7,
    address: '0x9999...3333',
    username: 'CryptoWhale',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.3,
    successfulTransactions: 76,
    totalEarned: '3.9 ETH',
    rank: 7,
  },
  {
    id: 8,
    address: '0xAAAA...4444',
    username: 'TokenLord',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.2,
    successfulTransactions: 65,
    totalEarned: '3.2 ETH',
    rank: 8,
  },
  {
    id: 9,
    address: '0xAAAA...4444',
    username: 'TokenLord',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.2,
    successfulTransactions: 65,
    totalEarned: '3.2 ETH',
    rank: 10,
  },
  {
    id: 10,
    address: '0xAAAA...4444',
    username: 'TokenLord',
    avatarUrl: '/placeholder.svg?height=80&width=80',
    reputationScore: 4.2,
    successfulTransactions: 65,
    totalEarned: '3.2 ETH',
    rank: 10,
  },
];

export const TopUsersCarousel = () => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const itemsPerView = 5;
  const maxSlide = Math.max(0, topLenders.length - itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [maxSlide, isHovered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className='mt-32'>
      <div className='text-center mb-16'>
        <h2 className='text-3xl md:text-5xl font-bold text-white mb-6'>
          <span className='bg-gradient-to-r from-lendr-400 to-cyan-400 bg-clip-text text-transparent'>
            All Time Top Users
          </span>{' '}
        </h2>
        <p className='text-slate-400 text-[16px] md:text-lg md:max-w-3xl mx-auto'>
          Discover our most successful lenders based on completed transactions,
          reputation scores, and total earnings in the Lendr ecosystem.
        </p>
      </div>

      {/* Carousel Container */}
      <div className='relative'>
        {/* Navigation Buttons */}
        <motion.button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            currentSlide === 0
              ? 'border-slate-600 text-slate-600 cursor-not-allowed'
              : 'border-slate-400 text-slate-400 hover:border-lendr-400 hover:text-lendr-400 hover:bg-lendr-400/10'
          }`}
          whileHover={currentSlide !== 0 ? { scale: 1.1 } : {}}
          whileTap={currentSlide !== 0 ? { scale: 0.95 } : {}}>
          <ChevronLeft className='w-6 h-6' />
        </motion.button>

        <motion.button
          onClick={nextSlide}
          disabled={currentSlide >= maxSlide}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            currentSlide >= maxSlide
              ? 'border-slate-600 text-slate-600 cursor-not-allowed'
              : 'border-lendr-400 text-lendr-400 bg-lendr-400/10 hover:bg-lendr-400/20 hover:scale-110'
          }`}
          whileHover={currentSlide < maxSlide ? { scale: 1.1 } : {}}
          whileTap={currentSlide < maxSlide ? { scale: 0.95 } : {}}>
          <ChevronRight className='w-6 h-6' />
        </motion.button>

        {/* Carousel Content */}
        <div
          className='overflow-hidden mx-16 py-20'
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}>
          <motion.div
            ref={carouselRef}
            className='flex gap-8'
            animate={{
              x: `${-currentSlide * (100 / itemsPerView)}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            style={{
              width: `${(topLenders.length / itemsPerView) * 100}%`,
            }}>
            {topLenders.map((lender, index) => (
              <motion.div
                key={lender.id}
                className='flex-shrink-0 text-center'
                style={{ width: `${100 / topLenders.length}%` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}>
                {/* Rank Badge */}
                <div className='relative inline-block mb-4'>
                  <motion.div
                    className='relative'
                    whileHover={{ scale: 1.1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}>
                    {/* Avatar with rank */}
                    <div className='relative'>
                      <Avatar className='w-30 h-30 border-4 border-lendr-400/30 shadow-lg shadow-lendr-400/20'>
                        <AvatarImage
                          src={lender.avatarUrl || '/placeholder.svg'}
                          alt={lender.username}
                        />
                        <AvatarFallback className='bg-gradient-to-br from-lendr-400 to-cyan-400 text-slate-950 font-bold text-xl'>
                          {lender.username?.charAt(0) ||
                            lender.address.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Rank number */}
                      <motion.div
                        className={`absolute top-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg
                                                    ${
                                                      lender.rank === 1
                                                        ? ' text-slate-950 bg-lendr-'
                                                        : lender.rank === 2
                                                          ? 'text-slate-950'
                                                          : lender.rank === 3
                                                            ? 'text-slate-950'
                                                            : 'bg-gradient-to-r from-lendr-400 to-cyan-400 text-slate-950'
                                                    }
                                                    `}
                        animate={{
                          boxShadow: [
                            '0 0 10px rgba(220, 243, 71, 0.3)',
                            '0 0 20px rgba(220, 243, 71, 0.6)',
                            '0 0 10px rgba(220, 243, 71, 0.3)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}>
                        {lender.rank <= 3 ? (
                          <Crown
                            className='w-8 h-8'
                            color={
                              lender.rank === 1
                                ? '#FFD700' // Gold
                                : lender.rank === 2
                                  ? '#C0C0C0' // Silver
                                  : '#CD7F32' // Bronze
                            }
                            fill={
                              lender.rank === 1
                                ? '#FFD700'
                                : lender.rank === 2
                                  ? '#C0C0C0'
                                  : '#CD7F32'
                            }
                          />
                        ) : (
                          <span>{lender.rank}</span>
                        )}
                      </motion.div>

                      {/* Reputation stars */}
                      <motion.div
                        className='absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-slate-900/90 backdrop-blur-sm rounded-full px-2 py-1 border border-lendr-400/30'
                        animate={{
                          y: [0, -2, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: 'easeInOut',
                          delay: index * 0.2,
                        }}>
                        <Star className='w-3 h-3 text-yellow-400 fill-current' />
                        <span className='text-xs text-lendr-400 font-bold'>
                          {lender.reputationScore}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                {/* User Info */}
                <div className='space-y-2'>
                  <motion.h3
                    className='text-white font-bold text-lg hover:text-lendr-400 transition-colors duration-300 cursor-pointer'
                    whileHover={{ scale: 1.05 }}>
                    {lender.username || 'Anonymous'}
                  </motion.h3>

                  {/* Earnings */}
                  <motion.div
                    className='text-lendr-400 font-bold text-xl'
                    animate={{
                      textShadow: [
                        '0 0 5px rgba(220, 243, 71, 0.5)',
                        '0 0 10px rgba(220, 243, 71, 0.8)',
                        '0 0 5px rgba(220, 243, 71, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.3,
                    }}>
                    {lender.totalEarned}
                  </motion.div>

                  {/* Stats */}
                  <div className='flex items-center justify-center space-x-4 text-sm text-slate-400'>
                    <div className='flex items-center space-x-1'>
                      <CheckCircle className='w-3 h-3 text-green-400' />
                      <span>{lender.successfulTransactions}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                      <TrendingUp className='w-3 h-3 text-cyan-400' />
                      <span>
                        +{((lender.reputationScore - 4) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <motion.div
                    className='w-full h-1 bg-slate-700 rounded-full overflow-hidden mx-auto max-w-24'
                    whileInView={{ scaleX: 1 }}
                    initial={{ scaleX: 0 }}
                    transition={{
                      duration: 1,
                      delay: index * 0.1,
                    }}
                    viewport={{ once: true }}>
                    <motion.div
                      className='h-full bg-gradient-to-r from-lendr-400 to-cyan-400 rounded-full'
                      style={{
                        width: `${(lender.reputationScore / 5) * 100}%`,
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 5px rgba(220, 243, 71, 0.5)',
                          '0 0 15px rgba(220, 243, 71, 0.8)',
                          '0 0 5px rgba(220, 243, 71, 0.5)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.2,
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Carousel Indicators */}
        <div className='flex justify-center mt-8 space-x-2'>
          {Array.from({ length: maxSlide + 1 }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-lendr-400 w-8'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      {/* View all button */}
      <motion.div
        className='text-center mt-12'
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        viewport={{ once: true }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          <Button
            size='lg'
            variant='outline'
            className='border-2 border-lendr-400 text-lendr-400 hover:bg-lendr-400 hover:text-slate-950 bg-transparent font-bold text-lg px-8 py-4 shadow-lg shadow-lendr-400/20 hover:shadow-lendr-400/40 transition-all duration-300'>
            View Full Leaderboard
            <TrendingUp className='ml-2 w-5 h-5' />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
