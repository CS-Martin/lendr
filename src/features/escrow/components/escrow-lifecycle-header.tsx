import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEscrowLifecycle } from './escrow-lifecycle-context';
import { Doc } from '@convex/_generated/dataModel';

interface EscrowLifecycleHeaderProps {
  completedSteps: number;
  progress: number;
  steps: Doc<'escrowSmartContractSteps'>[];
}

export function EscrowLifecycleHeader({
  completedSteps,
  progress,
  steps,
}: EscrowLifecycleHeaderProps) {
  const currentStep = steps?.find((step) => step.status === 'ACTIVE') || steps?.[0];
  const currentStepNumber = currentStep?.stepNumber ?? 0;
  const totalSteps = steps?.length || 0;

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-bold text-white'>Escrow Lifecycle</h2>
          <span className='text-slate-400'>Step {currentStepNumber}/5</span>
        </div>
        <Progress
          value={progress}
          className='h-2'
        />
        <div className='mt-2 text-sm text-slate-400'>
          {completedSteps} of {totalSteps} steps completed
        </div>
      </CardContent>
    </Card>
  );
}