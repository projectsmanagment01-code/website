import express, { Request, Response } from 'express';
import path from 'path';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/error-handler';
import { upload, uploadMultiple, generateSafeFilename, getUploadPath } from '../config/multer';
import { ImageProcessor } from '../services/image-processor';
import { MediaService } from '../services/media-service';

const router = express.Router();

/**
 * POST /api/media/upload
 * Upload single file
 */
router.post(
  '/upload',
  authMiddleware,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    const { category = 'general', alt, caption, tags } = req.body;
    const userId = req.user?.userId || 'system';

    // Generate safe filename
    const safeFilename = generateSafeFilename(req.file.originalname, category);
    const filePath = getUploadPath(category, safeFilename);

    // Process image with Sharp
    const processed = await ImageProcessor.process(req.file.buffer, {
      format: 'webp',
      quality: 85,
      generateThumbnail: true,
    });

    // Save to disk
    const { path: savedPath, thumbnailPath } = await ImageProcessor.saveToDisk(
      processed.buffer,
      filePath,
      processed.thumbnailBuffer
    );

    // Create database record
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const media = await MediaService.create({
      filename: safeFilename,
      originalName: req.file.originalname,
      path: savedPath,
      url: `${baseUrl}/uploads/${category}/${safeFilename}`,
      category,
      mimeType: req.file.mimetype,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      thumbnailUrl: thumbnailPath
        ? `${baseUrl}/uploads/${category}/${path.basename(thumbnailPath)}`
        : undefined,
      alt,
      caption,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
      uploadedBy: userId,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: media,
    });
  })
);

/**
 * POST /api/media/upload/bulk
 * Upload multiple files
 */
router.post(
  '/upload/bulk',
  authMiddleware,
  uploadMultiple.array('files', 10),
  asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new AppError('No files provided', 400);
    }

    const { category = 'general' } = req.body;
    const userId = req.user?.userId || 'system';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const safeFilename = generateSafeFilename(file.originalname, category);
        const filePath = getUploadPath(category, safeFilename);

        const processed = await ImageProcessor.process(file.buffer, {
          format: 'webp',
          quality: 85,
          generateThumbnail: true,
        });

        const { path: savedPath, thumbnailPath } = await ImageProcessor.saveToDisk(
          processed.buffer,
          filePath,
          processed.thumbnailBuffer
        );

        return await MediaService.create({
          filename: safeFilename,
          originalName: file.originalname,
          path: savedPath,
          url: `${baseUrl}/uploads/${category}/${safeFilename}`,
          category,
          mimeType: file.mimetype,
          size: processed.size,
          width: processed.width,
          height: processed.height,
          thumbnailUrl: thumbnailPath
            ? `${baseUrl}/uploads/${category}/${path.basename(thumbnailPath)}`
            : undefined,
          uploadedBy: userId,
        });
      })
    );

    const successful = results
      .filter((r) => r.status === 'fulfilled')
      .map((r: any) => r.value);
    
    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r: any) => r.reason?.message || 'Unknown error');

    res.status(201).json({
      success: true,
      message: `Uploaded ${successful.length} of ${files.length} files`,
      data: {
        successful,
        failed,
        total: files.length,
      },
    });
  })
);

/**
 * GET /api/media
 * List all media with filters
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      category,
      recipeId,
      authorId,
      categoryId,
      page = '1',
      limit = '50',
    } = req.query;

    const result = await MediaService.list(
      {
        category: category as string,
        recipeId: recipeId as string,
        authorId: authorId as string,
        categoryId: categoryId as string,
      },
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/media/search/:query
 * Search media
 */
router.get(
  '/search/:query',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { query } = req.params;
    const { page = '1', limit = '50' } = req.query;

    const result = await MediaService.search(
      query,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: result,
    });
  })
);

/**
 * GET /api/media/stats
 * Get storage statistics
 */
router.get(
  '/stats',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await MediaService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  })
);

/**
 * GET /api/media/:id
 * Get single media by ID
 */
router.get(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const media = await MediaService.getById(id);

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    res.json({
      success: true,
      data: media,
    });
  })
);

/**
 * PATCH /api/media/:id
 * Update media metadata
 */
router.patch(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { alt, caption, tags } = req.body;

    const media = await MediaService.update(id, {
      alt,
      caption,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : undefined,
    });

    res.json({
      success: true,
      message: 'Media updated successfully',
      data: media,
    });
  })
);

/**
 * DELETE /api/media/:id
 * Soft delete media
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get media to delete file from disk
    const media = await MediaService.getById(id);
    if (!media) {
      throw new AppError('Media not found', 404);
    }

    // Delete from database (soft delete)
    await MediaService.delete(id);

    // Delete from disk
    try {
      await ImageProcessor.deleteFromDisk(media.path);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
      // Continue even if file deletion fails
    }

    res.json({
      success: true,
      message: 'Media deleted successfully',
    });
  })
);

export default router;
