import { Skeleton } from "@/components/ui/skeleton";

export const MessageSkeleton = () => {
    return (
        <div className='flex items-center gap-3'>
            <Skeleton className='w-8 h-8 rounded-full' />
            <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
            </div>
        </div>
    );
}