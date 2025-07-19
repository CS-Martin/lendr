/*
  Warnings:

  - You are about to drop the column `bidTimestamp` on the `Bid` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "bidTimestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
