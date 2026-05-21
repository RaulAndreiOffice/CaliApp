-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "measurement_type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50),
    "description" TEXT,
    "default_sets" INTEGER,
    "default_target_value" DOUBLE PRECISION,
    "default_rest_seconds" INTEGER,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_tables" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_table_rows" (
    "id" TEXT NOT NULL,
    "workout_table_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "planned_sets" INTEGER NOT NULL,
    "planned_target_value" DOUBLE PRECISION NOT NULL,
    "rest_seconds" INTEGER,
    "order_index" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_table_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_table_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'started',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_session_rows" (
    "id" TEXT NOT NULL,
    "workout_session_id" TEXT NOT NULL,
    "workout_table_row_id" TEXT,
    "exercise_id" TEXT NOT NULL,
    "planned_sets_snapshot" INTEGER,
    "planned_target_value_snapshot" DOUBLE PRECISION,
    "measurement_type_snapshot" VARCHAR(20),
    "order_index" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_session_rows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performed_sets" (
    "id" TEXT NOT NULL,
    "workout_session_row_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "actual_value" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performed_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_table_shares" (
    "id" TEXT NOT NULL,
    "workout_table_id" TEXT NOT NULL,
    "shared_by_user_id" TEXT NOT NULL,
    "shared_with_user_id" TEXT NOT NULL,
    "permission" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "workout_table_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "exercises_owner_user_id_idx" ON "exercises"("owner_user_id");

-- CreateIndex
CREATE INDEX "workout_tables_owner_user_id_idx" ON "workout_tables"("owner_user_id");

-- CreateIndex
CREATE INDEX "workout_table_rows_workout_table_id_idx" ON "workout_table_rows"("workout_table_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_table_rows_workout_table_id_order_index_key" ON "workout_table_rows"("workout_table_id", "order_index");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_idx" ON "workout_sessions"("user_id");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_started_at_idx" ON "workout_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "workout_session_rows_workout_session_id_idx" ON "workout_session_rows"("workout_session_id");

-- CreateIndex
CREATE INDEX "performed_sets_workout_session_row_id_idx" ON "performed_sets"("workout_session_row_id");

-- CreateIndex
CREATE UNIQUE INDEX "performed_sets_workout_session_row_id_set_number_key" ON "performed_sets"("workout_session_row_id", "set_number");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "workout_table_shares_shared_with_user_id_idx" ON "workout_table_shares"("shared_with_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_table_shares_workout_table_id_shared_with_user_id_key" ON "workout_table_shares"("workout_table_id", "shared_with_user_id");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_tables" ADD CONSTRAINT "workout_tables_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_rows" ADD CONSTRAINT "workout_table_rows_workout_table_id_fkey" FOREIGN KEY ("workout_table_id") REFERENCES "workout_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_rows" ADD CONSTRAINT "workout_table_rows_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_table_id_fkey" FOREIGN KEY ("workout_table_id") REFERENCES "workout_tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session_rows" ADD CONSTRAINT "workout_session_rows_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session_rows" ADD CONSTRAINT "workout_session_rows_workout_table_row_id_fkey" FOREIGN KEY ("workout_table_row_id") REFERENCES "workout_table_rows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_session_rows" ADD CONSTRAINT "workout_session_rows_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performed_sets" ADD CONSTRAINT "performed_sets_workout_session_row_id_fkey" FOREIGN KEY ("workout_session_row_id") REFERENCES "workout_session_rows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_shares" ADD CONSTRAINT "workout_table_shares_workout_table_id_fkey" FOREIGN KEY ("workout_table_id") REFERENCES "workout_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_shares" ADD CONSTRAINT "workout_table_shares_shared_by_user_id_fkey" FOREIGN KEY ("shared_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_shares" ADD CONSTRAINT "workout_table_shares_shared_with_user_id_fkey" FOREIGN KEY ("shared_with_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
