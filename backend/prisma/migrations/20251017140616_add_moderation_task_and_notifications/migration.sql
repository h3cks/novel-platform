-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'LOCKED', 'AWAITING_AUTHOR', 'AWAITING_REVIEW', 'CLOSED', 'ESCALATED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "actionTakenNote" TEXT,
ADD COLUMN     "taskId" INTEGER;

-- CreateTable
CREATE TABLE "ModerationTask" (
    "id" SERIAL NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "createdBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "lockedBy" INTEGER,
    "lockedAt" TIMESTAMP(3),
    "assignedTo" INTEGER,
    "lastNotifiedAt" TIMESTAMP(3),
    "lastAuthorActionAt" TIMESTAMP(3),
    "closedBy" INTEGER,
    "closedAt" TIMESTAMP(3),
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,

    CONSTRAINT "ModerationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" INTEGER,
    "taskId" INTEGER,
    "actorId" INTEGER,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationTask_targetType_targetId_idx" ON "ModerationTask"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ModerationTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
