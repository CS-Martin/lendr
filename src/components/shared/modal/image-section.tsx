import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { NftMetadata } from 'alchemy-sdk';

export const ImageSection = ({ nftMetadata }: { nftMetadata: NftMetadata }) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className='space-y-4'>
      <div className='relative aspect-square rounded-xl overflow-hidden bg-gray-800/50'>
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
              nftMetadata.image?.originalUrl ||
              nftMetadata.image?.pngUrl ||
              nftMetadata.contract.openSeaMetadata?.imageUrl ||
              '/placeholder.svg'
            }
            alt={nftMetadata.name || 'NFT image'}
            fill
            className='object-cover hover:scale-105 transition-all duration-500'
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            unoptimized
          />
        )}
      </div>
    </motion.div>
  );
};
