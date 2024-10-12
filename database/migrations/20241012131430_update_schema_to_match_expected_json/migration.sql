/*
  Warnings:

  - You are about to drop the column `age` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `Prescription` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dosesTaken` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDoses` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_patientId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "age",
DROP COLUMN "name",
ADD COLUMN     "dosesTaken" INTEGER NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "medicalConditions" TEXT[],
ADD COLUMN     "totalDoses" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Prescription";

-- CreateTable
CREATE TABLE "Medications" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "time" TEXT[],
    "mode" "Mode" NOT NULL,

    CONSTRAINT "Medications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Medications" ADD CONSTRAINT "Medications_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
