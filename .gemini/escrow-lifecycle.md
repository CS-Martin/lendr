# GEMINI.md

## 🎯 Goal

Implement the **Escrow Smart Contract Lifecycle** on the frontend.  
The lifecycle ensures safe NFT rentals between renter and lender by enforcing deadlines, collateral, and payouts.

---

## 📦 Core Entities

### `escrowSmartContracts` (Table)

- `bidId` → reference to accepted bid
- `rentalPostId` → reference to rental post
- `rentalPostRenterAddress` → renter’s wallet address
- `rentalPostOwnerAddress` → lender’s wallet address
- `status` → `ACTIVE | CANCELLED | DEFAULTED | COMPLETED`
- `step2ExpiresAt` → deadline for lender to send NFT (1 day)
- `step4ExpiresAt` → deadline for renter to return NFT (3 days)

### `escrowSmartContractSteps` (Table)

- `escrowId` → reference to `escrowSmartContracts`
- `stepNumber` → 1–5
- `status` → `PENDING | ACTIVE | COMPLETED`
- `txHash` → blockchain transaction hash (optional)
- `timestamp` → Unix time when action occurred

---

## 🔄 Lifecycle Flow

1. **Escrow Created**

   - Triggered when renter accepts bid.
   - Creates escrow contract (`status: ACTIVE`).
   - Creates **Step 1 record** with `status: ACTIVE`.

2. **Step 1: Renter Pays (Collateral + Rental Fee)**

   - Renter deposits into escrow.
   - On success:
     - Update **Step 1 → COMPLETED**
     - Create **Step 2 → ACTIVE**

3. **Step 2: Lender Sends NFT**

   - Lender must send NFT within 24h.
   - On success:
     - Update **Step 2 → COMPLETED**
     - Create **Step 3 → ACTIVE**
   - On timeout:
     - Escrow → `CANCELLED` (funds refunded to renter).

4. **Step 3: Rental Duration**

   - Starts once NFT is received.
   - Ends after rental period (or renter returns early).
   - On success:
     - Update **Step 3 → COMPLETED**
     - Create **Step 4 → ACTIVE**

5. **Step 4: Renter Returns NFT**

   - Must return within 3 days after rental ends.
   - On success:
     - Update **Step 4 → COMPLETED**
     - Create **Step 5 → ACTIVE**
   - On timeout:
     - Escrow → `DEFAULTED` (collateral → lender).

6. **Step 5: Settlement / Payout**
   - Platform executes payouts:
     - Rental fee → lender
     - Collateral → renter (if NFT returned)
     - Platform fee deducted
   - Escrow → `COMPLETED`

---

## ⚙️ Frontend Responsibilities

### 1. Initialize Escrow

```ts
await createEscrowSmartContract({
  bidId,
  rentalPostId,
  rentalPostRenterAddress: renterAddress,
  rentalPostOwnerAddress: lenderAddress,
  status: 'ACTIVE',
});
```

### 2. Progress Steps

Always complete the current step before creating the next one.

```ts
await completeStep({
  escrowId,
  stepNumber: 1,
  status: 'COMPLETED',
  txHash,
  timestamp: Date.now(),
});

await createStep({
  escrowId,
  stepNumber: 2,
  status: 'ACTIVE',
  timestamp: Date.now(),
});
```

3. Handle Deadlines
   Use countdown timers for Step 2 (24h) and Step 4 (72h).
   If expired → auto call cancelEscrow or defaultEscrow.

```tsx
Copy code

function DeadlineTimer({ deadline }: { deadline: number }) {
const [timeLeft, setTimeLeft] = useState(deadline - Date.now());
useEffect(() => {
const t = setInterval(() => setTimeLeft(deadline - Date.now()), 1000);
return () => clearInterval(t);
}, [deadline]);
return <span>{Math.max(0, Math.floor(timeLeft / 1000))}s</span>;
} 4. Settlement
Triggered after NFT is returned → finalizes payout.
```

ts
Copy code
await settleEscrow({ escrowId });
🖼️ Suggested UI
Progress Tracker (Stepper)

Shows Steps 1–5.

✅ Completed, ⏳ Active, ⬜ Pending.

Action Buttons

Each step → context action:

Step 1 → "Pay Rental Fee"

Step 2 → "Send NFT"

Step 3 → "End Rental Early"

Step 4 → "Return NFT"

Step 5 → "Settle Escrow"

Deadline Countdown

Step 2 & Step 4 show countdown timer.

📑 API Checklist
createEscrowSmartContract

getEscrowSmartContract

createStep

completeStep

cancelEscrow

defaultEscrow

settleEscrow

✅ Key Rules
One escrow per rental post.

Completing a step always creates the next one.

Deadlines enforce automatic status changes.

Settlement finalizes and closes escrow.

```

```
