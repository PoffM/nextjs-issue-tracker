-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_createdByUserId_idx" ON "Issue"("createdByUserId");
