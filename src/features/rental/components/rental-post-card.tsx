'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, Trash2Icon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Card3D } from '../../../components/shared/card-3d';
import { cn } from '@/lib/utils';
import LendrButton from '../../../components/shared/lendr-btn';
import { Doc, Id } from '../../../../convex/_generated/dataModel';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RentalPostProps {
  post: Doc<'rentalposts'>;
  viewMode: 'grid' | 'list';
  onViewRentalPost: (e: React.MouseEvent) => void;
}

export const RentalPostCard = ({ post, viewMode, onViewRentalPost }: RentalPostProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const deleteRentalPost = useMutation(api.rentalpost.deleteRentalPost);

  const [isLiked, setIsLiked] = useState(false);

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

  const handleLike = () => {
    setIsLiked(!isLiked);

    // Animate heart
    if (typeof window !== 'undefined') {
      gsap.fromTo(
        '.heart-icon',
        { scale: 1 },
        {
          scale: 1.3,
          duration: 0.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
      );
    }
  };

  return (
    <Card3D className='relative group'>
      <motion.div
        onClick={(e) => onViewRentalPost(e)}
        ref={cardRef}
        className={cn(
          'relative cursor-pointer bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-lendr-400/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-lendr-400/30 transition-all duration-500',
          viewMode === 'list' && 'flex max-h-30', // List view specific styles
        )}
        whileHover={{
          y: viewMode === 'grid' ? -15 : 0, // Only lift in grid view
          boxShadow: '0 25px 80px rgba(220, 243, 71, 0.25)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {/* Image Section - Left */}
        <div className={cn('relative overflow-hidden', viewMode === 'list' && 'w-1/2 md:w-[100px] xl:w-[160px]')}>
          <motion.div
            ref={imageRef}
            whileHover={{ scale: viewMode === 'grid' ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
            className={cn('w-full h-full', viewMode === 'list' && 'h-30')}>
            <Image
              src={
                post.nftMetadata.image.cachedUrl ||
                post.nftMetadata.image.thumbnailUrl ||
                post.nftMetadata.image.originalUrl ||
                '/placeholder.svg'
              }
              alt={post.name}
              width={500}
              height={500}
              unoptimized
              className={cn('w-full h-full object-cover', viewMode === 'grid' ? 'h-64' : 'h-30')}
            />
          </motion.div>

          {/* Holographic overlay */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-br from-lendr-400/20 via-transparent to-cyan-400/20 opacity-0 group-hover:opacity-100'
            transition={{ duration: 0.3 }}
          />

          {/* Interactive overlay buttons */}
          <div className='absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <motion.button
              onClick={handleLike}
              className='p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}>
              <Heart
                className={`heart-icon w-4 h-4 transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`}
              />
            </motion.button>
            <motion.button
              className='p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}>
              <Share2 className='w-4 h-4 text-white' />
            </motion.button>
          </div>

          {/* Status and Category Badges */}
          {viewMode === 'grid' && (
            <div className='absolute top-4 left-4 flex flex-col space-y-2'>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}>
                <Badge className={`${post.isActive ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}>
                  {post.isActive ? 'Available' : 'Locked'}
                </Badge>
              </motion.div>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}>
                <Badge className='bg-lendr-400 text-slate-950 font-semibold shadow-lg'>{post.category}</Badge>
              </motion.div>
            </div>
          )}
        </div>

        {/* Content Section - Center */}
        <div
          className={cn(
            'p-4 flex flex-col justify-between transition-all duration-500',
            viewMode === 'list' ? 'w-full p-2.5' : 'group-hover:-translate-y-2',
          )}>
          <div>
            <motion.h3
              className='text-sm mb-2 md:text-md font-mono font-bold text-white group-hover:text-lendr-400 transition-colors duration-300 line-clamp-1'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              {post.name}
            </motion.h3>

            <motion.p
              className={cn(
                'text-sm text-slate-400 mb-2 text-ellipsis',
                viewMode === 'grid' ? 'line-clamp-1' : 'line-clamp-1',
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}>
              {post.description}
            </motion.p>
          </div>

          <div className={cn('grid mb-4', viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-2')}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}>
              <div className='text-sm text-slate-400'>Hourly Rate</div>
              <motion.div
                className={cn('text-md font-bold text-lendr-400 font-mono', viewMode === 'list' ? 'text-sm' : '')}
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
                }}>
                {post.hourlyRate} ETH
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}>
              <div className='text-sm text-slate-400'>Collateral</div>
              <div className={cn('text-md font-bold text-cyan-400 font-mono', viewMode === 'list' ? 'text-sm' : '')}>
                {post.collateral} ETH
              </div>
            </motion.div>
            {viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={cn(viewMode === 'list' ? 'hidden' : 'block')}>
                <div className='text-sm text-slate-400'>Category</div>
                <div className='text-md font-bold text-purple-400 font-mono'>{post.category}</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* If user is not the poster */}
        {viewMode === 'grid' && post.posterAddress !== session?.user?.address && (
          <div className='absolute -translate-y-0 group-hover:-translate-y-16 w-full p-4 transition-all duration-500'>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}>
              <LendrButton
                className='w-full overflow-hidden rounded-md'
                disabled={!post.isActive}
                onClick={(e) => {
                  e.stopPropagation();

                  if (!session) {
                    toast.error('You must be signed in to place a bid.');
                    return;
                  }

                  router.push(`/rentals/${post._id}`);
                }}
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className='relative z-10'>{post.isActive ? 'Place Bid' : 'Unavailable'}</span>
              </LendrButton>
            </motion.div>
          </div>
        )}

        {/* If user is the poster */}
        {session && viewMode === 'grid' && post.posterAddress === session?.user?.address && (
          <div className='absolute -translate-y-0 group-hover:-translate-y-16 w-full p-4 transition-all duration-500 flex flex-row items-center justify-between gap-3'>
            <motion.div
              className='w-full'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}>
              <LendrButton
                className='w-full overflow-hidden rounded-md'
                disabled={!post.isActive}
                onClick={(e) => e.stopPropagation()}
                link={`/bidding/${post._id}`}>
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className='relative z-10'>{post.isActive ? 'Manage Bids' : 'Unavailable'}</span>
              </LendrButton>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className='w-1/5 overflow-hidden rounded-md bg-red-500 hover:bg-red-600'
              onClick={(e) => e.stopPropagation()}>
              <Button
                className='w-full overflow-hidden rounded-md bg-red-500 hover:bg-red-600'
                disabled={!post.isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRentalPost({ id: post._id as Id<'rentalposts'> });
                }}>
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                <span className='relative z-10'>
                  <Trash2Icon className='w-4 h-4' />
                </span>
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Card3D>
  );
};
