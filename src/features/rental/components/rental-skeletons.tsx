import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

export const RentalPostDetailsPageSkeleton = () => {
  return (
    <div className='min-h-screen bg-slate-950 overflow-hidden'>
      <div className='container max-w-7xl mx-auto'>
        <div className='flex items-center text-neutral-400 space-x-2 py-8'>
          <ArrowLeft className='w-5 h-5' />
          <Skeleton className='h-5 w-40 rounded-md' />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Image Skeleton */}
          <div className='flex flex-col space-y-4'>
            <Skeleton className='w-full aspect-square rounded-xl' />
            <div className='space-y-3'>
              <Skeleton className='h-20 w-full rounded-md' />
              <Skeleton className='h-4 w-1/2 rounded-md' />
              <Skeleton className='h-4 w-1/3 rounded-md' />
              <Skeleton className='h- rounded-lg' />
            </div>
          </div>

          {/* Info Skeleton */}
          <div className='space-y-6'>
            <Skeleton className='h-8 w-2/3 rounded-md' />
            <Skeleton className='h-4 w-1/2 rounded-md' />
            <Skeleton className='h-4 w-1/3 rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />
            <Skeleton className='h-20 w-full rounded-md' />

            <Skeleton className='h-40 w-full rounded-xl' />

            <div className='flex space-x-4'>
              <Skeleton className='h-10 w-32 rounded-md' />
              <Skeleton className='h-10 w-32 rounded-md' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
