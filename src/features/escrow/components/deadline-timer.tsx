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
 * - Step 3 → rental period, deadline = rentalStartTime + rentalDuration (hours)
 * - Step 4 → no deadline (automatic settlement)
 */
export function DeadlineTimer() {
  const { escrow, currentStep, rentalDuration, rentalStartTime, timeRemainingStep2, defaultEscrow, completeStep } =
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
        // Rental period = rentalStartTime + rentalDuration (in hours)
        // Only calculate if we have both rentalStartTime and rentalDuration
        if (!rentalStartTime || !rentalDuration) return 0;
        return rentalStartTime + rentalDuration * 60 * 60 * 1000;

      case 4:
        // Step 4 (settlement) has no deadline - automatic processing
        return 0;

      default:
        return 0;
    }
  }, [currentStep, rentalDuration, rentalStartTime, timeRemainingStep2]);

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
        if (currentStep?.stepNumber === 3 && rentalStartTime) {
          // Auto-complete rental step when rental period ends (only if we're in step 3 and rental started)
          completeStep({ escrowId: escrow._id, stepNumber: 3 });
        } else if (currentStep?.stepNumber !== 3) {
          // Otherwise, default escrow on deadline expiry (but not for step 3)
          defaultEscrow(escrow._id);
        }
      }
    };

    tick(); // run immediately
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [endTime, escrow, currentStep, rentalStartTime, completeStep, defaultEscrow]);

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
