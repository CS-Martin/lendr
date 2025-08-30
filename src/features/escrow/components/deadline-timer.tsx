import { useState, useEffect } from 'react';
import { useEscrowLifecycle } from '../providers/escrow-provider';
import { CountdownTimer } from '@/features/marketplace/components/countdown-timer';

export function DeadlineTimer() {
  const { escrow, defaultEscrow } = useEscrowLifecycle();

  const endTime = escrow?.step2ExpiresAt ? new Date(escrow.step2ExpiresAt).getTime() : 0;
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    if (timeLeft <= 0) {
      defaultEscrow(escrow!._id);
      return;
    }

    const interval = setInterval(() => {
      const newTimeLeft = endTime - Date.now();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearInterval(interval);
        defaultEscrow(escrow!._id);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, escrow, defaultEscrow, timeLeft]);

  if (timeLeft <= 0) return <span>Expired</span>;

  return <CountdownTimer biddingEndTime={new Date(endTime)} />;
}
