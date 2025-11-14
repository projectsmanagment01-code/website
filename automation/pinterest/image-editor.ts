/**
 * Pinterest Image Editor Service
 * Uses Gemini AI to edit SpyPin images with recipe-specific customizations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

export interface ImageEditResult {
  success: boolean;
  originalImagePath?: string;
  editedImagePath?: string;
  editedImageUrl?: string;
  error?: string;
  geminiResponse?: string;
}

/**
 * Download image from URL to temp location
 */
async function downloadImage(imageUrl: string): Promise<string> {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);
  
  // Create temp file
  const tempDir = path.join(process.cwd(), 'uploads', 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const tempPath = path.join(tempDir, `temp-${Date.now()}.jpg`);
  fs.writeFileSync(tempPath, buffer);
  
  return tempPath;
}

/**
 * Convert image to base64 for Gemini API
 */
function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

/**
 * Edit image using Gemini AI with custom prompt
 */
export async function editImageWithGemini(
  spyPinImageUrl: string,
  recipeTitle: string,
  customPrompt: string,
  geminiApiKey: string
): Promise<ImageEditResult> {
  try {
    // Download SpyPin image
    const tempImagePath = await downloadImage(spyPinImageUrl);
    
    // Replace variables in custom prompt
    const processedPrompt = customPrompt
      .replace(/\{spyPinImage\}/g, 'the provided image')
      .replace(/\{recipeTitle\}/g, recipeTitle);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Convert image to base64
    const imageBase64 = imageToBase64(tempImagePath);

    // Send to Gemini for analysis/description
    const result = await model.generateContent([
      processedPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const geminiText = response.text();

    console.log('[Pinterest Image Editor] Gemini response:', geminiText);

    // For now, we'll use the original image with optimizations
    // (Gemini doesn't directly edit images, but provides analysis)
    // In a full implementation, you'd use image editing APIs based on Gemini's guidance

    // Optimize image for Pinterest (1000x1500 recommended)
    const outputDir = path.join(process.cwd(), 'public', 'uploads', 'pinterest');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `pinterest-${Date.now()}.jpg`;
    const outputPath = path.join(outputDir, filename);

    await sharp(tempImagePath)
      .resize(1000, 1500, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Clean up temp file
    fs.unlinkSync(tempImagePath);

    const editedImageUrl = `/uploads/pinterest/${filename}`;

    return {
      success: true,
      originalImagePath: spyPinImageUrl,
      editedImagePath: outputPath,
      editedImageUrl,
      geminiResponse: geminiText,
    };
  } catch (error: any) {
    console.error('[Pinterest Image Editor] Error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to edit image',
    };
  }
}

/**
 * Batch edit multiple images
 */
export async function editImagesBatch(
  images: { url: string; recipeTitle: string }[],
  customPrompt: string,
  geminiApiKey: string
): Promise<ImageEditResult[]> {
  const results: ImageEditResult[] = [];

  for (const image of images) {
    const result = await editImageWithGemini(
      image.url,
      image.recipeTitle,
      customPrompt,
      geminiApiKey
    );
    results.push(result);

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return results;
}

/**
 * Validate Gemini API key
 */
export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Simple test request
    const result = await model.generateContent('Hello');
    await result.response;
    
    return { valid: true };
  } catch (error: any) {
    return { 
      valid: false, 
      error: error.message || 'Invalid API key' 
    };
  }
}
