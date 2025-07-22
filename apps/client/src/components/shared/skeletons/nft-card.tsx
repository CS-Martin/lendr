'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function NFTCardSkeleton() {
    return (
        <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
            <Skeleton className="aspect-square w-full bg-gray-800" />
            <div className="p-4">
                <Skeleton className="h-5 w-3/4 bg-gray-800 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-gray-800" />
                <div className="mt-4 flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4 bg-gray-800" />
                    <Skeleton className="h-8 w-8 rounded-full bg-gray-800" />
                </div>
            </div>
        </div>
    );
}

export const NFTGridSkeleton = ({ count = 10 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <NFTCardSkeleton key={i} />
            ))}
        </div>
    );
}
