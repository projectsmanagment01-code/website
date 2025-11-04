# Automatic Category & Author Matching

## Overview
The recipe generation system now automatically matches recipes to the correct categories and suggests matching authors based on tags.

## How It Works

### 1. Category Matching
When generating a recipe, the system analyzes:
- Recipe title
- Recipe description  
- SEO keyword
- SEO category
- Ingredients

It compares this data against **keyword mappings** for each category in your database.

### 2. Author Matching
Once a category is matched, the system looks for authors whose **tags** match the category name or slug.

**Example:**
- Recipe: "Peach Cake Recipe"
- Matched Category: "Dessert" or "Cake"
- System finds Author with tags: `["dessert", "baking", "cake"]`
- Auto-assigns that author to the recipe

## Category Keyword Mappings

The system includes 60+ category mappings covering:

### Meal Times
- `breakfast`, `morning_favorite` - pancakes, eggs, waffles, etc.
- `lunch`, `quick_lunch` - sandwiches, wraps, salads
- `dinner`, `family_dinner`, `evening_meals` - main dishes, casseroles

### Food Types
- `bread` - loaves, rolls, sourdough
- `soup` - broths, bisques, chowders
- `salad` - greens, slaws
- `pasta` - spaghetti, lasagna, noodles
- `dessert`, `cake`, `cookies` - sweets and baked goods

### Proteins
- `chicken`, `beef`, `lamb`, `seafood`
- `vegetarian`, `vegan`

### Cuisines
- `italian`, `mexican`, `asian`, `mediterranean`, `american`

### Cooking Methods
- `grilled`, `fried`, `baked`, `slow_cooker`

### Dietary
- `gluten_free`, `keto`, `paleo`, `healthy`

## Setting Up Author Tags

To enable automatic author matching:

1. Go to **Authors** in admin dashboard
2. Edit each author
3. Add **tags** that match their expertise:
   - For a dessert specialist: `["dessert", "baking", "cake", "cookies"]`
   - For a dinner expert: `["dinner", "main dish", "comfort food"]`
   - For a breakfast chef: `["breakfast", "brunch", "morning"]`

### Tag Matching Rules
- Tags are matched case-insensitively
- Partial matches are allowed
- Multiple matching tags increase confidence
- If no author matches, you'll be prompted to select one manually

## API Endpoints

### Generate Recipe with Auto-Matching
```
POST /api/admin/pinterest-spy/generate-recipe
{
  "spyEntryId": "xxx",
  "authorId": "auto" // or specific author ID
}
```

### Preview Category Match
```
POST /api/admin/pinterest-spy/category-match
{
  "spyEntryId": "xxx"
}
```

Returns:
```json
{
  "categoryMatch": {
    "id": "cat_123",
    "name": "Dessert",
    "slug": "dessert",
    "confidence": 85,
    "matchReasons": [
      "Contains keyword: 'cake'",
      "Direct category name match: 'Dessert'"
    ]
  },
  "suggestedAuthors": [
    {
      "id": "author_456",
      "name": "Jane Smith",
      "matchingTags": ["dessert", "baking"],
      "confidence": 40
    }
  ]
}
```

## Customizing Keywords

To add or modify category keywords, edit:
```
automation/recipe-generation/category-matcher.ts
```

Look for the `categoryKeywords` object and add your mappings:
```typescript
'your_category_slug': [
  'keyword1',
  'keyword2',
  'phrase with spaces'
]
```

## Confidence Scoring

The system scores matches based on:
- **+25 points**: SEO category exact match
- **+20 points**: Direct category name in content
- **+15 points**: Category slug match
- **+10 points**: Each keyword match

Scores are capped at 100% confidence.

## Best Practices

1. **Keep author tags specific** - Use exact category names when possible
2. **Use multiple tags per author** - Increases matching opportunities
3. **Review matches** - Check the category match preview before generating
4. **Update keywords regularly** - Add new mappings as you create categories
5. **Avoid bread in soup** - The system prevents mismatches like "bread" → "soup"

## Troubleshooting

**"No matching category found"**
- Add more keywords to your category mappings
- Check if the category exists in the database
- Verify the recipe title/description contains relevant keywords

**"No author found with matching tags"**
- Add tags to your authors that match category names
- Use the manual author selection option
- Create a "General" author with broad tags as fallback

**Wrong category assigned**
- Review the keyword mappings for conflicts
- Make category-specific keywords more precise
- Adjust confidence scoring if needed
