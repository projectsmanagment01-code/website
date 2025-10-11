//[TODO: make hero seperate in layout] 2h  --- DONE
//[TODO: make About, Contact and Categories, with AI] 2h ---DONE
//[TODO: polish]
//[TODO: mock data for categors and recipes] 2h
//[TODO: seed the database]
//[TODO: dashboadr layout same style using AI]
//[TODO: test API in mock data file]
//[TODO: test dashboard with API]
//[TODO: SEO basic]
//[TODO: reusable components]  ---X
//[TODO: publish]
//[TODO: CDN and caching]
//[TODO: Optimize]
// estimated time: 8*2h == 16h
/*
1- wider side on recipe page-------------------------------------------------------------------------OK
2- color ob buttuon very dark gray-------------------------------------------------------------------OK
3- offset of author image----------------------------------------------------------------------------OK
4- text-[#c64118] in hero----------------------------------------------------------------------------OK
5- make the logo black ------------------------------------------------------------------------------OK
6- optimize more pagination--------------------------------------------------------------------------OK
7- test on several screens---------------------------------------------------------------------------OK
8- views on prod-------------------------------------------------------------------------------------OK
9- categories are missing----------------------------------------------------------------------------OK
10- latestrecipes more lines/content, images makethem grid 3 (more sqaured), three linse 3*3=9-------OK
11- it stretches on home page------------------------------------------------------------------------OK
12-Categories page-----------------------------------------------------------------------------------NO
13- Admin dashboard (persistent modifying)-----------------------------------------------------------OK
14- Admin dashboard (All pages content)--------------------------------------------------------------NO
15- Admin Dashboard (preview Images)-----------------------------------------------------------------OK
16- Admin Dashboard (block ads)----------------------------------------------------------------------OK
17- UI improvements  (Main page wider)---------------------------------------------------------------OK
18- UI improvements  (treding 4 grids)---------------------------------------------------------------OK
19- UI improvements  (explore page, raise resolution)------------------------------------------------OK
20- HTML embedded in content (now it does create links)----------------------------------------------NO
21- deploy auth--------------------------------------------------------------------------------------NO

*/

2025-Sep-07 22:09:50.795700
#14 41.46 > Build error occurred
2025-Sep-07 22:09:50.795700
#14 41.49 [Error: Failed to collect page data for /api/categories] {
2025-Sep-07 22:09:50.795700
#14 41.49   type: 'Error'
2025-Sep-07 22:09:50.795700
#14 41.49 }
2025-Sep-07 22:09:50.795700
#14 41.56  ELIFECYCLE  Command failed with exit code 1.
2025-Sep-07 22:09:50.924905
#14 ERROR: process "/bin/sh -c pnpm build" did not complete successfully: exit code: 1
2025-Sep-07 22:09:50.924905
------
2025-Sep-07 22:09:50.924905
> [ 9/10] RUN pnpm build:
2025-Sep-07 22:09:50.924905
41.45     at t (.next/server/webpack-runtime.js:1:127)
2025-Sep-07 22:09:50.924905
41.45     at t (.next/server/app/api/categories/route.js:1:2671)
2025-Sep-07 22:09:50.924905
41.45     at <unknown> (.next/server/app/api/categories/route.js:1:2703)
2025-Sep-07 22:09:50.924905
41.45     at t.X (.next/server/webpack-runtime.js:1:1191)
2025-Sep-07 22:09:50.924905
41.46
2025-Sep-07 22:09:50.924905
41.46 > Build error occurred
2025-Sep-07 22:09:50.924905
41.49 [Error: Failed to collect page data for /api/categories] {
2025-Sep-07 22:09:50.924905
41.49   type: 'Error'
2025-Sep-07 22:09:50.924905
41.49 }
2025-Sep-07 22:09:50.924905
41.56  ELIFECYCLE  Command failed with exit code 1.
2025-Sep-07 22:09:50.924905
------
2025-Sep-07 22:09:50.929431
Dockerfile:22
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
--------------------
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
20 |
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
21 |     # Build the app
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
22 | >>> RUN pnpm build
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
23 |
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
24 |     # Expose port (default Next.js port)
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
--------------------
2025-Sep-07 22:09:50.929431
2025-Sep-07 22:09:50.929431
failed to solve: process "/bin/sh -c pnpm build" did not complete successfully: exit code: 1
2025-Sep-07 22:09:50.932570
exit status 1
2025-Sep-07 22:09:50.996058
Oops something is not okay, are you okay? 😢
2025-Sep-07 22:09:51.001876
Dockerfile:22
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
--------------------
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
20 |
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
21 |     # Build the app
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
22 | >>> RUN pnpm build
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
23 |
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
24 |     # Expose port (default Next.js port)
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
--------------------
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
failed to solve: process "/bin/sh -c pnpm build" did not complete successfully: exit code: 1
2025-Sep-07 22:09:51.001876
2025-Sep-07 22:09:51.001876
exit status 1
2025-Sep-07 22:09:51.448379
Gracefully shutting down build container: u4o0s8c4k4cs0gc4o888cs0w

/*

pm2 start "yarn preview" --name "app"
pm2 save
pm2 startup


ssh root@82.25.90.64
janean
6:23 PM
AKb01ldoAQxw01#
You
6:24 PM
ssh root@82.25.90.64

*/

//alter user "prisma_guelma" with password '01305906559191';
//[TODO: GET RECIPES BY CATEGORIES]

//[DOCKER IMG BLOG i NGINX] ====> dashboard ===> POSTRRES DB

//[TODO: BARREL_OPTIMIZATION_PREFIX, Images]

/*
1- Terms & Conditions (Highly Recommended) Not explicitly required by AdSense, but strongly recommended. Helps protect you legally
2.Disclaimer Page (Recommended)
Important if your site deals with food, health, finance, or any advice-related content.
States that your content is for informational purposes only and not a substitute for professional advice.
Protects you from liability claims (e.g., if someone misuses a recipe or health tip).
3- Cookie Policy / Consent Notice (Depending on Region)
If you have traffic from EU (GDPR) or California (CCPA/CPRA), you must:
Show a cookie consent banner before cookies load.
Explain what cookies are used and why.
Allow users to manage their preferences.
4- Contact Page:
Should include:
A contact form and email address.
Business details (company name, address if available).


This pages are a must be for  the sace of adsense aproval 


1-Terms & Conditions 2-Disclaimer Page
3-Cookie Policy

email section at Contact
*/

/*
[TODO: make admin get suggestion for
 related recipes]
[TODO: add walid changes]
[TODO: deploy schema]
[TODO: make recipe content agnostic]

{
    "slug": "complete-sample-recipe",
    "href": "/recipes/complete-sample-recipe",
    "imageAlt": null,
    "categoryHref": null,
    "img": "/uploads/recipes/1756812205948-4fwj1yxuway.jpg",
    "title": "Complete Sample Recipe",
    "intro": "This is a complete sample recipe showing all available fields for your recipe system",
    "description": "Complete recipe description with all details and techniques",
    "shortDescription": "A comprehensive sample recipe with all possible fields",
    "story": "The fascinating story behind this recipe and how it came to be a family favorite",
    "testimonial": "What people are saying about this incredible dish and why they love it",
    "category": "main-dishes",
    "categoryLink": "/categories/main-dishes",
    "featuredText": "Featured Recipe",
    "updatedDate": "2025-09-01T17:36:16.231Z",
    "author": {
        "bio": "Professional chef with 10+ years experience in international cuisine",
        "link": "/authors/chef-sample",
        "name": "Chef Sample",
        "avatar": "/chef-avatar.jpg"
    },
    "whyYouLove": {
        "type": "Card",
        "items": [
            "**Quick weeknight solution** - Ready in under an hour with simple techniques",
            "**Restaurant-quality flavors** - Professional results in your home kitchen",
            "**Family-friendly** - Kids love the sweet and savory combination",
            "**Meal prep friendly** - Makes great leftovers for busy weeks"
        ],
        "title": "Why You'll Love It"
    },
    "timing": {
        "cookTime": "30 minutes",
        "prepTime": "15 minutes",
        "totalTime": "45 minutes"
    },
    "recipeInfo": {
        "cuisine": "Asian Fusion",
        "dietary": "Dairy-Free, Gluten-Free Option",
        "servings": "4 Servings (generous portions)",
        "difficulty": "Intermediate"
    },
    "questions": {
        "items": [
            {
                "answer": "Yes! Thaw and drain frozen broccoli well, then add it directly to the pan since it's already cooked.",
                "question": "Can I use frozen broccoli instead of fresh?"
            },
            {
                "answer": "Use tamari instead of soy sauce and replace any flour with cornstarch or rice flour.",
                "question": "How can I make this gluten-free?"
            },
            {
                "answer": "Absolutely! Store in the fridge for up to 4 days and reheat gently to avoid overcooking.",
                "question": "Can I meal prep this dish?"
            }
        ],
        "title": "Frequently Asked Questions"
    },
    "essIngredientGuide": [
        {
            "note": "Use fresh ginger for the best flavor - ground ginger won't provide the same aromatic impact",
            "ingredient": "Fresh ginger"
        },
        {
            "note": "This is what gives the sauce its distinctive nutty flavor. Don't substitute with regular oil",
            "ingredient": "Sesame oil"
        },
        {
            "note": "Natural honey creates the perfect glaze and balances the salty elements beautifully",
            "ingredient": "Real honey"
        }
    ],
    "ingredientGuide": null,
    "ingredients": [
        {
            "items": [
                "1/4 cup low sodium soy sauce",
                "3 tbsp honey",
                "2 tbsp sesame oil",
                "1 tbsp rice vinegar",
                "1 tsp fresh ginger, grated",
                "2 cloves garlic, minced"
            ],
            "section": "For the Sauce"
        },
        {
            "items": [
                "1.5 lbs chicken breast, cut into pieces",
                "4 cups broccoli florets",
                "2 tbsp cornstarch",
                "2 tbsp vegetable oil",
                "2 green onions, sliced",
                "1 tbsp sesame seeds"
            ],
            "section": "For the Main Dish"
        }
    ],
    "instructions": [
        {
            "step": "Step 01",
            "instruction": "Prepare all ingredients by washing, chopping, and measuring. Having everything ready makes the cooking process smooth and enjoyable."
        },
        {
            "step": "Step 02",
            "instruction": "Steam the broccoli until tender-crisp, about 5-6 minutes. Drain and rinse with cold water to stop cooking and preserve the bright color."
        },
        {
            "step": "Step 03",
            "instruction": "Toss chicken pieces with cornstarch until evenly coated. Heat oil in a large skillet and cook chicken until golden brown and cooked through."
        },
        {
            "step": "Step 04",
            "instruction": "Whisk together all sauce ingredients until smooth. Pour over cooked chicken and simmer until sauce thickens beautifully."
        },
        {
            "step": "Step 05",
            "instruction": "Add steamed broccoli to the saucy chicken and toss gently. Garnish with green onions and sesame seeds before serving hot."
        }
    ],
    "completeProcess": [
        {
            "title": "Preparation Phase",
            "description": "Start by gathering all ingredients and preparing your workspace. Cut the chicken into uniform pieces for even cooking, and trim the broccoli into bite-sized florets. Having everything prepped makes the actual cooking much smoother."
        },
        {
            "title": "Cooking Phase",
            "description": "Begin by steaming the broccoli until just tender-crisp - this preserves both color and nutrition. Meanwhile, coat the chicken with cornstarch and cook in batches to achieve that perfect golden crust."
        },
        {
            "title": "Sauce & Assembly",
            "description": "Whisk the sauce ingredients until completely smooth, then pour over the golden chicken. The sauce will thicken quickly, creating a glossy coating that clings perfectly to both chicken and vegetables."
        },
        {
            "title": "Final Presentation",
            "description": "Gently fold in the steamed broccoli and garnish with fresh green onions and sesame seeds. Serve immediately while hot for the best texture and flavor experience."
        }
    ],
    "sections": [
        {
            "type": "card",
            "after": "These professional techniques ensure restaurant-quality results every time you make this dish.",
            "items": [
                "Don't overcrowd the pan when cooking chicken - work in batches for proper browning",
                "Let the chicken cook undisturbed for 2-3 minutes to develop a golden crust",
                "Rinse steamed vegetables with cold water to stop cooking and preserve color"
            ],
            "title": "Professional Tips"
        }
    ],
    "faq": null,
    "relatedRecipes": [
        {
            "link": "/recipes/similar-asian-dish",
            "image": "/related-asian.jpg",
            "title": "Similar Asian Dish"
        },
        {
            "link": "/recipes/quick-dinner",
            "image": "/related-quick.jpg",
            "title": "Another Quick Dinner"
        }
    ],
    "mustKnowTips": [
        "**Fresh ginger is key** - Ground ginger won't provide the same bright, aromatic flavor",
        "**Don't skip the cornstarch** - It creates the perfect coating and helps thicken the sauce",
        "**Serve immediately** - This dish is best enjoyed hot and fresh from the pan"
    ],
    "professionalSecrets": [
        "**Room temperature chicken** - Let chicken sit out 15 minutes before cooking for even results",
        "**High heat searing** - Don't move the chicken too early to achieve perfect browning",
        "**Sauce consistency** - Adjust thickness with cornstarch slurry if needed"
    ],
    "serving": "Best served hot over steamed rice or noodles with fresh herbs",
    "storage": "Keeps well in refrigerator for 3 days, reheat gently to preserve texture",
    "heroImage": "/hero-image.jpg",
    "images": [
        "/uploads/recipes/1756812240762-17lo9ng5ml1.jpg"
    ],
    "notes": [
        "For Whole30 compliance, use coconut aminos instead of soy sauce",
        "Dish can be made dairy-free and gluten-free with simple substitutions",
        "Double the sauce recipe if you like extra saucy dishes"
    ],
    "tools": [
        "Large pot with steamer basket",
        "12-inch skillet or wok",
        "Sharp chef's knife",
        "Cutting board",
        "Mixing bowls",
        "Whisk",
        "Measuring cups and spoons"
    ],
    "allergyInfo": "Contains soy and sesame. Check all ingredients for potential allergens",
    "nutritionDisclaimer": "Nutritional information is approximate and should not be used as definitive health advice",
    "createdAt": "2025-09-01T17:36:16.243Z",
    "updatedAt": "2025-09-02T11:23:30.915Z",
    "id": "cmf1ei839000095ysuv7kirir"
}


*/

[TODO: merge modifications of walid]
[TODO: check for recipe images]
[TODO: when Adding an image edit recipe Imagesrc]


/*
server {

    server_name n8n.yourrecipesite.com;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/n8n.yourrecipesite.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/n8n.yourrecipesite.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = n8n.yourrecipesite.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;

    server_name n8n.yourrecipesite.com;
    return 404; # managed by Certbot


}
*/
