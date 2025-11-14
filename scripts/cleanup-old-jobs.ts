/**
 * Clean Up Old Automation Jobs
 * Run with: npx tsx scripts/cleanup-old-jobs.ts
 * 
 * This script helps you clean up old automation jobs from the database.
 * You can filter by age, status, or delete all jobs.
 */

import { prisma } from '../lib/prisma';

// ============= CONFIGURATION =============
const CONFIG = {
  // Delete jobs older than X days
  olderThanDays: 30,
  
  // Which statuses to delete (set to null to delete all statuses)
  // Options: 'SUCCESS', 'FAILED', 'PENDING', 'PROCESSING'
  statusesToDelete: ['FAILED'], // Only delete failed jobs by default
  
  // Keep the most recent X jobs (set to null to delete all matching)
  keepRecentCount: 10,
  
  // Dry run mode - show what would be deleted without actually deleting
  dryRun: false,
};
// ==========================================

async function cleanupOldJobs() {
  console.log('🧹 Automation Jobs Cleanup Tool\n');
  console.log('Configuration:');
  console.log(`  - Delete jobs older than: ${CONFIG.olderThanDays} days`);
  console.log(`  - Status filter: ${CONFIG.statusesToDelete ? CONFIG.statusesToDelete.join(', ') : 'ALL'}`);
  console.log(`  - Keep most recent: ${CONFIG.keepRecentCount || 'None (delete all matching)'}`);
  console.log(`  - Dry run: ${CONFIG.dryRun ? 'YES (no changes will be made)' : 'NO (will delete jobs)'}\n`);

  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.olderThanDays);
    
    console.log(`📅 Cutoff date: ${cutoffDate.toLocaleString()}\n`);

    // Build where clause
    const where: any = {
      startedAt: {
        lt: cutoffDate
      }
    };

    if (CONFIG.statusesToDelete && CONFIG.statusesToDelete.length > 0) {
      where.status = {
        in: CONFIG.statusesToDelete
      };
    }

    // Get jobs that match criteria
    let jobsToDelete = await prisma.recipeAutomation.findMany({
      where,
      orderBy: {
        startedAt: 'desc'
      },
      select: {
        id: true,
        recipeRowNumber: true,
        spyTitle: true,
        status: true,
        currentStep: true,
        startedAt: true,
        completedAt: true,
        error: true,
      }
    });

    if (jobsToDelete.length === 0) {
      console.log('✅ No jobs found matching the criteria.');
      console.log('💡 Try adjusting the configuration at the top of this script.');
      return;
    }

    console.log(`📊 Found ${jobsToDelete.length} jobs matching criteria:\n`);

    // If keepRecentCount is set, exclude the most recent ones
    if (CONFIG.keepRecentCount && CONFIG.keepRecentCount > 0) {
      const beforeCount = jobsToDelete.length;
      jobsToDelete = jobsToDelete.slice(CONFIG.keepRecentCount);
      const keptCount = beforeCount - jobsToDelete.length;
      
      if (keptCount > 0) {
        console.log(`💾 Keeping ${keptCount} most recent jobs`);
        console.log(`🗑️  Will delete ${jobsToDelete.length} older jobs\n`);
      }
    }

    if (jobsToDelete.length === 0) {
      console.log('✅ All matching jobs are within the "keep recent" count.');
      console.log('💡 No jobs to delete.');
      return;
    }

    // Group by status for summary
    const statusCounts: Record<string, number> = {};
    jobsToDelete.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    console.log('Summary by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} jobs`);
    });
    console.log('');

    // Show first 10 jobs as examples
    const showCount = Math.min(10, jobsToDelete.length);
    console.log(`First ${showCount} jobs to be deleted:`);
    jobsToDelete.slice(0, showCount).forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.status} - ${job.spyTitle || 'Untitled'}`);
      console.log(`   ID: ${job.id}`);
      console.log(`   Row: ${job.recipeRowNumber}`);
      console.log(`   Step: ${job.currentStep}/12`);
      console.log(`   Started: ${job.startedAt.toLocaleString()}`);
      if (job.error) {
        console.log(`   Error: ${job.error.substring(0, 60)}...`);
      }
    });

    if (jobsToDelete.length > showCount) {
      console.log(`\n... and ${jobsToDelete.length - showCount} more jobs`);
    }

    console.log('\n');

    if (CONFIG.dryRun) {
      console.log('🔵 DRY RUN MODE - No changes made');
      console.log('💡 Set CONFIG.dryRun = false to actually delete these jobs');
      return;
    }

    // Confirmation
    console.log('⚠️  WARNING: This will PERMANENTLY DELETE these jobs!');
    console.log('⚠️  This action cannot be undone!\n');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Deleting jobs...');

    // Delete jobs
    const jobIds = jobsToDelete.map(job => job.id);
    const deleteResult = await prisma.recipeAutomation.deleteMany({
      where: {
        id: {
          in: jobIds
        }
      }
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.count} jobs!`);
    console.log('💡 Your automation dashboard is now cleaner.');

    // Show remaining job counts
    console.log('\n📊 Remaining jobs in database:');
    const remainingCounts = await prisma.recipeAutomation.groupBy({
      by: ['status'],
      _count: true
    });

    remainingCounts.forEach(group => {
      console.log(`   ${group.status}: ${group._count} jobs`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage instructions
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║     Automation Jobs Cleanup Tool - Configuration Help         ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');
console.log('Edit the CONFIG object at the top of this file:\n');
console.log('📅 olderThanDays: Delete jobs older than X days (default: 30)');
console.log('📋 statusesToDelete: Array of statuses or null for all');
console.log('   Examples:');
console.log('   - [\'FAILED\'] - Only failed jobs');
console.log('   - [\'SUCCESS\', \'FAILED\'] - Both success and failed');
console.log('   - null - All statuses');
console.log('💾 keepRecentCount: Keep X most recent jobs (default: 10)');
console.log('🔵 dryRun: Set to true to preview without deleting\n');
console.log('════════════════════════════════════════════════════════════════\n');

// Run the cleanup
cleanupOldJobs();