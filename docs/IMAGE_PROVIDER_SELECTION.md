# Image Provider Selection Guide

## Overview

The recipe automation system supports two image generation providers:
1. **Google Gemini** - Free/low-cost, integrated AI image generation
2. **Midjourney** - Premium quality via GoAPI integration

## How Provider Selection Works

### Configuration Location

Navigate to: **Admin Panel → Automation → Settings → Images Tab**

### Selecting a Provider

1. **Choose Provider**: Click on either the "Google Gemini" or "Midjourney" card
2. **Configure Settings**: Each provider has different configuration requirements
3. **Save Settings**: Click the "Save All Settings" button at the top of the page

### Provider-Specific Settings

#### When Gemini is Selected:
- **No additional configuration needed** - Uses the Gemini API key from your automation settings
- **4 Image Prompts visible** - Customize how each of the 4 recipe images is generated
  - Image 1: Finished dish hero shot
  - Image 2: Raw ingredients layout
  - Image 3: Cooking action shot
  - Image 4: Styled presentation
- **Synchronous generation** - Images are created immediately during pipeline execution

#### When Midjourney is Selected:
- **GoAPI API Key required** - Get from [goapi.ai](https://goapi.ai)
- **Webhook URL** - Auto-generated based on your domain (e.g., `https://yourdomain.com/api/webhooks/goapi/midjourney`)
- **Prompt Template** - Single template for all 4 images (default provided)
- **Processing Mode** - Choose between:
  - Relax (Cheapest, slower)
  - Fast (Balanced) - **Default**
  - Turbo (Most expensive, fastest)
- **Asynchronous generation** - Pipeline continues while images generate in background
- **Style Reference** - Pinterest spy image automatically used as style reference (sref parameter)
- **4 Image Prompts hidden** - Not used for Midjourney

### Default Values

#### Default Webhook URL
```
https://yourdomain.com/api/webhooks/goapi/midjourney
```
- Automatically generated from your site's domain
- Can be customized if needed
- Used by GoAPI to send back completed images

#### Default Prompt Template
```
Create a high-quality, photorealistic food photography image for {recipeName}. 
Focus on: {seoKeyword}
Style: Professional food magazine, natural lighting, appetizing presentation
SEO Title: {seoTitle}
```

Available template variables:
- `{recipeName}` - Recipe name
- `{seoKeyword}` - Primary SEO keyword
- `{seoTitle}` - SEO-optimized title
- `{seoDescription}` - SEO description

## How the Pipeline Uses the Selected Provider

1. **Pipeline reads `imageProvider` field** from AutomationSettings
2. **ImageProviderFactory creates appropriate provider**:
   ```typescript
   const provider = ImageProviderFactory.create({
     provider: config.imageProvider, // 'gemini' or 'midjourney'
     // ... provider-specific config
   });
   ```
3. **Generation pattern differs by provider**:
   - **Gemini**: `await provider.generateImages()` - waits for completion
   - **Midjourney**: `await provider.generateImages()` - returns taskId, continues pipeline, webhook delivers images later

## Troubleshooting

### Midjourney Images Not Generating?

1. **Check GoAPI account** - Ensure you have an active subscription with Midjourney access
2. **Verify API key** - Confirm key is correct in Images tab
3. **Check webhook URL** - Must be publicly accessible (not localhost)
4. **Review Pinterest spy** - Midjourney requires a Pinterest spy image as style reference

### Gemini Images Low Quality?

Consider switching to Midjourney for:
- Professional food photography
- High-resolution images
- Photorealistic quality
- Style consistency

### Want to Switch Providers Mid-Automation?

1. Go to **Admin → Automation → Settings → Images Tab**
2. Select the new provider
3. Configure required settings
4. Click **Save All Settings**
5. **Restart any running automations** - Existing pipelines use the provider they started with

## Security Notes

- **No webhook secret required** - GoAPI validates requests on their end
- **API keys encrypted** - Stored securely in database
- **Webhook endpoint** - Public but validates task IDs against database records

## Cost Considerations

### Gemini
- Free tier available
- Pay per image generated
- Lower cost per image

### Midjourney
- Requires GoAPI subscription + Midjourney plan
- Higher cost per image
- 4 variations per request (better value)
- Processing mode affects cost:
  - Relax: Cheapest (uses relaxed mode credits)
  - Fast: Standard pricing
  - Turbo: 2x standard pricing

## Technical Details

### Database Field
```prisma
model AutomationSettings {
  imageProvider String @default("gemini") // 'gemini' | 'midjourney'
  
  // Midjourney fields
  midjourneyApiKey         String?
  midjourneyWebhookUrl     String?
  midjourneyPromptTemplate String?
  midjourneyProcessMode    String? @default("fast")
  
  // Gemini fields (in imagePromptSystemPrompt)
  imagePromptSystemPrompt String? // Contains 4 image prompts
}
```

### Factory Pattern
```typescript
// automation/image-providers/factory.ts
export class ImageProviderFactory {
  static create(config: ProviderConfig): ImageProvider {
    if (config.provider === 'midjourney') {
      return new MidjourneyImageProvider(/* midjourney config */);
    }
    return new GeminiImageProvider(/* gemini config */);
  }
}
```

### Webhook Endpoint
```
POST /api/webhooks/goapi/midjourney
```
- Receives 4 image URLs from GoAPI when generation complete
- Validates `taskId` against database
- Downloads images to `/uploads/images/recipe-{recipeId}/`
- Updates `PinterestSpyData.imageGeneratedAt` timestamp

## Best Practices

1. **Start with Gemini** for testing and development
2. **Switch to Midjourney** when quality matters (production recipes)
3. **Use Relax mode** for cost savings on non-urgent recipes
4. **Customize prompt template** to match your site's style
5. **Monitor webhook delivery** - Check task completion in database
6. **Keep API keys secure** - Never commit to version control
