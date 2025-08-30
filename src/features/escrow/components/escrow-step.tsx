import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStepIcon } from './utils'; // Assuming you have a utils file for getStepIcon
import { Step1Completed } from './StepContentViews/step-1-completed';
import { Step2Active } from './StepContentViews/step-2-active';
import { Step3Pending } from './StepContentViews/step-3-pending';
import { Step4Pending } from './StepContentViews/step-4-pending';
import { Step5Pending } from './StepContentViews/step-5-pending';
import { TransactionDetails } from './transaction-details';
import { Doc } from '@convex/_generated/dataModel';
import { StepStatus } from '../types/step-status';
import { useEscrowLifecycle } from './escrow-lifecycle-context';

interface EscrowStepProps {
  step: Doc<'escrowSmartContractSteps'>;
  index: number;
}

export function EscrowStep({ step, index }: EscrowStepProps) {
  const { escrowData } = useEscrowLifecycle();

  const renderStepContent = () => {
    switch (step.stepNumber) {
      case 1:
        return step.status === 'COMPLETED' ? <Step1Completed /> : null;
      case 2:
        return step.status === 'ACTIVE' ? <Step2Active step={step} /> : null;
      case 3:
        return step.status === 'PENDING' ? <Step3Pending /> : null;
      case 4:
        return step.status === 'PENDING' ? <Step4Pending step={step} /> : null;
      case 5:
        return step.status === 'PENDING' ? <Step5Pending /> : null;
      default:
        return null;
    }
  };

  return (
    <motion.div
      key={step.stepNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Card
        className={`border-slate-800 ${
          step.status === 'COMPLETED'
            ? 'bg-green-900/20 border-green-800'
            : step.status === 'ACTIVE'
              ? 'bg-blue-900/20 border-blue-800'
              : 'bg-slate-900/50'
        }`}>
        <CardContent className='p-6'>
          <div className='flex items-start space-x-4'>
            <div className='flex-shrink-0 mt-1'>{getStepIcon(step.status as StepStatus)}</div>

            <div className='flex-1'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-lg font-semibold text-white'>
                  Step {step.stepNumber}: {step.title}
                </h3>
                <Badge
                  className={
                    step.status === 'COMPLETED'
                      ? 'bg-green-500'
                      : step.status === 'ACTIVE'
                        ? 'bg-blue-500'
                        : 'bg-slate-600'
                  }>
                  {step.status}
                </Badge>
              </div>

              <p className='text-slate-400 mb-3'>{step.description}</p>
              <p className='text-slate-300 text-sm mb-4'>{step.details}</p>

              {renderStepContent()}

              {step.txHash && (
                <TransactionDetails
                  txHash={step.txHash}
                  timestamp={step.timestamp}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
