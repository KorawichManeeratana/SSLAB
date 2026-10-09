/*
  Warnings:

  - The `result` column on the `user_exercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TLE', 'MLE', 'RUNTIME_ERROR', 'SYSTEM_ERROR');

-- AlterTable
ALTER TABLE "user_exercise" ADD COLUMN     "verdict" "Verdict" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "ai_feedback" DROP NOT NULL,
ALTER COLUMN "exec_time" DROP NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" JSONB;

-- CreateIndex
CREATE INDEX "user_exercise_user_id_exercise_id_idx" ON "user_exercise"("user_id", "exercise_id");
