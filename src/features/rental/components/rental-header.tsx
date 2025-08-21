import { type Doc } from '@convex/_generated/dataModel';

type RentalHeaderProps = {
  rentalPost: Doc<'rentalposts'>;
};

export function RentalHeader({ rentalPost }: RentalHeaderProps) {
  return (
    <div>
      <h1 className='text-4xl font-bold text-white mb-2'>{rentalPost.name}</h1>
      <p className='text-slate-400 text-lg leading-relaxed'>{rentalPost.description}</p>
    </div>
  );
}
