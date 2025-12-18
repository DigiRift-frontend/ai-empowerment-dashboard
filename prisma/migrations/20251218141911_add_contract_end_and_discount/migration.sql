-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "contractEnd" TIMESTAMP(3),
ADD COLUMN     "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
