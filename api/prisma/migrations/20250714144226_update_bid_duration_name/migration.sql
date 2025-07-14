/*
  Warnings:

  - You are about to drop the column `duration` on the `Bid` table. All the data in the column will be lost.
  - Added the required column `rentalDuration` to the `Bid` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "duration",
ADD COLUMN     "rentalDuration" INTEGER NOT NULL;
