import { useState, useEffect, useMemo } from 'react';
import { useEscrowLifecycle } from '../providers/escrow-provider';
import { CountdownTimer } from '@/features/marketplace/components/countdown-timer';

/**
 * DeadlineTimer
 *
 * Displays a countdown timer for the current escrow step.
 * Handles expiry logic for step 2, step 3 (rental period), and step 4.
 *
 * Step behavior:
 * - Step 2 → deadline comes from `timeRemainingStep2`
 * - Step 3 → rental period, deadline = now + rentalDuration (days)
 * - Step 4 → deadline comes from `timeRemainingStep4`
 */
export function DeadlineTimer() {
  const { escrow, currentStep, rentalDuration, timeRemainingStep2, timeRemainingStep4, defaultEscrow, completeStep } =
    useEscrowLifecycle();

  /**
   * Compute deadline (endTime) based on the current step.
   */
  const endTime = useMemo(() => {
    if (!currentStep) return 0;

    switch (currentStep.stepNumber) {
      case 2:
        return new Date(timeRemainingStep2).getTime();

      case 3:
        // Rental period = now + rentalDuration (in days)
        return Date.now() + (rentalDuration || 0) * 24 * 60 * 60 * 1000;

      case 4:
        return new Date(timeRemainingStep4).getTime();

      default:
        return 0;
    }
  }, [currentStep, rentalDuration, timeRemainingStep2, timeRemainingStep4]);

  console.log('endTime', endTime);

  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  /**
   * Effect: update countdown every second and handle expiry logic.
   */
  useEffect(() => {
    if (!endTime || !escrow) return;

    const tick = () => {
      const remaining = endTime - Date.now();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (currentStep?.stepNumber === 3) {
          // Auto-complete rental step when rental period ends
          completeStep({ escrowId: escrow._id, stepNumber: 3 });
        } else {
          // Otherwise, default escrow on deadline expiry
          defaultEscrow(escrow._id);
        }
      }
    };

    tick(); // run immediately
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [endTime, escrow, currentStep, completeStep, defaultEscrow]);

  // Expired state UI
  if (timeLeft <= 0) {
    return <span className='text-red-400'>Expired</span>;
  }

  // Default: render countdown
  return <CountdownTimer biddingEndTime={new Date(endTime)} />;
}
