-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "quoteSectionId" TEXT;

-- AlterTable
ALTER TABLE "QuoteOption" ADD COLUMN     "quoteSectionId" TEXT;

-- CreateTable
CREATE TABLE "QuoteSection" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteSection_quoteId_idx" ON "QuoteSection"("quoteId");

-- AddForeignKey
ALTER TABLE "QuoteSection" ADD CONSTRAINT "QuoteSection_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteOption" ADD CONSTRAINT "QuoteOption_quoteSectionId_fkey" FOREIGN KEY ("quoteSectionId") REFERENCES "QuoteSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteSectionId_fkey" FOREIGN KEY ("quoteSectionId") REFERENCES "QuoteSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
