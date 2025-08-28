import { EscrowProvider } from '@/features/escrow/escrow-provider';

export default async function EscrowPage() {
  return (
    <div className='min-h-screen bg-slate-950'>
      <div className='container mx-auto px-4 py-8'>
        <EscrowProvider />
      </div>
    </div>
  );
}
