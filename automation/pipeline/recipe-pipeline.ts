/**
 * Recipe Pipeline Orchestrator
 * Manages the complete pipeline from Pinterest Spy Data to Published Recipe
 * 
 * Pipeline Steps:
 * 1. Select spy data entry (PENDING status)
 * 2. Generate SEO metadata
 * 3. Generate 4 images
 * 4. Generate complete recipe
 * 5. Publish recipe
 * 6. Archive spy data
 */

import { PrismaClient } from '@prisma/client';
import { CategoryMatcher } from '../recipe-generation/category-matcher';
import { RecipeGenerationService } from '../recipe-generation/service';
import { RecipeDatabaseService } from '../recipe-generation/database';
import { getAutomationConfig } from '@/lib/automation-settings';
import { requestGoogleIndexing } from '../google-indexing/service';
import { editImageWithGemini } from '../pinterest/image-editor';
import { buildPinterestPayload, sendPinterestWebhook } from '../pinterest/webhook';
import { CheckpointManager } from './checkpoint-manager';

const prisma = new PrismaClient();

export interface PipelineContext {
  spyDataId: string;
  automationId?: string;
  authorId?: string; // Optional: auto-select if not provided
  onProgress?: (step: number, total: number, message: string) => Promise<void>;
}

export interface PipelineResult {
  success: boolean;
  recipeId?: string;
  recipeUrl?: string;
  error?: string;
  stage?: string; // What stage failed
  logs: string[];
}

export class RecipePipelineOrchestrator {
  private static readonly TOTAL_STEPS = 7; // Updated to 7 steps (added Google Indexing + Pinterest)

  /**
   * Execute the complete recipe generation pipeline
   */
  static async executePipeline(context: PipelineContext): Promise<PipelineResult> {
    const logs: string[] = [];
    const log = (message: string) => {
      console.log(message);
      logs.push(`[${new Date().toISOString()}] ${message}`);
    };

    try {
      log(`🚀 Starting recipe pipeline for spy data: ${context.spyDataId}`);

      // STEP 1: Fetch and validate spy data
      await context.onProgress?.(1, this.TOTAL_STEPS, 'Fetching spy data...');
      log('📊 STEP 1/7: Fetching spy data...');

      const spyData = await prisma.pinterestSpyData.findUnique({
        where: { id: context.spyDataId }
      });

      if (!spyData) {
        throw new Error(`Spy data not found: ${context.spyDataId}`);
      }

      // Check if already processed
      if (spyData.generatedRecipeId) {
        throw new Error(`Recipe already generated for this spy data: ${spyData.generatedRecipeId}`);
      }

      log(`✅ Spy data loaded: ${spyData.spyTitle}`);

      // Check for existing checkpoint to resume from
      const checkpoint = await CheckpointManager.getLastCheckpoint(context.spyDataId);
      if (checkpoint.lastStep) {
        log(`📍 CHECKPOINT FOUND: Last successful step was ${checkpoint.lastStep}`);
        log(`   Can resume: ${checkpoint.canResume}`);
        log(`   Has SEO: ${checkpoint.hasSEO}`);
        log(`   Has Images: ${checkpoint.hasImages}`);
        log(`   Has Recipe: ${checkpoint.hasRecipe}`);
      }

      // STEP 2: Generate SEO if not exists
      await context.onProgress?.(2, this.TOTAL_STEPS, 'Generating SEO metadata...');
      log('🔍 STEP 2/7: Generating SEO metadata...');

      if (!spyData.seoKeyword || !spyData.seoTitle || !spyData.seoDescription) {
        log('⚠️ SEO data missing, generating...');
        await this.generateSEO(spyData.id);
        
        // Reload spy data with SEO
        const updatedSpyData = await prisma.pinterestSpyData.findUnique({
          where: { id: context.spyDataId }
        });
        
        if (!updatedSpyData || !updatedSpyData.seoKeyword) {
          throw new Error('Failed to generate SEO data');
        }
        
        Object.assign(spyData, updatedSpyData);
        log(`✅ SEO generated: ${spyData.seoTitle}`);
        
        // CHECKPOINT: SEO Complete
        await CheckpointManager.saveCheckpoint(context.spyDataId, 'SEO_COMPLETE', {
          status: 'SEO_COMPLETED'
        });
      } else {
        log(`✅ SEO data already exists`);
      }

      // STEP 3: Generate images if not exists
      await context.onProgress?.(3, this.TOTAL_STEPS, 'Generating recipe images...');
      log('🖼️ STEP 3/7: Generating recipe images...');

      if (!spyData.generatedImage1Url || !spyData.generatedImage2Url || 
          !spyData.generatedImage3Url || !spyData.generatedImage4Url) {
        log('⚠️ Images missing, generating...');
        await this.generateImages(spyData.id);
        
        // Reload spy data with images
        const updatedSpyData = await prisma.pinterestSpyData.findUnique({
          where: { id: context.spyDataId }
        });
        
        if (!updatedSpyData) {
          throw new Error('Failed to reload spy data after image generation');
        }
        
        if (!updatedSpyData.generatedImage1Url || !updatedSpyData.generatedImage2Url ||
            !updatedSpyData.generatedImage3Url || !updatedSpyData.generatedImage4Url) {
          throw new Error(`Failed to generate all images. Missing: ${
            [
              !updatedSpyData.generatedImage1Url && 'image1',
              !updatedSpyData.generatedImage2Url && 'image2',
              !updatedSpyData.generatedImage3Url && 'image3',
              !updatedSpyData.generatedImage4Url && 'image4'
            ].filter(Boolean).join(', ')
          }`);
        }
        
        Object.assign(spyData, updatedSpyData);
        log(`✅ Images generated and verified:`);
        log(`   Image 1: ${spyData.generatedImage1Url}`);
        log(`   Image 2: ${spyData.generatedImage2Url}`);
        log(`   Image 3: ${spyData.generatedImage3Url}`);
        log(`   Image 4: ${spyData.generatedImage4Url}`);
        
        // CHECKPOINT: Images Complete - THIS SAVES MONEY ON RETRIES!
        await CheckpointManager.saveCheckpoint(context.spyDataId, 'IMAGES_COMPLETE', {
          status: 'READY_FOR_GENERATION'
        });
        log(`💰 CHECKPOINT SAVED: Images will not be regenerated if recipe fails`);
      } else {
        log(`✅ Images already exist`);
      }

      // STEP 4: Match category and author
      await context.onProgress?.(4, this.TOTAL_STEPS, 'Matching category and author...');
      log('🎯 STEP 4/7: Finding best category match...');

      const categoryMatch = await CategoryMatcher.findBestCategory({
        title: spyData.seoTitle!,
        description: spyData.seoDescription!,
        keyword: spyData.seoKeyword!,
        category: spyData.seoCategory || undefined
      });

      let authorId = context.authorId;
      let categoryId: string | undefined;

      if (categoryMatch) {
        log(`✅ Category matched: ${categoryMatch.categoryName} (${categoryMatch.confidence}% confidence)`);
        categoryId = categoryMatch.categoryId;

        // Auto-select author if not provided
        if (!authorId) {
          const matchingAuthorId = await CategoryMatcher.findMatchingAuthor(categoryMatch.categoryId);
          if (matchingAuthorId) {
            authorId = matchingAuthorId;
            log(`✅ Author auto-matched based on category tags`);
          } else {
            // Fallback to first available author
            const fallbackAuthor = await prisma.author.findFirst();
            if (fallbackAuthor) {
              authorId = fallbackAuthor.id;
              log(`⚠️ No matching author found, using fallback: ${fallbackAuthor.name}`);
            } else {
              throw new Error('No authors available in database');
            }
          }
        }
      } else {
        log(`⚠️ No category match found`);
        
        // Still need an author
        if (!authorId) {
          const fallbackAuthor = await prisma.author.findFirst();
          if (fallbackAuthor) {
            authorId = fallbackAuthor.id;
            log(`⚠️ Using fallback author: ${fallbackAuthor.name}`);
          } else {
            throw new Error('No authors available in database');
          }
        }
      }

      // STEP 5: Generate and publish recipe
      await context.onProgress?.(5, this.TOTAL_STEPS, 'Generating recipe content...');
      log('🍳 STEP 5/7: Generating complete recipe...');

      const recipeId = RecipeGenerationService.generateRecipeId();

      const generationInput = {
        seoKeyword: spyData.seoKeyword!,
        seoTitle: spyData.seoTitle!,
        seoDescription: spyData.seoDescription!,
        seoCategory: spyData.seoCategory || 'Main Dish',
        featureImage: spyData.generatedImage1Url!,
        preparationImage: spyData.generatedImage2Url!,
        cookingImage: spyData.generatedImage3Url!,
        finalPresentationImage: spyData.generatedImage4Url!,
        authorId: authorId!,
        recipeId: recipeId,
        categoryId: categoryId,
        categoryName: categoryMatch?.categoryName,
        categorySlug: categoryMatch?.categorySlug,
        spyData: spyData
      };

      log(`📝 Calling AI to generate recipe...`);
      const generationResult = await RecipeGenerationService.generateRecipe(generationInput);

      if (!generationResult.success || !generationResult.recipeData) {
        throw new Error(generationResult.error || 'Recipe generation failed');
      }

      log(`✅ Recipe content generated successfully`);

      // Save recipe to database
      log(`💾 Saving recipe to database...`);
      const saveResult = await RecipeDatabaseService.saveRecipe({
        spyEntryId: context.spyDataId,
        recipeData: generationResult.recipeData,
        recipeJson: JSON.stringify(generationResult.recipeData)
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save recipe');
      }

      log(`✅ Recipe saved with ID: ${saveResult.recipeId}`);

      // CHECKPOINT: Recipe Complete
      await CheckpointManager.saveCheckpoint(context.spyDataId, 'RECIPE_COMPLETE');

      // Update spy data to mark as completed
      await prisma.pinterestSpyData.update({
        where: { id: context.spyDataId },
        data: {
          status: 'COMPLETED',
          generatedRecipeId: saveResult.recipeId,
          recipeGeneratedAt: new Date()
        }
      });

      const recipeUrl = `/recipes/${generationResult.recipeData.slug}`;
      log(`✅ Recipe published successfully! URL: ${recipeUrl}`);

      // STEP 6: Google Indexing (if enabled)
      await context.onProgress?.(6, this.TOTAL_STEPS, 'Submitting to Google Indexing...');
      log('🔍 STEP 6/7: Google Indexing...');

      try {
        const automationConfig = await getAutomationConfig();
        
        if (automationConfig.indexing.enabled && automationConfig.indexing.credentials) {
          const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}${recipeUrl}`;
          log(`📡 Submitting URL to Google Indexing: ${fullUrl}`);
          
          const indexingResult = await requestGoogleIndexing(
            fullUrl,
            JSON.stringify(automationConfig.indexing.credentials)
          );
          
          if (indexingResult.success) {
            log(`✅ Google Indexing successful: ${indexingResult.message}`);
          } else {
            log(`⚠️ Google Indexing failed: ${indexingResult.error}`);
          }
        } else {
          log(`⏭️ Google Indexing disabled or not configured, skipping...`);
        }
      } catch (error) {
        log(`⚠️ Google Indexing error (non-fatal): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // STEP 7: Pinterest Integration (if enabled)
      await context.onProgress?.(7, this.TOTAL_STEPS, 'Processing Pinterest integration...');
      log('📌 STEP 7/7: Pinterest Integration...');

      try {
        const automationConfig = await getAutomationConfig();
        
        if (automationConfig.pinterest.enabled && automationConfig.pinterest.webhookUrl) {
          log(`🖼️ Editing image for Pinterest...`);
          
          // Edit image using Gemini
          const imageEditResult = await editImageWithGemini(
            spyData.spyImageUrl, // Original SpyPin image
            generationResult.recipeData.title,
            automationConfig.pinterest.imageEditPrompt || 'Enhance this image for Pinterest: {recipeTitle}',
            process.env.GEMINI_API_KEY!
          );
          
          if (imageEditResult.success && imageEditResult.editedImageUrl) {
            log(`✅ Image edited: ${imageEditResult.editedImageUrl}`);
            
            // Get Pinterest board ID from category mapping
            let boardId = 'default-board-id';
            if (categoryId) {
              const boardMapping = await prisma.pinterestBoard.findFirst({
                where: {
                  categoryId: categoryId,
                  isActive: true
                }
              });
              
              if (boardMapping) {
                boardId = boardMapping.boardId;
                log(`✅ Found Pinterest board mapping: ${boardMapping.boardName} (${boardId})`);
              } else {
                log(`⚠️ No Pinterest board mapping found for category, using default`);
              }
            }
            
            // Build webhook payload
            const fullRecipeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}${recipeUrl}`;
            const fullImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}${imageEditResult.editedImageUrl}`;
            
            const payload = buildPinterestPayload(
              saveResult.recipeId!,
              generationResult.recipeData.title,
              generationResult.recipeData.description,
              fullImageUrl,
              process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
              boardId,
              {
                category: categoryMatch?.categoryName,
                tags: [spyData.seoKeyword || '', categoryMatch?.categoryName || ''].filter(Boolean),
                altText: generationResult.recipeData.title
              }
            );
            
            log(`📡 Sending webhook to Make.com...`);
            
            // Send webhook to Make.com
            const webhookResult = await sendPinterestWebhook(
              automationConfig.pinterest.webhookUrl,
              payload
            );
            
            if (webhookResult.success) {
              log(`✅ Pinterest webhook sent successfully`);
            } else {
              log(`⚠️ Pinterest webhook failed: ${webhookResult.error}`);
            }
          } else {
            log(`⚠️ Image editing failed: ${imageEditResult.error}`);
          }
        } else {
          log(`⏭️ Pinterest integration disabled or not configured, skipping...`);
        }
      } catch (error) {
        log(`⚠️ Pinterest integration error (non-fatal): ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      log(`🎉 Pipeline completed successfully!`);

      return {
        success: true,
        recipeId: saveResult.recipeId,
        recipeUrl: recipeUrl,
        logs
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`❌ Pipeline failed: ${errorMessage}`);

      // Determine which step failed and mark it
      let failedStep = 'UNKNOWN';
      if (errorMessage.includes('SEO') || errorMessage.includes('seo')) {
        failedStep = 'SEO_GENERATION';
      } else if (errorMessage.includes('image') || errorMessage.includes('Image')) {
        failedStep = 'IMAGE_GENERATION';
      } else if (errorMessage.includes('recipe') || errorMessage.includes('Recipe')) {
        failedStep = 'RECIPE_GENERATION';
      } else if (errorMessage.includes('Google') || errorMessage.includes('index')) {
        failedStep = 'GOOGLE_INDEXING';
      } else if (errorMessage.includes('Pinterest')) {
        failedStep = 'PINTEREST_INTEGRATION';
      }

      // Mark as failed with checkpoint info
      await CheckpointManager.markFailed(context.spyDataId, failedStep, errorMessage);

      return {
        success: false,
        error: errorMessage,
        stage: failedStep,
        logs
      };
    }
  }

  /**
   * Generate SEO metadata for spy data
   */
  private static async generateSEO(spyDataId: string): Promise<void> {
    // Import SEO extraction service directly instead of making API call
    const { SEOExtractionService } = await import('@/lib/pinterest-spy/seo-extraction-service');
    
    const spyData = await prisma.pinterestSpyData.findUnique({
      where: { id: spyDataId }
    });
    
    if (!spyData) {
      throw new Error('Spy data not found');
    }
    
    const result = await SEOExtractionService.extractSEOMetadata({
      spyTitle: spyData.spyTitle,
      spyDescription: spyData.spyDescription || undefined,
      spyImageUrl: spyData.spyImageUrl
    });
    
    await prisma.pinterestSpyData.update({
      where: { id: spyDataId },
      data: {
        seoKeyword: result.seoKeyword,
        seoTitle: result.seoTitle,
        seoDescription: result.seoDescription,
        seoCategory: result.seoCategory,
        seoProcessedAt: new Date(),
        status: 'SEO_PROCESSED'
      }
    });
  }

  /**
   * Generate images for spy data
   */
  private static async generateImages(spyDataId: string): Promise<void> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🖼️  IMAGE GENERATION START - Spy Data ID: ${spyDataId}`);
    console.log(`${'='.repeat(80)}\n`);
    
    try {
      // Import image provider factory
      const { ImageProviderFactory } = await import('@/automation/image-providers/factory');
      const sharp = (await import('sharp')).default;
      
      const spyData = await prisma.pinterestSpyData.findUnique({
        where: { id: spyDataId }
      });
      
      if (!spyData) {
        throw new Error('Spy data not found');
      }
      
      if (!spyData.seoKeyword || !spyData.seoTitle) {
        throw new Error('SEO data must be generated before images');
      }

      // Get automation settings to determine provider
      const config = await getAutomationConfig();
      const imageProvider = config.imageProvider || 'gemini';
      
      console.log(`✅ Spy data loaded successfully`);
      console.log(`   Title: ${spyData.seoTitle}`);
      console.log(`   Keyword: ${spyData.seoKeyword}`);
      console.log(`   Reference Image: ${spyData.spyImageUrl || 'NONE'}`);
      console.log(`   Image Provider: ${imageProvider.toUpperCase()}`);
      console.log(`\n${'='.repeat(80)}\n`);

      // Create appropriate image provider
      const provider = ImageProviderFactory.create({
        provider: imageProvider as 'gemini' | 'midjourney',
        geminiApiKey: config.geminiApiKey,
        midjourneyApiKey: config.midjourneyApiKey,
        midjourneyWebhookUrl: config.midjourneyWebhookUrl,
        midjourneyWebhookSecret: config.midjourneyWebhookSecret
      });

      if (!provider) {
        throw new Error(`Failed to create ${imageProvider} provider. Check configuration.`);
      }

      if (!provider.isConfigured()) {
        throw new Error(`${imageProvider} provider is not properly configured`);
      }

      console.log(`✅ ${provider.getProviderName().toUpperCase()} provider initialized`);
    
    // Handle Midjourney async pattern
    if (imageProvider === 'midjourney') {
      console.log(`🎨 Midjourney selected - Using async webhook pattern`);
      
      // Process prompt template with variables
      const promptTemplate = config.midjourneyPromptTemplate || 
        'Create a high-quality, photorealistic food photography image for {recipeName}. Focus on: {seoKeyword}';
      
      const processedPrompt = promptTemplate
        .replace(/\{recipeName\}/g, spyData.seoTitle)
        .replace(/\{seoKeyword\}/g, spyData.seoKeyword)
        .replace(/\{seoTitle\}/g, spyData.seoTitle)
        .replace(/\{seoDescription\}/g, spyData.seoDescription || '');
      
      console.log(`📝 Processed prompt: ${processedPrompt.substring(0, 100)}...`);
      
      // Generate images with Midjourney (will return task ID)
      const result = await provider.generateImages({
        prompt: processedPrompt,
        referenceImageUrl: spyData.spyImageUrl || undefined,
        recipeTitle: spyData.seoTitle,
        seoKeyword: spyData.seoKeyword,
        imageNumber: 1 // Midjourney generates all 4 at once
      });

      if (!result.success || !result.taskId) {
        throw new Error(result.error || 'Failed to initiate Midjourney generation');
      }

      console.log(`✅ Midjourney request sent successfully`);
      console.log(`   Task ID: ${result.taskId}`);
      console.log(`   Status: Images will arrive via webhook`);
      
      // Save task ID for webhook tracking
      await prisma.pinterestSpyData.update({
        where: { id: spyDataId },
        data: {
          midjourneyTaskId: result.taskId,
          status: 'GENERATING',
          imageGeneratedAt: new Date()
        }
      });

      console.log(`\n${'='.repeat(80)}`);
      console.log(`⏳ MIDJOURNEY GENERATION INITIATED`);
      console.log(`   Task ID saved. Webhook will deliver images when ready.`);
      console.log(`   Pipeline will continue when webhook updates the record.`);
      console.log(`${'='.repeat(80)}\n`);
      
      // For Midjourney, we return here and let webhook complete the process
      return;
    }

    // Gemini synchronous generation (existing logic)
    console.log(`💎 Gemini selected - Using synchronous generation`);
    
    // Import Gemini service for backward compatibility
    const { ImageGenerationService } = await import('@/automation/image-generation/service');
    
    // Generate 4 images
    const imageUrls: Record<string, string> = {};
    const prompts: Record<string, string> = {};
    
    for (let i = 1; i <= 4; i++) {
      let retryCount = 0;
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`📸 Generating image ${i}/4 (attempt ${retryCount + 1}/${maxRetries})...`);
          
          const prompt = await this.generateImagePrompt(spyData, i);
          prompts[`image_${i}`] = prompt;
          
          // Convert reference image to base64 (optional - will be null if not available)
          const referenceBase64 = await ImageGenerationService.imageUrlToBase64(spyData.spyImageUrl);
          
          // Generate image with timeout
          console.log(`🎨 Calling Gemini API for image ${i}... (this may take up to 2 minutes)`);
          const startTime = Date.now();
          
          const result = await ImageGenerationService.generateSingleImage(
            prompt,
            referenceBase64,
            i,
            spyData.seoKeyword
          );
          
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`⏱️ Image ${i} generation took ${duration}s`);
          
          if (!result || !result.imageData) {
            throw new Error(`Image generation returned no data for image ${i}`);
          }
          
          console.log(`✅ Image ${i} generated, size: ${result.imageData.length} bytes`);
          
          // Save image file and convert to WebP
          const fs = await import('fs/promises');
          const path = await import('path');
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'generated-recipes');
          
          console.log(`📁 Ensuring upload directory exists: ${uploadDir}`);
          await fs.mkdir(uploadDir, { recursive: true });
          
          // Verify directory was created
          try {
            await fs.access(uploadDir);
            console.log(`✅ Upload directory confirmed: ${uploadDir}`);
          } catch (err) {
            throw new Error(`Failed to create/access upload directory: ${uploadDir}`);
          }
          
          // Convert filename to .webp
          const webpFilename = result.filename.replace(/\.(jpg|jpeg|png)$/i, '.webp');
          const webpPath = path.join(uploadDir, webpFilename);
          
          console.log(`🔄 Converting image ${i} to WebP format...`);
          console.log(`   Output path: ${webpPath}`);
          
          // Convert image to WebP format
          const imageBuffer = Buffer.from(result.imageData, 'base64');
          
          try {
            await sharp(imageBuffer)
              .webp({ quality: 85 })
              .toFile(webpPath);
            
            console.log(`💾 WebP file written: ${webpFilename}`);
            
            // CRITICAL: Verify file was actually written and is readable
            const stats = await fs.stat(webpPath);
            console.log(`✅ File verified - Size: ${stats.size} bytes, Written: ${stats.mtime}`);
            
            if (stats.size === 0) {
              throw new Error(`WebP file was created but is empty (0 bytes)`);
            }
            
            // Additional verification - try to read the file
            await fs.access(webpPath, fs.constants.R_OK);
            console.log(`✅ File is readable: ${webpFilename}`);
            
          } catch (conversionError) {
            const errMsg = conversionError instanceof Error ? conversionError.message : String(conversionError);
            throw new Error(`Failed to convert/save image ${i} to WebP: ${errMsg}`);
          }
          
          const imageUrl = `/uploads/generated-recipes/${webpFilename}`;
          imageUrls[`image${i}`] = imageUrl;
          
          console.log(`✅ Image ${i} complete and verified: ${imageUrl}`);
          
          // Small delay to ensure filesystem has fully committed the write
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Success - break retry loop
          break;
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          retryCount++;
          
          console.error(`❌ Failed to generate image ${i} (attempt ${retryCount}/${maxRetries}):`, lastError.message);
          
          if (retryCount < maxRetries) {
            const waitTime = Math.min(5000 * Math.pow(2, retryCount - 1), 30000); // Exponential backoff: 5s, 10s, 20s
            console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            // Max retries reached
            throw new Error(`Image ${i} generation failed after ${maxRetries} attempts: ${lastError.message}`);
          }
        }
      }
    }
    
    // Verify all images were generated
    if (!imageUrls.image1 || !imageUrls.image2 || !imageUrls.image3 || !imageUrls.image4) {
      throw new Error(`Not all images were generated. Got: ${Object.keys(imageUrls).join(', ')}`);
    }
    
    console.log(`✅ All 4 images generated successfully`);
    
    // CRITICAL: Final verification - ensure all files actually exist on disk before updating database
    const fs = await import('fs/promises');
    const path = await import('path');
    
    console.log(`🔍 Performing final file existence verification...`);
    for (const [key, url] of Object.entries(imageUrls)) {
      const filePath = path.join(process.cwd(), 'public', url);
      try {
        const stats = await fs.stat(filePath);
        console.log(`✅ ${key}: ${url} (${stats.size} bytes) - EXISTS`);
        
        if (stats.size === 0) {
          throw new Error(`File ${url} exists but is empty (0 bytes)`);
        }
      } catch (err) {
        throw new Error(`CRITICAL: Image file verification failed for ${key} (${url}). File does not exist or is not accessible. Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    console.log(`✅ All 4 image files verified on disk`);
    console.log(`📝 Updating spy data with image URLs:`, imageUrls);
    
    // Additional safety delay to ensure all filesystem operations are complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update spy data with image URLs
    await prisma.pinterestSpyData.update({
      where: { id: spyDataId },
      data: {
        generatedImage1Url: imageUrls.image1,
        generatedImage2Url: imageUrls.image2,
        generatedImage3Url: imageUrls.image3,
        generatedImage4Url: imageUrls.image4,
        generatedImagePrompts: prompts,
        imageGeneratedAt: new Date(),
        status: 'READY_FOR_GENERATION'
      }
    });
    
    console.log(`✅ Spy data updated with all image URLs`);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ IMAGE GENERATION COMPLETE - All 4 images saved and verified`);
    console.log(`${'='.repeat(80)}\n`);
    
    } catch (error) {
      console.error(`\n${'='.repeat(80)}`);
      console.error(`❌ IMAGE GENERATION FAILED`);
      console.error(`${'='.repeat(80)}`);
      console.error(`Error:`, error);
      console.error(`Stack:`, error instanceof Error ? error.stack : 'No stack trace');
      console.error(`${'='.repeat(80)}\n`);
      throw error;
    }
  }
  
  /**
   * Generate a prompt for a specific image number
   */
  private static async generateImagePrompt(spyData: any, imageNumber: number): Promise<string> {
    const prompts = {
      1: `FINISHED DISH HERO SHOT: Close-up 45-degree angle of ${spyData.seoTitle} plated on kitchen surface. Show complete finished dish as main subject. NO raw ingredients, NO cooking process, ONLY final result. Kitchen environment, 16:9 tall aspect ratio.`,
      2: `RAW INGREDIENTS LAYOUT: ONLY raw, uncooked ingredients for ${spyData.seoTitle} laid out separately. NO finished dish, NO cooking in progress. Ingredients in bowls, measuring cups, on cutting board. Overhead flat lay view from directly above. Kitchen environment, 16:9 tall aspect ratio.`,
      3: `COOKING ACTION SHOT: ${spyData.seoTitle} being cooked/mixed/baked IN PROGRESS. Steam, bubbles, or action visible. Side angle or 3/4 view showing the process. NO finished dish, NO raw ingredients layout. Kitchen environment, 16:9 tall aspect ratio.`,
      4: `STYLED PRESENTATION: ${spyData.seoTitle} finished dish in ELEGANT table setting. Different angle than image 1 (front view or side profile). More styling and props. Kitchen environment, 16:9 tall aspect ratio.`
    };
    
    return prompts[imageNumber as keyof typeof prompts] || prompts[1];
  }

  /**
   * Get next pending spy data entry for processing
   */
  static async getNextPendingEntry(): Promise<string | null> {
    const entry = await prisma.pinterestSpyData.findFirst({
      where: {
        OR: [
          { status: 'PENDING' },
          { status: 'SEO_COMPLETED' }
        ],
        generatedRecipeId: null
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      select: { id: true }
    });

    return entry?.id || null;
  }

  /**
   * Archive completed spy data to archive table
   */
  static async archiveCompletedEntry(spyDataId: string): Promise<void> {
    const spyData = await prisma.pinterestSpyData.findUnique({
      where: { id: spyDataId },
      include: { generatedRecipe: true }
    });

    if (!spyData || !spyData.generatedRecipe) {
      throw new Error('Spy data or generated recipe not found');
    }

    // Create archive entry
    await prisma.generatedRecipeArchive.create({
      data: {
        recipeId: spyData.generatedRecipeId!,
        originalSpyData: spyData as any,
        spyDataId: spyData.id,
        title: spyData.generatedRecipe.title,
        slug: spyData.generatedRecipe.slug,
        category: spyData.generatedRecipe.category,
        authorId: spyData.generatedRecipe.authorId,
        images: [
          spyData.generatedImage1Url,
          spyData.generatedImage2Url,
          spyData.generatedImage3Url,
          spyData.generatedImage4Url
        ].filter(Boolean) as string[],
        seoKeyword: spyData.seoKeyword,
        seoTitle: spyData.seoTitle,
        seoDescription: spyData.seoDescription,
        publishedAt: new Date(),
        status: 'ACTIVE'
      }
    });

    // Delete spy data entry
    await prisma.pinterestSpyData.delete({
      where: { id: spyDataId }
    });
  }
}
