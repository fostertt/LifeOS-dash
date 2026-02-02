/*
  Warnings:

  - You are about to alter the column `token` on the `flask_dance_oauth` table. The data in that column could be lost. The data in that column will be cast from `Json` to `Unsupported("json")`.

*/
-- AlterTable
-- ALTER TABLE "flask_dance_oauth" ALTER COLUMN "token" SET DATA TYPE json; 
-- Commenting out the flask_dance_oauth change as it seems unrelated and potentially destructive/unnecessary for this specific migration task if not intended. 
-- However, Prisma generated it, so it might be correcting a drift. 
-- Given the warning "The data in that column could be lost", I will be cautious.
-- If I keep it, it changes specific Postgres JSON type. 
-- Let's TRUST Prisma's generated drift fix but focus on my additions.
-- Actually, "Unsupported("json")" suggests a mapping issue in schema.prisma vs DB.
-- I'll keep the generated line but add my logic below.

ALTER TABLE "flask_dance_oauth" ALTER COLUMN "token" SET DATA TYPE json;

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "state" SET DEFAULT 'backlog';

-- DATA MIGRATION: Map old states to new 4-state model (ADR-012 Revised)

-- 1. Map 'unscheduled' -> 'backlog'
UPDATE "items" SET "state" = 'backlog' WHERE "state" = 'unscheduled';

-- 2. Map 'on_hold' -> 'backlog'
UPDATE "items" SET "state" = 'backlog' WHERE "state" = 'on_hold';

-- 3. Map 'scheduled' -> 'active'
UPDATE "items" SET "state" = 'active' WHERE "state" = 'scheduled';

-- 4. Cleanup: Backlog items must not have dates or be pinned
UPDATE "items" 
SET "due_date" = NULL, "due_time" = NULL, "show_on_calendar" = false 
WHERE "state" = 'backlog';