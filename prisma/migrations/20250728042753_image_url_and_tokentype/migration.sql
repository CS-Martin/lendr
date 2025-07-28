/*
  Warnings:

  - Added the required column `imageUrl` to the `RentalPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenType` to the `RentalPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RentalPost" ADD COLUMN     "collectionName" TEXT,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "tokenType" TEXT NOT NULL;
