ALTER TABLE "agent_runs" ADD COLUMN "cycleKey" TEXT;
CREATE UNIQUE INDEX "agent_runs_cycleKey_key" ON "agent_runs"("cycleKey");
