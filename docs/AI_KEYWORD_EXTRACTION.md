# AI-Powered Internal Linking System

## Overview
The internal linking system now supports AI-enhanced keyword extraction using GitHub Models API (GPT-4o-mini) to discover semantic keywords and phrases that go beyond simple title/category/ingredient matching.

## Features

### Standard Keyword Extraction (No AI)
- **Title Keywords**: Full recipe title + base title without numbers
- **Category Keywords**: Recipe category
- **Ingredient Keywords**: Main ingredients extracted from recipe data

### AI-Enhanced Keyword Extraction
AI analyzes recipe content to extract:
- **Cooking Techniques**: "pan-seared", "slow-cooked", "air-fried"
- **Cuisine Types**: "Italian", "Asian-inspired", "Mediterranean"  
- **Key Ingredients**: Main proteins, vegetables, spices
- **Meal Occasions**: "weeknight dinner", "holiday dessert", "meal prep"
- **Dietary Attributes**: "gluten-free", "low-carb", "vegetarian"
- **Flavor Profiles**: "spicy", "sweet and savory", "umami-rich"

## Setup

### 1. Environment Variable
```bash
# Add to .env
GITHUB_TOKEN=your_github_token_here
```

### 2. How It Works

#### Without AI (Default - Fast)
```
1. Extract title, category, ingredients
2. Create keyword index
3. Find link opportunities
4. Store suggestions
```

#### With AI (Slower but Better)
```
1. Extract title, category, ingredients
2. Call AI to analyze content → extract semantic keywords
3. Combine standard + AI keywords
4. Create enhanced keyword index
5. Find MORE link opportunities
6. Store suggestions
```

## Usage

### Admin UI
**Quick Scan**: Fast scan using standard keyword extraction
**✨ AI Scan**: Enhanced scan using AI-powered keyword extraction

### API Endpoints

#### Standard Scan
```bash
POST /api/admin/internal-links/scan
{
  "rescan": true,
  "useAI": false  # Default
}
```

#### AI-Enhanced Scan
```bash
POST /api/admin/internal-links/scan
{
  "rescan": true,
  "useAI": true   # Enable AI
}
```

## Performance

### Standard Scan
- **Speed**: ~100-300ms per recipe
- **Cost**: Free
- **Keywords**: 5-15 per recipe
- **Best For**: Quick updates, large batches

### AI Scan
- **Speed**: ~1-2 seconds per recipe
- **Cost**: ~$0.0001 per recipe (GPT-4o-mini)
- **Keywords**: 15-30 per recipe
- **Best For**: Initial setup, quality improvement

## Rate Limiting

The AI extractor includes automatic rate limiting:
- Batch size: 5 recipes at a time
- Delay between batches: 1 second
- Prevents API throttling

## Example Results

### Standard Keywords (No AI)
```
Recipe: "Honey Sesame Chicken and Broccoli"
- honey sesame chicken and broccoli (priority: 100)
- honey sesame chicken (priority: 95)
- Asian Food (priority: 70)
- chicken (priority: 60)
- broccoli (priority: 60)
```

### AI-Enhanced Keywords
```
Recipe: "Honey Sesame Chicken and Broccoli"
Standard:
- honey sesame chicken and broccoli (priority: 100)
- honey sesame chicken (priority: 95)
- Asian Food (priority: 70)
- chicken (priority: 60)
- broccoli (priority: 60)

AI-Added:
- stir-fry (priority: 58, technique)
- Asian-inspired (priority: 56, cuisine)
- weeknight dinner (priority: 54, occasion)
- sweet and savory (priority: 52, flavor)
- quick meal (priority: 50, occasion)
- sesame sauce (priority: 48, ingredient)
```

## Benefits

1. **More Link Opportunities**: AI discovers 2-3x more relevant keywords
2. **Better Semantic Matching**: Links related concepts even with different wording
3. **Improved User Experience**: More natural and useful internal links
4. **SEO Enhancement**: Better topical clustering and internal link structure

## Fallback Behavior

If AI extraction fails:
- Falls back to standard keyword extraction
- No errors thrown
- System continues working normally

## Testing

```bash
# Test AI keyword extraction on one recipe
node test-ai-keywords.js

# Test full scan without AI
POST /api/admin/internal-links/scan
{ "rescan": true }

# Test full scan with AI
POST /api/admin/internal-links/scan
{ "rescan": true, "useAI": true }
```

## Troubleshooting

### "GITHUB_TOKEN not set"
- Add `GITHUB_TOKEN` to `.env` file
- System falls back to standard extraction

### "AI API error: 429"
- Rate limit reached
- Wait 60 seconds and retry
- Consider reducing batch size

### AI keywords not appearing
- Check console for AI extraction errors
- Verify GITHUB_TOKEN is valid
- Ensure recipe has sufficient content (title + intro + description)

## Cost Estimation

For 100 recipes with AI scan:
- API calls: 100 requests
- Tokens per request: ~200 input + 150 output = 350 tokens
- Total tokens: 35,000 tokens
- Cost: ~$0.01 (GPT-4o-mini pricing)

Very affordable for the quality improvement!
