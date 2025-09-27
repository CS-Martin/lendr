'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Edit3, Gavel, Loader2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import LendrButton from '@/components/shared/lendr-btn';

import { api } from '@convex/_generated/api';
import { Doc } from '@convex/_generated/dataModel';
import { formatDuration } from '@/lib/utils';
import { bidFormSchema, BidFormValues } from '@/features/bidding/schemas/bid-schemas';
import {
  BIDDING_CONSTANTS,
  calculateBidCosts,
  validateBidAgainstHighestBid,
} from '@/features/bidding/utils/bidding-utils';
import { BidFormSkeleton } from '@/features/bidding/components/bidding-skeletons';
import { BidCostBreakdown } from '@/features/bidding/components/bid-cost-breakdown';

interface BiddingFormProps {
  rentalPost: Doc<'rentalposts'>;
}

export function BiddingForm({ rentalPost }: BiddingFormProps) {
  const { data: session } = useSession();
  const userAddress = session?.user?.address;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convex queries
  const userBid = useQuery(
    api.bids.getUserBidForRentalPost,
    userAddress ? { rentalPostId: rentalPost._id, bidderAddress: userAddress } : 'skip',
  );

  const highestBidData = useQuery(api.bids.getHighestBid, { rentalPostId: rentalPost._id });

  const placeBidMutation = useMutation(api.bids.placeBid);

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError,
    reset,
  } = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      bidAmount: Math.max(rentalPost.hourlyRate, highestBidData?.bidAmount || rentalPost.hourlyRate),
      rentalDuration: userBid?.rentalDuration || 12,
      message: userBid?.message || '',
    },
    mode: 'onChange',
  });

  // Watch form values
  const bidAmount = watch('bidAmount');
  const rentalDuration = watch('rentalDuration');

  // Update form when user bid loads
  useEffect(() => {
    if (userBid) {
      reset({
        bidAmount: userBid.bidAmount,
        rentalDuration: userBid.rentalDuration,
        message: userBid.message || '',
      });
    }
  }, [userBid, reset]);

  // Calculate costs
  const costBreakdown = calculateBidCosts(bidAmount, rentalDuration);

  const handleBidSubmission = async (formData: BidFormValues) => {
    if (!userAddress) {
      toast.error('You must be signed in to place a bid.');
      return;
    }

    // Validate against the highest bid
    const validation = validateBidAgainstHighestBid(
      formData.bidAmount,
      formData.rentalDuration,
      highestBidData ?? null,
      rentalPost,
    );

    if (!validation.isValid) {
      setError('bidAmount', { type: 'manual', message: validation.error });
      return;
    }

    setIsSubmitting(true);

    try {
      await placeBidMutation({
        rentalPostId: rentalPost._id,
        bidderAddress: userAddress,
        bidAmount: formData.bidAmount,
        rentalDuration: formData.rentalDuration,
        message: formData.message,
        totalBidAmount: costBreakdown.totalRequired,
      });

      toast.success(
        <div>
          <strong>{userBid ? 'Bid updated!' : 'Bid placed!'}</strong>
          <div>{userBid ? 'Your bid has been successfully updated.' : 'Your bid has been placed successfully.'}</div>
        </div>,
      );
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error(
        <div className='text-red-500'>
          <strong>Bid Failed</strong>
          <div>Failed to place bid. Please try again.</div>
        </div>,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while data is being fetched
  if (highestBidData === undefined) {
    return <BidFormSkeleton />;
  }

  // Get minimum bid amount for display
  const getMinimumBidAmount = () => {
    if (!highestBidData) return rentalPost.hourlyRate;
    return Math.max(highestBidData.bidAmount + 0.0001, rentalPost.hourlyRate);
  };

  return (
    <Card className='bg-slate-900/50 border-slate-800'>
      <CardHeader>
        <CardTitle className='text-white flex items-center space-x-2'>
          <Gavel className='w-5 h-5 text-orange-400' />
          <span>{userBid ? 'Edit Your Bid' : 'Place Your Bid'}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(handleBidSubmission)}
          className='space-y-4'>
          {/* Bid Amount Input */}
          <div className='space-y-2'>
            <Label
              htmlFor='bidAmount'
              className='text-slate-300'>
              Bid Amount (ETH per hour)
            </Label>
            <Input
              id='bidAmount'
              type='number'
              step='0.0001'
              min={getMinimumBidAmount()}
              className='bg-slate-800 border-slate-700 text-white'
              {...register('bidAmount', { valueAsNumber: true })}
            />

            {errors.bidAmount ? (
              <p className='text-sm text-red-400'>{errors.bidAmount.message}</p>
            ) : (
              <div className='text-sm text-slate-400 space-y-1'>
                {highestBidData ? (
                  <>
                    <p>Current highest bid: {highestBidData.bidAmount} ETH/hour</p>
                    <p>Total highest value: {highestBidData.totalBidAmount.toFixed(4)} ETH</p>
                  </>
                ) : (
                  <p>Starting price: {rentalPost.hourlyRate} ETH/hour</p>
                )}
              </div>
            )}
          </div>

          {/* Rental Duration Slider */}
          <div className='space-y-2'>
            <Label className='text-slate-300'>Rental Duration: {formatDuration(rentalDuration)} hour(s)</Label>
            <Slider
              value={[rentalDuration]}
              onValueChange={([value]) => setValue('rentalDuration', value)}
              max={rentalPost.rentalDuration * 24}
              min={BIDDING_CONSTANTS.MIN_RENTAL_DURATION}
              step={1}
              className='mt-2'
            />
            {errors.rentalDuration && <p className='text-sm text-red-400'>{errors.rentalDuration.message}</p>}
          </div>

          {/* Optional Message */}
          <div className='space-y-2'>
            <Label
              htmlFor='message'
              className='text-slate-300'>
              Message to Owner (Optional)
            </Label>
            <Textarea
              id='message'
              placeholder='Why should you be chosen?'
              className='bg-slate-800 border-slate-700 text-white'
              {...register('message')}
            />
            {errors.message && <p className='text-sm text-red-400'>{errors.message.message}</p>}
          </div>

          {/* Cost Breakdown */}
          {bidAmount > 0 && (
            <BidCostBreakdown
              costBreakdown={costBreakdown}
              rentalDuration={rentalDuration}
            />
          )}

          {/* Submit Button */}
          <LendrButton
            type='submit'
            className='w-full bg-gradient-to-r border-0'
            disabled={isSubmitting || !isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {userBid ? 'Updating...' : 'Placing...'}
              </>
            ) : (
              <>
                <Edit3 className='mr-2 h-4 w-4' />
                {userBid ? 'Update Bid' : 'Place Bid'}
              </>
            )}
          </LendrButton>

          {userBid && (
            <p className='text-sm text-slate-400 text-center'>
              You can edit your bid at any time before the auction ends.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
