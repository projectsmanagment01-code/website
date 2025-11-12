/**
 * Delete ALL Automation Jobs
 * Run with: npx tsx scripts/delete-all-jobs.ts
 * 
 * ⚠️  WARNING: This will DELETE ALL automation jobs from the database!
 * Use this for a complete reset of your automation history.
 */

import { prisma } from '../lib/prisma';

async function deleteAllJobs() {
  console.log('⚠️  DELETE ALL AUTOMATION JOBS ⚠️\n');
  console.log('This will PERMANENTLY DELETE ALL automation jobs from your database!\n');

  try {
    // Count current jobs
    const currentCounts = await prisma.recipeAutomation.groupBy({
      by: ['status'],
      _count: true
    });

    if (currentCounts.length === 0) {
      console.log('✅ No jobs found in database.');
      console.log('💡 Database is already clean!');
      return;
    }

    console.log('📊 Current jobs in database:');
    let totalJobs = 0;
    currentCounts.forEach(group => {
      console.log(`   ${group.status}: ${group._count} jobs`);
      totalJobs += group._count;
    });
    console.log(`   TOTAL: ${totalJobs} jobs\n`);

    // Show some recent jobs as examples
    const recentJobs = await prisma.recipeAutomation.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        spyTitle: true,
        status: true,
        startedAt: true,
      }
    });

    if (recentJobs.length > 0) {
      console.log('Most recent jobs:');
      recentJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.status} - ${job.spyTitle || 'Untitled'}`);
        console.log(`   Started: ${job.startedAt.toLocaleString()}`);
      });
      console.log('');
    }

    // Triple confirmation for safety
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                    ⚠️  WARNING ⚠️                        ║');
    console.log('║  This will DELETE ALL automation jobs!                  ║');
    console.log('║  This action CANNOT be undone!                          ║');
    console.log('║  Press Ctrl+C NOW to cancel...                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    console.log('Waiting 10 seconds before deletion...\n');
    
    // Countdown
    for (let i = 10; i > 0; i--) {
      process.stdout.write(`\r⏳ Deleting in ${i} seconds... (Ctrl+C to cancel)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('\n\nDeleting all jobs...\n');

    // Delete all jobs
    const deleteResult = await prisma.recipeAutomation.deleteMany({});

    console.log(`✅ Successfully deleted ${deleteResult.count} jobs!`);
    console.log('💡 Your automation history is now completely clean.');
    console.log('💡 You can start fresh with new automation runs.');

    // Verify deletion
    const remainingCount = await prisma.recipeAutomation.count();
    if (remainingCount === 0) {
      console.log('\n✅ Verified: 0 jobs remaining in database');
    } else {
      console.log(`\n⚠️  Warning: ${remainingCount} jobs still remain`);
    }

  } catch (error) {
    console.error('❌ Error during deletion:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Show warning message
console.log('\n');
console.log('════════════════════════════════════════════════════════════════');
console.log('  🗑️  DELETE ALL AUTOMATION JOBS - DANGEROUS OPERATION');
console.log('════════════════════════════════════════════════════════════════');
console.log('');
console.log('This script will delete ALL automation jobs, regardless of:');
console.log('  - Status (SUCCESS, FAILED, PENDING, PROCESSING)');
console.log('  - Age (old or recent)');
console.log('  - Any other criteria');
console.log('');
console.log('Use this when you want a COMPLETE RESET of automation history.');
console.log('');
console.log('For selective deletion, use:');
console.log('  - cleanup-old-jobs.ts (delete by age/status)');
console.log('  - delete-failed-step1-jobs.ts (delete Step 1 failures)');
console.log('  - fix-failed-jobs.ts (fix status without deleting)');
console.log('');
console.log('════════════════════════════════════════════════════════════════\n');

// Run the deletion
deleteAllJobs();