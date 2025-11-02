import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/auth';

interface ExtractionRequest {
  url: string;
  title: string;
  entryId: string;
}

interface ExtractionResult {
  imageUrl: string;
  alt?: string;
  selector?: string;
  success: boolean;
  error?: string;
}

// Common selectors for recipe featured images
const IMAGE_SELECTORS = [
  // Recipe-specific selectors
  'article img[data-lazy-src]',
  'article img[data-src]',
  '.recipe-card img',
  '.recipe-header img',
  '.featured-image img',
  '.post-thumbnail img',
  '.wp-post-image',
  
  // General content selectors
  'article img:first-of-type',
  '.content img:first-of-type',
  '.post-content img:first-of-type',
  '.entry-content img:first-of-type',
  
  // Open Graph and meta images
  'meta[property="og:image"]',
  'meta[name="twitter:image"]',
  
  // Pinterest-specific
  'img[data-pin-media]',
  'img.pin-image',
  
  // WordPress and CMS
  '.wp-block-image img',
  '.gutenberg-image img',
  '.elementor-image img',
  
  // Generic fallbacks
  'img[alt*="recipe"]',
  'img[alt*="food"]',
  'img[src*="recipe"]',
  'main img:first-of-type',
  'body img:first-of-type'
];

async function extractImageFromUrl(url: string): Promise<ExtractionResult> {
  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Try to extract image using different methods
    let imageUrl = '';
    let alt = '';
    let usedSelector = '';

    // Method 1: Try specific selectors
    for (const selector of IMAGE_SELECTORS) {
      const result = extractImageWithSelector(html, selector, url);
      if (result.imageUrl && !result.imageUrl.startsWith('data:')) {
        imageUrl = result.imageUrl;
        alt = result.alt || '';
        usedSelector = selector;
        break;
      }
    }

    // Method 2: If no image found, try JSON-LD structured data
    if (!imageUrl) {
      const jsonLdResult = extractImageFromJsonLd(html, url);
      if (jsonLdResult.imageUrl) {
        imageUrl = jsonLdResult.imageUrl;
        alt = jsonLdResult.alt || '';
        usedSelector = 'JSON-LD';
      }
    }

    // Method 3: Final fallback - first large image
    if (!imageUrl) {
      const fallbackResult = extractFirstLargeImage(html, url);
      if (fallbackResult.imageUrl) {
        imageUrl = fallbackResult.imageUrl;
        alt = fallbackResult.alt || '';
        usedSelector = 'first-large-image';
      }
    }

    if (!imageUrl) {
      return {
        imageUrl: '',
        success: false,
        error: 'No suitable image found'
      };
    }

    // Make absolute URL
    const absoluteUrl = makeAbsoluteUrl(imageUrl, url);

    // Validate image URL - reject placeholders and invalid URLs
    if (!isValidImageUrl(absoluteUrl)) {
      return {
        imageUrl: '',
        success: false,
        error: 'Invalid or placeholder image detected'
      };
    }

    return {
      imageUrl: absoluteUrl,
      alt,
      selector: usedSelector,
      success: true
    };

  } catch (error: any) {
    return {
      imageUrl: '',
      success: false,
      error: error.message || 'Failed to extract image'
    };
  }
}

function extractImageWithSelector(html: string, selector: string, baseUrl: string): { imageUrl: string; alt?: string } {
  try {
    if (selector.startsWith('meta[')) {
      // Handle meta tags
      const metaRegex = selector.includes('og:image') 
        ? /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
        : /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i;
      
      const match = html.match(metaRegex);
      return { imageUrl: match ? match[1] : '', alt: '' };
    }

    // Handle img tags - simplified regex approach
    const imgRegex = new RegExp(`<img[^>]*(?:class=["'][^"']*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']|${selector})[^>]*>`, 'i');
    const imgMatch = html.match(imgRegex);
    
    if (imgMatch) {
      const imgTag = imgMatch[0];
      
      // Extract src, data-src, or data-lazy-src
      const srcMatch = imgTag.match(/(?:data-lazy-)?(?:data-)?src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      
      return {
        imageUrl: srcMatch ? srcMatch[1] : '',
        alt: altMatch ? altMatch[1] : ''
      };
    }

    return { imageUrl: '', alt: '' };
  } catch (error) {
    return { imageUrl: '', alt: '' };
  }
}

function extractImageFromJsonLd(html: string, baseUrl: string): { imageUrl: string; alt?: string } {
  try {
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    let match;
    
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonData = JSON.parse(match[1]);
        const imageUrl = findImageInJsonLd(jsonData);
        if (imageUrl) {
          return { imageUrl, alt: '' };
        }
      } catch (e) {
        continue;
      }
    }
    
    return { imageUrl: '', alt: '' };
  } catch (error) {
    return { imageUrl: '', alt: '' };
  }
}

function findImageInJsonLd(obj: any): string {
  if (typeof obj === 'string' && (obj.startsWith('http') && (obj.includes('.jpg') || obj.includes('.png') || obj.includes('.webp') || obj.includes('.jpeg')))) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findImageInJsonLd(item);
      if (result) return result;
    }
  }
  
  if (typeof obj === 'object' && obj !== null) {
    // Check common image properties
    const imageProps = ['image', 'thumbnail', 'photo', 'picture'];
    for (const prop of imageProps) {
      if (obj[prop]) {
        const result = findImageInJsonLd(obj[prop]);
        if (result) return result;
      }
    }
    
    // Recursively search other properties
    for (const key in obj) {
      const result = findImageInJsonLd(obj[key]);
      if (result) return result;
    }
  }
  
  return '';
}

function extractFirstLargeImage(html: string, baseUrl: string): { imageUrl: string; alt?: string } {
  try {
    // Find all img tags
    const imgRegex = /<img[^>]+>/gi;
    const imgMatches = html.match(imgRegex) || [];
    
    for (const imgTag of imgMatches) {
      const srcMatch = imgTag.match(/(?:data-lazy-)?(?:data-)?src=["']([^"']+)["']/i);
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      
      if (srcMatch) {
        const src = srcMatch[1];
        
        // Skip small images, icons, and common non-content images
        if (
          src.includes('icon') ||
          src.includes('logo') ||
          src.includes('avatar') ||
          src.includes('thumb') ||
          src.includes('ad') ||
          src.includes('banner') ||
          src.includes('pixel') ||
          src.includes('tracking') ||
          src.match(/\d+x\d+/) && parseInt(src.match(/(\d+)x\d+/)?.[1] || '0') < 200
        ) {
          continue;
        }
        
        return {
          imageUrl: src,
          alt: altMatch ? altMatch[1] : ''
        };
      }
    }
    
    return { imageUrl: '', alt: '' };
  } catch (error) {
    return { imageUrl: '', alt: '' };
  }
}

function isValidImageUrl(url: string): boolean {
  try {
    // Reject data URLs (base64, SVG, etc.)
    if (url.startsWith('data:')) {
      return false;
    }

    // Reject SVG files (usually placeholders)
    if (url.toLowerCase().endsWith('.svg') || url.includes('.svg?')) {
      return false;
    }

    // Reject placeholder patterns
    const placeholderPatterns = [
      'placeholder',
      'default',
      'no-image',
      'noimage',
      'missing',
      'dummy',
      '1x1',
      'pixel',
      'blank'
    ];

    const lowerUrl = url.toLowerCase();
    if (placeholderPatterns.some(pattern => lowerUrl.includes(pattern))) {
      return false;
    }

    // Must be a valid image extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some(ext => 
      lowerUrl.includes(ext) || lowerUrl.match(new RegExp(`\\${ext}[?#]`, 'i'))
    );

    if (!hasValidExtension) {
      return false;
    }

    // Must be HTTP/HTTPS
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function makeAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    if (url.startsWith('http')) {
      return url;
    }
    
    const base = new URL(baseUrl);
    
    if (url.startsWith('//')) {
      return `${base.protocol}${url}`;
    }
    
    if (url.startsWith('/')) {
      return `${base.protocol}//${base.host}${url}`;
    }
    
    return new URL(url, baseUrl).href;
  } catch (error) {
    return url;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ExtractionRequest = await request.json();
    const { url, title, entryId } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Extract the featured image
    const result = await extractImageFromUrl(url);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          imageUrl: '',
          success: false
        },
        { status: 400 }
      );
    }

    // Update database with extracted image URL
    if (entryId && result.imageUrl) {
      const prisma = (await import('@/lib/prisma')).default;
      
      await prisma.pinterestSpyData.update({
        where: { id: entryId },
        data: { spyImageUrl: result.imageUrl }
      });
    }

    return NextResponse.json({
      imageUrl: result.imageUrl,
      alt: result.alt,
      selector: result.selector,
      success: true,
      entryId
    });

  } catch (error: any) {
    console.error('Image extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract image' },
      { status: 500 }
    );
  }
}