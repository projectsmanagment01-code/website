/**
 * Author Integration Service
 * 
 * Handles n8n JSON integration and automatic author creation/matching
 * Following the author-system.md specifications
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { Author, AuthorEntity } from '@/outils/types';

/**
 * Generate a URL-friendly slug from author name
 */
export function generateAuthorSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .trim()
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Process recipe author from n8n JSON import
 * Automatically creates author if doesn't exist, or finds existing one
 * 
 * @param authorData - Author JSON data from n8n recipe import
 * @returns Author ID for database relationship
 */
export async function processRecipeAuthor(authorData: Author): Promise<string> {
  if (!authorData || !authorData.name) {
    throw new Error('Author data is required with at least a name field');
  }

  const slug = generateAuthorSlug(authorData.name);

  try {
    // Try to find existing author by multiple criteria
    let author = await prisma.author.findFirst({
      where: {
        OR: [
          { name: { equals: authorData.name, mode: 'insensitive' } },
          { slug: slug },
          ...(authorData.avatar ? [{ avatar: authorData.avatar }] : [])
        ]
      }
    });

    // Create new author if doesn't exist
    if (!author) {
      console.log(`📝 Creating new author: ${authorData.name}`);
      
      author = await prisma.author.create({
        data: {
          name: authorData.name,
          bio: authorData.bio || null,
          avatar: authorData.avatar || null,
          slug: slug,
          link: authorData.link || `/authors/${slug}`
        }
      });

      console.log(`✅ Author created with ID: ${author.id}`);
    } else {
      console.log(`🔍 Found existing author: ${author.name} (ID: ${author.id})`);
      
      // Update author info if we have newer data
      const updateData: any = {};
      let shouldUpdate = false;

      if (authorData.bio && authorData.bio !== author.bio) {
        updateData.bio = authorData.bio;
        shouldUpdate = true;
      }

      if (authorData.avatar && authorData.avatar !== author.avatar) {
        updateData.avatar = authorData.avatar;
        shouldUpdate = true;
      }

      if (authorData.link && authorData.link !== author.link) {
        updateData.link = authorData.link;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        updateData.updatedAt = new Date();
        author = await prisma.author.update({
          where: { id: author.id },
          data: updateData
        });
        console.log(`🔄 Updated author: ${author.name}`);
      }
    }

    return author.id;
  } catch (error) {
    console.error('❌ Error processing recipe author:', error);
    throw new Error(`Failed to process author: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get author by ID with recipe count
 */
export async function getAuthorById(id: string): Promise<(AuthorEntity & { recipeCount: number }) | null> {
  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    if (!author) return null;

    return {
      id: author.id,
      name: author.name,
      bio: author.bio ?? undefined,
      img: author.img ?? undefined,
      avatar: author.avatar ?? undefined,
      slug: author.slug,
      link: author.link ?? undefined,
      tags: author.tags,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      recipeCount: author._count.recipes
    };
  } catch (error) {
    console.error('❌ Error getting author by ID:', error);
    return null;
  }
}

/**
 * Get author by slug with recipe count
 */
export async function getAuthorBySlug(slug: string): Promise<(AuthorEntity & { recipeCount: number }) | null> {
  try {
    const author = await prisma.author.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    });

    if (!author) return null;

    return {
      id: author.id,
      name: author.name,
      bio: author.bio ?? undefined,
      img: author.img ?? undefined,
      avatar: author.avatar ?? undefined,
      slug: author.slug,
      link: author.link ?? undefined,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      recipeCount: author._count.recipes
    };
  } catch (error) {
    console.error('❌ Error getting author by slug:', error);
    return null;
  }
}

/**
 * Get all authors with recipe counts
 */
export async function getAllAuthors(): Promise<(AuthorEntity & { recipeCount: number })[]> {
  try {
    const authors = await prisma.author.findMany({
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return authors.map(author => ({
      id: author.id,
      name: author.name,
      bio: author.bio ?? undefined,
      img: author.img ?? undefined,
      avatar: author.avatar ?? undefined,
      slug: author.slug,
      link: author.link ?? undefined,
      tags: author.tags,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      recipeCount: author._count.recipes
    }));
  } catch (error) {
    console.error('❌ Error getting all authors:', error);
    return [];
  }
}

/**
 * Convert AuthorEntity to Author JSON format (for recipe display)
 */
export function authorEntityToJson(authorEntity: AuthorEntity): Author {
  return {
    name: authorEntity.name,
    link: authorEntity.link || `/authors/${authorEntity.slug}`,
    avatar: authorEntity.avatar || authorEntity.img || '',
    bio: authorEntity.bio || ''
  };
}

/**
 * Migrate existing recipe authors from JSON to Author relationships
 * This function helps migrate legacy data
 */
export async function migrateExistingAuthors() {
  console.log('🚀 Starting author migration...');
  
  try {
    // Get all recipes with author JSON data
    const recipes = await prisma.recipe.findMany({
      where: {
        authorId: null, // Only process recipes without author relationships
        author: {
          not: Prisma.JsonNull
        }
      }
    });

    console.log(`📊 Found ${recipes.length} recipes to migrate`);

    for (const recipe of recipes) {
      try {
        const authorJson = recipe.author as any;
        
        if (authorJson && authorJson.name) {
          console.log(`🔄 Processing recipe: ${recipe.title}`);
          
          const authorId = await processRecipeAuthor(authorJson);
          
          // Update recipe with author relationship
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { authorId }
          });
          
          console.log(`✅ Updated recipe "${recipe.title}" with author ID: ${authorId}`);
        }
      } catch (error) {
        console.error(`❌ Error migrating recipe "${recipe.title}":`, error);
      }
    }
    
    console.log('🎉 Author migration completed!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}