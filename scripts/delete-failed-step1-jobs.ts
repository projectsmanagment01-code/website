/**
 * Delete Failed Jobs from Step 1
 * Run with: npx tsx scripts/delete-failed-step1-jobs.ts
 * 
 * This script DELETES jobs that failed at Step 1 (Google Sheets fetching).
 * Use this to clean up your automation history.
 */

import { prisma } from '../lib/prisma';

async function deleteFailedStep1Jobs() {
  console.log('🗑️  Deleting jobs that failed at Step 1...\n');

  try {
    // Find jobs that failed at Step 1 with Google Sheets error
    const jobsToDelete = await prisma.recipeAutomation.findMany({
      where: {
        OR: [
          {
            status: 'SUCCESS',
            error: {
              contains: 'Step 1/12: Fetching Google Sheet data'
            }
          },
          {
            status: 'FAILED',
            error: {
              contains: 'Fetching Google Sheet'
            }
          },
          {
            status: 'FAILED',
            currentStep: 1
          }
        ]
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

    if (jobsToDelete.length === 0) {
      console.log('✅ No failed Step 1 jobs found!');
      return;
    }

    console.log(`Found ${jobsToDelete.length} jobs to delete:\n`);

    jobsToDelete.forEach((job, index) => {
      console.log(`${index + 1}. Job ${job.id}`);
      console.log(`   Row: ${job.recipeRowNumber}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Step: ${job.currentStep}/12`);
      console.log(`   Error: ${job.error?.substring(0, 80)}...`);
      console.log('');
    });

    console.log('⚠️  WARNING: This will PERMANENTLY DELETE these jobs!\n');
    console.log('Press Ctrl+C now to cancel, or wait 5 seconds to continue...\n');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Deleting jobs...');

    // Delete all found jobs
    const deleteResult = await prisma.recipeAutomation.deleteMany({
      where: {
        OR: [
          {
            status: 'SUCCESS',
            error: {
              contains: 'Step 1/12: Fetching Google Sheet data'
            }
          },
          {
            status: 'FAILED',
            error: {
              contains: 'Fetching Google Sheet'
            }
          },
          {
            status: 'FAILED',
            currentStep: 1
          }
        ]
      }
    });

    console.log(`\n✅ Deleted ${deleteResult.count} jobs!`);
    console.log('💡 Your automation dashboard will now show clean data.');

  } catch (error) {
    console.error('❌ Error deleting jobs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deletion
deleteFailedStep1Jobs();