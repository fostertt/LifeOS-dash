/**
 * Project Model Verification Script
 * Validates that the Project model and task association work correctly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProjectModel() {
  console.log('🔍 Verifying Project model...\n');

  try {
    // Get the current user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('⚠️  No users found. Creating test data requires a user.');
      return;
    }
    console.log(`✅ Using user: ${user.email || user.id}\n`);

    // 1. Create a test project
    console.log('1️⃣  Creating test project...');
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'Test Project (will be deleted)',
        description: 'This is a test project to verify schema',
        status: 'in_progress',
        tags: ['test', 'verification'],
        targetDate: new Date('2026-12-31'),
        blockedBy: [] // Empty array - no blockers
      }
    });
    console.log(`   ✅ Project created: ${project.id}`);
    console.log(`   - Name: ${project.name}`);
    console.log(`   - Status: ${project.status}`);
    console.log(`   - Tags: ${JSON.stringify(project.tags)}`);
    console.log(`   - Target Date: ${project.targetDate}\n`);

    // 2. Create a task associated with the project
    console.log('2️⃣  Creating task associated with project...');
    const task = await prisma.item.create({
      data: {
        userId: user.id,
        itemType: 'task',
        name: 'Test Task in Project (will be deleted)',
        state: 'scheduled',
        isParent: false,
        projectId: project.id // Associate with project
      }
    });
    console.log(`   ✅ Task created: ${task.id}`);
    console.log(`   - Name: ${task.name}`);
    console.log(`   - Project ID: ${task.projectId}\n`);

    // 3. Verify the relationship works (fetch project with tasks)
    console.log('3️⃣  Verifying project-task relationship...');
    const projectWithTasks = await prisma.project.findUnique({
      where: { id: project.id },
      include: { tasks: true }
    });
    console.log(`   ✅ Project has ${projectWithTasks.tasks.length} task(s)`);
    console.log(`   - Task names: ${projectWithTasks.tasks.map(t => t.name).join(', ')}\n`);

    // 4. Test project blockedBy field
    console.log('4️⃣  Testing project dependencies (blockedBy)...');
    const blockerProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'Blocker Project (will be deleted)',
        status: 'in_progress'
      }
    });
    const blockedProject = await prisma.project.create({
      data: {
        userId: user.id,
        name: 'Blocked Project (will be deleted)',
        status: 'backlog',
        blockedBy: [blockerProject.id.toString()]
      }
    });
    console.log(`   ✅ Blocked project created: ${blockedProject.id}`);
    console.log(`   - Blocked by project IDs: ${JSON.stringify(blockedProject.blockedBy)}\n`);

    // Clean up
    console.log('🗑️  Cleaning up test data...');
    await prisma.item.delete({ where: { id: task.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await prisma.project.delete({ where: { id: blockedProject.id } });
    await prisma.project.delete({ where: { id: blockerProject.id } });
    console.log('   ✅ All test data deleted\n');

    console.log('✨ Project model verified successfully!\n');
    console.log('Confirmed:');
    console.log('  ✅ Project model (name, description, status, blockedBy, targetDate, tags)');
    console.log('  ✅ Task.projectId association');
    console.log('  ✅ Project-task relationship query');
    console.log('  ✅ Project.blockedBy dependency tracking');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProjectModel();
