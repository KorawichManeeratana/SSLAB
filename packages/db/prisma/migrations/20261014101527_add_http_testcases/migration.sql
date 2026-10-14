/*
  Warnings:

  - Added the required column `path` to the `Testcase` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GradingEngine" AS ENUM ('QUERY', 'HTTP');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- AlterTable
ALTER TABLE "Exercises" ADD COLUMN     "exc_engine" "GradingEngine" NOT NULL DEFAULT 'QUERY';

-- AlterTable
ALTER TABLE "Testcase" ADD COLUMN     "body" JSONB,
ADD COLUMN     "expected_body" JSONB,
ADD COLUMN     "expected_status" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "headers" JSONB,
ADD COLUMN     "method" "HttpMethod" NOT NULL DEFAULT 'GET',
ADD COLUMN     "order_matters" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Testcase_exercise_id_idx" ON "Testcase"("exercise_id");
