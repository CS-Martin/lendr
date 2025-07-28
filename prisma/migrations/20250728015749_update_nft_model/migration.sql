/*
  Warnings:

  - The primary key for the `NFT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `userAddress` on the `NFT` table. All the data in the column will be lost.
  - You are about to drop the column `statusCode` on the `RentalPost` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contractAddress,tokenId]` on the table `NFT` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractAddress` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `NFT` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `metadata` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerAddress` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `NFT` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_userAddress_fkey";

-- DropForeignKey
ALTER TABLE "RentalPostItem" DROP CONSTRAINT "RentalPostItem_nftAddress_fkey";

-- AlterTable
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_pkey",
DROP COLUMN "address",
DROP COLUMN "userAddress",
ADD COLUMN     "contractAddress" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "isListable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB NOT NULL,
ADD COLUMN     "ownerAddress" TEXT NOT NULL,
ADD COLUMN     "tokenId" TEXT NOT NULL,
ADD CONSTRAINT "NFT_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RentalPost" DROP COLUMN "statusCode",
ADD COLUMN     "status" "RentalListingStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "NFT_ownerAddress_idx" ON "NFT"("ownerAddress");

-- CreateIndex
CREATE INDEX "NFT_collectionName_idx" ON "NFT"("collectionName");

-- CreateIndex
CREATE UNIQUE INDEX "NFT_contractAddress_tokenId_key" ON "NFT"("contractAddress", "tokenId");

-- CreateIndex
CREATE INDEX "RentalPost_posterAddress_idx" ON "RentalPost"("posterAddress");

-- CreateIndex
CREATE INDEX "RentalPost_status_idx" ON "RentalPost"("status");

-- CreateIndex
CREATE INDEX "RentalPost_createdAt_idx" ON "RentalPost"("createdAt");

-- CreateIndex
CREATE INDEX "User_address_idx" ON "User"("address");

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_ownerAddress_fkey" FOREIGN KEY ("ownerAddress") REFERENCES "User"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_nftAddress_fkey" FOREIGN KEY ("nftAddress") REFERENCES "NFT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
