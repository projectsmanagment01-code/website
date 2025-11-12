/**
 * Fix Incorrect SUCCESS Status for Failed Jobs
 * Run with: npx tsx scripts/fix-failed-jobs.ts
 * 
 * This script finds jobs marked as SUCCESS but actually failed at Step 1
 * and updates their status to FAILED.
 */

import { prisma } from '../lib/prisma';

async function fixFailedJobs() {
  console.log('🔍 Looking for incorrectly marked SUCCESS jobs...\n');

  try {
    // Find jobs marked as SUCCESS but with error message about Step 1
    const incorrectJobs = await prisma.recipeAutomation.findMany({
      where: {
        status: 'SUCCESS',
        error: {
          contains: 'Step 1/12: Fetching Google Sheet data'
        }
      },
      select: {
        id: true,
        recipeRowNumber: true,
        spyTitle: true,
        status: true,
        error: true,
        startedAt: true,
        currentStep: true,
      }
    });

    if (incorrectJobs.length === 0) {
      console.log('✅ No incorrectly marked jobs found!');
      console.log('All jobs have correct status.');
      return;
    }

    console.log(`Found ${incorrectJobs.length} jobs incorrectly marked as SUCCESS:\n`);

    incorrectJobs.forEach((job, index) => {
      console.log(`${index + 1}. Job ${job.id}`);
      console.log(`   Row: ${job.recipeRowNumber}`);
      console.log(`   Title: ${job.spyTitle || 'Untitled'}`);
      console.log(`   Current Status: ${job.status}`);
      console.log(`   Current Step: ${job.currentStep}/12`);
      console.log(`   Error: ${job.error?.substring(0, 100)}...`);
      console.log(`   Started: ${job.startedAt.toLocaleString()}`);
      console.log('');
    });

    // Ask for confirmation (you can comment this out to auto-fix)
    console.log('⚠️  About to update these jobs to status FAILED\n');
    
    // Update all incorrect jobs
    const updateResult = await prisma.recipeAutomation.updateMany({
      where: {
        status: 'SUCCESS',
        error: {
          contains: 'Step 1/12: Fetching Google Sheet data'
        }
      },
      data: {
        status: 'FAILED',
        completedAt: new Date(), // Set completion time if not set
      }
    });

    console.log(`✅ Fixed ${updateResult.count} jobs!`);
    console.log('   Status changed from SUCCESS to FAILED');
    console.log('\n💡 These jobs will now appear in the "Failed" section of your dashboard.');
    console.log('💡 You can retry them from the admin panel.');

  } catch (error) {
    console.error('❌ Error fixing jobs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixFailedJobs();