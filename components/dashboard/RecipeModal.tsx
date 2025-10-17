import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  ArrowLeft,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  FileText,
  Code,
  Eye,
} from "lucide-react";
import { Recipe } from "@/outils/types";
import { useAdmin } from "@/contexts/AdminContext";
import { AUTHOR_HERO_IMAGES } from "@/data/author-hero-images";
import { refreshAfterChange } from "@/lib/revalidation-utils";

// Import modular forms
import { BasicInfoForm } from "@/components/admin/forms/BasicInfoForm";
import { AuthorForm } from "@/components/admin/forms/AuthorForm";
import { TimingInfoForm } from "@/components/admin/forms/TimingInfoForm";
import { IngredientsForm } from "@/components/admin/forms/IngredientsForm";
import { InstructionsForm } from "@/components/admin/forms/InstructionsForm";
import { ProcessForm } from "@/components/admin/forms/ProcessForm";
import { SectionsForm } from "@/components/admin/forms/SectionsForm";
import { FAQForm } from "@/components/admin/forms/FAQForm";
import { RelatedRecipesForm } from "@/components/admin/forms/RelatedRecipesForm";
import { EssentialIngredientsForm } from "@/components/admin/forms/EssentialIngredientsForm";
import { WhyYouLoveForm } from "@/components/admin/forms/WhyYouLoveForm";
import { FileUpload } from "@/components/admin/FileUpload";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: Recipe | null;
  mode: "add" | "edit";
}

const FORM_STEPS = [
  {
    id: "json",
    title: "JSON Import",
    description: "Import recipe from JSON data",
  },
  {
    id: "basic",
    title: "Basic Info",
    description: "Title, intro, and basic details",
  },
  {
    id: "images",
    title: "Images",
    description: "Upload and manage recipe images",
  },
  { id: "author", title: "Author", description: "Author information and bio" },
  {
    id: "timing",
    title: "Timing & Info",
    description: "Cook times, difficulty, and recipe info",
  },
  {
    id: "whyYouLove",
    title: "Why You'll Love It",
    description: "Compelling reasons to try this recipe",
  },
  {
    id: "ingredients",
    title: "Ingredients",
    description: "Recipe ingredients organized by sections",
  },
  {
    id: "essIngredientGuide",
    title: "Essential Ingredients",
    description: "Key ingredient notes and tips",
  },
  {
    id: "instructions",
    title: "Instructions",
    description: "Step-by-step cooking instructions",
  },
  {
    id: "process",
    title: "Process Steps",
    description: "Visual process breakdown",
  },
  {
    id: "sections",
    title: "Additional Sections",
    description: "Extra content sections and tips",
  },
  { id: "faq", title: "FAQ", description: "Frequently asked questions" },
  {
    id: "related",
    title: "Related Recipes",
    description: "Related and similar recipes",
  },
];

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  recipe,
  mode,
}) => {
  const { createRecipe, updateRecipe, loading } = useAdmin();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Recipe>>({});
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [jsonSuccess, setJsonSuccess] = useState(false);
  
  // Upload progress state for bulk uploads
  const [uploadProgress, setUploadProgress] = useState({
    show: false,
    current: 0,
    total: 0,
    errors: [] as string[]
  });

  useEffect(() => {
    if (recipe && mode === "edit") {
      setFormData(recipe);
    } else if (mode === "add") {
      // Always reset to empty values for add mode, regardless of previous state
      setFormData({
        id: Date.now().toString(),
        slug: "",
        img: "",
        heroImage: "",
        images: [],
        href: "",
        title: "",
        intro: "",
        author: {
          name: "",
          link: "",
          avatar: "",
          bio: "",
        },
        timing: {
          prepTime: "",
          cookTime: "",
          totalTime: "",
        },
        recipeInfo: {
          difficulty: "",
          cuisine: "",
          servings: "",
          dietary: "",
        },
        whyYouLove: {
          type: "Card",
          title: "Why You'll Love It",
          items: [],
        },
        ingredients: [],
        essIngredientGuide: [],
        instructions: [],
        completeProcess: [],
        sections: [],
        questions: {
          title: "Frequently Asked Questions",
          items: [],
        },
        relatedRecipes: [],
      });
      // Also clear JSON input when switching to add mode
      setJsonInput("");
      setJsonError("");
      setJsonSuccess(false);
      // Reset to first step
      setCurrentStep(0);
    }
  }, [recipe, mode]);

  const handleSave = async () => {
    try {
      const { id, ...dataWithoutId } = formData;
      const recipeData = {
        ...dataWithoutId,
        // Generate slug if not provided
        slug:
          formData.slug ||
          formData.title
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim() ||
          "",
        // Generate href if not provided
        href: formData.href || `/recipes/${formData.slug}`,
      } as Recipe;

      // Debug: Log the recipe data being sent
      console.log("💾 RecipeModal: About to save recipe");
      console.log("- Title:", recipeData.title);
      console.log("- Main Image (img):", recipeData.img);
      console.log("- Hero Image:", recipeData.heroImage);
      console.log("- Additional Images:", recipeData.images);

      if (mode === "edit" && recipe?.id) {
        console.log("RecipeModal: About to update recipe with ID:", recipe.id);
        await updateRecipe(recipe.id, recipeData);
      } else {
        console.log("RecipeModal: About to create new recipe");
        await createRecipe(recipeData);
      }
      
      // Immediately revalidate affected pages
      await refreshAfterChange(['recipes', 'categories', 'home']);
      
      onClose();
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const updateFormData = (field: keyof Recipe, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Bulk upload handler for multiple images
  const handleBulkUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate file count (max 10 images)
    if (files.length > 10) {
      alert("Maximum 10 images allowed at once");
      return;
    }

    // Filter and validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.warn(`Skipping large file: ${file.name} (${file.size} bytes)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      alert("No valid image files found. Please select JPG, PNG, or WebP files under 5MB.");
      return;
    }

    // Initialize progress
    setUploadProgress({
      show: true,
      current: 0,
      total: validFiles.length,
      errors: []
    });

    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    // Upload files sequentially to avoid overwhelming the server
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("category", "recipes");

        const token = localStorage.getItem("admin_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          uploadedUrls.push(result.url);
        } else {
          errors.push(`${file.name}: ${result.error || 'Upload failed'}`);
        }
      } catch (error) {
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Update progress
      setUploadProgress(prev => ({
        ...prev,
        current: i + 1,
        errors
      }));

      // Small delay to prevent overwhelming the server
      if (i < validFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Update form data with new images
    if (uploadedUrls.length > 0) {
      const currentImages = formData.images || [];
      updateFormData("images", [...currentImages, ...uploadedUrls]);
    }

    // Hide progress after a moment
    setTimeout(() => {
      setUploadProgress(prev => ({ ...prev, show: false }));
    }, 2000);

    // Show summary
    if (uploadedUrls.length > 0 && errors.length > 0) {
      alert(`Upload completed!\n✅ ${uploadedUrls.length} images uploaded successfully\n❌ ${errors.length} images failed`);
    } else if (errors.length > 0) {
      alert(`Upload failed for all images:\n${errors.join('\n')}`);
    }
  };

  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // JSON Import Functions
  const handleJsonImport = () => {
    setJsonError("");
    setJsonSuccess(false);

    try {
      const parsedData = JSON.parse(jsonInput);

      // Validate that it's a recipe object
      if (!parsedData.title) {
        setJsonError("JSON must contain a 'title' field");
        return;
      }

      // Merge with existing form data and fill in defaults
      const importedData = {
        ...formData,
        ...parsedData,
        id: parsedData.id || Date.now().toString(),
        slug:
          parsedData.slug ||
          parsedData.title
            ?.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim() ||
          "",
        href: parsedData.href || `/recipes/${parsedData.slug}`,
        // Ensure required nested objects exist
        author: {
          name: "",
          link: "",
          avatar: "",
          bio: "",
          ...parsedData.author,
        },
        timing: {
          prepTime: "",
          cookTime: "",
          totalTime: "",
          ...parsedData.timing,
        },
        recipeInfo: {
          difficulty: "",
          cuisine: "",
          servings: "",
          dietary: "",
          ...parsedData.recipeInfo,
        },
      };

      setFormData(importedData);
      setJsonSuccess(true);

      // Auto-advance to next step after successful import
      setTimeout(() => {
        setCurrentStep(1); // Move to Basic Info tab
      }, 1000);
    } catch (error) {
      setJsonError(
        `Invalid JSON: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const loadSampleJson = async () => {
    try {
      // Fetch the actual recipe.json file from your project
      const response = await fetch('/api/recipe/sample');
      if (!response.ok) {
        throw new Error('Failed to fetch sample recipe');
      }
      
      const sampleRecipe = await response.json();
      
      // Remove the id field since we're creating a new recipe
      const { id, ...recipeWithoutId } = sampleRecipe;
      
      // Update title to indicate it's a copy
      recipeWithoutId.title = `${recipeWithoutId.title} (Copy)`;
      
      setJsonInput(JSON.stringify(recipeWithoutId, null, 2));
    } catch (error) {
      console.error('Error loading sample JSON:', error);
      
      // Fallback to a minimal structure if fetch fails
      const fallbackRecipe = {
      title: "Complete Sample Recipe",
      intro:
        "This is a complete sample recipe showing all available fields for your recipe system",
      img: "/main-image.jpg",
      heroImage: "/hero-image.jpg",
      images: ["/process-1.jpg", "/process-2.jpg", "/ingredients.jpg"],
      category: "main-dishes",
      categoryLink: "/categories/main-dishes",
      featuredText: "Featured Recipe",
      description:
        "Complete recipe description with all details and techniques",
      shortDescription:
        "A comprehensive sample recipe with all possible fields",
      story:
        "The fascinating story behind this recipe and how it came to be a family favorite",
      testimonial:
        "What people are saying about this incredible dish and why they love it",
      serving: "Best served hot over steamed rice or noodles with fresh herbs",
      storage:
        "Keeps well in refrigerator for 3 days, reheat gently to preserve texture",
      allergyInfo:
        "Contains soy and sesame. Check all ingredients for potential allergens",
      nutritionDisclaimer:
        "Nutritional information is approximate and should not be used as definitive health advice",

      author: {
        name: "Chef Sample",
        link: "/authors/chef-sample",
        avatar: "/chef-avatar.jpg",
        bio: "Professional chef with 10+ years experience in international cuisine",
      },

      timing: {
        prepTime: "15 minutes",
        cookTime: "30 minutes",
        totalTime: "45 minutes",
      },

      recipeInfo: {
        difficulty: "Intermediate",
        cuisine: "Asian Fusion",
        servings: "4 Servings (generous portions)",
        dietary: "Dairy-Free, Gluten-Free Option",
      },

      whyYouLove: {
        type: "Card",
        title: "Why You'll Love It",
        items: [
          "**Quick weeknight solution** - Ready in under an hour with simple techniques",
          "**Restaurant-quality flavors** - Professional results in your home kitchen",
          "**Family-friendly** - Kids love the sweet and savory combination",
          "**Meal prep friendly** - Makes great leftovers for busy weeks",
        ],
      },

      essIngredientGuide: [
        {
          ingredient: "Fresh ginger",
          note: "Use fresh ginger for the best flavor - ground ginger won't provide the same aromatic impact",
        },
        {
          ingredient: "Sesame oil",
          note: "This is what gives the sauce its distinctive nutty flavor. Don't substitute with regular oil",
        },
        {
          ingredient: "Real honey",
          note: "Natural honey creates the perfect glaze and balances the salty elements beautifully",
        },
      ],

      ingredients: [
        {
          section: "For the Sauce",
          items: [
            "1/4 cup low sodium soy sauce",
            "3 tbsp honey",
            "2 tbsp sesame oil",
            "1 tbsp rice vinegar",
            "1 tsp fresh ginger, grated",
            "2 cloves garlic, minced",
          ],
        },
        {
          section: "For the Main Dish",
          items: [
            "1.5 lbs chicken breast, cut into pieces",
            "4 cups broccoli florets",
            "2 tbsp cornstarch",
            "2 tbsp vegetable oil",
            "2 green onions, sliced",
            "1 tbsp sesame seeds",
          ],
        },
      ],

      instructions: [
        {
          step: "Step 01",
          instruction:
            "Prepare all ingredients by washing, chopping, and measuring. Having everything ready makes the cooking process smooth and enjoyable.",
        },
        {
          step: "Step 02",
          instruction:
            "Steam the broccoli until tender-crisp, about 5-6 minutes. Drain and rinse with cold water to stop cooking and preserve the bright color.",
        },
        {
          step: "Step 03",
          instruction:
            "Toss chicken pieces with cornstarch until evenly coated. Heat oil in a large skillet and cook chicken until golden brown and cooked through.",
        },
        {
          step: "Step 04",
          instruction:
            "Whisk together all sauce ingredients until smooth. Pour over cooked chicken and simmer until sauce thickens beautifully.",
        },
        {
          step: "Step 05",
          instruction:
            "Add steamed broccoli to the saucy chicken and toss gently. Garnish with green onions and sesame seeds before serving hot.",
        },
      ],

      completeProcess: [
        {
          title: "Preparation Phase",
          description:
            "Start by gathering all ingredients and preparing your workspace. Cut the chicken into uniform pieces for even cooking, and trim the broccoli into bite-sized florets. Having everything prepped makes the actual cooking much smoother.",
        },
        {
          title: "Cooking Phase",
          description:
            "Begin by steaming the broccoli until just tender-crisp - this preserves both color and nutrition. Meanwhile, coat the chicken with cornstarch and cook in batches to achieve that perfect golden crust.",
        },
        {
          title: "Sauce & Assembly",
          description:
            "Whisk the sauce ingredients until completely smooth, then pour over the golden chicken. The sauce will thicken quickly, creating a glossy coating that clings perfectly to both chicken and vegetables.",
        },
        {
          title: "Final Presentation",
          description:
            "Gently fold in the steamed broccoli and garnish with fresh green onions and sesame seeds. Serve immediately while hot for the best texture and flavor experience.",
        },
      ],

      sections: [
        {
          type: "card",
          title: "Professional Tips",
          items: [
            "Don't overcrowd the pan when cooking chicken - work in batches for proper browning",
            "Let the chicken cook undisturbed for 2-3 minutes to develop a golden crust",
            "Rinse steamed vegetables with cold water to stop cooking and preserve color",
          ],
          after:
            "These professional techniques ensure restaurant-quality results every time you make this dish.",
        },
      ],

      questions: {
        title: "Frequently Asked Questions",
        items: [
          {
            question: "Can I use frozen broccoli instead of fresh?",
            answer:
              "Yes! Thaw and drain frozen broccoli well, then add it directly to the pan since it's already cooked.",
          },
          {
            question: "How can I make this gluten-free?",
            answer:
              "Use tamari instead of soy sauce and replace any flour with cornstarch or rice flour.",
          },
          {
            question: "Can I meal prep this dish?",
            answer:
              "Absolutely! Store in the fridge for up to 4 days and reheat gently to avoid overcooking.",
          },
        ],
      },

      relatedRecipes: [
        {
          title: "Similar Asian Dish",
          image: "/related-asian.jpg",
          link: "/recipes/similar-asian-dish",
        },
        {
          title: "Another Quick Dinner",
          image: "/related-quick.jpg",
          link: "/recipes/quick-dinner",
        },
      ],

      mustKnowTips: [
        "**Fresh ginger is key** - Ground ginger won't provide the same bright, aromatic flavor",
        "**Don't skip the cornstarch** - It creates the perfect coating and helps thicken the sauce",
        "**Serve immediately** - This dish is best enjoyed hot and fresh from the pan",
      ],

      professionalSecrets: [
        "**Room temperature chicken** - Let chicken sit out 15 minutes before cooking for even results",
        "**High heat searing** - Don't move the chicken too early to achieve perfect browning",
        "**Sauce consistency** - Adjust thickness with cornstarch slurry if needed",
      ],

      notes: [
        "For Whole30 compliance, use coconut aminos instead of soy sauce",
        "Dish can be made dairy-free and gluten-free with simple substitutions",
        "Double the sauce recipe if you like extra saucy dishes",
      ],

      tools: [
        "Large pot with steamer basket",
        "12-inch skillet or wok",
        "Sharp chef's knife",
        "Cutting board",
        "Mixing bowls",
        "Whisk",
        "Measuring cups and spoons",
      ],
    };
      
      setJsonInput(JSON.stringify(fallbackRecipe, null, 2));
    }
  };

  const renderCurrentForm = () => {
    const stepId = FORM_STEPS[currentStep].id;

    switch (stepId) {
      case "json":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Code className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                JSON Import
              </h3>
              <span className="text-sm text-gray-500">
                Import recipe data from JSON format
              </span>
            </div>

            {/* JSON Input Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Paste your recipe JSON data:
                </label>
                <button
                  onClick={loadSampleJson}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Load Recipe Template
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "title": "My Recipe Title",
  "intro": "Recipe introduction...",
  "ingredients": [...],
  "instructions": [...],
  ...
}`}
                className="w-full h-80 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
              />

              {/* Import Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleJsonImport}
                  disabled={!jsonInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <FileText className="w-4 h-4" />
                  Import JSON
                </button>

                <button
                  onClick={() => {
                    setJsonInput("");
                    setJsonError("");
                    setJsonSuccess(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              </div>

              {/* Success Message */}
              {jsonSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-green-800 font-medium">
                      JSON imported successfully!
                    </p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Recipe data has been loaded. You can now review and edit the
                    data in the other tabs.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {jsonError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-red-800 font-medium">Import Error</p>
                  </div>
                  <p className="text-red-700 text-sm mt-1">{jsonError}</p>
                </div>
              )}
            </div>

            {/* JSON Format Guide */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
              <h5 className="font-medium text-purple-900 mb-3">
                📋 JSON Format Guide
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
                <div>
                  <h6 className="font-medium mb-2">Required Fields:</h6>
                  <ul className="space-y-1">
                    <li>
                      • <code>title</code>: Recipe title (string)
                    </li>
                    <li>
                      • <code>intro</code>: Recipe introduction (string)
                    </li>
                  </ul>
                </div>
                <div>
                  <h6 className="font-medium mb-2">Optional Fields:</h6>
                  <ul className="space-y-1">
                    <li>
                      • <code>img</code>: Main image URL
                    </li>
                    <li>
                      • <code>heroImage</code>: Hero banner URL
                    </li>
                    <li>
                      • <code>images</code>: Array of image URLs
                    </li>
                    <li>
                      • <code>ingredients</code>: Ingredients array
                    </li>
                    <li>
                      • <code>instructions</code>: Instructions array
                    </li>
                    <li>
                      • <code>author</code>: Author object
                    </li>
                    <li>
                      • <code>timing</code>: Timing object
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 p-3 bg-purple-100 rounded text-xs text-purple-700">
                <strong>Tip:</strong> Click "Load Sample JSON" above to see a
                complete example structure.
              </div>
            </div>
          </div>
        );
      case "basic":
        return (
          <BasicInfoForm
            title={formData.title || ""}
            intro={formData.intro || ""}
            category={formData.category || ""}
            categoryLink={formData.categoryLink || ""}
            onChange={(field, value) =>
              updateFormData(field as keyof Recipe, value)
            }
          />
        );
      case "images":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Recipe Images
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Recipe Image */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Main Recipe Image</h4>
                <FileUpload
                  label="Upload main image"
                  category="recipes"
                  currentImage={formData.img || ""}
                  showRecipeLinking={mode === "add"}
                  onFileUploaded={(fileUrl, fileName) => {
                    console.log("🖼️ RecipeModal: Main image uploaded", {
                      fileUrl,
                      fileName,
                    });
                    updateFormData("img", fileUrl);
                  }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Additional Images Gallery - Enhanced with Bulk Upload */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Additional Images</h4>
                <span className="text-sm text-gray-500">
                  {(formData.images || []).length} image(s) uploaded
                </span>
              </div>

              {/* Bulk Upload Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all hover:border-blue-400 hover:bg-blue-50/50">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                    Bulk Image Upload
                  </h5>
                  <p className="text-sm text-gray-600 mb-4">
                    Select multiple images or drag and drop them here
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.multiple = true;
                        input.onchange = async (e) => {
                          const files = Array.from((e.target as HTMLInputElement).files || []);
                          if (files.length > 0) {
                            await handleBulkUpload(files);
                          }
                        };
                        input.click();
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select Images
                    </button>
                    
                    <span className="text-gray-400">or</span>
                    
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'bg-blue-50');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
                      }}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-50');
                        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                        if (files.length > 0) {
                          await handleBulkUpload(files);
                        }
                      }}
                      className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg transition-all cursor-pointer"
                    >
                      <span className="text-sm text-gray-600">Drag & Drop Zone</span>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Supports: JPG, PNG, WebP • Max size: 5MB per image • Up to 10 images at once
                  </div>
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress.show && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Uploading {uploadProgress.current} of {uploadProgress.total} images...
                    </span>
                    <span className="text-sm text-blue-700">
                      {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                      }}
                    ></div>
                  </div>
                  {uploadProgress.errors.length > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Failed to upload {uploadProgress.errors.length} image(s)
                    </div>
                  )}
                </div>
              )}

              {/* Simple Image Grid - Clean & Working */}
              {(formData.images || []).length > 0 && (
                <div className="space-y-4">
                  <h5 className="text-sm font-medium text-gray-700">
                    Uploaded Images ({(formData.images || []).length})
                  </h5>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {(formData.images || []).map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={(e) => {
                              e.currentTarget.parentElement!.classList.remove('bg-gray-200');
                              e.currentTarget.parentElement!.classList.add('bg-white');
                            }}
                            onError={(e) => {
                              console.log('Image failed to load:', imageUrl);
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='12' fill='%23666'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...(formData.images || [])];
                              newImages.splice(index, 1);
                              updateFormData("images", newImages);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                          
                          {/* Image number */}
                          <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!formData.images || formData.images.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No additional images uploaded yet</p>
                  <p className="text-xs text-gray-400">Add process shots, ingredients, or variations</p>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <p className="font-medium">📸 Image Guidelines:</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Main image: Primary recipe photo (required)</li>
                <li>• Hero image: Large banner image for featured recipes</li>
                <li>
                  • Additional images: Process shots, ingredients, variations
                </li>
                <li>• Use high-quality images (min 800px width recommended)</li>
                <li>• Supported formats: JPG, PNG, WebP</li>
              </ul>
            </div>
          </div>
        );
      case "author":
        return (
          <AuthorForm
            img={recipe?.heroImage || ""}
            author={
              formData.author || { name: "", link: "", avatar: "", bio: "" }
            }
            authorId={formData.authorId} // Pass authorId for auto-population
            onChange={(author, authorId) => {
              updateFormData("author", author);
              if (authorId) {
                updateFormData("authorId", authorId);
              } else {
                // Remove authorId if manually entering author
                updateFormData("authorId", undefined);
              }
            }}
          />
        );
      case "timing":
        return (
          <TimingInfoForm
            timing={
              formData.timing || { prepTime: "", cookTime: "", totalTime: "" }
            }
            recipeInfo={
              formData.recipeInfo || {
                difficulty: "",
                cuisine: "",
                servings: "",
                dietary: "",
              }
            }
            onTimingChange={(timing) => updateFormData("timing", timing)}
            onRecipeInfoChange={(recipeInfo) =>
              updateFormData("recipeInfo", recipeInfo)
            }
          />
        );
      case "whyYouLove":
        return (
          <WhyYouLoveForm
            whyYouLove={
              formData.whyYouLove || {
                type: "Card",
                title: "Why You'll Love It",
                items: [],
              }
            }
            onChange={(whyYouLove) => updateFormData("whyYouLove", whyYouLove)}
          />
        );
      case "ingredients":
        return (
          <IngredientsForm
            ingredients={formData.ingredients || []}
            onChange={(ingredients) =>
              updateFormData("ingredients", ingredients)
            }
          />
        );
      case "essIngredientGuide":
        return (
          <EssentialIngredientsForm
            essIngredientGuide={formData.essIngredientGuide || []}
            onChange={(essIngredientGuide) =>
              updateFormData("essIngredientGuide", essIngredientGuide)
            }
          />
        );
      case "instructions":
        return (
          <InstructionsForm
            instructions={formData.instructions || []}
            onChange={(instructions) =>
              updateFormData("instructions", instructions)
            }
          />
        );
      case "process":
        return (
          <ProcessForm
            process={formData.completeProcess || []}
            onChange={(process) => updateFormData("completeProcess", process)}
          />
        );
      case "sections":
        return (
          <SectionsForm
            sections={formData.sections || []}
            onChange={(sections) => updateFormData("sections", sections)}
          />
        );
      case "faq":
        return (
          <FAQForm
            faq={formData.questions?.items || []}
            onChange={(faq) =>
              updateFormData("questions", {
                title:
                  formData.questions?.title || "Frequently Asked Questions",
                items: faq,
              })
            }
          />
        );
      case "related":
        return (
          <RelatedRecipesForm
            relatedRecipes={formData.relatedRecipes || []}
            onChange={(relatedRecipes) =>
              updateFormData("relatedRecipes", relatedRecipes)
            }
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2 md:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl mx-2 md:mx-0">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white gap-3 md:gap-0">
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                {mode === "edit" ? "Edit Recipe" : "Add New Recipe"}
              </h2>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <span className="text-sm text-blue-600 font-medium">
                  {FORM_STEPS[currentStep].title}
                </span>
                <span className="text-gray-300 hidden sm:inline">•</span>
                <span className="text-xs md:text-sm text-gray-600">
                  {FORM_STEPS[currentStep].description}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 self-end md:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white">
            <nav
              className="flex overflow-x-auto scrollbar-hide px-2 md:px-0"
              aria-label="Tabs"
            >
              {FORM_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`group relative min-w-0 flex-1 overflow-hidden py-3 md:py-4 px-2 md:px-4 text-center text-xs md:text-sm font-medium hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 ${
                    index === currentStep
                      ? "text-blue-600"
                      : index < currentStep
                      ? "text-green-600 hover:text-green-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  aria-current={index === currentStep ? "page" : undefined}
                >
                  <div className="flex flex-col items-center space-y-1 md:space-y-2">
                    <div
                      className={`w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-200 ${
                        index === currentStep
                          ? "bg-blue-600 text-white"
                          : index < currentStep
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                      }`}
                    >
                      {index < currentStep ? "✓" : index + 1}
                    </div>
                    <span className="block truncate">{step.title}</span>
                  </div>

                  {/* Active tab indicator */}
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors duration-200 ${
                      index === currentStep ? "bg-blue-600" : "bg-transparent"
                    }`}
                  />
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {renderCurrentForm()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {FORM_STEPS.length}
              </span>

              {currentStep === FORM_STEPS.length - 1 ? (
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.title}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Save className="w-4 h-4" />
                  {loading
                    ? "Saving..."
                    : mode === "edit"
                    ? "Update Recipe"
                    : "Create Recipe"}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={currentStep === FORM_STEPS.length - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
