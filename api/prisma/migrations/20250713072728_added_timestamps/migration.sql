/*
  Warnings:

  - Added the required column `updatedAt` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `NFT` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RentalPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RentalPostItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "NFT" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RentalPost" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "RentalPostItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
