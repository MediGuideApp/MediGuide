/*
  Warnings:

  - You are about to drop the column `dosesTaken` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `totalDoses` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "dosesTaken",
DROP COLUMN "totalDoses",
ADD COLUMN     "totalConsumedDoses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalDosesToConsume" INTEGER NOT NULL DEFAULT 0;
