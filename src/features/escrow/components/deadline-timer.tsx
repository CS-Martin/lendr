import { useState, useEffect, useMemo } from 'react';
import { useEscrowLifecycle } from '../providers/escrow-provider';
import { CountdownTimer } from '@/features/marketplace/components/countdown-timer';

/**
 * DeadlineTimer
 *
 * Displays a countdown timer for the current escrow step.
 * Handles expiry logic for step 2 and step 3 (rental period).
 *
 * Step behavior:
 * - Step 2 → deadline comes from `timeRemainingStep2`
 * - Step 3 → rental period, deadline = now + rentalDuration (days)
 * - Step 4 → no deadline (automatic settlement)
 */
export function DeadlineTimer() {
  const { escrow, currentStep, rentalDuration, timeRemainingStep2, defaultEscrow, completeStep } = useEscrowLifecycle();

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
        // Step 4 (settlement) has no deadline - automatic processing
        return 0;

      default:
        return 0;
    }
  }, [currentStep, rentalDuration, timeRemainingStep2]);

  console.log('endTime', endTime);

  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  /**
   * Effect: update countdown every second and handle expiry logic.
   */
  useEffect(() => {
    if (!endTime || !escrow || currentStep?.stepNumber === 4) return; // Skip timer for step 4

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

  // Step 4 (settlement) has no deadline
  if (currentStep?.stepNumber === 4) {
    return <span className='text-blue-400'>No deadline - Automatic processing</span>;
  }

  // Expired state UI
  if (timeLeft <= 0) {
    return <span className='text-red-400'>Expired</span>;
  }

  // Default: render countdown
  return <CountdownTimer biddingEndTime={new Date(endTime)} />;
}
