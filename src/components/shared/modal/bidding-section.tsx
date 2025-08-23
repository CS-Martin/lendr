
import { Card, CardContent } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import LendrButton from '@/components/shared/lendr-btn';
import { CountdownTimer } from '@/features/marketplace/components/countdown-timer';

export const BiddingSection = ({ rentalPost }: { rentalPost: any }) => {
  if (!rentalPost?.isBiddable || !rentalPost.biddingEndTime) return null;

  return (
    <Card className='bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-800'>
      <CardContent className='p-1 text-center'>
        <h3 className='text-xl font-semibold text-white mb-4 flex items-center justify-center space-x-2'>
          <Timer className='w-5 h-5 text-orange-400' />
          <span>Bidding Ends In</span>
        </h3>
        <CountdownTimer biddingEndTime={new Date(rentalPost.biddingEndTime)} />
        <LendrButton className='w-[90%] mt-5 rounded-lg'>Bid now!</LendrButton>
      </CardContent>
    </Card>
  );
};
