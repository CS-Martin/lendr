import { Doc } from '@convex/_generated/dataModel';
import { BidCostBreakdown } from '../types/bidding';

export const BIDDING_CONSTANTS = {
  MIN_BID_AMOUNT: 0.0001,
  MIN_RENTAL_DURATION: 1,
  MAX_RENTAL_DURATION: 720,
  MAX_MESSAGE_LENGTH: 500,
} as const;

export const calculateBidCosts = (bidAmount: number, rentalDuration: number): BidCostBreakdown => {
  const totalRentalCost = bidAmount * rentalDuration;
  const totalRequired = totalRentalCost;

  return {
    hourlyCost: bidAmount,
    totalRentalCost,
    collateral: 0,
    totalRequired,
  };
};

export const validateBidAgainstHighestBid = (
  newBidAmount: number,
  newRentalDuration: number,
  highestBid: Doc<'bids'> | null,
  rentalPost: Doc<'rentalposts'>,
): { isValid: boolean; error?: string } => {
  // Calculate the total cost for the new bid
  const newBidTotalCost = calculateBidCosts(newBidAmount, newRentalDuration).totalRequired;

  // If there's no highest bid yet, only check against minimum requirements
  if (!highestBid) {
    if (newBidAmount <= rentalPost.hourlyRate) {
      return {
        isValid: false,
        error: `Bid must be higher than the starting price (${rentalPost.hourlyRate} POL)`,
      };
    }
    return { isValid: true };
  }

  // Calculate the highest bid's total cost (should already be stored as totalBidAmount)
  const highestBidTotalCost = highestBid.totalBidAmount;

  // Compare total costs (bid amount * duration)
  if (newBidTotalCost <= highestBidTotalCost) {
    return {
      isValid: false,
      error: `Your total bid (${newBidTotalCost.toFixed(4)} POL) must be higher than the current highest total bid (${highestBidTotalCost.toFixed(4)} POL)`,
    };
  }

  // Also ensure the hourly rate is reasonable
  if (newBidAmount <= highestBid.bidAmount) {
    return {
      isValid: false,
      error: `Hourly bid amount (${newBidAmount} POL) must be higher than the current highest hourly bid (${highestBid.bidAmount} POL)`,
    };
  }

  return { isValid: true };
};
