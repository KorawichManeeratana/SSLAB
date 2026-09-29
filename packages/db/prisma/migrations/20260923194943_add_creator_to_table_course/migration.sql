/*
  Warnings:

  - Added the required column `creator_id` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" ADD COLUMN     "creator_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Courses" ADD CONSTRAINT "Courses_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
