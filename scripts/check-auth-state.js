#!/usr/bin/env node

/**
 * Check the current state of authentication in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuthState() {
  console.log('\n🔍 Checking authentication database state...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true,
      },
    });

    console.log('👥 USERS:');
    if (users.length === 0) {
      console.log('   ❌ No users found');
    } else {
      users.forEach((user, i) => {
        console.log(`\n   User ${i + 1}:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Created: ${user.createdAt}`);
        console.log(`   - Accounts: ${user.accounts.length}`);
        console.log(`   - Sessions: ${user.sessions.length}`);

        if (user.accounts.length > 0) {
          console.log('   - Account Details:');
          user.accounts.forEach(acc => {
            console.log(`     * Provider: ${acc.provider}`);
            console.log(`     * Provider Account ID: ${acc.providerAccountId}`);
          });
        }

        if (user.sessions.length > 0) {
          console.log('   - Session Details:');
          user.sessions.forEach(sess => {
            const isExpired = new Date(sess.expires) < new Date();
            console.log(`     * Session Token: ${sess.sessionToken.substring(0, 20)}...`);
            console.log(`     * Expires: ${sess.expires} ${isExpired ? '(EXPIRED)' : '(VALID)'}`);
          });
        }
      });
    }

    // Check all accounts
    const accounts = await prisma.account.findMany();
    console.log(`\n🔑 ACCOUNTS: ${accounts.length} total`);
    accounts.forEach(acc => {
      console.log(`   - Provider: ${acc.provider}, User ID: ${acc.userId}`);
    });

    // Check all sessions
    const sessions = await prisma.session.findMany();
    console.log(`\n🔐 SESSIONS: ${sessions.length} total`);
    sessions.forEach(sess => {
      const isExpired = new Date(sess.expires) < new Date();
      console.log(`   - User ID: ${sess.userId}, Expires: ${sess.expires} ${isExpired ? '(EXPIRED)' : '(VALID)'}`);
    });

    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuthState();
