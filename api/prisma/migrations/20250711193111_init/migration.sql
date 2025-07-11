-- CreateTable
CREATE TABLE "User" (
    "address" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "NFT" (
    "address" TEXT NOT NULL,
    "user_address" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "floorPrice" DOUBLE PRECISION,
    "collectionName" TEXT,

    CONSTRAINT "NFT_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "RentalListingStatus" (
    "status_code" TEXT NOT NULL,
    "status_name" TEXT NOT NULL,

    CONSTRAINT "RentalListingStatus_pkey" PRIMARY KEY ("status_code")
);

-- CreateTable
CREATE TABLE "RentalPost" (
    "rental_post_id" SERIAL NOT NULL,
    "poster_address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "collateral" DOUBLE PRECISION NOT NULL,
    "is_biddable" BOOLEAN NOT NULL,
    "bidding_starttime" TIMESTAMP(3),
    "bidding_endtime" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL,
    "status_code" TEXT NOT NULL,

    CONSTRAINT "RentalPost_pkey" PRIMARY KEY ("rental_post_id")
);

-- CreateTable
CREATE TABLE "RentalPostItem" (
    "rental_post_id" INTEGER NOT NULL,
    "nft_address" TEXT NOT NULL,

    CONSTRAINT "RentalPostItem_pkey" PRIMARY KEY ("rental_post_id","nft_address")
);

-- CreateTable
CREATE TABLE "Rental" (
    "rental_id" SERIAL NOT NULL,
    "renter_address" TEXT NOT NULL,
    "rental_post_id" INTEGER NOT NULL,
    "bid_id" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "start_datetime" TIMESTAMP(3) NOT NULL,
    "end_datetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rental_pkey" PRIMARY KEY ("rental_id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "bid_id" SERIAL NOT NULL,
    "rental_post_id" INTEGER NOT NULL,
    "bidder_address" TEXT NOT NULL,
    "message" TEXT,
    "hourly_rate" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_accepted" BOOLEAN NOT NULL,
    "bid_timestamp" TIMESTAMP(3) NOT NULL,
    "accepted_timestamp" TIMESTAMP(3),

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("bid_id")
);

-- CreateTable
CREATE TABLE "TransactionHash" (
    "transaction_hash" TEXT NOT NULL,
    "rental_id" INTEGER NOT NULL,

    CONSTRAINT "TransactionHash_pkey" PRIMARY KEY ("transaction_hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rental_bid_id_key" ON "Rental"("bid_id");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionHash_rental_id_key" ON "TransactionHash"("rental_id");

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_user_address_fkey" FOREIGN KEY ("user_address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_poster_address_fkey" FOREIGN KEY ("poster_address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_status_code_fkey" FOREIGN KEY ("status_code") REFERENCES "RentalListingStatus"("status_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_rental_post_id_fkey" FOREIGN KEY ("rental_post_id") REFERENCES "RentalPost"("rental_post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_nft_address_fkey" FOREIGN KEY ("nft_address") REFERENCES "NFT"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_renter_address_fkey" FOREIGN KEY ("renter_address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_rental_post_id_fkey" FOREIGN KEY ("rental_post_id") REFERENCES "RentalPost"("rental_post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rental" ADD CONSTRAINT "Rental_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "Bid"("bid_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_rental_post_id_fkey" FOREIGN KEY ("rental_post_id") REFERENCES "RentalPost"("rental_post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidder_address_fkey" FOREIGN KEY ("bidder_address") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionHash" ADD CONSTRAINT "TransactionHash_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "Rental"("rental_id") ON DELETE RESTRICT ON UPDATE CASCADE;
