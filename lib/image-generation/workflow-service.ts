// Main service coordinator for the image generation workflow
import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import { 
  RecipeData, 
  ImageGenerationJob, 
  CronJobConfig, 
  GeneratedImage,
  AIModelConfig 
} from './types';
import { PromptGenerationService } from './prompt-generation-service';
import { ImageDownloadService } from './image-download-service';
import { ImagePreprocessingService } from './image-preprocessing-service';
import { ImageGenerationService } from './image-generation-service';
import { FileNamingService } from './file-naming-service';
import { UploadService } from './upload-service';

export class ImageGenerationWorkflow {
  private prisma: PrismaClient;
  private promptService: PromptGenerationService;
  private downloadService: ImageDownloadService;
  private preprocessingService: ImagePreprocessingService;
  private generationService: ImageGenerationService;
  private namingService: FileNamingService;
  private uploadService: UploadService;
  private activeCronJobs: Map<string, CronJob> = new Map();

  constructor(
    aiConfig: AIModelConfig,
    prisma?: PrismaClient
  ) {
    this.prisma = prisma || new PrismaClient();
    this.promptService = new PromptGenerationService(aiConfig);
    this.downloadService = new ImageDownloadService();
    this.preprocessingService = new ImagePreprocessingService(aiConfig);
    this.generationService = new ImageGenerationService(aiConfig);
    this.namingService = new FileNamingService();
    this.uploadService = new UploadService();
  }

  /**
   * Start all active cron jobs
   */
  async startCronJobs(): Promise<void> {
    try {
      // Get all active cron jobs from database
      const activeJobs = await this.prisma.cronJobConfig.findMany({
        where: { isActive: true }
      });

      for (const jobConfig of activeJobs) {
        this.startCronJob(jobConfig);
      }

      console.log(`Started ${activeJobs.length} cron jobs`);
    } catch (error) {
      console.error('Error starting cron jobs:', error);
      throw error;
    }
  }

  /**
   * Start a specific cron job
   */
  private startCronJob(config: CronJobConfig): void {
    const job = new CronJob(
      config.schedule,
      () => this.processBatch(config),
      null,
      true,
      'America/New_York'
    );

    this.activeCronJobs.set(config.id, job);
    console.log(`Started cron job: ${config.name} (${config.schedule})`);
  }

  /**
   * Stop a specific cron job
   */
  async stopCronJob(jobId: string): Promise<void> {
    const job = this.activeCronJobs.get(jobId);
    if (job) {
      job.stop();
      this.activeCronJobs.delete(jobId);
      
      // Update database
      await this.prisma.cronJobConfig.update({
        where: { id: jobId },
        data: { isActive: false }
      });
    }
  }

  /**
   * Process a batch of recipes for a cron job
   */
  private async processBatch(config: CronJobConfig): Promise<void> {
    try {
      console.log(`Processing batch for job: ${config.name}`);
      
      // Update last run time
      await this.prisma.cronJobConfig.update({
        where: { id: config.id },
        data: { lastRun: new Date() }
      });

      // Get pending recipes that haven't been processed yet
      const pendingRecipes = await this.prisma.pinterestSpyData.findMany({
        where: {
          userId: config.userId,
          // Only process recipes that don't have image generation jobs yet
          imageGenerationJobs: {
            none: {}
          }
        },
        take: config.batchSize,
        orderBy: { createdAt: 'asc' }
      });

      console.log(`Found ${pendingRecipes.length} recipes to process`);

      // Process each recipe
      for (const recipe of pendingRecipes) {
        await this.processRecipe(config.id, recipe);
      }

    } catch (error) {
      console.error(`Error processing batch for job ${config.name}:`, error);
    }
  }

  /**
   * Process a single recipe through the entire workflow
   */
  async processRecipe(cronJobId: string, recipe: any): Promise<void> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create job record
      const job = await this.prisma.imageGenerationJob.create({
        data: {
          id: jobId,
          cronJobId,
          recipeId: recipe.id,
          status: 'processing',
          step: 'prompt_generation',
          progress: 0,
          startedAt: new Date(),
          generatedImages: []
        }
      });

      console.log(`Starting image generation for recipe: ${recipe.title} (Job: ${jobId})`);

      // Step 1: Generate image prompts
      await this.updateJobProgress(jobId, 'prompt_generation', 10);
      const prompts = await this.promptService.generatePrompts({
        id: recipe.id,
        seoTitle: recipe.title,
        seoDescription: recipe.description,
        seoKeyword: recipe.keyword,
        category: recipe.category,
        spyPinImageUrl: recipe.spyPinImageUrl,
        nakedDomain: recipe.nakedDomain || 'example.com',
        websiteToken: recipe.websiteToken || ''
      });

      // Step 2: Download spy pin image
      await this.updateJobProgress(jobId, 'image_download', 20);
      const spyImageBuffer = await this.downloadService.downloadImage(recipe.spyPinImageUrl);

      // Step 3: Preprocess spy image
      await this.updateJobProgress(jobId, 'image_preprocessing', 30);
      const cleanedImageBuffer = await this.preprocessingService.cleanImage(spyImageBuffer);

      // Step 4: Generate four images in parallel
      await this.updateJobProgress(jobId, 'image_generation', 40);
      const imageGenerationPromises = [
        this.generationService.generateFeatureImage(prompts.image_1_feature, cleanedImageBuffer, recipe.nakedDomain),
        this.generationService.generateIngredientsImage(prompts.image_2_ingredients, cleanedImageBuffer, recipe.nakedDomain),
        this.generationService.generateCookingImage(prompts.image_3_cooking, cleanedImageBuffer, recipe.nakedDomain),
        this.generationService.generateFinalPresentationImage(prompts.image_4_final_presentation, cleanedImageBuffer, recipe.nakedDomain)
      ];

      const generatedImages = await Promise.all(imageGenerationPromises);

      // Step 5: Generate filenames and upload
      await this.updateJobProgress(jobId, 'upload', 80);
      const uploadPromises = generatedImages.map(async (image, index) => {
        const fileName = this.namingService.generateFileName(recipe.keyword, image.type);
        image.fileName = fileName;
        
        const uploadedUrl = await this.uploadService.uploadImage(
          image.buffer,
          fileName,
          recipe.nakedDomain,
          recipe.websiteToken
        );
        
        image.url = uploadedUrl;
        return image;
      });

      const uploadedImages = await Promise.all(uploadPromises);

      // Step 6: Complete job
      await this.updateJobProgress(jobId, 'completed', 100);
      await this.prisma.imageGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          step: 'completed',
          progress: 100,
          generatedImages: uploadedImages,
          completedAt: new Date()
        }
      });

      console.log(`Successfully completed image generation for recipe: ${recipe.title}`);

    } catch (error) {
      console.error(`Error processing recipe ${recipe.title}:`, error);
      
      // Update job with error
      await this.prisma.imageGenerationJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        }
      });
    }
  }

  /**
   * Update job progress
   */
  private async updateJobProgress(
    jobId: string, 
    step: ImageGenerationJob['step'], 
    progress: number
  ): Promise<void> {
    await this.prisma.imageGenerationJob.update({
      where: { id: jobId },
      data: { step, progress }
    });
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<ImageGenerationJob | null> {
    return await this.prisma.imageGenerationJob.findUnique({
      where: { id: jobId }
    });
  }

  /**
   * Get all jobs for a user
   */
  async getUserJobs(userId: string, limit = 50): Promise<ImageGenerationJob[]> {
    return await this.prisma.imageGenerationJob.findMany({
      where: {
        cronJob: {
          userId
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    });
  }

  /**
   * Stop all cron jobs and cleanup
   */
  async shutdown(): Promise<void> {
    for (const [jobId, job] of this.activeCronJobs) {
      job.stop();
    }
    this.activeCronJobs.clear();
    await this.prisma.$disconnect();
    console.log('Image generation workflow shutdown complete');
  }
}