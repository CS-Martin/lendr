import { CheckCircle } from 'lucide-react';

export function Step4Completed() {
    return (
        <div className='bg-green-900/20 border border-green-800 rounded-lg p-4'>
            <div className='flex items-center space-x-2 text-green-300 mb-2'>
                <CheckCircle className='w-4 h-4' />
                <span className='font-semibold'>Settlement Completed Successfully</span>
            </div>
            <div className='text-sm text-green-200'>
                The rental process has been completed. The NFT has been automatically returned from the smart contract registry and the rental fee has been distributed.
            </div>
        </div>
    );
}
