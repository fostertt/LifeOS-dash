/*
  Warnings:

  - You are about to alter the column `token` on the `flask_dance_oauth` table. The data in that column could be lost. The data in that column will be cast from `Json` to `Unsupported("json")`.

*/
-- AlterTable
ALTER TABLE "flask_dance_oauth" ALTER COLUMN "token" SET DATA TYPE json;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "lists" ADD COLUMN     "project_id" INTEGER,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "project_id" INTEGER,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;
