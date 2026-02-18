/**
 * Wipe all test data from the database.
 * Keeps: users, accounts, sessions, families, calendar syncs, calendar events.
 * Deletes: items, habits, lists, notes, research clips, projects, and their children.
 *
 * Usage: node scripts/wipe-test-data.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Wiping all test data...\n");

  // Order matters due to foreign keys

  // 1. Item completions (depends on items)
  const itemCompletions = await prisma.itemCompletion.deleteMany({});
  console.log(`  Deleted ${itemCompletions.count} item completions`);

  // 2. Items - sub-items first (parentItemId FK), then parents
  // Clear parent references first to avoid FK issues
  await prisma.item.updateMany({
    where: { parentItemId: { not: null } },
    data: { parentItemId: null },
  });
  const items = await prisma.item.deleteMany({});
  console.log(`  Deleted ${items.count} items (tasks/habits/reminders)`);

  // 3. Habit completions (depends on habits)
  const habitCompletions = await prisma.habitCompletion.deleteMany({});
  console.log(`  Deleted ${habitCompletions.count} habit completions`);

  // 4. Habits - clear parent references first
  await prisma.habit.updateMany({
    where: { parentHabitId: { not: null } },
    data: { parentHabitId: null },
  });
  const habits = await prisma.habit.deleteMany({});
  console.log(`  Deleted ${habits.count} habits`);

  // 5. List items (depends on lists)
  const listItems = await prisma.listItem.deleteMany({});
  console.log(`  Deleted ${listItems.count} list items`);

  // 6. Lists
  const lists = await prisma.list.deleteMany({});
  console.log(`  Deleted ${lists.count} lists`);

  // 7. Notes - clear parent references first
  await prisma.note.updateMany({
    where: { parentNoteId: { not: null } },
    data: { parentNoteId: null },
  });
  const notes = await prisma.note.deleteMany({});
  console.log(`  Deleted ${notes.count} notes`);

  // 8. Research clips
  const clips = await prisma.researchClip.deleteMany({});
  console.log(`  Deleted ${clips.count} research clips`);

  // 9. Projects (items FK already cleared)
  const projects = await prisma.project.deleteMany({});
  console.log(`  Deleted ${projects.count} projects`);

  console.log("\nDone! All test data wiped. User/auth/calendar data preserved.");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
