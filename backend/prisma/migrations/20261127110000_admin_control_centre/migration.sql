ALTER TABLE "User" ADD COLUMN "adminRole" TEXT;
CREATE TABLE "AdminAudit" (
    "id" TEXT PRIMARY KEY, "actorId" TEXT NOT NULL, "action" TEXT NOT NULL,
    "target" TEXT NOT NULL, "reason" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AdminAudit_createdAt_idx" ON "AdminAudit"("createdAt");
CREATE TABLE "AdminContent" (
    "id" TEXT PRIMARY KEY, "channel" TEXT NOT NULL, "title" TEXT NOT NULL, "body" TEXT NOT NULL,
    "image" TEXT, "position" INTEGER NOT NULL DEFAULT 0, "active" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3), "endsAt" TIMESTAMP(3), "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "AdminContent_channel_active_position_idx" ON "AdminContent"("channel", "active", "position");
CREATE TABLE "SupportRequest" (
    "id" TEXT PRIMARY KEY, "userId" TEXT NOT NULL, "kind" TEXT NOT NULL, "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'open', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "SupportRequest_status_createdAt_idx" ON "SupportRequest"("status", "createdAt");
