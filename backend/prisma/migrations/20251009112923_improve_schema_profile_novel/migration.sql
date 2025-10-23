/*
  Warnings:

  - The values [UNDER_REVIEW] on the enum `NovelStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `emailConfirmToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `passwordResetToken` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[novelId,order]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NovelStatus_new" AS ENUM ('DRAFT', 'REVIEWING', 'PUBLISHED', 'BLOCKED');
ALTER TABLE "public"."Novel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Novel" ALTER COLUMN "status" TYPE "NovelStatus_new" USING ("status"::text::"NovelStatus_new");
ALTER TYPE "NovelStatus" RENAME TO "NovelStatus_old";
ALTER TYPE "NovelStatus_new" RENAME TO "NovelStatus";
DROP TYPE "public"."NovelStatus_old";
ALTER TABLE "Novel" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "emailConfirmToken" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "passwordResetToken" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_novelId_order_key" ON "Chapter"("novelId", "order");

-- CreateIndex
CREATE INDEX "Novel_title_idx" ON "Novel"("title");

-- CreateIndex
CREATE INDEX "Novel_status_idx" ON "Novel"("status");

-- CreateIndex
CREATE INDEX "Novel_authorId_idx" ON "Novel"("authorId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_processedBy_fkey" FOREIGN KEY ("processedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
