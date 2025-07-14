-- CreateEnum
CREATE TYPE "RentalListingStatus" AS ENUM ('AVAILABLE', 'RENTED', 'DELISTED', 'DISPUTED_FOR_LENDER', 'DISPUTED_FOR_RENTER');

-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "NFT" (
    "address" TEXT NOT NULL,
    "userAddress" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "floorPrice" DOUBLE PRECISION,
    "collectionName" TEXT,

    CONSTRAINT "NFT_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "RentalPost" (
    "rentalPostId" SERIAL NOT NULL,
    "posterAddress" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "collateral" DOUBLE PRECISION NOT NULL,
    "isBiddable" BOOLEAN NOT NULL,
    "biddingStarttime" TIMESTAMP(3),
    "biddingEndtime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL,
    "statusCode" "RentalListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RentalPost_pkey" PRIMARY KEY ("rentalPostId")
);

-- CreateTable
CREATE TABLE "RentalPostItem" (
    "rentalPostId" INTEGER NOT NULL,
    "nftAddress" TEXT NOT NULL,

    CONSTRAINT "RentalPostItem_pkey" PRIMARY KEY ("rentalPostId","nftAddress")
);

-- CreateTable
CREATE TABLE "Rental" (
    "rentalId" SERIAL NOT NULL,
    "renterAddress" TEXT NOT NULL,
    "rentalPostId" INTEGER NOT NULL,
    "bidId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "startDatetime" TIMESTAMP(3) NOT NULL,
    "endDatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("rentalId")
);

-- CreateTable
CREATE TABLE "Bid" (
    "bidId" SERIAL NOT NULL,
    "rentalPostId" INTEGER NOT NULL,
    "bidderAddress" TEXT NOT NULL,
    "message" TEXT,
    "hourlyRate" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "isAccepted" BOOLEAN NOT NULL,
    "bidTimestamp" TIMESTAMP(3) NOT NULL,
    "acceptedTimestamp" TIMESTAMP(3),

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("bidId")
);

-- CreateTable
CREATE TABLE "TransactionHash" (
    "transactionHash" TEXT NOT NULL,
    "rentalId" INTEGER NOT NULL,

    CONSTRAINT "TransactionHash_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rental_bidId_key" ON "Rental"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionHash_rentalId_key" ON "TransactionHash"("rentalId");

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_userAddress_fkey" FOREIGN KEY ("userAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_posterAddress_fkey" FOREIGN KEY ("posterAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_rentalPostId_fkey" FOREIGN KEY ("rentalPostId") REFERENCES "RentalPost"("rentalPostId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NFT"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_renterAddress_fkey" FOREIGN KEY ("renterAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_rentalPostId_fkey" FOREIGN KEY ("rentalPostId") REFERENCES "RentalPost"("rentalPostId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("bidId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_rentalPostId_fkey" FOREIGN KEY ("rentalPostId") REFERENCES "RentalPost"("rentalPostId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidderAddress_fkey" FOREIGN KEY ("bidderAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHash" ADD CONSTRAINT "TransactionHash_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental"("rentalId") ON DELETE RESTRICT ON UPDATE CASCADE;
