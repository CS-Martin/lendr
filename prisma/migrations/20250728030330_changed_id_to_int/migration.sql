/*
  Warnings:

  - The primary key for the `NFT` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `NFT` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RentalPostItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nftAddress` on the `RentalPostItem` table. All the data in the column will be lost.
  - Added the required column `nftId` to the `RentalPostItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RentalPostItem" DROP CONSTRAINT "RentalPostItem_nftAddress_fkey";

-- AlterTable
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "NFT_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "RentalPostItem" DROP CONSTRAINT "RentalPostItem_pkey",
DROP COLUMN "nftAddress",
ADD COLUMN     "nftId" INTEGER NOT NULL,
ADD CONSTRAINT "RentalPostItem_pkey" PRIMARY KEY ("rentalPostId", "nftId");

-- AddForeignKey
ALTER TABLE "RentalPostItem" ADD CONSTRAINT "RentalPostItem_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "NFT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
