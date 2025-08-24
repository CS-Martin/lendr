import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Doc } from '@convex/_generated/dataModel';
import { Calendar, Copy, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export const ProfileHeader = ({ user }: { user?: Doc<'users'> }) => {
  return (
    <div className='relative z-10'>
      {/* Blurred Avatar Background */}
      <div className='relative h-[40vh] sm:h-[55vh] overflow-hidden'>
        {/* Blurred Background Image */}
        <Image
          src={!user?.avatarUrl ? '/avatar-placeholder.webp' : user.avatarUrl}
          alt='Blurred Background'
          fill
          className='object-cover blur-2xl scale-125'
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/avatar-placeholder.webp';
          }}
        />

        {/* Dark overlay */}
        <div className='absolute inset-0 bg-black/40' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-b from-transparent to-slate-950' />

        {/* Profile Info Overlay */}
        <div className='relative mt-10 md:mt-0 z-10 max-w-7xl mx-auto h-full flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8 px-4 pb-6'>
          {/* Avatar */}
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-75' />
            <Image
              src={!user?.avatarUrl ? '/avatar-placeholder.webp' : user.avatarUrl}
              alt='Profile Avatar'
              width={120}
              height={120}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/avatar-placeholder.webp';
              }}
              unoptimized
              className='relative h-24 w-24 sm:h-36 sm:w-36 rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-sm'
            />
          </div>

          {/* Profile Details */}
          <div className='flex-1 text-center sm:text-left'>
            {/* Username + Rating */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-3'>
              <h1 className='text-2xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                {user?.username || 'Unnamed Monkey'}
              </h1>
              <div className='flex items-center justify-center sm:justify-start gap-1 bg-yellow-500/20 px-2 py-1 rounded-full mt-2 sm:mt-0'>
                <Star className='h-4 w-4 text-yellow-400 fill-current' />
                <span className='text-yellow-400 text-sm font-semibold'>{'4.3'}</span>
              </div>
            </div>

            {/* Wallet Address */}
            <div className='flex items-center justify-center sm:justify-start gap-2 mb-4 text-white/80'>
              <span className='font-mono text-xs sm:text-sm bg-black/30 px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm truncate max-w-[150px] sm:max-w-none'>
                {user?.address ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : '0x000...0000'}
              </span>
              <Button
                onClick={() => navigator.clipboard.writeText(user?.address || '')}
                variant='ghost'
                size='sm'
                className='h-7 w-7 sm:h-8 sm:w-8 p-0 text-white/60 hover:bg-white/10 hover:text-white'>
                <Copy className='h-3 w-3' />
              </Button>
            </div>

            {/* Extra Info */}
            <div className='flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-8 text-xs sm:text-sm text-white/80'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>{user?._creationTime ? formatDate(new Date(user._creationTime)) : 'Unknown'}</span>
              </div>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-green-400' />
                <span>100% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
