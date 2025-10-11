/**
 * Author Service
 * 
 * Business logic for Author CRUD operations
 * Following project context and admin authentication patterns
 */

import { prisma } from './prisma';
import { AuthorEntity } from '@/outils/types';
import { generateAuthorSlug } from './author-integration';

export interface CreateAuthorData {
  name: string;
  bio?: string;
  img?: string;
  avatar?: string;
  link?: string;
}

export interface UpdateAuthorData {
  name?: string;
  bio?: string;
  img?: string;
  avatar?: string;
  link?: string;
}

/**
 * Get an author by their slug
 */
export async function getAuthorBySlug(slug: string): Promise<AuthorEntity | null> {
  try {
    const author = await prisma.author.findUnique({
      where: { slug }
    });
    
    return author;
  } catch (error) {
    console.error('[Author Service] Error getting author by slug:', error);
    return null;
  }
}

/**
 * Create a new author
 */
export async function createAuthor(data: CreateAuthorData): Promise<AuthorEntity> {
  // Generate slug from name
  let slug = generateAuthorSlug(data.name);
  
  // Ensure slug is unique
  let counter = 1;
  let uniqueSlug = slug;
  
  while (await prisma.author.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  try {
    // If img is provided but avatar is not, use img path as avatar
    const avatarValue = data.avatar || (data.img ? data.img : null);
    
    const author = await prisma.author.create({
      data: {
        name: data.name,
        bio: data.bio || null,
        img: data.img || null,
        avatar: avatarValue,
        slug: uniqueSlug,
        link: data.link || `/authors/${uniqueSlug}`
      }
    });

    return {
      id: author.id,
      name: author.name,
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt
    };
  } catch (error) {
    console.error('❌ Error creating author:', error);
    throw new Error(`Failed to create author: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all authors with pagination
 */
export async function getAuthors(page: number = 1, limit: number = 20): Promise<{
  authors: (AuthorEntity & { recipeCount: number })[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const skip = (page - 1) * limit;
    
    const [authors, total] = await Promise.all([
      prisma.author.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { recipes: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.author.count()
    ]);

    const authorEntities = authors.map(author => ({
      id: author.id,
      name: author.name,
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      recipeCount: author._count.recipes
    }));

    return {
      authors: authorEntities,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error getting authors:', error);
    throw new Error(`Failed to get authors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all authors (without pagination) for static generation
 */
export async function getAllAuthors(): Promise<AuthorEntity[]> {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return authors.map(author => ({
      id: author.id,
      name: author.name,
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt
    }));
  } catch (error) {
    console.error('❌ Error getting all authors:', error);
    throw new Error(`Failed to get all authors: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get author by ID
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
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
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
 * Update author
 */
export async function updateAuthor(id: string, data: UpdateAuthorData): Promise<AuthorEntity | null> {
  try {
    // If name is being updated, generate new slug
    let updateData: any = { ...data };
    
    if (data.name) {
      let slug = generateAuthorSlug(data.name);
      
      // Ensure slug is unique (excluding current author)
      let counter = 1;
      let uniqueSlug = slug;
      
      while (true) {
        const existing = await prisma.author.findUnique({ 
          where: { slug: uniqueSlug } 
        });
        
        if (!existing || existing.id === id) break;
        
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
      
      updateData.slug = uniqueSlug;
      
      // Update link if not provided
      if (!data.link) {
        updateData.link = `/authors/${uniqueSlug}`;
      }
    }

    const author = await prisma.author.update({
      where: { id },
      data: updateData
    });

    return {
      id: author.id,
      name: author.name,
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt
    };
  } catch (error) {
    console.error('❌ Error updating author:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return null;
    }
    
    throw new Error(`Failed to update author: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete author
 */
export async function deleteAuthor(id: string): Promise<boolean> {
  try {
    // First check if author has any recipes
    const recipeCount = await prisma.recipe.count({
      where: { authorId: id }
    });

    if (recipeCount > 0) {
      // Set authorId to null for all recipes by this author
      await prisma.recipe.updateMany({
        where: { authorId: id },
        data: { authorId: null }
      });
      
      console.log(`🔄 Removed author relationship from ${recipeCount} recipes`);
    }

    // Delete the author
    await prisma.author.delete({
      where: { id }
    });

    console.log(`✅ Author deleted successfully (${recipeCount} recipes updated)`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting author:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return false;
    }
    
    throw new Error(`Failed to delete author: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get authors with search
 */
export async function searchAuthors(query: string, limit: number = 10): Promise<(AuthorEntity & { recipeCount: number })[]> {
  try {
    const authors = await prisma.author.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: { recipes: true }
        }
      },
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });

    return authors.map(author => ({
      id: author.id,
      name: author.name,
      bio: author.bio,
      img: author.img,
      avatar: author.avatar,
      slug: author.slug,
      link: author.link,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
      recipeCount: author._count.recipes
    }));
  } catch (error) {
    console.error('❌ Error searching authors:', error);
    return [];
  }
}

/**
 * Get author statistics
 */
export async function getAuthorStats(): Promise<{
  totalAuthors: number;
  authorsWithRecipes: number;
  authorsWithoutRecipes: number;
  averageRecipesPerAuthor: number;
}> {
  try {
    const [totalAuthors, authorsWithRecipeCounts] = await Promise.all([
      prisma.author.count(),
      prisma.author.findMany({
        include: {
          _count: {
            select: { recipes: true }
          }
        }
      })
    ]);

    const authorsWithRecipes = authorsWithRecipeCounts.filter(a => a._count.recipes > 0).length;
    const authorsWithoutRecipes = totalAuthors - authorsWithRecipes;
    const totalRecipes = authorsWithRecipeCounts.reduce((sum, a) => sum + a._count.recipes, 0);
    const averageRecipesPerAuthor = totalAuthors > 0 ? Math.round((totalRecipes / totalAuthors) * 10) / 10 : 0;

    return {
      totalAuthors,
      authorsWithRecipes,
      authorsWithoutRecipes,
      averageRecipesPerAuthor
    };
  } catch (error) {
    console.error('❌ Error getting author stats:', error);
    return {
      totalAuthors: 0,
      authorsWithRecipes: 0,
      authorsWithoutRecipes: 0,
      averageRecipesPerAuthor: 0
    };
  }
}