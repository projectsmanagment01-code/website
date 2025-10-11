import { PrismaClient } from '@prisma/client';
import fs from 'fs-extra';
import path from 'path';
import { BackupError } from './types';

/**
 * Database backup and restore service
 */
export class DatabaseBackupService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Export all database content to JSON
   */
  async exportDatabase(): Promise<{
    recipes: any[];
    authors: any[];
    categories: any[];
    settings: any[];
    summary: {
      recipes: number;
      authors: number;
      categories: number;
      settings: number;
    };
  }> {
    try {
      console.log('📊 Exporting database content...');

      // Export recipes with all relationships
      const recipes = await this.prisma.recipe.findMany();

      // Export authors
      const authors = await this.prisma.author.findMany();

      // Export any category data if exists
      let categories: any[] = [];
      try {
        // Check if categories table exists
        categories = await this.prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'categories'`;
        if (categories.length > 0) {
          categories = await this.prisma.$queryRaw`SELECT * FROM categories`;
        } else {
          categories = [];
        }
      } catch (error) {
        console.log('No categories table found, skipping...');
        categories = [];
      }

      // Export settings or configuration data
      let settings: any[] = [];
      try {
        // Check if settings table exists
        const settingsCheck = await this.prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'settings'`;
        if (Array.isArray(settingsCheck) && settingsCheck.length > 0) {
          settings = await this.prisma.$queryRaw`SELECT * FROM settings`;
        }
      } catch (error) {
        console.log('No settings table found, skipping...');
        settings = [];
      }

      const summary = {
        recipes: recipes.length,
        authors: authors.length,
        categories: Array.isArray(categories) ? categories.length : 0,
        settings: Array.isArray(settings) ? settings.length : 0,
      };

      console.log(`✅ Database export completed:`, summary);

      return {
        recipes,
        authors,
        categories: Array.isArray(categories) ? categories : [],
        settings: Array.isArray(settings) ? settings : [],
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
  }, options: Partial<{ cleanExisting: boolean }> = {}): Promise<void> {
    try {
      console.log('📥 Starting database restoration...');
      console.log('📊 Data to restore:', {
        recipes: data.recipes?.length || 0,
        authors: data.authors?.length || 0,
        categories: data.categories?.length || 0,
        settings: data.settings?.length || 0,
      });

      // Start transaction for atomic restoration
      await this.prisma.$transaction(async (tx) => {
        if (options.cleanExisting) {
          console.log('🗑️ Cleaning existing data...');
          
          // Delete in correct order to handle foreign keys
          await tx.recipe.deleteMany();
          await tx.author.deleteMany();
          
          console.log('✅ Existing data cleaned');
        }

        // Restore authors first (recipes depend on authors)
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
                },
                create: {
                  id: author.id,
                  name: author.name,
                  bio: author.bio,
                  img: author.img,
                  avatar: author.avatar,
                  slug: author.slug,
                  link: author.link,
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