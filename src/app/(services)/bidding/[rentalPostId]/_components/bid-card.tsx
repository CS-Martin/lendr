'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMutation } from 'convex/react';
import { Doc } from '../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

interface BidCardProps {
  bid: Doc<'bids'>;
  index: number;
}

const BidCard = ({ bid, index }: BidCardProps) => {
  const acceptBid = useMutation(api.bids.acceptBid);
  const rejectBid = useMutation(api.bids.rejectBid);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<string | null>(null);

  // Mock data for bidder details (replace with actual data from your database)
  const bidderRating = 4.9;
  const bidderRentals = 45;

  const handleAcceptBid = () => {
    acceptBid({ bidId: bid._id });
    setShowAcceptModal(false);
  };

  const handleRejectBid = (bidId: string) => {
    // rejectBid({ bidId });
  };

  return (
    <motion.div
      key={bid._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Card
        className={`border-slate-800 hover:border-purple-500/50 transition-all duration-300 ${index === 0 ? 'bg-green-900/20 border-green-800' : 'bg-slate-900/50'
          }`}>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>{bid.bidderAddress.slice(2, 4).toUpperCase()}</span>
              </div>
              <div>
                <div className='flex items-center space-x-2'>
                  <span className='text-white font-mono'>
                    {bid.bidderAddress.slice(0, 8)}...{bid.bidderAddress.slice(-6)}
                  </span>
                  {index === 0 && <Badge className='bg-green-500 text-xs'>Highest Bid</Badge>}
                </div>
                <div className='flex items-center space-x-4 text-sm text-slate-400 mt-1'>
                  <div className='flex items-center space-x-1'>
                    <Star className='w-3 h-3 text-yellow-400 fill-current' />
                    <span>{bidderRating}</span>
                  </div>
                  <span>{bidderRentals} rentals</span>
                  <span>{new Date(bid.updatedTime).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-2xl font-bold text-green-400'>{bid.bidAmount} ETH</div>
              <div className='text-sm text-slate-400'>per day</div>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 mb-4 text-sm'>
            <div>
              <div className='text-slate-400'>Duration</div>
              <div className='text-white font-semibold'>{bid.rentalDuration} day(s)</div>
            </div>

            <div>
              <div className='text-slate-400'>Total Value</div>
              <div className='text-purple-400 font-semibold'>
                {(Number.parseFloat(bid.bidAmount.toString()) * bid.rentalDuration).toFixed(3)} ETH
              </div>
            </div>
          </div>

          {bid.message && (
            <div className='bg-slate-800/50 rounded-lg p-3 mb-4'>
              <div className='flex items-start space-x-2'>
                <MessageSquare className='w-4 h-4 text-slate-400 mt-0.5' />
                <div>
                  <div className='text-xs text-slate-400 mb-1'>Message from bidder:</div>
                  <div className='text-sm text-slate-300 italic'>&quot;{bid.message}&quot;</div>
                </div>
              </div>
            </div>
          )}

          <div className='flex space-x-3'>
            <Dialog
              open={showAcceptModal && selectedBid === bid._id}
              onOpenChange={setShowAcceptModal}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setSelectedBid(bid._id)}
                  className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'>
                  <CheckCircle className='w-4 h-4 mr-2' />
                  Accept Bid
                </Button>
              </DialogTrigger>

              <DialogContent className='bg-slate-900 border-slate-800 text-white !max-w-md'>
                <DialogHeader>
                  <DialogTitle className='text-xl'>Accept Bid</DialogTitle>
                </DialogHeader>

                <div className='space-y-6'>
                  <div className='bg-slate-800 rounded-lg p-4 space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Bidder</span>
                      <span className='text-white font-mono'>
                        {bid.bidderAddress.slice(0, 8)}...{bid.bidderAddress.slice(-6)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Bid Amount</span>
                      <span className='text-green-400 font-bold'>{bid.bidAmount} ETH/day</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Duration</span>
                      <span className='text-white'>{bid.rentalDuration} day(s)</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-400'>Total Earnings</span>
                      <span className='text-purple-400 font-bold'>
                        {(Number.parseFloat(bid.bidAmount.toString()) * bid.rentalDuration).toFixed(3)} ETH
                      </span>
                    </div>
                  </div>

                  <div className='text-xs text-slate-400 space-y-1'>
                    <p>• Accepting this bid will automatically reject all other bids</p>
                    <p>• The rental will begin immediately after acceptance</p>
                    <p>• You cannot change your mind once accepted</p>
                  </div>

                  <div className='flex space-x-3'>
                    <Button
                      variant='outline'
                      onClick={() => setShowAcceptModal(false)}
                      className='flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAcceptBid}
                      className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0'>
                      Accept Bid
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant='outline'
              onClick={() => handleRejectBid(bid._id)}
              className='border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent'>
              Reject
            </Button>

            <Button
              variant='outline'
              className='border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'>
              Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BidCard;
