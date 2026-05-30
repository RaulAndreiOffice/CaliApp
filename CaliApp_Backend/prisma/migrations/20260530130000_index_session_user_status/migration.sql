-- CreateIndex
CREATE INDEX "workout_sessions_user_id_status_started_at_idx" ON "workout_sessions"("user_id", "status", "started_at");
