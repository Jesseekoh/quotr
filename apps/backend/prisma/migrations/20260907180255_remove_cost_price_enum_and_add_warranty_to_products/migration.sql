/*
  Warnings:

  - The values [COST_PRICE] on the enum `PriceLabel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PriceLabel_new" AS ENUM ('DISCOUNT_PRICE', 'RESALE_PRICE', 'SPECIAL_PRICE', 'ENDUSER_PRICE');
ALTER TABLE "public"."Quote" ALTER COLUMN "label" DROP DEFAULT;
ALTER TABLE "Quote" ALTER COLUMN "label" TYPE "PriceLabel_new" USING ("label"::text::"PriceLabel_new");
ALTER TYPE "PriceLabel" RENAME TO "PriceLabel_old";
ALTER TYPE "PriceLabel_new" RENAME TO "PriceLabel";
DROP TYPE "public"."PriceLabel_old";
ALTER TABLE "Quote" ALTER COLUMN "label" SET DEFAULT 'ENDUSER_PRICE';
COMMIT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "warranty" TEXT NOT NULL DEFAULT 'N/A';
