-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ViewHistory_novelId_idx" ON "ViewHistory"("novelId");

-- CreateIndex
CREATE INDEX "ViewHistory_chapterId_idx" ON "ViewHistory"("chapterId");

-- CreateIndex
CREATE INDEX "ViewHistory_userId_idx" ON "ViewHistory"("userId");
