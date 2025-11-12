// Image Generation Service Initializer
// This should be started when the application boots up
import { ImageGenerationWorkflow } from './workflow-service';
import { AIModelConfig } from './types';

class ImageGenerationServiceManager {
  private static instance: ImageGenerationServiceManager;
  private workflows: Map<string, ImageGenerationWorkflow> = new Map();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ImageGenerationServiceManager {
    if (!ImageGenerationServiceManager.instance) {
      ImageGenerationServiceManager.instance = new ImageGenerationServiceManager();
    }
    return ImageGenerationServiceManager.instance;
  }

  /**
   * Initialize the image generation service
   * This should be called when the application starts
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Image generation service already initialized');
      return;
    }

    try {
      console.log('Initializing image generation service...');

      // Load all active cron jobs from database and start them
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const activeCronJobs = await prisma.imageGenerationCronJob.findMany({
        where: { isActive: true }
      });

      console.log(`Found ${activeCronJobs.length} active cron jobs`);

      // Start each cron job with its specific configuration
      for (const cronJob of activeCronJobs) {
        await this.startWorkflow(cronJob.id, {
          provider: cronJob.aiProvider as 'github' | 'azure' | 'openai',
          model: cronJob.aiModel,
          apiKey: cronJob.aiApiKey, // In production, decrypt this
          endpoint: cronJob.aiEndpoint || undefined
        });
      }

      this.isInitialized = true;
      console.log('Image generation service initialized successfully');

    } catch (error) {
      console.error('Error initializing image generation service:', error);
      throw error;
    }
  }

  /**
   * Start a workflow for a specific cron job
   */
  async startWorkflow(cronJobId: string, aiConfig: AIModelConfig): Promise<void> {
    try {
      if (this.workflows.has(cronJobId)) {
        console.log(`Workflow for cron job ${cronJobId} already running`);
        return;
      }

      const workflow = new ImageGenerationWorkflow(aiConfig);
      
      // Start only this specific cron job
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const cronJob = await prisma.imageGenerationCronJob.findUnique({
        where: { id: cronJobId }
      });

      if (!cronJob) {
        throw new Error(`Cron job ${cronJobId} not found`);
      }

      // Start the workflow with this specific cron job
      await workflow.startCronJobs();
      
      this.workflows.set(cronJobId, workflow);
      console.log(`Started workflow for cron job: ${cronJob.name}`);

    } catch (error) {
      console.error(`Error starting workflow for cron job ${cronJobId}:`, error);
      throw error;
    }
  }

  /**
   * Stop a workflow for a specific cron job
   */
  async stopWorkflow(cronJobId: string): Promise<void> {
    try {
      const workflow = this.workflows.get(cronJobId);
      if (!workflow) {
        console.log(`No active workflow found for cron job ${cronJobId}`);
        return;
      }

      await workflow.stopCronJob(cronJobId);
      this.workflows.delete(cronJobId);
      console.log(`Stopped workflow for cron job ${cronJobId}`);

    } catch (error) {
      console.error(`Error stopping workflow for cron job ${cronJobId}:`, error);
      throw error;
    }
  }

  /**
   * Restart a workflow (stop and start)
   */
  async restartWorkflow(cronJobId: string, aiConfig: AIModelConfig): Promise<void> {
    await this.stopWorkflow(cronJobId);
    await this.startWorkflow(cronJobId, aiConfig);
  }

  /**
   * Get status of all workflows
   */
  getWorkflowsStatus(): { cronJobId: string; isActive: boolean }[] {
    return Array.from(this.workflows.keys()).map(cronJobId => ({
      cronJobId,
      isActive: true
    }));
  }

  /**
   * Shutdown all workflows
   */
  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down image generation service...');

      const shutdownPromises = Array.from(this.workflows.values()).map(workflow => 
        workflow.shutdown()
      );

      await Promise.all(shutdownPromises);
      this.workflows.clear();
      this.isInitialized = false;

      console.log('Image generation service shutdown complete');

    } catch (error) {
      console.error('Error during image generation service shutdown:', error);
      throw error;
    }
  }

  /**
   * Process a single recipe immediately (manual trigger)
   */
  async processRecipeNow(cronJobId: string, recipeId: string): Promise<void> {
    try {
      const workflow = this.workflows.get(cronJobId);
      if (!workflow) {
        throw new Error(`No active workflow found for cron job ${cronJobId}`);
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const recipe = await prisma.pinterestSpyData.findUnique({
        where: { id: recipeId }
      });

      if (!recipe) {
        throw new Error(`Recipe ${recipeId} not found`);
      }

      await workflow.processRecipe(cronJobId, recipe);
      console.log(`Manually processed recipe ${recipeId} with cron job ${cronJobId}`);

    } catch (error) {
      console.error(`Error processing recipe ${recipeId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const imageGenerationService = ImageGenerationServiceManager.getInstance();

// Auto-initialize when module is imported (in production, call this from your app startup)
if (process.env.NODE_ENV === 'production') {
  imageGenerationService.initialize().catch(console.error);
}