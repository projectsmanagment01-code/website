/**
 * Enhanced Recipe Pipeline with Checkpoint/Retry Support
 * 
 * Key Features:
 * - Saves progress after each step
 * - Can resume from last successful checkpoint
 * - Tracks which step failed
 * - Prevents wasting money on regenerating images when recipe generation fails
 * - Comprehensive error handling with retry capability
 */

import { PrismaClient } from '@prisma/client';
import { PipelineContext, PipelineResult } from '../pipeline/recipe-pipeline';

const prisma = new PrismaClient();

export type CheckpointStep = 
  | 'INIT'
  | 'SEO_COMPLETE'
  | 'IMAGES_COMPLETE'
  | 'RECIPE_COMPLETE'
  | 'GOOGLE_INDEXED'
  | 'PINTEREST_SENT';

export interface RetryContext extends PipelineContext {
  resumeFromStep?: CheckpointStep;
  skipCompletedSteps?: boolean;
}

export class CheckpointManager {
  /**
   * Save checkpoint after successful step
   */
  static async saveCheckpoint(
    spyDataId: string,
    step: CheckpointStep,
    additionalData?: Record<string, any>
  ): Promise<void> {
    console.log(`✅ CHECKPOINT: Saving progress at ${step} for ${spyDataId}`);
    
    await prisma.pinterestSpyData.update({
      where: { id: spyDataId },
      data: {
        lastSuccessfulStep: step,
        failedAt: null,
        failedStep: null,
        updatedAt: new Date(),
        ...additionalData
      }
    });
  }

  /**
   * Mark step as failed
   */
  static async markFailed(
    spyDataId: string,
    step: string,
    error: string
  ): Promise<void> {
    console.error(`❌ FAILED: Step ${step} failed for ${spyDataId}: ${error}`);
    
    await prisma.pinterestSpyData.update({
      where: { id: spyDataId },
      data: {
        status: 'FAILED',
        failedStep: step,
        failedAt: new Date(),
        generationError: error,
        generationAttempts: { increment: 1 },
        canRetry: true
      }
    });
  }

  /**
   * Get last successful checkpoint for retry
   */
  static async getLastCheckpoint(spyDataId: string): Promise<{
    lastStep: CheckpointStep | null;
    canResume: boolean;
    hasImages: boolean;
    hasSEO: boolean;
    hasRecipe: boolean;
  }> {
    const spyData = await prisma.pinterestSpyData.findUnique({
      where: { id: spyDataId },
      select: {
        lastSuccessfulStep: true,
        canRetry: true,
        generatedImage1Url: true,
        generatedImage2Url: true,
        generatedImage3Url: true,
        generatedImage4Url: true,
        seoKeyword: true,
        seoTitle: true,
        seoDescription: true,
        generatedRecipeId: true,
      }
    });

    if (!spyData) {
      return {
        lastStep: null,
        canResume: false,
        hasImages: false,
        hasSEO: false,
        hasRecipe: false
      };
    }

    const hasImages = !!(
      spyData.generatedImage1Url &&
      spyData.generatedImage2Url &&
      spyData.generatedImage3Url &&
      spyData.generatedImage4Url
    );

    const hasSEO = !!(
      spyData.seoKeyword &&
      spyData.seoTitle &&
      spyData.seoDescription
    );

    const hasRecipe = !!spyData.generatedRecipeId;

    return {
      lastStep: spyData.lastSuccessfulStep as CheckpointStep | null,
      canResume: spyData.canRetry ?? true,
      hasImages,
      hasSEO,
      hasRecipe
    };
  }

  /**
   * Determine which step to resume from
   */
  static async determineResumeStep(spyDataId: string): Promise<{
    resumeStep: CheckpointStep;
    message: string;
  }> {
    const checkpoint = await this.getLastCheckpoint(spyDataId);

    if (!checkpoint.canResume) {
      throw new Error('This entry cannot be retried. Please contact support.');
    }

    // If recipe is complete, nothing to do
    if (checkpoint.hasRecipe) {
      return {
        resumeStep: 'RECIPE_COMPLETE',
        message: 'Recipe already complete. Will proceed to optional steps (indexing/pinterest).'
      };
    }

    // If images exist, skip image generation
    if (checkpoint.hasImages && checkpoint.hasSEO) {
      return {
        resumeStep: 'IMAGES_COMPLETE',
        message: '✅ Images exist! Resuming from recipe generation (no image costs).'
      };
    }

    // If SEO exists, skip SEO generation
    if (checkpoint.hasSEO) {
      return {
        resumeStep: 'SEO_COMPLETE',
        message: 'SEO exists. Resuming from image generation.'
      };
    }

    // Start from beginning
    return {
      resumeStep: 'INIT',
      message: 'Starting from beginning (no checkpoints found).'
    };
  }

  /**
   * Reset failed entry for retry
   */
  static async resetForRetry(spyDataId: string): Promise<void> {
    await prisma.pinterestSpyData.update({
      where: { id: spyDataId },
      data: {
        status: 'PENDING',
        failedAt: null,
        failedStep: null,
        generationError: null
        // Keep lastSuccessfulStep to resume from checkpoint
      }
    });
  }

  /**
   * Get all failed entries that can be retried
   */
  static async getRetriableEntries() {
    return await prisma.pinterestSpyData.findMany({
      where: {
        status: 'FAILED',
        canRetry: true
      },
      orderBy: {
        failedAt: 'desc'
      },
      select: {
        id: true,
        spyTitle: true,
        status: true,
        failedStep: true,
        failedAt: true,
        lastSuccessfulStep: true,
        generationAttempts: true,
        generationError: true,
        generatedImage1Url: true,
        generatedImage2Url: true,
        generatedImage3Url: true,
        generatedImage4Url: true,
        seoKeyword: true,
        seoTitle: true,
        createdAt: true
      }
    });
  }

  /**
   * Generate user-friendly resume summary
   */
  static async getResumeSummary(spyDataId: string): Promise<string> {
    const checkpoint = await this.getLastCheckpoint(spyDataId);
    const resumeInfo = await this.determineResumeStep(spyDataId);

    const parts: string[] = [];

    if (checkpoint.hasSEO) {
      parts.push('✅ SEO Complete');
    }

    if (checkpoint.hasImages) {
      parts.push('✅ Images Generated (No re-generation needed - saves money!)');
    }

    if (checkpoint.hasRecipe) {
      parts.push('✅ Recipe Complete');
    }

    if (parts.length === 0) {
      return 'Will start from beginning';
    }

    return `${parts.join(' → ')}\n➡️ ${resumeInfo.message}`;
  }
}
