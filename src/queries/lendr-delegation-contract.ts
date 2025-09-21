'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { LENDR_DELEGATION_CONTRACT_ADDRESS, LENDR_DELEGATION_ABI } from './smart-contract';

/**
 * LENDR DELEGATION CONTRACT HOOKS
 *
 * This file contains React hooks for interacting with the Lendr Delegation Registry contract.
 * The contract handles NFT delegation rentals where NFTs are held in escrow and delegated to renters.
 *
 * RECOMMENDED USAGE:
 *
 * 1. COMPREHENSIVE HOOK (Preferred):
 *    const delegation = useLendrDelegationContract()
 *    delegation.initiateDelegationRental(rentalId, value)
 *    const { agreement } = delegation.getRentalAgreement(rentalId)
 *
 * 2. INDIVIDUAL READ HOOKS:
 *    const { data, isLoading, error } = useGetDelegation(nftContract, tokenId)
 *    const { data: agreement } = useGetRentalAgreement(rentalId)
 *
 * 3. TRANSACTION FLOW:
 *    - Call write function from comprehensive hook
 *    - Monitor hash, isPending, isConfirming, isConfirmed states
 *    - Handle success/error states automatically
 *
 * All functions follow the Checks-Effects-Interactions pattern as per smart contract best practices.
 */

// ============================================================================
// READ FUNCTIONS (View/Pure functions from the delegation contract)
// ============================================================================

/**
 * Get delegation information for a specific NFT
 * @param nftContract - The NFT contract address
 * @param tokenId - The token ID
 */
export function useGetDelegation(nftContract: `0x${string}`, tokenId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'getDelegation',
    args: [nftContract as `0x${string}`, tokenId],
  });
}

/**
 * Get rental agreement details by rental ID
 * @param rentalId - The rental agreement ID
 */
export function useGetRentalAgreement(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'getRentalAgreement',
    args: [rentalId],
  });
}

/**
 * Get total hourly fee for a rental
 * @param rentalId - The rental agreement ID
 */
export function useGetTotalHourlyFee(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'getTotalHourlyFee',
    args: [rentalId],
  });
}

/**
 * Get the contract owner address
 */
export function useGetOwner() {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'i_owner',
  });
}

/**
 * Get the original owner of an NFT in escrow
 * @param nftContract - The NFT contract address
 * @param tokenId - The token ID
 */
export function useOriginalOwnerOf(nftContract: `0x${string}`, tokenId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'originalOwnerOf',
    args: [nftContract as `0x${string}`, tokenId],
  });
}

/**
 * Check if an address is authorized
 * @param address - The address to check
 */
export function useIsAuthorized(address: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 's_isAuthorized',
    args: [address as `0x${string}`],
  });
}

/**
 * Get NFT standard for a contract
 * @param nftContract - The NFT contract address
 */
export function useGetNftStandard(nftContract: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 's_nftStandard',
    args: [nftContract as `0x${string}`],
  });
}

/**
 * Get rental agreement by ID (direct mapping access)
 * @param rentalId - The rental agreement ID
 */
export function useGetRentalAgreementMapping(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 's_rentalAgreements',
    args: [rentalId],
  });
}

/**
 * Check if interface is supported (ERC165)
 * @param interfaceId - The interface ID to check
 */
export function useSupportsInterface(interfaceId: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'supportsInterface',
    args: [interfaceId],
  });
}

/**
 * Get user expiration time for delegation
 * @param nftContract - The NFT contract address
 * @param tokenId - The token ID
 */
export function useUserExpires(nftContract: `0x${string}`, tokenId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'userExpires',
    args: [nftContract, tokenId],
  });
}

/**
 * Get current user of delegated NFT
 * @param nftContract - The NFT contract address
 * @param tokenId - The token ID
 */
export function useUserOf(nftContract: `0x${string}`, tokenId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'userOf',
    args: [nftContract, tokenId],
  });
}

// ============================================================================
// INDIVIDUAL HELPER HOOKS (For specific use cases)
// ============================================================================

/**
 * [FACTORY ONLY] Create Rental Agreement
 * Individual hook for factory contracts to create rental agreements
 * 
 * NOTE: For most use cases, prefer useLendrDelegationContract() comprehensive hook
 */
export function useCreateRentalAgreement() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const createRentalAgreement = (
    rentalId: bigint,
    lender: `0x${string}`,
    nftContract: `0x${string}`,
    tokenId: bigint,
    hourlyRentalFee: bigint,
    rentalDurationInHours: bigint,
    nftStandard: number, // enum RentalEnums.NftStandard
    dealDuration: number, // enum RentalEnums.DealDuration
  ) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'createRentalAgreement',
      args: [rentalId, lender, nftContract, tokenId, hourlyRentalFee, rentalDurationInHours, nftStandard, dealDuration],
    });
  };

  return { createRentalAgreement, hash, error, isPending };
}

// ============================================================================
// TRANSACTION RECEIPT HELPERS
// ============================================================================

/**
 * Hook to wait for transaction receipt
 * Use this with any of the write function hashes to wait for confirmation
 * @param hash - Transaction hash from write functions
 */
export function useWaitForDelegationTransaction(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

/**
 * Combined hook for write operation with transaction waiting
 * Example usage pattern for any write function
 */
export function useDelegationTransactionFlow() {
  const { address } = useAccount();

  return {
    address,
    // Helper to check if user is connected
    isConnected: !!address,
    // Common pattern: write -> wait for receipt -> handle success/error
    waitForTransaction: useWaitForTransactionReceipt,
  };
}

// ============================================================================
// COMPREHENSIVE DELEGATION CONTRACT HOOK
// ============================================================================

/**
 * Comprehensive hook for interacting with the Lendr Delegation Contract
 * Provides unified access to all contract functions and state management
 * Similar pattern to useLendrFactoryContract for consistency
 */
export function useLendrDelegationContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { address } = useAccount();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract functions - Core contract data
  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: 'i_owner',
  });

  // Helper functions for common read operations
  const getDelegation = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: delegation, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'getDelegation',
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    });
    return { delegation, refetch };
  };

  const getRentalAgreement = (rentalId: bigint) => {
    const { data: agreement, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'getRentalAgreement',
      args: [rentalId],
      query: { enabled: rentalId !== undefined },
    });
    return { agreement, refetch };
  };

  const getTotalHourlyFee = (rentalId: bigint) => {
    const { data: fee, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'getTotalHourlyFee',
      args: [rentalId],
      query: { enabled: rentalId !== undefined },
    });
    return { fee, refetch };
  };

  const getUserOf = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: user, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'userOf',
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    });
    return { user, refetch };
  };

  const getUserExpires = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: expires, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'userExpires',
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    });
    return { expires, refetch };
  };

  // Write functions - Rental lifecycle
  const initiateDelegationRental = (rentalId: bigint, value: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'initiateDelegationRental',
      args: [rentalId],
      value: value,
    });
  };

  const activateDelegation = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'activateDelegation',
      args: [rentalId],
    });
  };

  const completeDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'completeDelegationRental',
      args: [rentalId],
    });
  };

  const cancelDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'cancelDelegationRental',
      args: [rentalId],
    });
  };

  // Write functions - NFT management
  const depositNFTByLender = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'depositNFTByLender',
      args: [rentalId],
    });
  };

  const depositNFTtoEscrow = (contractAddress: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'depositNFTtoEscrow',
      args: [contractAddress, tokenId],
    });
  };

  const withdrawNft = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'withdrawNft',
      args: [nftContract, tokenId],
    });
  };

  // Write functions - Delegation management
  const setDelegation = (nftContract: `0x${string}`, tokenId: bigint, user: `0x${string}`, expires: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'setDelegation',
      args: [nftContract, tokenId, user, expires],
    });
  };

  const revokeDelegation = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'revokeDelegation',
      args: [nftContract, tokenId],
    });
  };

  // Write functions - Factory/Admin
  const createRentalAgreement = (
    rentalId: bigint,
    lender: `0x${string}`,
    nftContract: `0x${string}`,
    tokenId: bigint,
    hourlyRentalFee: bigint,
    rentalDurationInHours: bigint,
    nftStandard: number,
    dealDuration: number,
  ) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'createRentalAgreement',
      args: [rentalId, lender, nftContract, tokenId, hourlyRentalFee, rentalDurationInHours, nftStandard, dealDuration],
    });
  };

  const addAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'addAuthorized',
      args: [factoryAddress],
    });
  };

  const removeAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'removeAuthorized',
      args: [factoryAddress],
    });
  };

  const reportBreach = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: 'reportBreach',
      args: [rentalId],
    });
  };

  // Utility functions
  const refetchContractData = () => {
    refetchOwner();
  };

  return {
    // Contract data
    owner: owner as `0x${string}`,

    // Transaction state
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,

    // User state
    address,
    isConnected: !!address,

    // Read functions (with built-in refetch)
    getDelegation,
    getRentalAgreement,
    getTotalHourlyFee,
    getUserOf,
    getUserExpires,

    // Write functions - Rental lifecycle
    initiateDelegationRental,
    activateDelegation,
    completeDelegationRental,
    cancelDelegationRental,

    // Write functions - NFT management
    depositNFTByLender,
    depositNFTtoEscrow,
    withdrawNft,

    // Write functions - Delegation management
    setDelegation,
    revokeDelegation,

    // Write functions - Factory/Admin
    createRentalAgreement,
    addAuthorized,
    removeAuthorized,
    reportBreach,

    // Utility
    refetchContractData,
  };
}
