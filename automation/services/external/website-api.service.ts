/**
 * Website API Client Service
 */

import { automationEnv } from '../../config/env';
import { logger } from '../../utils/logger';

export class WebsiteApiService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = automationEnv.website.apiUrl;
    this.apiToken = automationEnv.website.apiToken;
  }

  /**
   * Get list of authors from website
   */
  async getAuthors(): Promise<Array<{ id: string; name: string; slug: string }>> {
    logger.info('Fetching authors from website');

    try {
      const response = await fetch(`${this.apiUrl}/api/authors`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch authors: ${response.status}`);
      }

      const data = await response.json();
      return data.authors || [];
    } catch (error) {
      logger.error('Failed to fetch authors', error);
      return [];
    }
  }

  /**
   * Get list of categories from website
   */
  async getCategories(): Promise<
    Array<{ id: string; name: string; slug: string }>
  > {
    logger.info('Fetching categories from website');

    try {
      const response = await fetch(`${this.apiUrl}/api/categories`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      logger.error('Failed to fetch categories', error);
      return [];
    }
  }

  /**
   * Get sitemap for internal linking
   */
  async getSitemap(): Promise<string[]> {
    logger.info('Fetching sitemap from website');

    try {
      const response = await fetch(`${this.apiUrl}/sitemap.xml`);

      if (!response.ok) {
        throw new Error(`Failed to fetch sitemap: ${response.status}`);
      }

      const xml = await response.text();
      
      // Extract URLs from sitemap XML
      const urlMatches = xml.match(/<loc>(.*?)<\/loc>/g);
      if (!urlMatches) return [];

      const urls = urlMatches.map((match) =>
        match.replace(/<\/?loc>/g, '')
      );

      logger.info(`Found ${urls.length} URLs in sitemap`);
      return urls;
    } catch (error) {
      logger.error('Failed to fetch sitemap', error);
      return [];
    }
  }
}

export const websiteApi = new WebsiteApiService();
