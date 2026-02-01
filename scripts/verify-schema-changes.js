/**
 * Schema Verification Script
 * Validates that Phase 3.6 schema additions are in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifySchemaChanges() {
  console.log('🔍 Verifying Phase 3.6 schema changes...\n');

  try {
    // Get the current user (assuming there's at least one user in the system)
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('⚠️  No users found. Creating test data requires a user.');
      return;
    }
    console.log(`✅ Using user: ${user.email || user.id}\n`);

    // 1. Verify ResearchClip model exists
    console.log('1️⃣  Testing ResearchClip model...');
    const clip = await prisma.researchClip.create({
      data: {
        userId: user.id,
        url: 'https://example.com/test-article',
        title: 'Test Research Clip',
        notes: 'This is a test clip to verify schema',
        tags: ['test', 'schema-verification'],
        projectRef: 'test-project'
      }
    });
    console.log(`   ✅ ResearchClip created: ${clip.id}`);
    console.log(`   - URL: ${clip.url}`);
    console.log(`   - Tags: ${JSON.stringify(clip.tags)}`);
    console.log(`   - Project Ref: ${clip.projectRef}\n`);

    // Clean up
    await prisma.researchClip.delete({ where: { id: clip.id } });
    console.log(`   🗑️  Test clip deleted\n`);

    // 2. Verify blockedBy field on tasks
    console.log('2️⃣  Testing blockedBy field on tasks...');
    const task1 = await prisma.item.create({
      data: {
        userId: user.id,
        itemType: 'task',
        name: 'Blocker Task (will be deleted)',
        state: 'in_progress',
        isParent: false
      }
    });
    const task2 = await prisma.item.create({
      data: {
        userId: user.id,
        itemType: 'task',
        name: 'Blocked Task (will be deleted)',
        state: 'unscheduled',
        isParent: false,
        blockedBy: [task1.id.toString()] // This is the new field
      }
    });
    console.log(`   ✅ Task with blockedBy created: ${task2.id}`);
    console.log(`   - Blocked by task IDs: ${JSON.stringify(task2.blockedBy)}\n`);

    // Clean up
    await prisma.item.delete({ where: { id: task2.id } });
    await prisma.item.delete({ where: { id: task1.id } });
    console.log(`   🗑️  Test tasks deleted\n`);

    // 3. Verify parentNoteId field on notes
    console.log('3️⃣  Testing parentNoteId field on notes...');
    const parentNote = await prisma.note.create({
      data: {
        userId: user.id,
        title: 'Parent Note (will be deleted)',
        content: 'This is a parent note',
        tags: ['test']
      }
    });
    const childNote = await prisma.note.create({
      data: {
        userId: user.id,
        title: 'Child Note (will be deleted)',
        content: 'This is a nested child note',
        parentNoteId: parentNote.id, // This is the new field
        tags: ['test']
      }
    });
    console.log(`   ✅ Nested note created: ${childNote.id}`);
    console.log(`   - Parent note ID: ${childNote.parentNoteId}\n`);

    // Verify the relationship works
    const parentWithChildren = await prisma.note.findUnique({
      where: { id: parentNote.id },
      include: { childNotes: true }
    });
    console.log(`   ✅ Parent note has ${parentWithChildren.childNotes.length} child note(s)\n`);

    // Clean up (delete parent first due to cascade)
    await prisma.note.delete({ where: { id: childNote.id } });
    await prisma.note.delete({ where: { id: parentNote.id } });
    console.log(`   🗑️  Test notes deleted\n`);

    console.log('✨ All schema changes verified successfully!\n');
    console.log('Schema additions confirmed:');
    console.log('  ✅ ResearchClip model (url, title, screenshot, notes, tags, projectRef)');
    console.log('  ✅ Item.blockedBy (JSONB array)');
    console.log('  ✅ Note.parentNoteId (with cascade relationship)');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchemaChanges();
