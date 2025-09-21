'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { LENDR_FACTORY_CONTRACT_ADDRESS, LENDR_FACTORY_ABI } from './smart-contract';

/**
 * Hook for interacting with the Lendr Factory Contract
 * Provides functions to create rental agreements and read contract state
 */
export function useLendrFactoryContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { address } = useAccount();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract functions - Factory Contract
  const { data: deployer, refetch: refetchDeployer } = useReadContract({
    address: LENDR_FACTORY_CONTRACT_ADDRESS,
    abi: LENDR_FACTORY_ABI,
    functionName: 'i_deployer',
  });

  const { data: delegationRegistry, refetch: refetchDelegationRegistry } = useReadContract({
    address: LENDR_FACTORY_CONTRACT_ADDRESS,
    abi: LENDR_FACTORY_ABI,
    functionName: 'i_delegationRegistry',
  });

  const { data: collateralRegistry, refetch: refetchCollateralRegistry } = useReadContract({
    address: LENDR_FACTORY_CONTRACT_ADDRESS,
    abi: LENDR_FACTORY_ABI,
    functionName: 'i_collateralRegistry',
  });

  const { data: totalRentals, refetch: refetchTotalRentals } = useReadContract({
    address: LENDR_FACTORY_CONTRACT_ADDRESS,
    abi: LENDR_FACTORY_ABI,
    functionName: 's_totalRentals',
  });

  const { data: feeBps, refetch: refetchFeeBps } = useReadContract({
    address: LENDR_FACTORY_CONTRACT_ADDRESS,
    abi: LENDR_FACTORY_ABI,
    functionName: 's_feeBps',
  });

  // Function to get collateral rental agreement by ID
  const getCollateralRentalAgreement = (rentalId: number) => {
    const { data: agreement, refetch } = useReadContract({
      address: LENDR_FACTORY_CONTRACT_ADDRESS,
      abi: LENDR_FACTORY_ABI,
      functionName: 's_collateralRentalAgreementById',
      args: [BigInt(rentalId)],
      query: { enabled: rentalId > 0 },
    });
    return { agreement, refetch };
  };

  // Write functions - Create rental agreements
  const createCollateralRentalAgreement = (
    lender: string,
    nftContract: string,
    tokenId: number,
    hourlyRentalFee: string,
    collateral: string,
    rentalDurationInHours: number,
    nftStandard: number, // 0 for ERC721, 1 for ERC1155
    dealDuration: number, // 0 for HOURS, 1 for DAYS, 2 for WEEKS
  ) => {
    writeContract({
      address: LENDR_FACTORY_CONTRACT_ADDRESS,
      abi: LENDR_FACTORY_ABI,
      functionName: 'createCollateralRentalAgreement',
      args: [
        lender as `0x${string}`,
        nftContract as `0x${string}`,
        BigInt(tokenId),
        parseEther(hourlyRentalFee),
        parseEther(collateral),
        BigInt(rentalDurationInHours),
        nftStandard,
        dealDuration,
      ],
    });
  };

  const createDelegationRentalAgreement = (
    lender: string,
    nftContract: string,
    tokenId: number,
    hourlyRentalFee: string,
    rentalDurationInHours: number,
    nftStandard: number, // 0 for ERC721, 1 for ERC1155
    dealDuration: number, // 0 for HOURS, 1 for DAYS, 2 for WEEKS
  ) => {
    writeContract({
      address: LENDR_FACTORY_CONTRACT_ADDRESS,
      abi: LENDR_FACTORY_ABI,
      functionName: 'createDelegationRentalAgreement',
      args: [
        lender as `0x${string}`,
        nftContract as `0x${string}`,
        BigInt(tokenId),
        parseEther(hourlyRentalFee),
        BigInt(rentalDurationInHours),
        nftStandard,
        dealDuration,
      ],
    });
  };

  // Admin functions (only deployer can call)
  const setFeeBps = (newFeeBps: number) => {
    writeContract({
      address: LENDR_FACTORY_CONTRACT_ADDRESS,
      abi: LENDR_FACTORY_ABI,
      functionName: 'setFeeBps',
      args: [BigInt(newFeeBps)],
    });
  };

  const withdraw = () => {
    writeContract({
      address: LENDR_FACTORY_CONTRACT_ADDRESS,
      abi: LENDR_FACTORY_ABI,
      functionName: 'withdraw',
    });
  };

  // Utility functions
  const refetchAll = () => {
    refetchDeployer();
    refetchDelegationRegistry();
    refetchCollateralRegistry();
    refetchTotalRentals();
    refetchFeeBps();
  };

  return {
    // Contract data
    deployer: deployer as string,
    delegationRegistry: delegationRegistry as string,
    collateralRegistry: collateralRegistry as string,
    totalRentals: totalRentals ? Number(totalRentals) : 0,
    feeBps: feeBps ? Number(feeBps) : 0,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // Contract functions
    createCollateralRentalAgreement,
    createDelegationRentalAgreement,
    setFeeBps,
    withdraw,
    getCollateralRentalAgreement,

    // Utility
    refetchAll,
  };
}
