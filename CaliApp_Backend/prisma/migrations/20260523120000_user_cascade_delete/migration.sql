-- DropForeignKey
ALTER TABLE "workout_tables" DROP CONSTRAINT "workout_tables_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_sessions" DROP CONSTRAINT "workout_sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_table_shares" DROP CONSTRAINT "workout_table_shares_shared_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_table_shares" DROP CONSTRAINT "workout_table_shares_shared_with_user_id_fkey";

-- AddForeignKey
ALTER TABLE "workout_tables" ADD CONSTRAINT "workout_tables_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_shares" ADD CONSTRAINT "workout_table_shares_shared_by_user_id_fkey" FOREIGN KEY ("shared_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_table_shares" ADD CONSTRAINT "workout_table_shares_shared_with_user_id_fkey" FOREIGN KEY ("shared_with_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
