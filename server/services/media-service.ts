import { PrismaClient, Media } from '@prisma/client';
import { AppError } from '../middleware/error-handler';
import { prisma } from '../../lib/prisma';

export interface CreateMediaInput {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  category: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  recipeId?: string;
  authorId?: string;
  categoryId?: string;
  uploadedBy: string;
}

export interface UpdateMediaInput {
  alt?: string;
  caption?: string;
  tags?: string[];
}

export interface MediaFilters {
  category?: string;
  recipeId?: string;
  authorId?: string;
  categoryId?: string;
  mimeType?: string;
  uploadedBy?: string;
}

export class MediaService {
  /**
   * Create new media record
   */
  static async create(input: CreateMediaInput): Promise<Media> {
    try {
      const media = await prisma.media.create({
        data: {
          ...input,
          uploadedAt: new Date(),
        },
      });
      return media;
    } catch (error) {
      console.error('Create media error:', error);
      throw new AppError('Failed to create media record', 500);
    }
  }

  /**
   * Get media by ID
   */
  static async getById(id: string): Promise<Media | null> {
    try {
      const media = await prisma.media.findUnique({
        where: { id, deletedAt: null },
      });
      return media;
    } catch (error) {
      console.error('Get media error:', error);
      throw new AppError('Failed to get media', 500);
    }
  }

  /**
   * List media with filters and pagination
   */
  static async list(
    filters: MediaFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{ media: Media[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (filters.category) where.category = filters.category;
      if (filters.recipeId) where.recipeId = filters.recipeId;
      if (filters.authorId) where.authorId = filters.authorId;
      if (filters.categoryId) where.categoryId = filters.categoryId;
      if (filters.mimeType) where.mimeType = filters.mimeType;
      if (filters.uploadedBy) where.uploadedBy = filters.uploadedBy;

      const [media, total] = await Promise.all([
        prisma.media.findMany({
          where,
          skip,
          take: limit,
          orderBy: { uploadedAt: 'desc' },
        }),
        prisma.media.count({ where }),
      ]);

      return {
        media,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('List media error:', error);
      throw new AppError('Failed to list media', 500);
    }
  }

  /**
   * Search media by filename or tags
   */
  static async search(
    query: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ media: Media[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const where = {
        deletedAt: null,
        OR: [
          { filename: { contains: query, mode: 'insensitive' as const } },
          { originalName: { contains: query, mode: 'insensitive' as const } },
          { alt: { contains: query, mode: 'insensitive' as const } },
          { caption: { contains: query, mode: 'insensitive' as const } },
          { tags: { has: query } },
        ],
      };

      const [media, total] = await Promise.all([
        prisma.media.findMany({
          where,
          skip,
          take: limit,
          orderBy: { uploadedAt: 'desc' },
        }),
        prisma.media.count({ where }),
      ]);

      return {
        media,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Search media error:', error);
      throw new AppError('Failed to search media', 500);
    }
  }

  /**
   * Update media metadata
   */
  static async update(id: string, input: UpdateMediaInput): Promise<Media> {
    try {
      const media = await prisma.media.update({
        where: { id },
        data: input,
      });
      return media;
    } catch (error) {
      console.error('Update media error:', error);
      throw new AppError('Failed to update media', 500);
    }
  }

  /**
   * Soft delete media
   */
  static async delete(id: string): Promise<Media> {
    try {
      const media = await prisma.media.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return media;
    } catch (error) {
      console.error('Delete media error:', error);
      throw new AppError('Failed to delete media', 500);
    }
  }

  /**
   * Get storage statistics
   */
  static async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: { category: string; count: number; size: number }[];
  }> {
    try {
      const [totalFiles, aggregates, byCategory] = await Promise.all([
        prisma.media.count({ where: { deletedAt: null } }),
        prisma.media.aggregate({
          where: { deletedAt: null },
          _sum: { size: true },
        }),
        prisma.media.groupBy({
          by: ['category'],
          where: { deletedAt: null },
          _count: true,
          _sum: { size: true },
        }),
      ]);

      return {
        totalFiles,
        totalSize: aggregates._sum.size || 0,
        byCategory: byCategory.map((cat) => ({
          category: cat.category,
          count: cat._count,
          size: cat._sum.size || 0,
        })),
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new AppError('Failed to get statistics', 500);
    }
  }

  /**
   * Check if file already exists (prevent duplicates)
   */
  static async exists(category: string, filename: string): Promise<boolean> {
    try {
      const count = await prisma.media.count({
        where: {
          category,
          filename,
          deletedAt: null,
        },
      });
      return count > 0;
    } catch (error) {
      console.error('Check exists error:', error);
      return false;
    }
  }
}
