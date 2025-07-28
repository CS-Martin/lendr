-- DropForeignKey
ALTER TABLE "RentalPost" DROP CONSTRAINT "RentalPost_nftId_fkey";

-- AlterTable
ALTER TABLE "RentalPost" ALTER COLUMN "nftId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RentalPost" ADD CONSTRAINT "RentalPost_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "NFT"("id") ON DELETE SET NULL ON UPDATE CASCADE;
