import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { StepStatus } from '../types/step-status';

export const getStepIcon = (status: StepStatus) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className='w-6 h-6 text-green-500' />;
    case 'ACTIVE':
      return <Clock className='w-6 h-6 text-blue-500' />;
    case 'PENDING':
      return <AlertCircle className='w-6 h-6 text-slate-500' />;
    default:
      return <XCircle className='w-6 h-6 text-red-500' />;
  }
};
