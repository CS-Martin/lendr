import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { EscrowLifecycleHeader } from './escrow-lifecycle-header';
import { EscrowStep } from './escrow-step';
import { DeadlineTimer } from './deadline-timer';
import { HelpSection } from './help-section';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useEscrowLifecycle } from '../providers/escrow-provider';

export function EscrowLifecycle() {
  const { escrow } = useEscrowLifecycle();

  const steps = useQuery(api.escrowSmartContractStep.getEscrowSmartContractSteps, escrow?._id ? { escrowId: escrow._id } : 'skip');

  const { completedSteps, progress, currentStep } = useMemo(() => {
    if (!steps) {
      return {
        completedSteps: 0,
        progress: 0,
        currentStep: { stepNumber: 0, status: 'PENDING' as const },
      };
    }

    const completed = steps.filter((step) => step.status === 'COMPLETED').length;
    const progress = (completed / steps.length) * 100;
    const current = steps.find((step) => step.status === 'ACTIVE') ||
      steps[0] || { stepNumber: 0, status: 'PENDING' as const };

    return {
      completedSteps: completed,
      progress,
      currentStep: current,
    };
  }, [steps]);

  if (!steps) {
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

      {currentStep.stepNumber === 2 && (
        <Card className='bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-800'>
          <CardContent className='p-6 text-center'>
            <h3 className='text-xl font-semibold text-white mb-2'>⚠️ Deadline Approaching</h3>
            <p className='text-orange-200 mb-4'>Lender must send NFT within:</p>
            <DeadlineTimer />
            <div className='text-sm text-red-300'>
              If deadline passes → Escrow will be CANCELLED and funds returned to renter
            </div>
          </CardContent>
        </Card>
      )}

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
