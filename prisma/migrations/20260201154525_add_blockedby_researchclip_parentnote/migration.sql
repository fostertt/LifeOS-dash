/*
  Warnings:

  - You are about to alter the column `token` on the `flask_dance_oauth` table. The data in that column could be lost. The data in that column will be cast from `Json` to `Unsupported("json")`.

*/
-- AlterTable
ALTER TABLE "flask_dance_oauth" ALTER COLUMN "token" SET DATA TYPE json;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "blocked_by" JSONB;

-- AlterTable
ALTER TABLE "notes" ADD COLUMN     "parent_note_id" INTEGER;

-- CreateTable
CREATE TABLE "research_clips" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "screenshot" TEXT,
    "notes" TEXT,
    "tags" JSONB,
    "project_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_clips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "research_clips_user_id_idx" ON "research_clips"("user_id");

-- CreateIndex
CREATE INDEX "notes_parent_note_id_idx" ON "notes"("parent_note_id");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_parent_note_id_fkey" FOREIGN KEY ("parent_note_id") REFERENCES "notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_clips" ADD CONSTRAINT "research_clips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
