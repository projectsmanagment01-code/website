# n8n AI Integration Guide - Named Image Fields

## 🎯 Overview
This guide shows how to configure your n8n workflow to send recipe data with properly named image fields.

## 📦 Quick Reference Files

- **📄 Full Recipe Template**: `recipe-template-with-named-images.json` - Complete working example with all fields
- **📘 This Guide**: Step-by-step integration instructions and field definitions
- **🗺️ Migration Plan**: `IMAGE_FIELD_MIGRATION_PLAN.md` - Technical implementation details

---

## 📋 Required Image Fields

Your AI should generate **4 different images** and fill these exact field names in the JSON:

### 1. **featureImage** (Required)
- **Purpose**: Main hero/feature image shown at the very top
- **Content**: The most appealing shot of the final dish
- **Position**: Top of the recipe page (first thing users see)
- **Example**: `"featureImage": "https://example.com/images/dish-hero.jpg"`

### 2. **preparationImage** (Required)
- **Purpose**: Shows ingredient preparation
- **Content**: Ingredients laid out, chopped, or being prepped (mise en place)
- **Position**: After the ingredient guide section
- **Example**: `"preparationImage": "https://example.com/images/ingredients-prep.jpg"`

### 3. **cookingImage** (Required)
- **Purpose**: Shows the cooking/mixing process
- **Content**: Food being cooked, mixed, or assembled (in pan, oven, mixer, etc.)
- **Position**: After the cooking process instructions
- **Example**: `"cookingImage": "https://example.com/images/cooking-mixing.jpg"`

### 4. **finalPresentationImage** (Required)
- **Purpose**: Final plated presentation
- **Content**: Beautifully plated final dish, ready to serve
- **Position**: Near the end, before FAQ section
- **Example**: `"finalPresentationImage": "https://example.com/images/final-plated.jpg"`

---

## 🤖 n8n Workflow Configuration

### Step 1: AI Prompt Configuration

Configure your AI to generate 4 distinct images with these instructions:

```
Generate 4 different images for this recipe in this exact order:

1. Feature Image: Main hero shot of the completed dish (most appetizing angle)
2. Preparation Image: Show ingredients laid out and ready (mise en place)
3. Cooking Image: Show the dish being cooked or mixed (action shot)
4. Final Presentation: Show the beautifully plated final result (ready to serve)

These images will appear throughout the recipe:
- Feature Image: Top of page
- Preparation Image: After ingredient list
- Cooking Image: After cooking instructions
- Final Presentation: Before FAQ section

Return the image URLs in this exact format:
{
  "featureImage": "url_to_hero_image",
  "preparationImage": "url_to_ingredients_prep",
  "cookingImage": "url_to_cooking_mixing",
  "finalPresentationImage": "url_to_final_plated"
}
```

### Step 2: JSON Structure for n8n

Your n8n workflow should send this JSON structure:

```json
{
  "title": "Delicious Chocolate Cake",
  "slug": "delicious-chocolate-cake",
  "category": "Desserts",
  "description": "A rich and moist chocolate cake...",
  
  "featureImage": "https://your-cdn.com/images/cake-hero.jpg",
  "cookingImage": "https://your-cdn.com/images/cake-baking.jpg",
  "preparationImage": "https://your-cdn.com/images/cake-mixing.jpg",
  "finalPresentationImage": "https://your-cdn.com/images/cake-plated.jpg",
  
  "images": [
    "https://your-cdn.com/images/cake-hero.jpg",
    "https://your-cdn.com/images/cake-baking.jpg",
    "https://your-cdn.com/images/cake-mixing.jpg",
    "https://your-cdn.com/images/cake-plated.jpg"
  ],
  
  "story": "This chocolate cake...",
  "ingredients": [...],
  "instructions": [...]
}
```

### Step 3: Field Mapping in n8n

Configure your n8n HTTP Request node:

**Method**: POST  
**URL**: `https://your-domain.com/api/recipe`  
**Authentication**: Bearer Token  
**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_TOKEN"
}
```

**Body** (Expression mode):
```javascript
{
  "title": "{{ $json.recipe.title }}",
  "slug": "{{ $json.recipe.slug }}",
  "category": "{{ $json.recipe.category }}",
  "description": "{{ $json.recipe.description }}",
  
  // Named image fields - REQUIRED
  "featureImage": "{{ $json.images.feature }}",
  "cookingImage": "{{ $json.images.cooking }}",
  "preparationImage": "{{ $json.images.preparation }}",
  "finalPresentationImage": "{{ $json.images.finalPresentation }}",
  
  // Also populate images array for backward compatibility
  "images": [
    "{{ $json.images.feature }}",
    "{{ $json.images.cooking }}",
    "{{ $json.images.preparation }}",
    "{{ $json.images.finalPresentation }}"
  ],
  
  // ... rest of recipe fields
}
```

---

## ✅ Complete Example

> **📄 Full Working Example**: See `recipe-template-with-named-images.json` in the root directory for a complete, production-ready recipe template with all fields properly populated.

### Full n8n JSON Payload

```json
{
  "id": "auto-generated",
  "title": "Classic Margherita Pizza",
  "slug": "classic-margherita-pizza",
  "category": "Italian",
  "categoryLink": "/categories/italian",
  "description": "Authentic Italian Margherita pizza with fresh mozzarella",
  "shortDescription": "Classic Italian pizza",
  "intro": "Learn to make authentic Margherita pizza at home",
  "story": "This classic Italian pizza originated in Naples...",
  "testimonial": "The best pizza I've ever made at home!",
  
  "featureImage": "https://cdn.example.com/pizza-hero-1234.jpg",
  "cookingImage": "https://cdn.example.com/pizza-oven-5678.jpg",
  "preparationImage": "https://cdn.example.com/pizza-prep-9012.jpg",
  "finalPresentationImage": "https://cdn.example.com/pizza-plated-3456.jpg",
  
  "images": [
    "https://cdn.example.com/pizza-hero-1234.jpg",
    "https://cdn.example.com/pizza-oven-5678.jpg",
    "https://cdn.example.com/pizza-prep-9012.jpg",
    "https://cdn.example.com/pizza-plated-3456.jpg"
  ],
  
  "heroImage": "https://cdn.example.com/pizza-hero-1234.jpg",
  "img": "https://cdn.example.com/pizza-hero-1234.jpg",
  
  "timing": {
    "prepTime": "30 minutes",
    "cookTime": "15 minutes",
    "totalTime": "45 minutes"
  },
  
  "recipeInfo": {
    "difficulty": "Medium",
    "cuisine": "Italian",
    "servings": "4",
    "dietary": "Vegetarian"
  },
  
  "ingredients": [
    {
      "section": "Dough",
      "items": [
        "2 cups all-purpose flour",
        "1 tsp active dry yeast",
        "3/4 cup warm water",
        "1 tsp salt",
        "1 tbsp olive oil"
      ]
    },
    {
      "section": "Toppings",
      "items": [
        "1 cup tomato sauce",
        "8 oz fresh mozzarella",
        "Fresh basil leaves",
        "2 tbsp olive oil"
      ]
    }
  ],
  
  "instructions": [
    {
      "step": "1",
      "instruction": "Mix flour, yeast, salt, and warm water to form dough"
    },
    {
      "step": "2",
      "instruction": "Knead dough for 10 minutes until smooth and elastic"
    },
    {
      "step": "3",
      "instruction": "Let dough rise for 1 hour in a warm place"
    },
    {
      "step": "4",
      "instruction": "Roll out dough into a 12-inch circle"
    },
    {
      "step": "5",
      "instruction": "Spread tomato sauce, add mozzarella and basil"
    },
    {
      "step": "6",
      "instruction": "Bake at 475°F for 12-15 minutes until crust is golden"
    }
  ],
  
  "whyYouLove": {
    "type": "list",
    "title": "Why You'll Love This Pizza",
    "items": [
      "Authentic Italian flavor",
      "Simple, fresh ingredients",
      "Crispy crust, gooey cheese",
      "Ready in under an hour",
      "Perfect for family dinner"
    ]
  },
  
  "essIngredientGuide": [
    {
      "ingredient": "Fresh Mozzarella",
      "note": "Use whole milk mozzarella for best flavor and melt"
    },
    {
      "ingredient": "00 Flour",
      "note": "Italian 00 flour makes the crispiest crust"
    },
    {
      "ingredient": "San Marzano Tomatoes",
      "note": "These Italian tomatoes have the perfect sweet-tart balance"
    }
  ],
  
  "completeProcess": [
    {
      "title": "Make the Dough",
      "type": "steps",
      "items": [
        "Combine dry ingredients in large bowl",
        "Add water and olive oil, mix until combined",
        "Knead on floured surface for 10 minutes",
        "Place in oiled bowl, cover, let rise 1 hour"
      ]
    },
    {
      "title": "Prepare Toppings",
      "type": "steps",
      "items": [
        "Slice fresh mozzarella into rounds",
        "Wash and dry fresh basil leaves",
        "Have tomato sauce ready at room temperature"
      ]
    },
    {
      "title": "Assemble and Bake",
      "type": "steps",
      "items": [
        "Preheat oven to 475°F with pizza stone inside",
        "Roll out dough on parchment paper",
        "Spread sauce, leaving 1-inch border",
        "Add mozzarella slices evenly",
        "Bake 12-15 minutes until golden and bubbly",
        "Add fresh basil leaves and serve immediately"
      ]
    }
  ],
  
  "questions": {
    "title": "Frequently Asked Questions",
    "items": [
      {
        "question": "Can I use pre-made pizza dough?",
        "answer": "Yes! Store-bought dough works great. Let it come to room temperature before rolling."
      },
      {
        "question": "What temperature should my oven be?",
        "answer": "Heat your oven as hot as it goes, ideally 475-500°F. A pizza stone helps achieve crispy crust."
      },
      {
        "question": "Can I freeze leftover pizza?",
        "answer": "Yes! Wrap slices individually in plastic wrap, then foil. Freeze up to 2 months. Reheat in oven at 375°F."
      }
    ]
  },
  
  "mustKnowTips": [
    "Use a pizza stone preheated for at least 30 minutes",
    "Don't overload with toppings - less is more",
    "Let dough come to room temperature before rolling",
    "Brush crust edge with olive oil for extra crispiness"
  ],
  
  "professionalSecrets": [
    "Add a pinch of sugar to dough for better browning",
    "Use parchment paper for easy transfer to oven",
    "Finish with a drizzle of high-quality olive oil",
    "Let pizza rest 2-3 minutes before slicing"
  ],
  
  "serving": "4 servings",
  "storage": "Store leftovers in airtight container in fridge for up to 3 days. Reheat in oven at 375°F for 5-7 minutes.",
  "allergyInfo": "Contains gluten (wheat flour) and dairy (mozzarella cheese)",
  "nutritionDisclaimer": "Nutritional values are approximate and may vary based on specific ingredients used.",
  "notes": [
    "Pizza stone is highly recommended for crispy crust",
    "Can substitute regular flour for 00 flour if needed",
    "Fresh basil is key - don't skip it!"
  ],
  "tools": [
    "Large mixing bowl",
    "Pizza stone or baking sheet",
    "Rolling pin",
    "Pizza cutter or sharp knife"
  ],
  
  "author": {
    "name": "Chef Giovanni",
    "bio": "Italian chef with 20 years experience",
    "avatar": "https://cdn.example.com/chef-avatar.jpg",
    "link": "/authors/chef-giovanni"
  },
  
  "authorId": "author-uuid-here",
  "featuredText": "Featured Recipe",
  "updatedDate": "2025-10-13T10:00:00Z",
  "status": "published",
  "href": "/recipes/classic-margherita-pizza"
}
```

---

## 🔄 Backward Compatibility

The app now supports **both methods**:

### Method 1: Named Fields (NEW - Recommended)
```json
{
  "featureImage": "image1.jpg",
  "cookingImage": "image2.jpg",
  "preparationImage": "image3.jpg",
  "finalPresentationImage": "image4.jpg"
}
```

### Method 2: Array (OLD - Still works)
```json
{
  "images": ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"]
}
```

**Best Practice**: Send both! This ensures compatibility:
```json
{
  "featureImage": "image1.jpg",
  "cookingImage": "image2.jpg",
  "preparationImage": "image3.jpg",
  "finalPresentationImage": "image4.jpg",
  "images": ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"]
}
```

---

## 🎨 AI Image Generation Prompts

### Prompt for Feature Image (Top of page):
```
Generate a professional food photography style image of [DISH NAME].
High-quality, well-lit, most appetizing presentation.
Shot from a 45-degree angle with shallow depth of field.
This is the hero image - make it look irresistible!
Food should be the main focus with clean, simple background.
```

### Prompt for Preparation Image (After ingredients):
```
Generate an image showing ingredients prepared and laid out for [DISH NAME].
Mise en place style - all ingredients prepped, measured, and organized.
Show chopped vegetables, measured spices, bowls of ingredients.
Clean kitchen counter, top-down view or slight angle.
Natural lighting, professional kitchen feel.
```

### Prompt for Cooking Image (After cooking steps):
```
Generate an image showing [DISH NAME] during the cooking or mixing process.
Show food being actively cooked in a pan, pot, oven, or mixer.
Action shot - stirring, flipping, or food bubbling/cooking.
Steam or cooking action visible if appropriate.
Kitchen setting, natural lighting, focus on the cooking process.
```

### Prompt for Final Presentation Image (Before FAQ):
```
Generate an image of [DISH NAME] beautifully plated and ready to serve.
Restaurant-quality plating on a clean white or neutral plate.
Garnished appropriately, looking fresh and appetizing.
Shot from above or 45-degree angle.
This should look like the finished masterpiece!
```

---

## ✅ Testing Your Integration

### Test Payload (Minimal)

```json
{
  "title": "Test Recipe",
  "slug": "test-recipe",
  "category": "Test",
  "description": "Test description",
  "featureImage": "https://example.com/test1.jpg",
  "cookingImage": "https://example.com/test2.jpg",
  "preparationImage": "https://example.com/test3.jpg",
  "finalPresentationImage": "https://example.com/test4.jpg",
  "images": [
    "https://example.com/test1.jpg",
    "https://example.com/test2.jpg",
    "https://example.com/test3.jpg",
    "https://example.com/test4.jpg"
  ],
  "story": "Test story",
  "author": {
    "name": "Test Author",
    "bio": "Test bio",
    "avatar": "https://example.com/avatar.jpg",
    "link": "/authors/test"
  }
}
```

### Verification Steps

1. **Send test recipe via n8n**
2. **Check database**:
   - Verify all 4 named image fields are populated
   - Verify images array has 4 items
3. **View recipe page**:
   - Should see 4 distinct images
   - Each image in correct position
   - No duplicates
4. **Check console for errors**

---

## 🐛 Troubleshooting

### Issue: Images not showing

**Check**:
- [ ] Image URLs are valid and accessible
- [ ] URLs use HTTPS (not HTTP)
- [ ] All 4 fields are present in JSON
- [ ] Images array also populated

### Issue: Duplicate images

**Check**:
- [ ] All 4 field values are different
- [ ] AI generated 4 distinct images
- [ ] No copy-paste errors in n8n workflow

### Issue: Wrong image in wrong position

**Check**:
- [ ] Field names are spelled exactly as documented
- [ ] Camel case is correct (featureImage, not feature_image)
- [ ] No extra spaces in field names

---

## 📊 Database Schema

After migration, your Recipe table will have:

```sql
CREATE TABLE "Recipe" (
  ...
  "images" TEXT[],                      -- Array (backward compatibility)
  "featureImage" TEXT,                  -- NEW: Feature/hero image
  "cookingImage" TEXT,                  -- NEW: Cooking process
  "preparationImage" TEXT,              -- NEW: Preparation steps
  "finalPresentationImage" TEXT,        -- NEW: Final plating
  ...
);
```

---

## 🚀 Next Steps

1. **Update your n8n workflow** with named fields
2. **Test with one recipe** to verify it works
3. **Run migration script** to update existing recipes
4. **Update AI prompts** to generate 4 distinct images
5. **Monitor logs** for any issues

---

## 📞 Support

If you encounter issues:
1. Check n8n workflow logs
2. Check API response from `/api/recipe`
3. Check browser console on recipe page
4. Verify database has all fields populated

---

**Last Updated**: October 13, 2025
**Version**: 2.0 (Named Image Fields)
