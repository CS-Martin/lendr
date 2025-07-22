import { Card3D } from '../card-3d';
import { motion } from 'framer-motion';
import { OwnedNft } from 'alchemy-sdk';
import { useRef } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import LendrButton from '../lendr-btn';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';

interface NFTCardProps {
  nft: OwnedNft;
  onListNFT?: () => void;
  onViewNFT?: () => void;
}

export const NFTCard = ({ nft, onViewNFT, onListNFT }: NFTCardProps) => {
  const { data: session } = useSession();
  console.log(session);

  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Subtle glow animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(cardRef.current, {
      boxShadow: '0 0 30px rgba(220, 243, 71, 0.1)',
      duration: 3,
      ease: 'power2.inOut',
    });

    return () => {
      tl.kill();
    };
  }, []);

  if (!nft.tokenId || !nft.contract.address) return null;

  return (
    <Card3D className='group h-full cursor-pointer'>
      <motion.div
        onClick={onViewNFT}
        ref={cardRef}
        className='relative flex flex-col h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-lendr-400/50 rounded-xl overflow-hidden shadow-2xl hover:shadow-lendr-400/30 transition-all duration-500'
        whileHover={{
          y: -15,
          boxShadow: '0 25px 80px rgba(220, 243, 71, 0.25)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <div className='relative overflow-hidden '>
          <motion.div
            ref={imageRef}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}>
            <Image
              src={
                nft.image.thumbnailUrl ||
                nft.image.pngUrl ||
                nft.image.originalUrl ||
                nft.image.cachedUrl ||
                '/placeholder.svg'
              }
              alt={nft.name || nft.contract.name || 'NFT'}
              width={500}
              height={500}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
              unoptimized
              className='w-full h-64 object-cover group-hover:scale-105 transition-all duration-500'
            />
          </motion.div>

          {/* Holographic overlay */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-br from-lendr-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100'
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className='relative p-2 py-3 flex-1'>
          <motion.h3
            className='text-sm font-bold text-white mb-2 group-hover:text-lendr-400 transition-colors duration-300'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            {nft.name}
          </motion.h3>

          <motion.p
            className='text-sm text-slate-400 mb-4 line-clamp-1'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}>
            {nft.description}
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className='absolute w-[90%] -bottom-10 group-hover:-translate-y-13 left-1/2 -translate-x-1/2 transition-all duration-500'>
            <LendrButton
              onClick={(e) => {
                e.stopPropagation();

                onListNFT?.();
              }}
              className='w-full rounded-md bg-gradient-to-r from-lendr-400 to-lendr-500 hover:from-lendr-500 hover:to-lendr-600 text-slate-950 border-0 font-bold shadow-md shadow-lendr-400/30 hover:shadow-lendr-400/50 transition-all duration-500 overflow-hidden'>
              List NFT
            </LendrButton>
          </motion.div>
        </div>
      </motion.div>
    </Card3D>
  );
};
