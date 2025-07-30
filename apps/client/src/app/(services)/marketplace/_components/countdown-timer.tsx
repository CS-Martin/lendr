import { NumberTicker } from '@/components/magicui/number-ticker';
import { memo, useEffect, useState } from 'react';

// Memoized countdown component to prevent unnecessary re-renders
export const CountdownDisplay = memo(
  ({ timeRemaining }: { timeRemaining: { days: number; hours: number; minutes: number; seconds: number } }) => (
    <div className='grid grid-cols-4 gap-4'>
      <div>
        <NumberTicker
          value={timeRemaining.days}
          className='text-3xl font-bold text-orange-400'
        />
        <div className='text-sm text-slate-400'>Days</div>
      </div>
      <div>
        <NumberTicker
          value={timeRemaining.hours}
          className='text-3xl font-bold text-orange-400'
        />
        <div className='text-sm text-slate-400'>Hours</div>
      </div>
      <div>
        <NumberTicker
          value={timeRemaining.minutes}
          className='text-3xl font-bold text-orange-400'
        />
        <div className='text-sm text-slate-400'>Minutes</div>
      </div>
      <div>
        <NumberTicker
          value={timeRemaining.seconds}
          className='text-3xl font-bold text-orange-400'
        />
        <div className='text-sm text-slate-400'>Seconds</div>
      </div>
    </div>
  ),
);
CountdownDisplay.displayName = 'CountdownDisplay';

// Self-contained countdown timer component
export const CountdownTimer = memo(({ biddingEndtime }: { biddingEndtime: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(biddingEndtime).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [biddingEndtime]);

  return <CountdownDisplay timeRemaining={timeRemaining} />;
});
CountdownTimer.displayName = 'CountdownTimer';
