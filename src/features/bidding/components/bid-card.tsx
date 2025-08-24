'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Doc } from '@convex/_generated/dataModel';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { AcceptBidModal } from './accept-bid-modal';
import Link from 'next/link';
import LendrButton from '@/components/shared/lendr-btn';
import { useChatSheetStore } from '@/stores/chat-sheet.store';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useSession } from 'next-auth/react';

interface BidCardProps {
  bid: Doc<'bids'>;
  index: number;
  hasAcceptedBid: boolean;
}

const BidCard = ({ bid, index, hasAcceptedBid }: BidCardProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<string | null>(null);
  const { isOpen, openChatSheet } = useChatSheetStore();
  const createOrGetConversation = useMutation(api.conversations.createOrGetConversation);

  const currentUser = useQuery(api.user.getUser, user?.address ? { address: user.address } : 'skip');
  const bidderUser = useQuery(api.user.getUser, { address: bid.bidderAddress });

  const handleSendMessage = async () => {
    if (!currentUser || !bidderUser) {
      console.log('Missing user data:', { currentUser, bidderUser });
      return;
    }

    try {
      console.log('Creating conversation between:', currentUser._id, 'and', bidderUser._id);
      const conversationId = await createOrGetConversation({
        otherParticipantId: bidderUser._id,
        address: currentUser.address,
      });

      console.log('Opening chat sheet with conversationId:', conversationId);
      openChatSheet(conversationId);
      console.log('Chat sheet should be open now');
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  };

  // Mock data for bidder details (replace with actual data from your database)
  const bidderRating = 4.9;
  const bidderRentals = 45;

  return (
    <motion.div
      key={bid._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Card
        className={`relative transition-all duration-300
        ${bid.isAccepted
            ? 'bg-green-900/30 border-green-500 shadow-lg shadow-green-500/30'
            : 'bg-slate-900/50 border-slate-800 hover:border-purple-500/50'
          }`}>
        <CardContent className='py-6'>
          {/* Accepted badge */}
          {bid.isAccepted && (
            <div className='absolute top-3 right-3'>
              <Badge className='bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-md'>Accepted</Badge>
            </div>
          )}

          {/* Top section */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{bid.bidderAddress.slice(2, 4).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-white font-mono break-all">
                    {bid.bidderAddress.slice(0, 8)}...{bid.bidderAddress.slice(-6)}
                  </span>
                  {index === 0 && <Badge className="bg-green-500 text-xs">Highest Bid</Badge>}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{bidderRating}</span>
                  </div>
                  <span>{bidderRentals} rentals</span>
                  <span>{new Date(bid.updatedTime).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-green-400">{bid.bidAmount} ETH</div>
              <div className="text-sm text-slate-400">per day</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <div className="text-slate-400">Duration</div>
              <div className="text-white font-semibold">{bid.rentalDuration} day(s)</div>
            </div>

            <div>
              <div className="text-slate-400">Total Value</div>
              <div className="text-purple-400 font-semibold">
                {(Number.parseFloat(bid.bidAmount.toString()) * bid.rentalDuration).toFixed(3)} ETH
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {bid.isAccepted ? (
              <Button
                asChild
                variant="outline"
                className="border-green-500 text-green-400 bg-green-900/40 hover:bg-green-500 cursor-pointer flex-1 hover:scale-101">
                <Link href={`/escrow-smart-contract/${bid._id}`}>Proceed to Rental Process</Link>
              </Button>
            ) : (
              <AcceptBidModal
                bid={bid}
                index={index}
                showAcceptModal={showAcceptModal}
                setShowAcceptModal={setShowAcceptModal}
                selectedBid={selectedBid}
                setSelectedBid={setSelectedBid}
                disabled={hasAcceptedBid}
              />
            )}

            <LendrButton
              variant="outline"
              onClick={handleSendMessage}
              className="border-slate-700 rounded-md w-full text-slate-300 hover:text-white hover:bg-slate-800 bg-transparent flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send a Message
            </LendrButton>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BidCard;
