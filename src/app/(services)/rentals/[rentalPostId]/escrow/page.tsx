import { EscrowProvider } from '@/features/escrow/escrow-provider';

export default async function EscrowPage() {
  return (
    <div className='min-h-screen bg-slate-950'>
      <div className='container max-w-7xl mx-auto px-2 lg:px-0 py-8'>
        <EscrowProvider />
      </div>
    </div>
  );
}
