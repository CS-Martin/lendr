"use client"

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { 
  LENDR_DELEGATION_CONTRACT_ADDRESS,
  LENDR_DELEGATION_ABI,
} from "./smart-contract"

/**
 * LENDR DELEGATION CONTRACT HOOKS
 * 
 * This file contains React hooks for interacting with the Lendr Delegation Registry contract.
 * The contract handles NFT delegation rentals where NFTs are held in escrow and delegated to renters.
 * 
 * USAGE PATTERNS:
 * 
 * 1. READ OPERATIONS (View functions):
 *    const { data, isLoading, error } = useGetDelegation(nftContract, tokenId)
 * 
 * 2. WRITE OPERATIONS (State-changing functions):
 *    const { writeFunction, hash, error, isPending } = useWriteHook()
 *    const { data: receipt, isLoading: isConfirming } = useWaitForDelegationTransaction(hash)
 * 
 * 3. COMPLETE TRANSACTION FLOW:
 *    - Call write function
 *    - Wait for transaction hash
 *    - Wait for transaction confirmation
 *    - Handle success/error states
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
    functionName: "getDelegation",
    args: [nftContract as `0x${string}`, tokenId],
  })
}

/**
 * Get rental agreement details by rental ID
 * @param rentalId - The rental agreement ID
 */
export function useGetRentalAgreement(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "getRentalAgreement",
    args: [rentalId],
  })
}

/**
 * Get total hourly fee for a rental
 * @param rentalId - The rental agreement ID
 */
export function useGetTotalHourlyFee(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "getTotalHourlyFee",
    args: [rentalId],
  })
}

/**
 * Get the contract owner address
 */
export function useGetOwner() {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "i_owner",
  })
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
    functionName: "originalOwnerOf",
    args: [nftContract as `0x${string}`, tokenId],
  })
}

/**
 * Check if an address is authorized
 * @param address - The address to check
 */
export function useIsAuthorized(address: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "s_isAuthorized",
    args: [address as `0x${string}`],
  })
}

/**
 * Get NFT standard for a contract
 * @param nftContract - The NFT contract address
 */
export function useGetNftStandard(nftContract: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "s_nftStandard",
    args: [nftContract as `0x${string}`],
  })
}

/**
 * Get rental agreement by ID (direct mapping access)
 * @param rentalId - The rental agreement ID
 */
export function useGetRentalAgreementMapping(rentalId: bigint) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "s_rentalAgreements",
    args: [rentalId],
  })
}

/**
 * Check if interface is supported (ERC165)
 * @param interfaceId - The interface ID to check
 */
export function useSupportsInterface(interfaceId: `0x${string}`) {
  return useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "supportsInterface",
    args: [interfaceId],
  })
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
    functionName: "userExpires",
    args: [nftContract, tokenId],
  })
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
    functionName: "userOf",
    args: [nftContract, tokenId],
  })
}

// ============================================================================
// WRITE FUNCTIONS (State-changing functions from the delegation contract)
// ============================================================================

// ============================================================================
// ADMIN/OWNER FUNCTIONS (Contract Management)
// ============================================================================

/**
 * [OWNER ONLY] Add Authorized Address
 * 
 * USAGE GUIDE:
 * - Only callable by contract owner (deployer)
 * - Authorizes factory contracts to create rental agreements
 * - Required before factory can interact with delegation registry
 * 
 * WHEN TO USE:
 * - Setting up new factory contracts
 * - Upgrading factory contract addresses
 * 
 * REQUIREMENTS:
 * - msg.sender must be contract owner
 * - factoryAddress should be valid contract address
 * 
 * @param factoryAddress - The factory contract address to authorize
 */
export function useAddAuthorized() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const addAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "addAuthorized",
      args: [factoryAddress],
    })
  }

  return { addAuthorized, hash, error, isPending }
}

/**
 * [OWNER ONLY] Remove Authorized Address
 * 
 * USAGE GUIDE:
 * - Only callable by contract owner (deployer)
 * - Revokes factory contract authorization
 * - Prevents unauthorized contract interactions
 * 
 * WHEN TO USE:
 * - Decommissioning old factory contracts
 * - Emergency security measures
 * - Contract upgrades
 * 
 * REQUIREMENTS:
 * - msg.sender must be contract owner
 * - factoryAddress should be currently authorized
 * 
 * @param factoryAddress - The factory contract address to remove authorization
 */
export function useRemoveAuthorized() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const removeAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "removeAuthorized",
      args: [factoryAddress],
    })
  }

  return { removeAuthorized, hash, error, isPending }
}

// ============================================================================
// FACTORY FUNCTIONS (Authorized Contract Operations)
// ============================================================================

/**
 * [FACTORY ONLY] Create Rental Agreement
 * 
 * USAGE GUIDE:
 * - Only callable by authorized factory contracts
 * - Creates new delegation-based rental agreement
 * - Sets initial state to LISTED
 * 
 * WHEN TO USE:
 * - Factory contract creating new delegation rentals
 * - Automated rental agreement setup
 * 
 * REQUIREMENTS:
 * - msg.sender must be authorized factory
 * - rentalDurationInHours > 0
 * - dealDuration must be valid enum value
 * - All addresses must be valid
 * 
 * CONTRACT FLOW:
 * 1. Factory calls this function
 * 2. Agreement created in LISTED state
 * 3. Ready for renter to initiate rental
 * 
 * @param rentalId - Unique rental agreement ID
 * @param lender - NFT owner address
 * @param nftContract - NFT contract address
 * @param tokenId - NFT token ID
 * @param hourlyRentalFee - Fee per hour in wei
 * @param rentalDurationInHours - Total rental duration
 * @param nftStandard - 0=ERC721, 1=ERC1155, 2=ERC4907
 * @param dealDuration - Enum for lender response deadline
 */
export function useCreateRentalAgreement() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const createRentalAgreement = (
    rentalId: bigint,
    lender: `0x${string}`,
    nftContract: `0x${string}`,
    tokenId: bigint,
    hourlyRentalFee: bigint,
    rentalDurationInHours: bigint,
    nftStandard: number, // enum RentalEnums.NftStandard
    dealDuration: number // enum RentalEnums.DealDuration
  ) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "createRentalAgreement",
      args: [rentalId, lender, nftContract, tokenId, hourlyRentalFee, rentalDurationInHours, nftStandard, dealDuration],
    })
  }

  return { createRentalAgreement, hash, error, isPending }
}

/**
 * Set Delegation
 * 
 * USAGE GUIDE:
 * - Only callable by authorized contracts
 * - Sets delegation rights for specific NFT
 * - Creates time-bound usage rights
 * 
 * WHEN TO USE:
 * - Programmatic delegation setup
 * - Automated rental activation
 * 
 * REQUIREMENTS:
 * - msg.sender must be authorized
 * - NFT must be in escrow
 * - expires timestamp should be in future
 * 
 * @param nftContract - NFT contract address
 * @param tokenId - NFT token ID
 * @param user - Address to delegate to
 * @param expires - Unix timestamp when delegation expires
 */
export function useSetDelegation() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const setDelegation = (nftContract: `0x${string}`, tokenId: bigint, user: `0x${string}`, expires: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "setDelegation",
      args: [nftContract, tokenId, user, expires],
    })
  }

  return { setDelegation, hash, error, isPending }
}

/**
 * Revoke Delegation
 * 
 * USAGE GUIDE:
 * - Only callable by authorized contracts
 * - Immediately revokes delegation rights
 * - Clears delegation mapping
 * 
 * WHEN TO USE:
 * - Rental completion
 * - Emergency delegation removal
 * - Contract violations
 * 
 * REQUIREMENTS:
 * - msg.sender must be authorized
 * - Delegation must exist
 * 
 * @param nftContract - NFT contract address
 * @param tokenId - NFT token ID
 */
export function useRevokeDelegation() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const revokeDelegation = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "revokeDelegation",
      args: [nftContract, tokenId],
    })
  }

  return { revokeDelegation, hash, error, isPending }
}

// ============================================================================
// LENDER FUNCTIONS (NFT Owner Operations)
// ============================================================================

/**
 * [LENDER ONLY] Deposit NFT by Lender
 * 
 * USAGE GUIDE:
 * - Only callable by rental agreement lender
 * - Deposits NFT into escrow for delegation rental
 * - Must be called after rental is initiated by renter
 * - Required before delegation can be activated
 * 
 * WHEN TO USE:
 * - After renter initiates rental (PENDING state)
 * - Before lender delegation deadline expires
 * - To fulfill rental agreement obligations
 * 
 * REQUIREMENTS:
 * - msg.sender must be the lender for this rental
 * - Rental must be in PENDING state
 * - Must be before lenderDelegationDeadline
 * - Lender must have approved this contract for NFT transfer
 * - For ERC721: call approve(delegationContract, tokenId)
 * - For ERC1155: call setApprovalForAll(delegationContract, true)
 * 
 * CONTRACT FLOW:
 * 1. Renter initiates rental → PENDING state
 * 2. Lender deposits NFT (this function)
 * 3. Lender can then activate delegation
 * 
 * @param rentalId - The rental agreement ID
 */
export function useDepositNFTByLender() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const depositNFTByLender = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "depositNFTByLender",
      args: [rentalId],
    })
  }

  return { depositNFTByLender, hash, error, isPending }
}

/**
 * [LENDER ONLY] Activate Delegation
 * 
 * USAGE GUIDE:
 * - Only callable by rental agreement lender
 * - Activates delegation rights for the renter
 * - Transitions rental from PENDING to ACTIVE_DELEGATION
 * - Starts the rental period timer
 * 
 * WHEN TO USE:
 * - After depositing NFT (for non-ERC4907)
 * - When ready to start rental period
 * - To fulfill rental agreement
 * 
 * REQUIREMENTS:
 * - msg.sender must be the lender
 * - Rental must be in PENDING state
 * - For non-ERC4907: NFT must be deposited in escrow
 * - For ERC4907: Lender must own the NFT
 * 
 * CONTRACT FLOW:
 * 1. Renter initiates → PENDING
 * 2. Lender deposits NFT (if needed)
 * 3. Lender activates delegation (this function) → ACTIVE_DELEGATION
 * 4. Rental period begins
 * 
 * DELEGATION BEHAVIOR:
 * - ERC4907: Calls setUser() on NFT contract
 * - Others: Sets internal delegation mapping
 * 
 * @param rentalId - The rental agreement ID
 */
export function useActivateDelegation() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const activateDelegation = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "activateDelegation",
      args: [rentalId],
    })
  }

  return { activateDelegation, hash, error, isPending }
}

/**
 * [ANYONE] Deposit NFT to Escrow
 * 
 * USAGE GUIDE:
 * - Callable by NFT owners
 * - General purpose NFT escrow deposit
 * - Independent of rental agreements
 * - Supports ERC721 and ERC1155
 * 
 * WHEN TO USE:
 * - Preparing NFT for future rentals
 * - Manual escrow deposits
 * - NFT custody management
 * 
 * REQUIREMENTS:
 * - msg.sender must own the NFT
 * - Must approve this contract for transfer first
 * - NFT contract must support ERC721 or ERC1155
 * 
 * APPROVAL REQUIRED:
 * - ERC721: nftContract.approve(delegationContract, tokenId)
 * - ERC1155: nftContract.setApprovalForAll(delegationContract, true)
 * 
 * @param contractAddress - NFT contract address
 * @param tokenId - NFT token ID
 */
export function useDepositNFTtoEscrow() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const depositNFTtoEscrow = (contractAddress: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "depositNFTtoEscrow",
      args: [contractAddress, tokenId],
    })
  }

  return { depositNFTtoEscrow, hash, error, isPending }
}

/**
 * [ORIGINAL OWNER] Withdraw NFT
 * 
 * USAGE GUIDE:
 * - Only callable by original NFT owner
 * - Withdraws NFT from escrow back to owner
 * - Can only withdraw if no active delegation
 * 
 * WHEN TO USE:
 * - Retrieving NFT after rental completion
 * - Cancelling unused escrow deposits
 * - Emergency NFT recovery
 * 
 * REQUIREMENTS:
 * - msg.sender must be original owner (who deposited)
 * - No active delegation (userOf returns address(0))
 * - NFT must be in escrow
 * 
 * SAFETY CHECKS:
 * - Verifies original ownership
 * - Ensures no active delegation
 * - Handles both ERC721 and ERC1155
 * 
 * @param nftContract - NFT contract address
 * @param tokenId - NFT token ID
 */
export function useWithdrawNft() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const withdrawNft = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "withdrawNft",
      args: [nftContract, tokenId],
    })
  }

  return { withdrawNft, hash, error, isPending }
}

// ============================================================================
// RENTER FUNCTIONS (NFT Renter Operations)
// ============================================================================

/**
 * [RENTER] Initiate Delegation Rental (PAYABLE)
 * 
 * USAGE GUIDE:
 * - Callable by anyone except the lender
 * - Initiates a delegation-based rental
 * - Must send exact total rental fee in ETH
 * - Transitions rental from LISTED to PENDING
 * 
 * WHEN TO USE:
 * - Starting a new rental agreement
 * - Paying upfront for rental period
 * - Locking in rental terms
 * 
 * REQUIREMENTS:
 * - msg.sender cannot be the lender
 * - Rental must be in LISTED state
 * - Must send exact payment: hourlyFee * duration
 * - Payment held in escrow until completion
 * 
 * CONTRACT FLOW:
 * 1. Renter calls this function → PENDING state
 * 2. Lender has deadline to respond (deposit + activate)
 * 3. If lender doesn't respond, renter can cancel for refund
 * 
 * PAYMENT CALCULATION:
 * - Use getTotalHourlyFee(rentalId) to get required amount
 * - Payment = hourlyRentalFee * rentalDurationInHours
 * 
 * @param rentalId - The rental agreement ID
 * @param value - Total rental fee in wei (use getTotalHourlyFee)
 */
export function useInitiateDelegationRental() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const initiateDelegationRental = (rentalId: bigint, value: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "initiateDelegationRental",
      args: [rentalId],
      value: value, // ETH amount to send
    })
  }

  return { initiateDelegationRental, hash, error, isPending }
}

/**
 * [RENTER ONLY] Cancel Delegation Rental
 * 
 * USAGE GUIDE:
 * - Only callable by the renter who initiated
 * - Cancels rental if lender fails to respond in time
 * - Provides full refund to renter
 * - Can only cancel in PENDING state after deadline
 * 
 * WHEN TO USE:
 * - Lender missed delegation deadline
 * - Lender failed to deposit NFT
 * - Recovering payment from unresponsive lender
 * 
 * REQUIREMENTS:
 * - msg.sender must be the renter
 * - Rental must be in PENDING state
 * - Current time > lenderDelegationDeadline
 * 
 * REFUND PROCESS:
 * - Full rental payment returned to renter
 * - Rental state changed to CANCELLED
 * - No fees deducted for lender failure
 * 
 * TIMELINE:
 * 1. Renter initiates rental
 * 2. Lender has deadline to respond (6h-1week)
 * 3. If deadline passes, renter can cancel
 * 4. Renter receives full refund
 * 
 * @param rentalId - The rental agreement ID
 */
export function useCancelDelegationRental() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const cancelDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "cancelDelegationRental",
      args: [rentalId],
    })
  }

  return { cancelDelegationRental, hash, error, isPending }
}

/**
 * [RENTER ONLY] Report Breach
 * 
 * USAGE GUIDE:
 * - Only callable by renter during active rental
 * - Reports lender breach of delegation agreement
 * - Provides full refund if breach is confirmed
 * - Emergency protection for renters
 * 
 * WHEN TO USE:
 * - Lender revoked delegation early
 * - Delegation rights were not properly granted
 * - Lender violated rental terms
 * 
 * REQUIREMENTS:
 * - msg.sender must be the renter
 * - Rental must be in ACTIVE_DELEGATION state
 * - Current time < rentalEndTime (rental still active)
 * - Breach must be detectable (delegation not active)
 * 
 * BREACH DETECTION:
 * - ERC4907: Checks if userOf() != renter
 * - Others: Checks internal delegation mapping
 * - If delegation is still active, transaction reverts
 * 
 * REFUND PROCESS:
 * - Full rental payment returned to renter
 * - Rental state changed to CANCELLED
 * - Protects renter from lender violations
 * 
 * @param rentalId - The rental agreement ID
 */
export function useReportBreach() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const reportBreach = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "reportBreach",
      args: [rentalId],
    })
  }

  return { reportBreach, hash, error, isPending }
}

// ============================================================================
// PUBLIC FUNCTIONS (Anyone Can Call)
// ============================================================================

/**
 * [ANYONE] Complete Delegation Rental
 * 
 * USAGE GUIDE:
 * - Callable by anyone after rental period ends
 * - Completes successful rental and distributes payments
 * - Cleans up delegation and pays lender
 * - Permissionless rental finalization
 * 
 * WHEN TO USE:
 * - After rental period has ended
 * - To trigger payment to lender
 * - To clean up completed rentals
 * - Automated rental completion
 * 
 * REQUIREMENTS:
 * - Rental must be in ACTIVE_DELEGATION state
 * - Current time >= rentalEndTime
 * - No specific caller restrictions
 * 
 * PAYMENT DISTRIBUTION:
 * 1. Calculates total fee and platform fee
 * 2. Pays lender (total - platform fee)
 * 3. Pays platform fee to factory
 * 4. Revokes delegation rights
 * 5. Changes state to COMPLETED
 * 
 * DELEGATION CLEANUP:
 * - ERC4907: Calls setUser(tokenId, address(0), 0)
 * - Others: Deletes internal delegation mapping
 * 
 * GAS INCENTIVE:
 * - Anyone can call (keepers, bots, users)
 * - Ensures rentals complete even if parties are inactive
 * 
 * @param rentalId - The rental agreement ID
 */
export function useCompleteDelegationRental() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()

  const completeDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "completeDelegationRental",
      args: [rentalId],
    })
  }

  return { completeDelegationRental, hash, error, isPending }
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
  })
}

/**
 * Combined hook for write operation with transaction waiting
 * Example usage pattern for any write function
 */
export function useDelegationTransactionFlow() {
  const { address } = useAccount()
  
  return {
    address,
    // Helper to check if user is connected
    isConnected: !!address,
    // Common pattern: write -> wait for receipt -> handle success/error
    waitForTransaction: useWaitForTransactionReceipt,
  }
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
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { address } = useAccount()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Read contract functions - Core contract data
  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: LENDR_DELEGATION_CONTRACT_ADDRESS,
    abi: LENDR_DELEGATION_ABI,
    functionName: "i_owner",
  })

  // Helper functions for common read operations
  const getDelegation = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: delegation, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "getDelegation",
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    })
    return { delegation, refetch }
  }

  const getRentalAgreement = (rentalId: bigint) => {
    const { data: agreement, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "getRentalAgreement",
      args: [rentalId],
      query: { enabled: rentalId !== undefined },
    })
    return { agreement, refetch }
  }

  const getTotalHourlyFee = (rentalId: bigint) => {
    const { data: fee, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "getTotalHourlyFee",
      args: [rentalId],
      query: { enabled: rentalId !== undefined },
    })
    return { fee, refetch }
  }

  const getUserOf = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: user, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "userOf",
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    })
    return { user, refetch }
  }

  const getUserExpires = (nftContract: `0x${string}`, tokenId: bigint) => {
    const { data: expires, refetch } = useReadContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "userExpires",
      args: [nftContract, tokenId],
      query: { enabled: !!nftContract && tokenId !== undefined },
    })
    return { expires, refetch }
  }

  // Write functions - Rental lifecycle
  const initiateDelegationRental = (rentalId: bigint, value: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "initiateDelegationRental",
      args: [rentalId],
      value: value,
    })
  }

  const activateDelegation = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "activateDelegation",
      args: [rentalId],
    })
  }

  const completeDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "completeDelegationRental",
      args: [rentalId],
    })
  }

  const cancelDelegationRental = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "cancelDelegationRental",
      args: [rentalId],
    })
  }

  // Write functions - NFT management
  const depositNFTByLender = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "depositNFTByLender",
      args: [rentalId],
    })
  }

  const depositNFTtoEscrow = (contractAddress: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "depositNFTtoEscrow",
      args: [contractAddress, tokenId],
    })
  }

  const withdrawNft = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "withdrawNft",
      args: [nftContract, tokenId],
    })
  }

  // Write functions - Delegation management
  const setDelegation = (nftContract: `0x${string}`, tokenId: bigint, user: `0x${string}`, expires: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "setDelegation",
      args: [nftContract, tokenId, user, expires],
    })
  }

  const revokeDelegation = (nftContract: `0x${string}`, tokenId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "revokeDelegation",
      args: [nftContract, tokenId],
    })
  }

  // Write functions - Admin/Security
  const addAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "addAuthorized",
      args: [factoryAddress],
    })
  }

  const removeAuthorized = (factoryAddress: `0x${string}`) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "removeAuthorized",
      args: [factoryAddress],
    })
  }

  const reportBreach = (rentalId: bigint) => {
    writeContract({
      address: LENDR_DELEGATION_CONTRACT_ADDRESS,
      abi: LENDR_DELEGATION_ABI,
      functionName: "reportBreach",
      args: [rentalId],
    })
  }

  // Utility functions
  const refetchContractData = () => {
    refetchOwner()
  }

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

    // Write functions - Admin/Security
    addAuthorized,
    removeAuthorized,
    reportBreach,

    // Utility
    refetchContractData,
  }
}
