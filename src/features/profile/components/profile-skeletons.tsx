import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // shadcn/ui skeleton

export const ProfileSkeletons = () => {
  return (
    <Card className='bg-gray-900/50 backdrop-blur-sm border-gray-800/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-white'>
          <Skeleton className='w-5 h-5 rounded-full' />
          <Skeleton className='h-4 w-40' />
        </CardTitle>
        <CardDescription>
          <Skeleton className='h-3 w-60 mt-2' />
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Avatar + Info */}
        <div className='flex items-center gap-6'>
          <Skeleton className='w-24 h-24 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-48' />
            <Skeleton className='h-3 w-24 mt-2' />
          </div>
        </div>

        {/* Form Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Skeleton className='h-3 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-3 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>

        <div className='space-y-2'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-20 w-full' />
        </div>

        <div className='flex gap-3'>
          <Skeleton className='h-10 w-32 rounded-xl' />
          <Skeleton className='h-10 w-24 rounded-xl' />
        </div>
      </CardContent>
    </Card>
  );
};
