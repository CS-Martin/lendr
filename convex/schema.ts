import { defineSchema } from 'convex/server';
import { nft } from './nft';
import { rentalpost } from './rentalpost';
import { user } from './user';
import { bids } from './bids';

export default defineSchema({
  users: user,
  nfts: nft,
  rentalposts: rentalpost,
  bids: bids,
});
