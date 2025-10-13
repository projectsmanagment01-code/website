# Recipe Schema Example - Complete JSON Structure

This document provides a complete example of the recipe JSON structure that should be used for AI recipe generation. All fields are based on the TypeScript schema.

## Complete Recipe JSON Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "creamy-garlic-butter-tuscan-shrimp",
  "title": "Creamy Garlic Butter Tuscan Shrimp",
  "shortDescription": "Restaurant-quality shrimp in a creamy sun-dried tomato and spinach sauce, ready in just 20 minutes.",
  "description": "Creamy garlic butter Tuscan shrimp features succulent shrimp swimming in a luscious sauce made with sun-dried tomatoes, fresh spinach, and Parmesan cheese. This restaurant-quality dish comes together in just 20 minutes!",
  "category": "Seafood",
  "categoryLink": "/categories/seafood",
  "featuredText": "Quick Weeknight Favorite",
  "updatedDate": "2024-10-13T00:00:00Z",
  
  "author": {
    "name": "Rachel",
    "link": "/authors/rachel",
    "avatar": "/uploads/authors/a (17).webp",
    "bio": "Rachel is the passionate recipe developer and food blogger dedicated to bringing joy to kitchens everywhere."
  },

  "intro": "You know those nights when you want something that feels fancy but doesn't require hours in the kitchen? This Tuscan shrimp is exactly that! The combination of garlic, sun-dried tomatoes, and cream creates a sauce so good, you'll want to lick the plate clean. Trust me, this one's a keeper.",

  "story": "I first made this dish after a trip to Tuscany left me craving those rich, sun-soaked flavors. I wanted to recreate that magic at home without spending all evening cooking. After a few tries, I nailed it—and now it's my go-to whenever I need to impress guests or just treat myself to something special. The best part? It tastes like you've been slaving away for hours, but it's actually done in 20 minutes!",

  "testimonial": "This recipe is INCREDIBLE! My husband said it's better than anything we've had at our favorite Italian restaurant. The sauce is so creamy and flavorful, and the shrimp are perfectly cooked. Making this again this weekend!",

  "whyYouLove": {
    "type": "list",
    "title": "Why You'll Love This Recipe",
    "items": [
      "Ready in just 20 minutes from start to finish",
      "Restaurant-quality flavor without the restaurant price tag",
      "One-pan recipe means easy cleanup",
      "Perfect for impressive dinner parties or weeknight meals",
      "The creamy garlic sauce is absolutely addictive",
      "Pairs beautifully with pasta, rice, or crusty bread"
    ]
  },

  "timing": {
    "prepTime": "10 minutes",
    "cookTime": "10 minutes",
    "totalTime": "20 minutes"
  },

  "recipeInfo": {
    "difficulty": "Easy",
    "cuisine": "Italian",
    "servings": "4",
    "dietary": "Gluten-Free (naturally)"
  },

  "essIngredientGuide": [
    {
      "ingredient": "Large Shrimp",
      "note": "Use fresh or thawed frozen shrimp (16-20 count per pound). Make sure they're peeled and deveined for convenience. Pat them dry before cooking to get that perfect golden sear!"
    },
    {
      "ingredient": "Sun-Dried Tomatoes",
      "note": "Oil-packed sun-dried tomatoes work best here—they're already soft and add incredible flavor. If using dry-packed, rehydrate them in warm water first. Don't skip these; they're the star of the show!"
    },
    {
      "ingredient": "Heavy Cream",
      "note": "Heavy cream creates that luxurious, restaurant-style sauce. For a lighter version, you can use half-and-half, but the sauce won't be quite as rich and may need a bit of cornstarch to thicken."
    },
    {
      "ingredient": "Fresh Garlic",
      "note": "Fresh minced garlic is essential here—jarred just won't give you that punchy, aromatic flavor. Use at least 4-5 cloves; this is a garlic butter sauce after all!"
    },
    {
      "ingredient": "Parmesan Cheese",
      "note": "Freshly grated Parmesan melts smoothly into the sauce and adds that nutty, salty depth. Pre-shredded cheese has anti-caking agents that can make your sauce grainy, so grate your own if possible."
    }
  ],

  "completeProcess": [
    {
      "title": "Prep Your Ingredients",
      "type": "steps",
      "items": [
        "Pat shrimp completely dry with paper towels—this helps them get a nice golden sear.",
        "Mince the garlic cloves and set aside.",
        "Drain sun-dried tomatoes (reserve 1 tablespoon of the oil) and roughly chop them.",
        "Grate fresh Parmesan cheese and set aside.",
        "Wash and roughly chop fresh spinach."
      ]
    },
    {
      "title": "Sear the Shrimp",
      "type": "steps",
      "items": [
        "Heat a large skillet over medium-high heat. Add 2 tablespoons butter and the reserved tablespoon of sun-dried tomato oil.",
        "Once the butter is melted and foaming, add the shrimp in a single layer.",
        "Season with salt, pepper, and Italian seasoning.",
        "Cook for 1-2 minutes per side until pink and opaque. Don't overcook!",
        "Remove shrimp to a plate and set aside."
      ]
    },
    {
      "title": "Build the Sauce",
      "type": "steps",
      "items": [
        "In the same skillet, reduce heat to medium and add 2 more tablespoons of butter.",
        "Add minced garlic and cook for 30 seconds until fragrant (watch it closely so it doesn't burn!).",
        "Stir in chopped sun-dried tomatoes and cook for another minute.",
        "Pour in the heavy cream and bring to a gentle simmer.",
        "Add grated Parmesan cheese, stirring constantly until melted and smooth.",
        "Season with salt, pepper, and a pinch of red pepper flakes if you like a little heat."
      ]
    },
    {
      "title": "Finish and Serve",
      "type": "steps",
      "items": [
        "Add fresh spinach to the sauce and stir until wilted (about 1-2 minutes).",
        "Return the cooked shrimp to the skillet and toss to coat in the creamy sauce.",
        "Let everything simmer together for 1-2 minutes so the flavors meld.",
        "Taste and adjust seasoning if needed.",
        "Serve immediately over pasta, rice, or with crusty bread to soak up that amazing sauce!",
        "Garnish with extra Parmesan and fresh basil if desired."
      ]
    }
  ],

  "ingredients": [
    {
      "section": "For the Shrimp",
      "items": [
        "1 1/2 lbs large shrimp (16-20 count), peeled and deveined",
        "4 tablespoons butter, divided",
        "1 tablespoon sun-dried tomato oil (from the jar)",
        "1 teaspoon Italian seasoning",
        "1/2 teaspoon salt",
        "1/4 teaspoon black pepper",
        "1/4 teaspoon red pepper flakes (optional)"
      ]
    },
    {
      "section": "For the Tuscan Sauce",
      "items": [
        "5 cloves garlic, minced",
        "1/2 cup sun-dried tomatoes in oil, drained and chopped",
        "1 1/2 cups heavy cream",
        "3/4 cup freshly grated Parmesan cheese",
        "3 cups fresh baby spinach",
        "Salt and pepper to taste"
      ]
    },
    {
      "section": "For Serving",
      "items": [
        "Cooked pasta, rice, or crusty bread",
        "Fresh basil leaves for garnish",
        "Extra Parmesan cheese"
      ]
    }
  ],

  "instructions": [
    {
      "step": "1",
      "instruction": "Pat the shrimp completely dry with paper towels and season with salt, pepper, and Italian seasoning. Set aside."
    },
    {
      "step": "2",
      "instruction": "Heat a large skillet over medium-high heat. Add 2 tablespoons of butter and 1 tablespoon of sun-dried tomato oil."
    },
    {
      "step": "3",
      "instruction": "Once the butter is melted and foaming, add the shrimp in a single layer. Cook for 1-2 minutes per side until pink and just cooked through. Remove to a plate and set aside."
    },
    {
      "step": "4",
      "instruction": "Reduce heat to medium and add the remaining 2 tablespoons of butter to the same skillet. Add minced garlic and cook for 30 seconds until fragrant."
    },
    {
      "step": "5",
      "instruction": "Add the chopped sun-dried tomatoes and cook for 1 minute, stirring frequently."
    },
    {
      "step": "6",
      "instruction": "Pour in the heavy cream and bring to a gentle simmer. Stir in the Parmesan cheese until melted and smooth."
    },
    {
      "step": "7",
      "instruction": "Add the fresh spinach and cook until wilted, about 1-2 minutes. Season the sauce with salt, pepper, and red pepper flakes if using."
    },
    {
      "step": "8",
      "instruction": "Return the cooked shrimp to the skillet and toss to coat in the creamy sauce. Let simmer for 1-2 minutes to allow flavors to meld."
    },
    {
      "step": "9",
      "instruction": "Serve immediately over pasta, rice, or with crusty bread. Garnish with fresh basil and extra Parmesan cheese. Enjoy!"
    }
  ],

  "questions": {
    "title": "Frequently Asked Questions",
    "items": [
      {
        "question": "Can I use frozen shrimp?",
        "answer": "Absolutely! Just make sure to thaw them completely in the refrigerator overnight or quickly under cold running water. Pat them very dry before cooking to prevent excess moisture in the pan."
      },
      {
        "question": "Can I make this dairy-free?",
        "answer": "You can substitute coconut cream for the heavy cream and nutritional yeast for the Parmesan, though the flavor will be different. Coconut cream works surprisingly well with the sun-dried tomatoes!"
      },
      {
        "question": "What should I serve this with?",
        "answer": "This sauce is perfect over angel hair pasta, fettuccine, or linguine. It's also delicious with rice, cauliflower rice for a low-carb option, or simply with crusty bread to soak up every last drop of sauce."
      },
      {
        "question": "How do I prevent overcooking the shrimp?",
        "answer": "The key is to cook them quickly over medium-high heat—just 1-2 minutes per side. They're done when they turn pink and opaque. Remove them from the pan as soon as they're cooked, then add them back at the very end just to warm through."
      },
      {
        "question": "Can I add other vegetables?",
        "answer": "Definitely! Mushrooms, cherry tomatoes, or asparagus would all be great additions. Just sauté them after removing the shrimp and before adding the garlic."
      }
    ]
  },

  "mustKnowTips": [
    "Pat shrimp completely dry before cooking for the best sear",
    "Don't overcrowd the pan—cook shrimp in batches if needed",
    "Use freshly grated Parmesan for a smooth, creamy sauce",
    "Reserve some pasta water if serving over pasta—it helps thin the sauce",
    "Taste and adjust seasoning at the end—you may need more salt or garlic"
  ],

  "notes": [
    "For a lighter version, substitute half of the heavy cream with chicken broth",
    "Add a splash of white wine when cooking the garlic for extra depth",
    "Fresh spinach can be substituted with kale or arugula",
    "Store leftovers in an airtight container for up to 2 days—reheat gently",
    "Don't skip the sun-dried tomato oil—it adds incredible flavor!"
  ],

  "professionalSecrets": [
    "Reserve 2-3 shrimp and cook them separately to place on top as garnish—makes it look restaurant-worthy",
    "Add a teaspoon of Dijon mustard to the sauce for extra depth and complexity",
    "Finish with a squeeze of fresh lemon juice to brighten all the rich flavors",
    "Toast pine nuts and sprinkle on top for added texture and elegance",
    "Use a mix of sun-dried and fresh cherry tomatoes for beautiful color contrast"
  ],

  "tools": [
    "Large skillet or sauté pan (12-inch works best)",
    "Sharp knife for mincing garlic",
    "Cutting board",
    "Grater for Parmesan cheese",
    "Wooden spoon or spatula",
    "Paper towels for drying shrimp"
  ],

  "serving": "This recipe serves 4 people as a main dish. If serving over pasta, plan for 8-12 oz of cooked pasta.",

  "storage": "Store leftovers in an airtight container in the refrigerator for up to 2 days. Reheat gently in a skillet over low heat, adding a splash of cream or milk to loosen the sauce. Not recommended for freezing as cream-based sauces can separate.",

  "allergyInfo": "Contains: shellfish (shrimp), dairy (butter, cream, Parmesan cheese). Naturally gluten-free, but check labels on all packaged ingredients if serving to someone with celiac disease.",

  "nutritionDisclaimer": "Nutritional information is approximate and based on standard ingredient measurements. Values may vary depending on specific brands used and portion sizes. This recipe is designed for flavor and enjoyment rather than strict dietary adherence. Please consult with a healthcare professional for specific dietary needs.",

  "heroImage": "https://example.com/uploads/recipes/tuscan-shrimp-hero.webp",
  "featureImage": "https://example.com/uploads/recipes/tuscan-shrimp-feature.webp",
  "preparationImage": "https://example.com/uploads/recipes/tuscan-shrimp-prep.webp",
  "cookingImage": "https://example.com/uploads/recipes/tuscan-shrimp-cooking.webp",
  "finalPresentationImage": "https://example.com/uploads/recipes/tuscan-shrimp-final.webp",

  "images": [
    "https://example.com/uploads/recipes/tuscan-shrimp-1.webp",
    "https://example.com/uploads/recipes/tuscan-shrimp-2.webp",
    "https://example.com/uploads/recipes/tuscan-shrimp-3.webp",
    "https://example.com/uploads/recipes/tuscan-shrimp-4.webp"
  ],

  "img": "https://example.com/uploads/recipes/tuscan-shrimp-main.webp",
  "href": "/recipes/creamy-garlic-butter-tuscan-shrimp",

  "status": "published",
  "views": 0
}
```

## Critical Fields Explanation

### **Required Core Fields**
- `id`: Unique identifier (string)
- `slug`: URL-friendly version of title
- `title`: Recipe name
- `description`: Main description (2-3 sentences)
- `shortDescription`: Brief one-liner
- `category`: Category name
- `story`: Personal narrative about the recipe
- `intro`: Opening paragraph that hooks the reader

### **Named Image Fields (NEW - IMPORTANT!)**
These specific image fields are used for strategic placement throughout the recipe:

- `featureImage`: Main hero image at the top
- `preparationImage`: Shows ingredient prep (placed after ingredient guide)
- `cookingImage`: Shows cooking process (placed after cooking steps)
- `finalPresentationImage`: Final plated dish (placed just before recipe card)
- `images`: Array fallback for backward compatibility

### **Complete Process Structure (CRITICAL!)**
The `completeProcess` array uses this structure:
```json
{
  "title": "Section Title",
  "type": "steps",
  "items": ["Step 1 text", "Step 2 text", "..."]
}
```

**Important**: Use `items` array, NOT `description` field!

### **Essential Ingredient Guide**
Provides detailed context for key ingredients:
```json
{
  "ingredient": "Ingredient Name",
  "note": "Why it matters and tips for using it"
}
```

### **Author Object**
```json
{
  "name": "Author Name",
  "link": "/authors/author-slug",
  "avatar": "/uploads/authors/image.webp",
  "bio": "Brief author bio"
}
```

### **Timing Object**
```json
{
  "prepTime": "10 minutes",
  "cookTime": "20 minutes",
  "totalTime": "30 minutes"
}
```

### **Why You Love This**
```json
{
  "type": "list",
  "title": "Why You'll Love This Recipe",
  "items": ["Reason 1", "Reason 2", "..."]
}
```

## Field Layout in UI

The recipe content flows in this order:

1. **Feature Image** (`featureImage`)
2. Story
3. Why You'll Love This (`whyYouLove`)
4. Testimonial
5. Essential Ingredient Guide (`essIngredientGuide`)
6. **Preparation Image** (`preparationImage`)
7. Complete Cooking Process (`completeProcess`)
8. **Cooking Image** (`cookingImage`)
9. Dynamic Sections (if any)
10. FAQ Section (`questions`)
11. **Final Presentation Image** (`finalPresentationImage`)
12. Recipe Card (ingredients, instructions, timing)

## Best Practices for AI Generation

1. **Use conversational, friendly tone** - Write like you're talking to a friend
2. **Include personal anecdotes** in story and testimonial
3. **Be specific in measurements** - Always include units
4. **Provide context in essential ingredients** - Explain WHY each ingredient matters
5. **Break down complex steps** - Use `completeProcess` with clear, numbered steps
6. **Add helpful tips** - Use `mustKnowTips` and `professionalSecrets`
7. **Answer common questions** - Include 4-5 relevant FAQs
8. **Be descriptive** - Use sensory language (tastes, smells, textures)

## Common Mistakes to Avoid

❌ Using `description` instead of `items` in `completeProcess`  
❌ Forgetting to fill all 4 named image fields  
❌ Generic, boring descriptions  
❌ Missing essential ingredient explanations  
❌ Vague measurements like "a bit" or "some"  
❌ Overly formal, cookbook-style language  
❌ Not including personal touches (story, testimonial)

## Image URL Format

When generating image URLs, use this pattern:
```
https://chocofeverdream.com/uploads/recipes/image-[descriptor]-[timestamp]-[random].webp
```

Example:
```
https://chocofeverdream.com/uploads/recipes/image-wonder-1760392615140-3845.webp
```
