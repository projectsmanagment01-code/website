/**
 * Google Sheets Service
 * 
 * Column Structure:
 * A: SPY Title, B: SPY Description, C: SPY Image URL, D: Spy Article URL, E: SPY PIN Image
 * F: Row (Go/Not), G: SEO Keyword, H: SEO Title, I: SEO Description, J: Categorie
 * K: Image Job ID, L: Image 01, M: Image 02, N: Image 03, O: Image 04
 * P: Recipe ID, Q: Post link, R: is Published (Go/True), S: Is Indexed
 * T: PIN Description, U: PIN Title, V: Pin Image, W: Published, X: Post link (duplicate)
 * Y: PIN Categorie, Z: Error Count, AA: Skip (true/false)
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { retryWithBackoff } from '../../utils/retry';
import { SheetError } from '../../utils/errors';
import { getGoogleAuth } from './auth';

export class GoogleSheetsService {
  private cachedSheetName: string | null = null;

  /**
   * Get sheet ID from database settings or environment
   */
  private async getSheetId(): Promise<string> {
    const { getGoogleSheetId } = await import('../../config/env');
    return await getGoogleSheetId();
  }

  /**
   * Get the actual sheet name from the spreadsheet
   * Uses first sheet by default, caches result
   */
  private async getSheetName(): Promise<string> {
    if (this.cachedSheetName) {
      return this.cachedSheetName;
    }

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = await this.getSheetId();

      const metadata = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

      const firstSheet = metadata.data.sheets?.[0];
      this.cachedSheetName = firstSheet?.properties?.title || 'Sheet1';
      
      return this.cachedSheetName;
    } catch (error) {
      console.warn('Failed to get sheet name, using default "Sheet1"', error);
      return 'Sheet1';
    }
  }

  /**
   * Find first eligible recipe (is Published = "Go" AND Skip = false)
   * Returns only SPY data - SEO data will be generated
   */
  async fetchPendingRecipe(): Promise<{
    // SPY Input Data
    spyTitle: string;
    spyDescription: string;
    spyImageUrl?: string;
    spyArticleUrl?: string;
    spyPinImage?: string;
    category: string;
    rowNumber: number;
  } | null> {
    logger.info('📋 Fetching eligible recipe from Google Sheets');

    try {
      console.log('1️⃣ Importing googleapis...');
      const { google } = await import('googleapis');
      
      console.log('2️⃣ Getting Google auth...');
      const auth = await getGoogleAuth();
      
      console.log('3️⃣ Creating sheets client...');
      const sheets = google.sheets({ version: 'v4', auth });
      
      console.log('4️⃣ Getting Sheet ID from database/env...');
      const sheetId = await this.getSheetId();
      console.log(`   Sheet ID: ${sheetId}`);

      logger.info(`Using Sheet ID: ${sheetId}`);

      console.log('5️⃣ Getting sheet name...');
      const sheetName = await this.getSheetName();
      console.log(`   Sheet name: "${sheetName}"`);

      console.log(`6️⃣ Reading sheet data (${sheetName}!A2:AA1000)...`);
      // Read all data (columns A to AA)
      const response = await retryWithBackoff(() =>
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `${sheetName}!A2:AA1000`,
        })
      );

      console.log(`✅ Sheet read successful. Found ${response.data.values?.length || 0} rows`);

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        logger.info('No recipes found in sheet');
        console.log('ℹ️ Sheet is empty or has no data rows');
        return null;
      }

      console.log(`7️⃣ Searching for eligible recipe (is Published="Go" AND Skip="false")...`);
      
      // Find first row where:
      // - Column R (index 17): is Published = "Go"
      // - Column AA (index 26): Skip = "false" (must be explicitly false)
      let checkedCount = 0;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        const isPublished = row[17]?.trim().toLowerCase(); // Column R
        const skip = row[26]?.trim().toLowerCase(); // Column AA
        
        checkedCount++;
        
        // Log first few rows for debugging
        if (i < 3) {
          console.log(`   Row ${i + 2}: is Published="${row[17]}", Skip="${row[26]}"`);
        }
        
        // Check eligibility
        if (isPublished === 'go' && skip === 'false') {
          const recipe = {
            spyTitle: row[0] || '', // Column A
            spyDescription: row[1] || '', // Column B
            spyImageUrl: row[2] || undefined, // Column C
            spyArticleUrl: row[3] || undefined, // Column D
            spyPinImage: row[4] || undefined, // Column E
            category: row[9] || 'Recipes', // Column J
            rowNumber: i + 2, // +2 because: array is 0-indexed, row 1 is header
          };

          logger.info(`Found eligible recipe at row ${recipe.rowNumber}`, {
            title: recipe.spyTitle,
            category: recipe.category,
          });

          console.log(`✅ Found eligible recipe at row ${recipe.rowNumber}`);
          console.log(`   Title: ${recipe.spyTitle}`);
          console.log(`   Category: ${recipe.category}`);

          return recipe;
        }
      }

      console.log(`ℹ️ Checked ${checkedCount} rows - no eligible recipes found`);
      logger.info('No eligible recipes found (need is Published="Go" and Skip="false")');
      return null;
    } catch (error: any) {
      console.error('❌ Failed to fetch recipe from sheet:');
      console.error(`   Error type: ${error?.constructor?.name || 'Unknown'}`);
      console.error(`   Error message: ${error?.message || 'No message'}`);
      console.error(`   Error code: ${error?.code || 'No code'}`);
      
      if (error?.response) {
        console.error(`   API Response Status: ${error.response.status}`);
        console.error(`   API Response Data:`, error.response.data);
      }
      
      logger.error('Failed to fetch recipe from sheet', error);
      throw new SheetError(
        'Failed to read from Google Sheets',
        AUTOMATION_CONSTANTS.STEPS.FETCH_RECIPE
      );
    }
  }

  /**
   * Update image URLs in sheet
   */
  async updateImageUrls(
    rowNumber: number,
    images: {
      image1: string;
      image2: string;
      image3: string;
      image4: string;
    }
  ): Promise<void> {
    logger.info(`Updating image URLs in row ${rowNumber}`);

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = await this.getSheetId();
      const sheetName = await this.getSheetName();

      // Update columns H, I, J, K (images 1-4)
      await retryWithBackoff(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${sheetName}!H${rowNumber}:K${rowNumber}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[images.image1, images.image2, images.image3, images.image4]],
          },
        })
      );

      logger.info('Image URLs updated successfully');
    } catch (error) {
      logger.error('Failed to update image URLs', error);
      throw new SheetError(
        'Failed to update images in sheet',
        AUTOMATION_CONSTANTS.STEPS.UPDATE_SHEET_IMAGES
      );
    }
  }

  /**
   * Update publication status and all generated data
   */
  async updatePublicationStatus(
    rowNumber: number,
    data: {
      // SEO Generated Data
      seoKeyword: string;
      seoTitle: string;
      seoDescription: string;
      // Image URLs
      image01: string;
      image02: string;
      image03: string;
      image04: string;
      // Recipe Data
      recipeId: string;
      postLink: string;
      // Pinterest Data (optional)
      pinterestDescription?: string;
      pinterestTitle?: string;
      pinterestImage?: string;
      pinterestCategory?: string;
      // Indexing Status
      isIndexed?: string;
    }
  ): Promise<void> {
    logger.info(`Updating publication status for row ${rowNumber}`);

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = await this.getSheetId();

      const updates: any[] = [
        // G: SEO Keyword
        {
          range: `Sheet1!G${rowNumber}`,
          values: [[data.seoKeyword]],
        },
        // H: SEO Title
        {
          range: `Sheet1!H${rowNumber}`,
          values: [[data.seoTitle]],
        },
        // I: SEO Description
        {
          range: `Sheet1!I${rowNumber}`,
          values: [[data.seoDescription]],
        },
        // L-O: Image URLs (Image 01-04)
        {
          range: `Sheet1!L${rowNumber}:O${rowNumber}`,
          values: [[data.image01, data.image02, data.image03, data.image04]],
        },
        // P: Recipe ID
        {
          range: `Sheet1!P${rowNumber}`,
          values: [[data.recipeId]],
        },
        // Q: Post link
        {
          range: `Sheet1!Q${rowNumber}`,
          values: [[data.postLink]],
        },
        // R: is Published = "True" (mark as completed)
        {
          range: `Sheet1!R${rowNumber}`,
          values: [['True']],
        },
        // S: Is Indexed
        {
          range: `Sheet1!S${rowNumber}`,
          values: [[data.isIndexed || 'sent']],
        },
        // W: Published timestamp
        {
          range: `Sheet1!W${rowNumber}`,
          values: [[new Date().toISOString()]],
        },
      ];

      // Add Pinterest data if provided
      if (data.pinterestDescription) {
        updates.push(
          // T: PIN Description
          {
            range: `Sheet1!T${rowNumber}`,
            values: [[data.pinterestDescription]],
          },
          // U: PIN Title
          {
            range: `Sheet1!U${rowNumber}`,
            values: [[data.pinterestTitle || '']],
          },
          // V: Pin Image
          {
            range: `Sheet1!V${rowNumber}`,
            values: [[data.pinterestImage || '']],
          },
          // Y: PIN Categorie
          {
            range: `Sheet1!Y${rowNumber}`,
            values: [[data.pinterestCategory || '']],
          }
        );
      }

      await retryWithBackoff(() =>
        sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates,
          },
        })
      );

      logger.info('Publication status updated successfully');
    } catch (error) {
      logger.error('Failed to update publication status', error);
      throw new SheetError(
        'Failed to update publication status in sheet',
        AUTOMATION_CONSTANTS.STEPS.UPDATE_SHEET_PUBLISH
      );
    }
  }

  /**
   * Handle automation error - increment error count and set Skip if needed
   */
  async handleError(rowNumber: number, errorMessage: string): Promise<void> {
    logger.info(`Handling error for row ${rowNumber}`);

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      const sheetId = await this.getSheetId();

      // First, read current error count (column Z)
      const readResponse = await retryWithBackoff(() =>
        sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: `Sheet1!Z${rowNumber}`,
        })
      );

      const currentCount = parseInt(readResponse.data.values?.[0]?.[0] || '0', 10);
      const newCount = currentCount + 1;
      const shouldSkip = newCount >= 3;

      logger.info(`Error count: ${currentCount} -> ${newCount}. Skip: ${shouldSkip}`);

      // Update error count and skip status
      await retryWithBackoff(() =>
        sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: [
              // Z: Error Count
              {
                range: `Sheet1!Z${rowNumber}`,
                values: [[newCount.toString()]],
              },
              // AA: Skip (set to "true" if error count >= 3)
              {
                range: `Sheet1!AA${rowNumber}`,
                values: [[shouldSkip ? 'true' : 'false']],
              },
            ],
          },
        })
      );

      logger.info('Error handling completed', { newCount, shouldSkip });
    } catch (error) {
      logger.error('Failed to handle error in sheet', error);
      // Don't throw - this is a best-effort operation
    }
  }
}

export const googleSheets = new GoogleSheetsService();
