/*
  Warnings:

  - Added the required column `nftId` to the `RentalPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalPost" ADD COLUMN     "nftId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "NFT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
