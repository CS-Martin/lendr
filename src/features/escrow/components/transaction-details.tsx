import { Button } from '@/components/ui/button';
import { truncateText } from '@/lib/utils';
import { Copy, ExternalLink } from 'lucide-react';

interface TransactionDetailsProps {
  txHash: string;
  timestamp: number;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function TransactionDetails({ txHash, timestamp }: TransactionDetailsProps) {
  return (
    <div className='mt-4 pt-4 border-t border-slate-700'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-slate-400'>Transaction Hash</span>
        <div className='flex items-center space-x-2'>
          <code className='text-xs text-slate-300 font-mono'>{truncateText(txHash)}</code>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => copyToClipboard(txHash!)}
            className='hidden md:block text-slate-400 hover:text-white p-1'>
            <Copy className='w-3 h-3' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='hidden md:block text-slate-400 hover:text-white p-1'>
            <ExternalLink className='w-3 h-3' />
          </Button>
        </div>
      </div>
      {timestamp > 0 && (
        <div className='text-xs text-slate-500 mt-1'>
          {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
