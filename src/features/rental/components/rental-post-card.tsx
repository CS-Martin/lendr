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

interface RentalPostCardProps {
  post: Doc<'rentalposts'>;
  viewMode: 'grid' | 'list';
  onViewRentalPost: (e: React.MouseEvent) => void;
}

export const RentalPostCard = ({ post, viewMode, onViewRentalPost }: RentalPostCardProps) => {
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
    <Card3D className='relative group h-full'>
      <motion.div
        onClick={(e) => onViewRentalPost(e)}
        ref={cardRef}
        className={cn(
          'relative h-full flex flex-col cursor-pointer bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-slate-700/50 hover:border-lendr-400/50 rounded-2xl overflow-hidden shadow-2xl hover:shadow-lendr-400/30 transition-all duration-500',
          viewMode === 'list' && 'flex-row max-h-32', // List view specific styles
          viewMode === 'grid' && 'max-h-[400px]', // Grid view specific styles
        )}
        whileHover={{
          y: viewMode === 'grid' ? -15 : 0, // Only lift in grid view
          boxShadow: '0 25px 80px rgba(220, 243, 71, 0.25)',
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        {/* Image Section - Left */}
        <div
          className={cn(
            'relative overflow-hidden flex-shrink-0',
            viewMode === 'list' && 'w-1/2 md:w-[100px] xl:w-[160px]',
            viewMode === 'grid' && 'h-48',
          )}>
          <motion.div
            ref={imageRef}
            whileHover={{ scale: viewMode === 'grid' ? 1.05 : 1 }}
            transition={{ duration: 0.5 }}
            className='w-full h-full'>
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
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
              className={cn('w-full h-full object-cover', viewMode === 'grid' ? 'h-48' : 'h-full')}
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
                {post.status === 'AVAILABLE' ? (
                  <Badge className='bg-green-500 shadow-lg'>Available</Badge>
                ) : (
                  <Badge className='bg-red-500 shadow-lg'>Rented</Badge>
                )}
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
            'p-3 flex flex-col flex-1 transition-all duration-500',
            viewMode === 'list' ? 'w-full p-2.5' : 'group-hover:-translate-y-2',
          )}>
          <div className='flex-1'>
            <motion.h3
              className='text-sm mb-1 md:text-md font-mono font-bold text-white group-hover:text-lendr-400 transition-colors duration-300 line-clamp-1'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}>
              {post.name}
            </motion.h3>

            <motion.p
              className={cn(
                'text-xs text-slate-400 mb-3 text-ellipsis',
                viewMode === 'grid' ? 'line-clamp-2' : 'line-clamp-1',
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}>
              {post.description}
            </motion.p>
          </div>

          <div className={cn('grid', viewMode === 'grid' ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-2')}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}>
              <div className='text-xs text-slate-400'>Hourly Rate</div>
              <motion.div
                className={cn('text-sm font-bold text-lendr-400 font-mono', viewMode === 'list' ? 'text-xs' : '')}
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
              <div className='text-xs text-slate-400'>Collateral</div>
              <div className={cn('text-sm font-bold text-cyan-400 font-mono', viewMode === 'list' ? 'text-xs' : '')}>
                {post.collateral} ETH
              </div>
            </motion.div>
            {viewMode === 'list' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={cn(viewMode === 'list' ? 'hidden' : 'block')}>
                <div className='text-xs text-slate-400'>Category</div>
                <div className='text-sm font-bold text-purple-400 font-mono'>{post.category}</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {viewMode === 'grid' && (
          <div className='p-3 pt-0'>
            {post.posterAddress !== session?.user?.address && post.status === 'AVAILABLE' ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}>
                <LendrButton
                  className='w-full overflow-hidden rounded-md text-sm py-2'
                  disabled={post.status !== 'AVAILABLE'}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!session) {
                      toast.error('You must be signed in to place a bid.');
                      return;
                    }

                    router.push(`/rentals/${post._id}`);
                  }}>
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className='relative z-10'>{post.status === 'AVAILABLE' ? 'Place Bid' : 'Unavailable'}</span>
                </LendrButton>
              </motion.div>
            ) : session && post.posterAddress === session?.user?.address ? (
              <div className='flex flex-row items-center justify-between gap-2'>
                <motion.div
                  className='flex-1'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}>
                  <LendrButton
                    className='w-full overflow-hidden rounded-md text-sm py-2'
                    disabled={post.status !== 'AVAILABLE'}
                    onClick={(e) => e.stopPropagation()}
                    link={`/rentals/${post._id}/bids`}>
                    <motion.div
                      className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className='relative z-10'>Manage Bids</span>
                  </LendrButton>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className='flex-shrink-0'
                  onClick={(e) => e.stopPropagation()}>
                  <Button
                    className='w-10 h-10 overflow-hidden rounded-md bg-red-500 hover:bg-red-600 p-0'
                    disabled={post.status !== 'AVAILABLE'}
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
            ) : null}
          </div>
        )}
      </motion.div>
    </Card3D>
  );
};
