import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export const ImageSection = ({ nftMetadata }: { nftMetadata: any }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    containerRef.current.style.transform = `
      perspective(1000px)
      rotateX(${y * 6}deg)
      rotateY(${x * 6}deg)
      scale3d(1.02, 1.02, 1.02)
    `;
  };

  // Reset tilt effect when mouse leaves
  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
    }
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className='relative space-y-4'>
      <div
        ref={containerRef}
        className='relative aspect-square rounded-xl overflow-hidden bg-gray-800/50 transition-all duration-500 ease-out'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
        {/* Glowing border effect */}
        <div
          className='absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none'
          style={{
            boxShadow: '0 0 25px rgba(101, 124, 255, 0.4), 0 0 45px rgba(101, 124, 255, 0.2)',
            zIndex: 5,
          }}
        />

        {imageLoading && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-lendr-400' />
          </div>
        )}
        {nftMetadata.animation?.cachedUrl ? (
          <video
            src={nftMetadata.animation?.cachedUrl || '/placeholder.svg'}
            autoPlay
            loop
            muted
            controls
            className={`object-cover w-full h-full ${imageLoading ? 'hidden' : ''}`}
            onLoadedData={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        ) : (
          <Image
            src={
              nftMetadata.image?.cachedUrl ||
              nftMetadata.image?.originalUrl ||
              nftMetadata.image?.pngUrl ||
              nftMetadata.contract.openSeaMetadata?.imageUrl ||
              '/placeholder.svg'
            }
            alt={nftMetadata.name || 'NFT image'}
            fill
            className='object-cover transition-transform duration-500'
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            unoptimized
          />
        )}
      </div>
    </motion.div>
  );
};
