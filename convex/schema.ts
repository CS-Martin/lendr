import { defineSchema } from 'convex/server';
import { nft } from './nft';
import { rentalpost } from './rentalpost';
import { user } from './user';
import { bids } from './bids';
import { escrowSmartContract } from './escrowSmartContract';
import { escrowSmartContractStep } from './escrowSmartContractStep';
import { conversations } from './conversations';
import { messages } from './messages';
import { presence } from './presence';

export default defineSchema({
  users: user,
  nfts: nft,
  rentalposts: rentalpost,
  bids: bids,
  escrowSmartContracts: escrowSmartContract,
  escrowSmartContractSteps: escrowSmartContractStep,
  conversations: conversations,
  messages: messages,
  presence: presence,
});
