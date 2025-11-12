-- CreateTable: automation_step_logs
-- Add step-by-step logging for automation workflow

CREATE TABLE IF NOT EXISTS "automation_step_logs" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "inputData" JSONB,
    "outputData" JSONB,
    "config" JSONB,
    "error" TEXT,
    "stackTrace" TEXT,
    "tokensUsed" INTEGER,
    "costUsd" DECIMAL(10,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_step_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automation_step_logs_automationId_idx" ON "automation_step_logs"("automationId");
CREATE INDEX "automation_step_logs_stepNumber_idx" ON "automation_step_logs"("stepNumber");
CREATE INDEX "automation_step_logs_status_idx" ON "automation_step_logs"("status");
