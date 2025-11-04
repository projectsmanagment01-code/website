/**
 * Main Workflow Execution (Legacy - Stub for compatibility)
 * 
 * Note: This is a compatibility stub for the old automation system.
 * New automations should use RecipePipelineOrchestrator instead.
 */

import { WorkflowContext } from '../types/workflow.types';

export type ProgressCallback = (step: number, total: number) => Promise<void>;

export interface WorkflowResult {
  success: boolean;
  error?: string;
  recipeId?: string;
  recipeName?: string;
  recipeSlug?: string;
  steps?: {
    name: string;
    status: 'completed' | 'failed' | 'skipped';
    error?: string;
  }[];
}

/**
 * Execute workflow (Legacy stub)
 * 
 * @deprecated Use RecipePipelineOrchestrator.executePipeline() instead
 */
export async function executeWorkflow(
  context: WorkflowContext,
  progressCallback?: ProgressCallback
): Promise<WorkflowResult> {
  console.warn('⚠️ Using legacy executeWorkflow - consider migrating to RecipePipelineOrchestrator');
  
  // Return a failed result to indicate this should not be used
  return {
    success: false,
    error: 'Legacy workflow system is deprecated. Please use RecipePipelineOrchestrator instead.',
    steps: []
  };
}
