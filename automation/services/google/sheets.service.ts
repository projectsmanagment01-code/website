/**
 * Google Sheets Service
 */

import { automationEnv } from '../../config/env';
import { AUTOMATION_CONSTANTS } from '../../config/constants';
import { logger } from '../../utils/logger';
import { retryWithBackoff } from '../../utils/retry';
import { SheetError } from '../../utils/errors';
import { getGoogleAuth } from './auth';

export class GoogleSheetsService {
  private sheetId: string;

  constructor() {
    this.sheetId = automationEnv.google.sheetId;
  }

  /**
   * Fetch first pending recipe from Google Sheet
   */
  async fetchPendingRecipe(): Promise<{
    title: string;
    description?: string;
    keyword?: string;
    category: string;
    spyImageUrl?: string;
    rowNumber: number;
  } | null> {
    logger.info('Fetching pending recipe from Google Sheets');

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      // Read all data
      const response = await retryWithBackoff(() =>
        sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'Sheet1!A2:F1000', // Adjust range as needed
        })
      );

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        logger.info('No recipes found in sheet');
        return null;
      }

      // Find first row where:
      // - Column F (Skip) is not "true"
      // - Column G (is Published) is "Go"
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const skip = row[5]?.toLowerCase() === 'true';
        const isPublished = row[6]?.toLowerCase() === 'go';

        if (!skip && isPublished) {
          logger.info(`Found pending recipe at row ${i + 2}`, {
            title: row[0],
          });

          return {
            title: row[0],
            keyword: row[1] || undefined,
            description: row[2] || undefined,
            category: row[3],
            spyImageUrl: row[4] || undefined,
            rowNumber: i + 2, // +2 because: array is 0-indexed, row 1 is header
          };
        }
      }

      logger.info('No pending recipes found');
      return null;
    } catch (error) {
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

      // Update columns H, I, J, K (images 1-4)
      await retryWithBackoff(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: `Sheet1!H${rowNumber}:K${rowNumber}`,
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
   * Update publication status
   */
  async updatePublicationStatus(
    rowNumber: number,
    data: {
      postLink: string;
      recipeId: string;
      pinterestImage: string;
      pinterestTitle: string;
      pinterestDescription: string;
      pinterestCategory: string;
    }
  ): Promise<void> {
    logger.info(`Updating publication status in row ${rowNumber}`);

    try {
      const { google } = await import('googleapis');
      const auth = await getGoogleAuth();
      const sheets = google.sheets({ version: 'v4', auth });

      // Update multiple columns:
      // G (is Published) = true
      // L (Post Link)
      // M (Recipe ID)
      // N (Is Indexed) = sent
      // O (PIN Image)
      // P (PIN Title)
      // Q (PIN Description)
      // R (PIN Category)
      // S (Published) = Go

      await retryWithBackoff(() =>
        sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: [
              {
                range: `Sheet1!G${rowNumber}`,
                values: [['true']],
              },
              {
                range: `Sheet1!L${rowNumber}:M${rowNumber}`,
                values: [[data.postLink, data.recipeId]],
              },
              {
                range: `Sheet1!N${rowNumber}`,
                values: [['sent']],
              },
              {
                range: `Sheet1!O${rowNumber}:R${rowNumber}`,
                values: [[
                  data.pinterestImage,
                  data.pinterestTitle,
                  data.pinterestDescription,
                  data.pinterestCategory,
                ]],
              },
              {
                range: `Sheet1!S${rowNumber}`,
                values: [['Go']],
              },
            ],
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
}

export const googleSheets = new GoogleSheetsService();
