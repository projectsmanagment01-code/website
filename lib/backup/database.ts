import { prisma } from '@/lib/prisma';
import fs from 'fs-extra';
import path from 'path';
import { BackupError } from './types';
import { PrismaClient } from '@prisma/client';

/**
 * Database backup and restore service
 */
export class DatabaseBackupService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Export all database content to JSON
   */
  async exportDatabase(options?: { includeConfiguration?: boolean }): Promise<{
    recipes: any[];
    authors: any[];
    categories: any[];
    settings: any[];
    adminSettings: any[];
    siteConfig: any[];
    pageContent: any[];
    apiTokens: any[];
    media: any[];
    summary: {
      recipes: number;
      authors: number;
      categories: number;
      settings: number;
      adminSettings: number;
      siteConfig: number;
      pageContent: number;
      apiTokens: number;
      media: number;
    };
  }> {
    try {
      const includeConfiguration = options?.includeConfiguration ?? true; // Default to true for backward compatibility
      console.log('📊 Exporting database content...');
      console.log(`⚙️ Configuration data: ${includeConfiguration ? 'INCLUDED' : 'EXCLUDED'}`);

      // Export recipes with all relationships
      const recipes = await this.prisma.recipe.findMany();

      // Export authors
      const authors = await this.prisma.author.findMany();

      // Export categories (new system)
      let categories: any[] = [];
      try {
        categories = await this.prisma.category.findMany();
        console.log(`📂 Found ${categories.length} categories to backup`);
      } catch (error) {
        console.log('⚠️ No categories table found or error accessing it, skipping...', error);
        categories = [];
      }

      // Export admin settings (CONFIGURATION DATA)
      let adminSettings: any[] = [];
      if (includeConfiguration) {
        try {
          adminSettings = await this.prisma.adminSettings.findMany();
          console.log(`⚙️ Found ${adminSettings.length} admin settings to backup`);
        } catch (error) {
          console.log('⚠️ No admin settings found, skipping...');
          adminSettings = [];
        }
      } else {
        console.log('⏭️ Skipping admin settings (configuration disabled)');
      }

      // Export site config (hero, logo, site info, social links, etc.)
      let siteConfig: any[] = [];
      if (includeConfiguration) {
        try {
          siteConfig = await this.prisma.siteConfig.findMany();
          console.log(`🌐 Found ${siteConfig.length} site config entries to backup`);
          siteConfig.forEach(config => {
            console.log(`  - ${config.key}: ${JSON.stringify(config.data).substring(0, 100)}...`);
          });
        } catch (error) {
          console.log('⚠️ No site config found, skipping...');
          siteConfig = [];
        }
      } else {
        console.log('⏭️ Skipping site config (configuration disabled)');
      }

      // Export page content (disclaimer, terms, FAQs, about, contact, etc.)
      let pageContent: any[] = [];
      if (includeConfiguration) {
        try {
          pageContent = await this.prisma.pageContent.findMany();
          console.log(`📄 Found ${pageContent.length} page content entries to backup`);
          pageContent.forEach(page => {
            console.log(`  - ${page.page}: ${page.title || 'No title'}`);
          });
        } catch (error) {
          console.log('⚠️ No page content found, skipping...');
          pageContent = [];
        }
      } else {
        console.log('⏭️ Skipping page content (configuration disabled)');
      }

      // Export API tokens (without sensitive data)
      let apiTokens: any[] = [];
      try {
        apiTokens = await this.prisma.apiToken.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            expiresAt: true,
            isActive: true,
            lastUsedAt: true,
            createdBy: true,
            description: true,
            // Exclude the actual token for security
          }
        });
        console.log(`🔑 Found ${apiTokens.length} API tokens to backup (without sensitive data)`);
      } catch (error) {
        console.log('⚠️ No API tokens found, skipping...');
        apiTokens = [];
      }

      // Export media metadata (file references)
      let media: any[] = [];
      try {
        media = await this.prisma.media.findMany();
        console.log(`🖼️ Found ${media.length} media entries to backup`);
      } catch (error) {
        console.log('⚠️ No media table found, skipping...');
        media = [];
      }

      // Export legacy settings (if exists)
      let settings: any[] = [];
      try {
        // Check if legacy settings table exists
        const settingsCheck = await this.prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'settings'`;
        if (Array.isArray(settingsCheck) && settingsCheck.length > 0) {
          settings = await this.prisma.$queryRaw`SELECT * FROM settings`;
        }
      } catch (error) {
        console.log('⚠️ No legacy settings table found, skipping...');
        settings = [];
      }

      const summary = {
        recipes: recipes.length,
        authors: authors.length,
        categories: categories.length,
        settings: Array.isArray(settings) ? settings.length : 0,
        adminSettings: adminSettings.length,
        siteConfig: siteConfig.length,
        pageContent: pageContent.length,
        apiTokens: apiTokens.length,
        media: media.length,
      };

      console.log(`✅ Database export completed:`, summary);

      return {
        recipes,
        authors,
        categories,
        settings: Array.isArray(settings) ? settings : [],
        adminSettings,
        siteConfig,
        pageContent,
        apiTokens,
        media,
        summary,
      };
    } catch (error) {
      throw new BackupError(
        'Database export failed',
        'DATABASE_EXPORT_ERROR',
        error
      );
    }
  }

  /**
   * Save database export to JSON file
   */
  async saveDatabaseToFile(
    data: any,
    filePath: string
  ): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, data, { spaces: 2 });
      console.log(`✅ Database saved to: ${filePath}`);
    } catch (error) {
      throw new BackupError(
        'Failed to save database file',
        'DATABASE_SAVE_ERROR',
        error
      );
    }
  }

  /**
   * Load database data from JSON file
   */
  async loadDatabaseFromFile(filePath: string): Promise<any> {
    try {
      if (!await fs.pathExists(filePath)) {
        throw new BackupError(
          'Database file not found',
          'DATABASE_FILE_NOT_FOUND'
        );
      }

      const data = await fs.readJson(filePath);
      console.log(`✅ Database loaded from: ${filePath}`);
      return data;
    } catch (error) {
      if (error instanceof BackupError) throw error;
      throw new BackupError(
        'Failed to load database file',
        'DATABASE_LOAD_ERROR',
        error
      );
    }
  }

  /**
   * Restore database content from backup data
   */
  async restoreDatabase(data: {
    recipes: any[];
    authors: any[];
    categories?: any[];
    settings?: any[];
    adminSettings?: any[];
    siteConfig?: any[];
    pageContent?: any[];
    apiTokens?: any[];
    media?: any[];
  }, options: Partial<{ cleanExisting: boolean; includeConfiguration: boolean }> = {}): Promise<void> {
    try {
      const includeConfiguration = options.includeConfiguration ?? true; // Default to true
      console.log('📥 Starting database restoration...');
      console.log(`⚙️ Configuration data: ${includeConfiguration ? 'WILL BE RESTORED' : 'WILL BE SKIPPED'}`);
      console.log('📊 Data to restore:', {
        recipes: data.recipes?.length || 0,
        authors: data.authors?.length || 0,
        categories: data.categories?.length || 0,
        settings: data.settings?.length || 0,
        adminSettings: includeConfiguration ? (data.adminSettings?.length || 0) : 0,
        siteConfig: includeConfiguration ? (data.siteConfig?.length || 0) : 0,
        pageContent: includeConfiguration ? (data.pageContent?.length || 0) : 0,
        apiTokens: data.apiTokens?.length || 0,
        media: data.media?.length || 0,
      });

      // Start transaction for atomic restoration
      await this.prisma.$transaction(async (tx: any) => {
        if (options.cleanExisting) {
          console.log('🗑️ Cleaning existing data...');
          
          // Delete in correct order to handle foreign keys
          await tx.recipe.deleteMany();
          console.log('  ✓ Recipes cleaned');
          
          await tx.author.deleteMany();
          console.log('  ✓ Authors cleaned');
          
          // Clean categories if they exist
          try {
            await tx.category.deleteMany();
            console.log('  ✓ Categories cleaned');
          } catch (error) {
            console.log('  ⚠️ Categories table not found or already empty');
          }

          // Clean configuration tables ONLY if includeConfiguration is true
          if (includeConfiguration) {
            console.log('  🗑️ Cleaning configuration data (includeConfiguration is enabled)...');
            
            try {
              await tx.adminSettings.deleteMany();
              console.log('  ✓ Admin settings cleaned');
            } catch (error) {
              console.log('  ⚠️ AdminSettings table not found or already empty');
            }

            try {
              await tx.siteConfig.deleteMany();
              console.log('  ✓ Site config cleaned');
            } catch (error) {
              console.log('  ⚠️ SiteConfig table not found or already empty');
            }

            try {
              await tx.pageContent.deleteMany();
              console.log('  ✓ Page content cleaned');
            } catch (error) {
              console.log('  ⚠️ PageContent table not found or already empty');
            }

            try {
              await tx.media.deleteMany();
              console.log('  ✓ Media metadata cleaned');
            } catch (error) {
              console.log('  ⚠️ Media table not found or already empty');
            }
          } else {
            console.log('  ⏭️ Preserving existing configuration data (includeConfiguration is disabled)');
          }
          
          console.log('✅ Existing data cleaned');
        }

        // Restore categories first (recipes may depend on them)
        if (data.categories && data.categories.length > 0) {
          console.log(`📂 Restoring ${data.categories.length} categories...`);
          
          for (const category of data.categories) {
            try {
              await tx.category.upsert({
                where: { id: category.id },
                update: {
                  name: category.name,
                  slug: category.slug,
                  description: category.description,
                  image: category.image,
                  icon: category.icon,
                  color: category.color,
                  order: category.order || 0,
                  isActive: category.isActive !== undefined ? category.isActive : true,
                  metaTitle: category.metaTitle,
                  metaDescription: category.metaDescription,
                },
                create: {
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                  description: category.description,
                  image: category.image,
                  icon: category.icon,
                  color: category.color,
                  order: category.order || 0,
                  isActive: category.isActive !== undefined ? category.isActive : true,
                  metaTitle: category.metaTitle,
                  metaDescription: category.metaDescription,
                  createdAt: category.createdAt ? new Date(category.createdAt) : new Date(),
                  updatedAt: category.updatedAt ? new Date(category.updatedAt) : new Date(),
                },
              });
            } catch (error) {
              console.error(`Failed to restore category ${category.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Categories restored');
        }

        // Restore authors (recipes may depend on authors)
        if (data.authors && data.authors.length > 0) {
          console.log(`👥 Restoring ${data.authors.length} authors...`);
          
          for (const author of data.authors) {
            try {
              await tx.author.upsert({
                where: { id: author.id },
                update: {
                  name: author.name,
                  bio: author.bio,
                  img: author.img,
                  avatar: author.avatar,
                  slug: author.slug,
                  link: author.link,
                  tags: author.tags || [],
                },
                create: {
                  id: author.id,
                  name: author.name,
                  bio: author.bio,
                  img: author.img,
                  avatar: author.avatar,
                  slug: author.slug,
                  link: author.link,
                  tags: author.tags || [],
                  createdAt: author.createdAt ? new Date(author.createdAt) : new Date(),
                  updatedAt: author.updatedAt ? new Date(author.updatedAt) : new Date(),
                },
              });
            } catch (error) {
              console.error(`Failed to restore author ${author.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Authors restored');
        }

        // Restore recipes
        if (data.recipes && data.recipes.length > 0) {
          console.log(`📖 Restoring ${data.recipes.length} recipes...`);
          
          for (const recipe of data.recipes) {
            try {
              await tx.recipe.upsert({
                where: { id: recipe.id },
                update: {
                  ...recipe,
                  createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date(),
                  updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date(),
                  lastViewedAt: recipe.lastViewedAt ? new Date(recipe.lastViewedAt) : null,
                },
                create: {
                  ...recipe,
                  id: recipe.id,
                  createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date(),
                  updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date(),
                  lastViewedAt: recipe.lastViewedAt ? new Date(recipe.lastViewedAt) : null,
                },
              });
            } catch (error) {
              console.error(`Failed to restore recipe ${recipe.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Recipes restored');
        }

        // Restore admin settings (CONFIGURATION DATA)
        if (includeConfiguration && data.adminSettings && data.adminSettings.length > 0) {
          console.log(`⚙️ Restoring ${data.adminSettings.length} admin settings...`);
          
          for (const setting of data.adminSettings) {
            try {
              await tx.adminSettings.upsert({
                where: { id: setting.id },
                update: {
                  key: setting.key,
                  value: setting.value,
                  updatedBy: setting.updatedBy,
                },
                create: {
                  id: setting.id,
                  key: setting.key,
                  value: setting.value,
                  updatedAt: setting.updatedAt ? new Date(setting.updatedAt) : new Date(),
                  updatedBy: setting.updatedBy,
                },
              });
            } catch (error) {
              console.error(`Failed to restore admin setting ${setting.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Admin settings restored');
        } else if (!includeConfiguration) {
          console.log('⏭️ Skipping admin settings (configuration restore disabled)');
        }

        // Restore site config (hero, logo, site info, social links)
        if (includeConfiguration && data.siteConfig && data.siteConfig.length > 0) {
          console.log(`🌐 Restoring ${data.siteConfig.length} site config entries...`);
          
          for (const config of data.siteConfig) {
            try {
              console.log(`  - Restoring config: ${config.key}`);
              await tx.siteConfig.upsert({
                where: { id: config.id },
                update: {
                  key: config.key,
                  data: config.data,
                  updatedBy: config.updatedBy,
                },
                create: {
                  id: config.id,
                  key: config.key,
                  data: config.data,
                  updatedAt: config.updatedAt ? new Date(config.updatedAt) : new Date(),
                  updatedBy: config.updatedBy,
                },
              });
            } catch (error) {
              console.error(`Failed to restore site config ${config.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Site config restored (hero, logo, site settings)');
        } else if (!includeConfiguration) {
          console.log('⏭️ Skipping site config (configuration restore disabled)');
        }

        // Restore page content (disclaimer, terms, FAQs, about, contact, etc.)
        if (includeConfiguration && data.pageContent && data.pageContent.length > 0) {
          console.log(`📄 Restoring ${data.pageContent.length} page content entries...`);
          
          for (const page of data.pageContent) {
            try {
              console.log(`  - Restoring page: ${page.page}`);
              await tx.pageContent.upsert({
                where: { id: page.id },
                update: {
                  page: page.page,
                  title: page.title,
                  heroTitle: page.heroTitle,
                  heroDescription: page.heroDescription,
                  heroIntro: page.heroIntro,
                  content: page.content,
                  metaTitle: page.metaTitle,
                  metaDescription: page.metaDescription,
                  data: page.data,
                  updatedBy: page.updatedBy,
                },
                create: {
                  id: page.id,
                  page: page.page,
                  title: page.title,
                  heroTitle: page.heroTitle,
                  heroDescription: page.heroDescription,
                  heroIntro: page.heroIntro,
                  content: page.content,
                  metaTitle: page.metaTitle,
                  metaDescription: page.metaDescription,
                  data: page.data,
                  createdAt: page.createdAt ? new Date(page.createdAt) : new Date(),
                  updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
                  updatedBy: page.updatedBy,
                },
              });
            } catch (error) {
              console.error(`Failed to restore page content ${page.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Page content restored (disclaimer, terms, FAQs, etc.)');
        } else if (!includeConfiguration) {
          console.log('⏭️ Skipping page content (configuration restore disabled)');
        }

        // Restore media metadata
        if (data.media && data.media.length > 0) {
          console.log(`🖼️ Restoring ${data.media.length} media entries...`);
          
          for (const media of data.media) {
            try {
              await tx.media.upsert({
                where: { id: media.id },
                update: {
                  filename: media.filename,
                  originalName: media.originalName,
                  path: media.path,
                  url: media.url,
                  category: media.category,
                  mimeType: media.mimeType,
                  size: media.size,
                  width: media.width,
                  height: media.height,
                  thumbnailUrl: media.thumbnailUrl,
                  alt: media.alt,
                  caption: media.caption,
                  tags: media.tags || [],
                  recipeId: media.recipeId,
                  authorId: media.authorId,
                  categoryId: media.categoryId,
                  uploadedBy: media.uploadedBy,
                  deletedAt: media.deletedAt ? new Date(media.deletedAt) : null,
                },
                create: {
                  id: media.id,
                  filename: media.filename,
                  originalName: media.originalName,
                  path: media.path,
                  url: media.url,
                  category: media.category,
                  mimeType: media.mimeType,
                  size: media.size,
                  width: media.width,
                  height: media.height,
                  thumbnailUrl: media.thumbnailUrl,
                  alt: media.alt,
                  caption: media.caption,
                  tags: media.tags || [],
                  recipeId: media.recipeId,
                  authorId: media.authorId,
                  categoryId: media.categoryId,
                  uploadedBy: media.uploadedBy,
                  uploadedAt: media.uploadedAt ? new Date(media.uploadedAt) : new Date(),
                  updatedAt: media.updatedAt ? new Date(media.updatedAt) : new Date(),
                  deletedAt: media.deletedAt ? new Date(media.deletedAt) : null,
                },
              });
            } catch (error) {
              console.error(`Failed to restore media ${media.id}:`, error);
              throw error;
            }
          }
          
          console.log('✅ Media entries restored');
        }

        // Note: API tokens are not restored for security reasons
        if (data.apiTokens && data.apiTokens.length > 0) {
          console.log(`⚠️ Skipping ${data.apiTokens.length} API tokens for security reasons`);
        }

        console.log('✅ Database restoration completed successfully');
      });

    } catch (error) {
      console.error('❌ Database restoration failed:', error);
      throw new BackupError(
        'Database restoration failed',
        'DATABASE_RESTORE_ERROR',
        error
      );
    }
  }

  /**
   * Create a backup of current database before restoration
   */
  async createPreRestoreBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups', 'pre-restore');
      await fs.ensureDir(backupDir);
      
      const backupPath = path.join(backupDir, `pre-restore-${timestamp}.json`);
      const data = await this.exportDatabase();
      await this.saveDatabaseToFile(data, backupPath);
      
      console.log(`✅ Pre-restore backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      throw new BackupError(
        'Failed to create pre-restore backup',
        'PRE_RESTORE_BACKUP_ERROR',
        error
      );
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<{
    recipes: number;
    authors: number;
    totalSize: string;
  }> {
    try {
      const [recipeCount, authorCount] = await Promise.all([
        this.prisma.recipe.count(),
        this.prisma.author.count(),
      ]);

      return {
        recipes: recipeCount,
        authors: authorCount,
        totalSize: 'Unknown', // Could implement database size calculation
      };
    } catch (error) {
      throw new BackupError(
        'Failed to get database statistics',
        'DATABASE_STATS_ERROR',
        error
      );
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}