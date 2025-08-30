import { useState, useEffect } from 'react';
import { useEscrowLifecycle } from '../providers/escrow-provider';

export function DeadlineTimer() {
  const { timeRemainingStep2 } = useEscrowLifecycle();

  const [timeLeft, setTimeLeft] = useState(timeRemainingStep2);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(timeRemainingStep2 - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemainingStep2]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className='grid grid-cols-4 gap-4 mb-4'>
      <div>
        <div className='text-3xl font-bold text-orange-400'>{days}</div>
        <div className='text-sm text-slate-400'>Days</div>
      </div>
      <div>
        <div className='text-3xl font-bold text-orange-400'>{hours}</div>
        <div className='text-sm text-slate-400'>Hours</div>
      </div>
      <div>
        <div className='text-3xl font-bold text-orange-400'>{minutes}</div>
        <div className='text-sm text-slate-400'>Minutes</div>
      </div>
      <div>
        <div className='text-3xl font-bold text-orange-400'>{seconds}</div>
        <div className='text-sm text-slate-400'>Seconds</div>
      </div>
    </div>
  );
}
