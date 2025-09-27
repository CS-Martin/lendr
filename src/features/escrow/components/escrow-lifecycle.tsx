import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { EscrowLifecycleHeader } from './escrow-lifecycle-header';
import { EscrowStep } from './escrow-step';
import { DeadlineTimer } from './deadline-timer';
import { HelpSection } from './help-section';
import { Card, CardContent } from '@/components/ui/card';
import { useEscrowLifecycle } from '../providers/escrow-provider';

export function EscrowLifecycle() {
  const { steps, currentStep } = useEscrowLifecycle();

  const { completedSteps, progress } = useMemo(() => {
    if (!steps) {
      return {
        completedSteps: 0,
        progress: 0,
      };
    }

    const completed = steps.filter((step) => step.status === 'COMPLETED').length;
    const progress = (completed / steps.length) * 100;

    return {
      completedSteps: completed,
      progress,
    };
  }, [steps]);

  if (!steps || !currentStep) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className='space-y-6'>
      <EscrowLifecycleHeader
        steps={steps}
        completedSteps={completedSteps}
        progress={progress}
      />

      {/* Step 2 - Deadline Approaching */}
      {currentStep.stepNumber === 2 && (
        <Card className='bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-800'>
          <CardContent className='p-2 text-center'>
            <h3 className='text-base lg:text-xl font-semibold text-white mb-2'>⚠️ Deadline Approaching</h3>
            <p className='text-orange-200 mb-4'>Lender must send NFT within:</p>
            <DeadlineTimer />
            <div className='text-sm text-red-300'>
              If deadline passes → Escrow will be CANCELLED and funds returned to renter
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 - Rental Period */}
      {currentStep.stepNumber === 3 && (
        <Card className='bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-800'>
          <CardContent className='p-2 text-center'>
            <h3 className='text-base lg:text-xl font-semibold text-white mb-2'>⚠️ Rental Period</h3>
            <p className='text-orange-200 mb-4'>Lender must send NFT within:</p>
            <DeadlineTimer />
          </CardContent>
        </Card>
      )}

      {/* Step 4 - Deadline Approaching */}

      <div className='space-y-4'>
        {steps.map((step, index) => (
          <EscrowStep
            key={step.stepNumber}
            step={step}
            index={index}
          />
        ))}
      </div>

      <HelpSection />
    </motion.div>
  );
}
