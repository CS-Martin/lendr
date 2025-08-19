import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Calendar, Copy, Star, TrendingUp } from 'lucide-react';
import { Session } from 'next-auth';
import Image from 'next/image';
import { Doc } from '../../../../../convex/_generated/dataModel';

export const ProfileHeader = ({ user }: { user: Doc<'users'> }) => {
  return (
    <div className='relative z-10'>
      {/* Blurred Avatar Background */}
      <div className='relative h-[55vh] overflow-hidden'>
        {/* Blurred Background Image */}
        <Image
          src={
            user?.avatarUrl === '' || user?.avatarUrl === null || user?.avatarUrl === undefined
              ? '/avatar-placeholder.webp'
              : user?.avatarUrl
          }
          alt='Blurred Background'
          fill
          className='object-cover blur-2xl scale-125'
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/avatar-placeholder.webp';
          }}
        />
        {/* Dark overlay for contrast */}
        <div className='absolute inset-0 bg-black/40' />
        {/* Optional gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-slate-950' />

        {/* Profile Info Overlay */}
        <div className='relative z-10 max-w-7xl mx-auto h-full flex items-end gap-8 px-4 pb-6'>
          {/* Avatar */}
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-75' />
            <Image
              src={
                user?.avatarUrl === '' || user?.avatarUrl === null || user?.avatarUrl === undefined
                  ? '/avatar-placeholder.webp'
                  : user?.avatarUrl
              }
              alt='Profile Avatar'
              width={150}
              height={150}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/avatar-placeholder.webp';
              }}
              unoptimized
              className='h-35 w-35 relative rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-sm'
            />
          </div>

          {/* Profile Details */}
          <div className='flex-1'>
            <div className='flex items-center gap-4 mb-3'>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                {user?.username || 'Unnamed Monkey'}
              </h1>
              <div className='flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full'>
                <Star className='h-4 w-4 text-yellow-400 fill-current' />
                <span className='text-yellow-400 text-sm font-semibold'>{'4.3'}</span>
              </div>
            </div>

            <div className='flex items-center gap-3 mb-4 text-white/80'>
              <span className='font-mono text-sm bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm'>
                {user?.address?.slice(0, 6) + '...' + user?.address?.slice(-4)}
              </span>
              <Button
                onClick={() => navigator.clipboard.writeText(user?.address || '')}
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 text-white/60 hover:bg-white/10 hover:text-white'>
                <Copy className='h-3 w-3' />
              </Button>
            </div>

            <div className='flex items-center gap-8 text-sm text-white/80'>
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
