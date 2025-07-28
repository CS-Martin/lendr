/*
  Warnings:

  - Made the column `nftId` on table `RentalPost` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RentalPost" DROP CONSTRAINT "RentalPost_nftId_fkey";

-- AlterTable
ALTER TABLE "RentalPost" ALTER COLUMN "nftId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "NFT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
