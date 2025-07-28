import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const RentalPostCardSkeleton = ({ viewMode }: { viewMode: 'grid' | 'list' }) => {
    if (viewMode === 'list') {
        return (
            <div className="flex flex-row rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
                <Skeleton className="w-[160px] bg-gray-800" />
                <div className="flex flex-col items-start w-full p-4">
                    <Skeleton className="h-6 bg-gray-800 w-3/4 mb-2" />
                    <Skeleton className="h-4 bg-gray-800 w-1/2 mb-4" />
                    <Skeleton className="h-4 bg-gray-800 w-1/4" />
                </div>
            </div>
        );
    }

    return (
        <div className='rounded-xl overflow-hidden border border-gray-800 bg-gray-900'>
            <Skeleton className='h-[260px] w-full bg-gray-800' />
            <div className='p-4'>
                <Skeleton className='h-5 w-3/4 bg-gray-800 mb-2' />
                <Skeleton className='h-4 w-1/2 bg-gray-800' />
                <div className='mt-4 flex justify-between items-center'>
                    <Skeleton className='h-4 w-1/4 bg-gray-800' />
                    <Skeleton className='h-8 w-8 rounded-full bg-gray-800' />
                </div>
            </div>
        </div>
    );
};

export const RentalPostGridSkeleton = ({ count = 10, viewMode }: { count?: number; viewMode: 'grid' | 'list' }) => {
    return (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4', viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2')}>
            {Array.from({ length: count }).map((_, i) => (
                <RentalPostCardSkeleton key={i} viewMode={viewMode} />
            ))}
        </div>
    );
};