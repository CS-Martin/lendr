import { CheckCircle } from 'lucide-react';

export function Step4Completed() {
    return (
        <div className='bg-green-900/20 border border-green-800 rounded-lg p-4'>
            <div className='flex items-center space-x-2 text-green-300 mb-2'>
                <CheckCircle className='w-4 h-4' />
                <span className='font-semibold'>NFT Returned Successfully</span>
            </div>
            <div className='text-sm text-green-200'>
                The NFT has been successfully returned to the lender. Settlement is now being processed.
            </div>
        </div>
    );
}
