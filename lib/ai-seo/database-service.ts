/**
 * SEO Enhancement Database Schema
 * 
 * Database models for storing and managing AI-generated SEO enhancements
 */

// Prisma schema additions for SEO enhancements
export const seoEnhancementSchema = `
// Add to your prisma/schema.prisma file

model SEOEnhancement {
  id                String   @id @default(cuid())
  type              String   // 'metadata' | 'image' | 'internal-link' | 'schema' | 'content'
  status            String   @default("pending") // 'pending' | 'approved' | 'rejected' | 'applied'
  confidence        Float    // 0-1 confidence score from AI
  originalContent   String?  // Original content being replaced
  suggestedContent  String   // AI-generated content
  reasoning         String   // Why this change is suggested
  keywords          String[] // Related keywords
  estimatedImpact   String   // 'low' | 'medium' | 'high'
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  // Admin management
  reviewedBy        String?  // Admin who reviewed
  reviewedAt        DateTime?
  appliedBy         String?  // Admin who applied
  appliedAt         DateTime?
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("seo_enhancements")
}

model SEOMetadata {
  id                String   @id @default(cuid())
  
  // Page identification
  pageType          String   // 'recipe' | 'category' | 'author' | 'static'
  pageId            String   // ID of the specific page
  slug              String   @unique
  
  // AI-generated metadata
  aiTitle           String?
  aiDescription     String?
  aiKeywords        String[]
  aiOgTitle         String?
  aiOgDescription   String?
  aiTwitterTitle    String?
  aiTwitterDescription String?
  
  // Current live metadata
  currentTitle      String?
  currentDescription String?
  currentKeywords   String[]
  
  // Performance tracking
  generatedAt       DateTime @default(now())
  lastApplied       DateTime?
  performanceScore  Float?   // CTR, impressions, etc.
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("seo_metadata")
}

model SEOImageData {
  id                String   @id @default(cuid())
  
  // Image identification
  imageUrl          String   @unique
  imageHash         String?  // For detecting duplicates
  
  // AI-generated content
  aiAltText         String?
  aiCaption         String?
  aiTitle           String?
  aiStructuredData  Json?
  
  // Current content
  currentAltText    String?
  currentCaption    String?
  currentTitle      String?
  
  // Context
  pageType          String   // Where this image appears
  pageId            String
  imageContext      String   // 'hero' | 'ingredient' | 'step' | 'final-result'
  
  // Performance
  generatedAt       DateTime @default(now())
  lastApplied       DateTime?
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("seo_image_data")
}

model SEOInternalLink {
  id                String   @id @default(cuid())
  
  // Source page
  sourcePage        String   // URL where link should be added
  sourcePageType    String   // 'recipe' | 'category' | 'static'
  sourcePageId      String
  
  // Target page
  targetPage        String   // URL being linked to
  targetPageType    String
  targetPageId      String
  targetPageTitle   String
  
  // Link details
  anchorText        String
  contextBefore     String
  contextAfter      String
  linkType          String   // 'related-recipe' | 'category' | 'ingredient' | 'technique'
  relevanceScore    Float
  
  // Status
  status            String   @default("pending") // 'pending' | 'approved' | 'rejected' | 'applied'
  appliedAt         DateTime?
  
  // Performance tracking
  clickThrough      Int      @default(0)
  impressions       Int      @default(0)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("seo_internal_links")
}

model SEOPerformance {
  id                String   @id @default(cuid())
  
  // Page identification
  pageUrl           String
  pageType          String
  pageId            String
  
  // SEO metrics
  organicImpressions Int     @default(0)
  organicClicks     Int     @default(0)
  organicCTR        Float   @default(0)
  averagePosition   Float   @default(0)
  
  // AI enhancement impact
  beforeEnhancement Json?   // Metrics before AI changes
  afterEnhancement  Json?   // Metrics after AI changes
  improvementScore  Float?  // Calculated improvement
  
  // Time period
  dateFrom          DateTime
  dateTo            DateTime
  
  // Relations
  recipeId          String?
  recipe            Recipe?  @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([pageUrl, dateFrom, dateTo])
  @@map("seo_performance")
}

// Add to existing Recipe model
model Recipe {
  // ... existing fields ...
  
  // SEO relations
  seoEnhancements   SEOEnhancement[]
  seoMetadata       SEOMetadata[]
  seoImageData      SEOImageData[]
  seoPerformance    SEOPerformance[]
  
  // AI processing status
  lastSEOAnalysis   DateTime?
  seoScore          Float?   // Overall SEO score 0-100
  aiEnhancementsCount Int   @default(0)
  
  // ... rest of existing fields ...
}
`;

export const databaseService = `
/**
 * Database service for SEO enhancements
 */

import { prisma } from '@/lib/prisma';
import { SEOEnhancement, MetadataSuggestion, ImageSEOSuggestion, InternalLinkSuggestion } from './seo-engine';

// const prisma = new PrismaClient(); // Removed to use singleton

export class SEODatabaseService {
  
  /**
   * Save AI-generated metadata suggestions
   */
  async saveMetadataSuggestion(
    recipeId: string,
    suggestion: MetadataSuggestion,
    confidence: number = 0.85
  ) {
    return await prisma.sEOEnhancement.create({
      data: {
        type: 'metadata',
        recipeId,
        confidence,
        suggestedContent: JSON.stringify(suggestion),
        reasoning: 'AI-generated SEO-optimized metadata for improved search visibility',
        keywords: suggestion.keywords,
        estimatedImpact: 'high'
      }
    });
  }

  /**
   * Save image SEO suggestions
   */
  async saveImageSEOSuggestion(
    recipeId: string,
    suggestion: ImageSEOSuggestion,
    imageContext: string,
    confidence: number = 0.8
  ) {
    // Save to SEOImageData table
    await prisma.sEOImageData.create({
      data: {
        imageUrl: suggestion.imageUrl,
        aiAltText: suggestion.altText,
        aiCaption: suggestion.caption,
        aiTitle: suggestion.title,
        aiStructuredData: suggestion.structuredData,
        pageType: 'recipe',
        pageId: recipeId,
        imageContext,
        recipeId
      }
    });

    // Also save as enhancement for review
    return await prisma.sEOEnhancement.create({
      data: {
        type: 'image',
        recipeId,
        confidence,
        suggestedContent: JSON.stringify(suggestion),
        reasoning: \`AI-generated image SEO optimization for \${imageContext} image\`,
        keywords: [],
        estimatedImpact: 'medium'
      }
    });
  }

  /**
   * Save internal link suggestions
   */
  async saveInternalLinkSuggestions(
    sourceRecipeId: string,
    suggestions: InternalLinkSuggestion[]
  ) {
    const savedLinks = [];

    for (const suggestion of suggestions) {
      // Save to SEOInternalLink table
      const link = await prisma.sEOInternalLink.create({
        data: {
          sourcePage: \`/recipes/\${sourceRecipeId}\`,
          sourcePageType: 'recipe',
          sourcePageId: sourceRecipeId,
          targetPage: suggestion.targetUrl,
          targetPageType: 'recipe',
          targetPageId: suggestion.targetUrl.split('/').pop() || '',
          targetPageTitle: suggestion.targetPageTitle,
          anchorText: suggestion.anchorText,
          contextBefore: suggestion.contextBefore,
          contextAfter: suggestion.contextAfter,
          linkType: suggestion.linkType,
          relevanceScore: suggestion.relevanceScore
        }
      });

      // Also save as enhancement
      await prisma.sEOEnhancement.create({
        data: {
          type: 'internal-link',
          recipeId: sourceRecipeId,
          confidence: suggestion.relevanceScore,
          suggestedContent: JSON.stringify(suggestion),
          reasoning: \`AI-suggested internal link to improve user experience and SEO\`,
          keywords: [suggestion.anchorText],
          estimatedImpact: suggestion.relevanceScore > 0.8 ? 'high' : 'medium'
        }
      });

      savedLinks.push(link);
    }

    return savedLinks;
  }

  /**
   * Get pending SEO enhancements for review
   */
  async getPendingEnhancements(recipeId?: string, type?: string) {
    return await prisma.sEOEnhancement.findMany({
      where: {
        status: 'pending',
        ...(recipeId && { recipeId }),
        ...(type && { type })
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: [
        { estimatedImpact: 'desc' },
        { confidence: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Approve and apply SEO enhancement
   */
  async approveEnhancement(enhancementId: string, adminId: string) {
    const enhancement = await prisma.sEOEnhancement.findUnique({
      where: { id: enhancementId },
      include: { recipe: true }
    });

    if (!enhancement) {
      throw new Error('Enhancement not found');
    }

    // Apply the enhancement based on type
    switch (enhancement.type) {
      case 'metadata':
        await this.applyMetadataEnhancement(enhancement);
        break;
      case 'image':
        await this.applyImageEnhancement(enhancement);
        break;
      case 'internal-link':
        await this.applyInternalLinkEnhancement(enhancement);
        break;
    }

    // Update enhancement status
    return await prisma.sEOEnhancement.update({
      where: { id: enhancementId },
      data: {
        status: 'applied',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        appliedBy: adminId,
        appliedAt: new Date()
      }
    });
  }

  /**
   * Reject SEO enhancement
   */
  async rejectEnhancement(enhancementId: string, adminId: string, reason?: string) {
    return await prisma.sEOEnhancement.update({
      where: { id: enhancementId },
      data: {
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reasoning: reason || enhancement.reasoning
      }
    });
  }

  /**
   * Get SEO performance metrics
   */
  async getSEOPerformance(recipeId?: string, dateFrom?: Date, dateTo?: Date) {
    return await prisma.sEOPerformance.findMany({
      where: {
        ...(recipeId && { recipeId }),
        ...(dateFrom && { dateFrom: { gte: dateFrom } }),
        ...(dateTo && { dateTo: { lte: dateTo } })
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Bulk approve enhancements
   */
  async bulkApproveEnhancements(enhancementIds: string[], adminId: string) {
    const results = [];

    for (const id of enhancementIds) {
      try {
        const result = await this.approveEnhancement(id, adminId);
        results.push({ id, status: 'approved', result });
      } catch (error) {
        results.push({ id, status: 'error', error: error.message });
      }
    }

    return results;
  }

  /**
   * Get SEO enhancement statistics
   */
  async getEnhancementStats() {
    const [total, pending, approved, applied, rejected] = await Promise.all([
      prisma.sEOEnhancement.count(),
      prisma.sEOEnhancement.count({ where: { status: 'pending' } }),
      prisma.sEOEnhancement.count({ where: { status: 'approved' } }),
      prisma.sEOEnhancement.count({ where: { status: 'applied' } }),
      prisma.sEOEnhancement.count({ where: { status: 'rejected' } })
    ]);

    const impactDistribution = await prisma.sEOEnhancement.groupBy({
      by: ['estimatedImpact'],
      _count: true
    });

    const typeDistribution = await prisma.sEOEnhancement.groupBy({
      by: ['type'],
      _count: true
    });

    return {
      total,
      statusDistribution: { pending, approved, applied, rejected },
      impactDistribution,
      typeDistribution
    };
  }

  // Private helper methods
  private async applyMetadataEnhancement(enhancement: any) {
    const metadata = JSON.parse(enhancement.suggestedContent);
    
    // Update the SEOMetadata table
    await prisma.sEOMetadata.upsert({
      where: { 
        slug: enhancement.recipe.slug 
      },
      update: {
        aiTitle: metadata.title,
        aiDescription: metadata.description,
        aiKeywords: metadata.keywords,
        aiOgTitle: metadata.ogTitle,
        aiOgDescription: metadata.ogDescription,
        aiTwitterTitle: metadata.twitterTitle,
        aiTwitterDescription: metadata.twitterDescription,
        lastApplied: new Date()
      },
      create: {
        pageType: 'recipe',
        pageId: enhancement.recipeId,
        slug: enhancement.recipe.slug,
        aiTitle: metadata.title,
        aiDescription: metadata.description,
        aiKeywords: metadata.keywords,
        aiOgTitle: metadata.ogTitle,
        aiOgDescription: metadata.ogDescription,
        aiTwitterTitle: metadata.twitterTitle,
        aiTwitterDescription: metadata.twitterDescription,
        recipeId: enhancement.recipeId,
        lastApplied: new Date()
      }
    });
  }

  private async applyImageEnhancement(enhancement: any) {
    const imageData = JSON.parse(enhancement.suggestedContent);
    
    await prisma.sEOImageData.update({
      where: { imageUrl: imageData.imageUrl },
      data: {
        currentAltText: imageData.altText,
        currentCaption: imageData.caption,
        currentTitle: imageData.title,
        lastApplied: new Date()
      }
    });
  }

  private async applyInternalLinkEnhancement(enhancement: any) {
    const linkData = JSON.parse(enhancement.suggestedContent);
    
    await prisma.sEOInternalLink.updateMany({
      where: {
        sourcePageId: enhancement.recipeId,
        anchorText: linkData.anchorText
      },
      data: {
        status: 'applied',
        appliedAt: new Date()
      }
    });
  }
}

export default SEODatabaseService;
`;

console.log('SEO Database schema and service created!');
console.log('To use this:');
console.log('1. Add the model definitions to your prisma/schema.prisma file');
console.log('2. Run: npx prisma generate && npx prisma db push');
console.log('3. Use SEODatabaseService to manage AI-generated SEO content');