export interface Bid {
  rentalPostId: string;
  bidderAddress: string;
  message?: string;
  bidAmount: number;
  totalFee: number;
  rentalDuration: number;
  isAccepted: boolean;
  acceptedTimestamp?: number;
  updatedTime: number;
}

export interface BidFormData {
  bidAmount: number;
  rentalDuration: number;
  message?: string;
}

export interface BidCostBreakdown {
  hourlyCost: number;
  totalRentalCost: number;
  collateral: number;
  totalRequired: number;
}
