/*
  Warnings:

  - Added the required column `ai_feedback` to the `user_exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attempt_number` to the `user_exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exec_time` to the `user_exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_exercise" ADD COLUMN     "ai_feedback" TEXT NOT NULL,
ADD COLUMN     "attempt_number" INTEGER NOT NULL,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "exec_time" INTEGER NOT NULL,
ADD COLUMN     "graded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "result" TEXT;
