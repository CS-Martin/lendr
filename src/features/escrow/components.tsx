import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EscrowStatus, StepStatus } from './types';

export const getStepIcon = (status: StepStatus) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className='w-6 h-6 text-green-400' />;
    case 'ACTIVE':
      return <Clock className='w-6 h-6 text-blue-400' />;
    case 'PENDING':
      return <AlertCircle className='w-6 h-6 text-slate-400' />;
    default:
      return <AlertCircle className='w-6 h-6 text-slate-400' />;
  }
};

export const getStatusBadge = (status: EscrowStatus) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge className='bg-blue-500 text-white px-4 py-2'>Escrow Active</Badge>;
    case 'CANCELLED':
      return <Badge className='bg-red-500 text-white px-4 py-2'>Escrow Cancelled</Badge>;
    case 'DEFAULTED':
      return <Badge className='bg-orange-500 text-white px-4 py-2'>Escrow Defaulted</Badge>;
    case 'COMPLETED':
      return <Badge className='bg-green-500 text-white px-4 py-2'>Escrow Completed</Badge>;
    default:
      return <Badge className='bg-slate-500 text-white px-4 py-2'>Unknown Status</Badge>;
  }
};
