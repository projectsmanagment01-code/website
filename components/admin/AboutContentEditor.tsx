"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wand2, RefreshCw, Save, Eye, AlertCircle, CheckCircle, Info, ArrowLeft } from "lucide-react";
import { refreshAfterChange } from "@/lib/revalidation-utils";

interface AboutPageSection {
  id: string;
  title: string;
  items: string[];
  icon: string;
  position: "left" | "right";
}

interface AboutPageContent {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  
  // SEO Metadata
  metaTitle: string;
  metaDescription: string;
  
  // Cards Content
  recipesCardTitle: string;
  recipesCardItems: string[];
  recipesCardIcon: string;
  recipesCardPosition: "left" | "right";
  
  meetAuthorCardTitle: string;
  meetAuthorCardItems: string[];
  meetAuthorCardIcon: string;
  meetAuthorCardPosition: "left" | "right";
  
  missionCardTitle: string;
  missionCardItems: string[];
  missionCardIcon: string;
  missionCardPosition: "left" | "right";
  
  customSections?: AboutPageSection[];
}

interface WebsiteContext {
  currentBrandName: string;
  currentDescription: string;
  currentDomain: string;
  currentUrl: string;
  currentYear: number;
  existingContent: string;
}

export default function AboutContentEditor({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [content, setContent] = useState<AboutPageContent>({
    heroTitle: "",
    heroSubtitle: "",
    metaTitle: "",
    metaDescription: "",
    recipesCardTitle: "What Will You Find on Recipes by Clare?",
    recipesCardItems: [
      "Time-tested family recipes that work every time",
      "Practical cooking tips from years of kitchen experience", 
      "Personal stories behind favorite family dishes",
      "Kitchen wisdom for cooks of all skill levels"
    ],
    recipesCardIcon: "flame", // Default icon
    recipesCardPosition: "left", // Default position
    meetAuthorCardTitle: "Meet Clare",
    meetAuthorCardItems: [
      "A passionate home cook sharing tried-and-true recipes",
      "Creator of RecipesByClare.com",
      "Dedicated to making cooking accessible and enjoyable", 
      "Bringing families together through shared meals"
    ],
    meetAuthorCardIcon: "chef", // Default icon
    meetAuthorCardPosition: "right", // Default position
    missionCardTitle: "My Mission",
    missionCardItems: [
      "Help you feel confident in your kitchen",
      "Share reliable, delicious recipes for every occasion",
      "Create joyful cooking experiences",
      "Build a community of happy home cooks"
    ],
    missionCardIcon: "hand", // Default icon
    missionCardPosition: "left", // Default position
    customSections: []
  });

  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  // Load current settings and content
  useEffect(() => {
    loadContent();
  }, []);

  const handleBack = () => {
    router.push("/admin/content");
  };

  const handlePreview = () => {
    window.open("/about", "_blank");
  };

  const loadContent = async () => {
    try {
      // Load admin settings
      const settingsResponse = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        setSettings(data);
        
        // Load existing about content if it exists
        if (data.aboutPageContent) {
          setContent(prev => ({ ...prev, ...data.aboutPageContent }));
        }
      }
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const getWebsiteContext = (): WebsiteContext => {
    return {
      currentBrandName: settings?.logoText || "Recipe Website",
      currentDescription: settings?.siteDescription || "",
      currentDomain: settings?.siteDomain || window?.location?.hostname || "",
      currentUrl: settings?.siteUrl || window?.location?.origin || "",
      currentYear: new Date().getFullYear(),
      existingContent: "",
    };
  };

  const generateFieldContent = async (fieldName: string, itemIndex?: number) => {
    try {
      setGeneratingField(itemIndex !== undefined ? `${fieldName}_${itemIndex}` : fieldName);
      setError(null);

      const websiteContext = getWebsiteContext();
      let prompt = "";

      // Create field-specific prompts
      switch (fieldName) {
        case "heroTitle":
          prompt = `Generate a compelling 3-4 word hero title for the About page of "${websiteContext.currentBrandName}" recipe website. Should be warm and inviting. No explanations, just the title:`;
          break;
          
        case "heroSubtitle":
          prompt = `Generate a 15-20 word subtitle for the About page hero section of "${websiteContext.currentBrandName}". Should explain what visitors will discover. No explanations, just the subtitle:`;
          break;
          
        case "metaTitle":
          prompt = `Generate a 50-60 character SEO meta title for the About page of "${websiteContext.currentBrandName}" recipe website. Should include brand name and be search-optimized. No explanations, just the title:`;
          break;
          
        case "metaDescription":
          prompt = `Generate a 150-160 character SEO meta description for the About page of "${websiteContext.currentBrandName}". Should summarize what visitors will learn about the brand/author and encourage clicks. No explanations, just the description:`;
          break;
          
        case "recipesCardTitle":
          prompt = `Generate a 5-8 word section title asking what visitors will find on "${websiteContext.currentBrandName}". Should be question format. No explanations, just the title:`;
          break;
          
        case "recipesCardItems":
          const recipesTitle = content.recipesCardTitle || "What Will You Find on Recipes by Clare?";
          prompt = `Generate one compelling bullet point specifically related to "${recipesTitle}" for "${websiteContext.currentBrandName}" recipe website. The content should directly answer or support what's mentioned in the title "${recipesTitle}". Focus on specific benefits, features, or content types. 8-12 words. No explanations, just the bullet point:`;
          break;
          
        case "meetAuthorCardTitle":
          prompt = `Generate a 2-3 word title to introduce the main author/chef of "${websiteContext.currentBrandName}". Should be personal and welcoming. No explanations, just the title:`;
          break;
          
        case "meetAuthorCardItems":
          const authorTitle = content.meetAuthorCardTitle || "Meet Clare";
          prompt = `Generate one bullet point about the author/chef mentioned in "${authorTitle}" for "${websiteContext.currentBrandName}". The content should relate to what "${authorTitle}" suggests - describing their personality, expertise, or background. 8-12 words. No explanations, just the bullet point:`;
          break;
          
        case "missionCardTitle":
          prompt = `Generate a 2-3 word title about the mission/purpose of "${websiteContext.currentBrandName}". Should be inspiring. No explanations, just the title:`;
          break;
          
        case "missionCardItems":
          const missionTitle = content.missionCardTitle || "My Mission";
          prompt = `Generate one bullet point that supports and explains "${missionTitle}" for "${websiteContext.currentBrandName}" recipe website. The content should directly relate to what "${missionTitle}" implies about the website's purpose or goals. 8-12 words. No explanations, just the bullet point:`;
          break;
          
        default:
          throw new Error(`AI generation not supported for field: ${fieldName}`);
      }

      const requestData = {
        prompt,
        field: fieldName,
        maxLength: fieldName.includes("Title") ? 60 : fieldName.includes("Items") ? 100 : 200,
        contentType: fieldName.includes("Title") ? "title" : "description",
        websiteContext,
      };

      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      const generatedContent = data.content || "";

      // Update the specific field with generated content
      if (fieldName.includes("Items") && itemIndex !== undefined) {
        setContent(prev => ({
          ...prev,
          [fieldName]: (prev[fieldName as keyof AboutPageContent] as string[]).map((item: string, index: number) => 
            index === itemIndex ? generatedContent : item
          )
        }));
      } else {
        setContent(prev => ({
          ...prev,
          [fieldName]: generatedContent
        }));
      }

    } catch (err) {
      console.error("Content generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGeneratingField(null);
    }
  };

  const handleInputChange = (fieldName: string, value: string, itemIndex?: number) => {
    // Handle custom section icons
    if (fieldName.startsWith("custom-") && fieldName.endsWith("-icon")) {
      const sectionId = fieldName.replace("custom-", "").replace("-icon", "");
      updateCustomSection(sectionId, "icon", value);
      return;
    }

    if (fieldName.includes("Items") && itemIndex !== undefined) {
      setContent(prev => ({
        ...prev,
        [fieldName]: (prev[fieldName as keyof AboutPageContent] as string[]).map((item: string, index: number) => 
          index === itemIndex ? value : item
        )
      }));
    } else {
      setContent(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const addListItem = (fieldName: string) => {
    setContent(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName as keyof AboutPageContent] as string[]), ""]
    }));
  };

  const removeListItem = (fieldName: string, index: number) => {
    setContent(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName as keyof AboutPageContent] as string[]).filter((_, i) => i !== index)
    }));
  };

  const saveContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          aboutPageContent: content
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save content");
      }

      setSuccess("About page content saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      // Immediately revalidate about page
      await refreshAfterChange(['about']);

    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  // Custom section management functions
  const addCustomSection = () => {
    const newSection: AboutPageSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      items: ["Add your first item here"],
      icon: "flame",
      position: content.customSections && content.customSections.length % 2 === 0 ? "left" : "right"
    };

    setContent(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection]
    }));
  };

  const removeCustomSection = (sectionId: string) => {
    setContent(prev => ({
      ...prev,
      customSections: prev.customSections?.filter(section => section.id !== sectionId) || []
    }));
  };

  const updateCustomSection = (sectionId: string, field: keyof AboutPageSection, value: any) => {
    setContent(prev => ({
      ...prev,
      customSections: prev.customSections?.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ) || []
    }));
  };

  const addCustomSectionItem = (sectionId: string) => {
    setContent(prev => ({
      ...prev,
      customSections: prev.customSections?.map(section =>
        section.id === sectionId
          ? { ...section, items: [...section.items, "New item"] }
          : section
      ) || []
    }));
  };

  const removeCustomSectionItem = (sectionId: string, itemIndex: number) => {
    setContent(prev => ({
      ...prev,
      customSections: prev.customSections?.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((_, index) => index !== itemIndex) }
          : section
      ) || []
    }));
  };

  const updateCustomSectionItem = (sectionId: string, itemIndex: number, value: string) => {
    console.log(`updateCustomSectionItem called: sectionId=${sectionId}, itemIndex=${itemIndex}, value="${value}"`);
    setContent(prev => ({
      ...prev,
      customSections: prev.customSections?.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item, index) =>
                index === itemIndex ? value : item
              )
            }
          : section
      ) || []
    }));
  };

  const generateCustomSectionContent = async (sectionId: string, field: string, itemIndex?: number) => {
    const section = content.customSections?.find(s => s.id === sectionId);
    if (!section) return;

    console.log(`Generating content for section ${sectionId}, field ${field}, itemIndex ${itemIndex}`);
    setGeneratingField(`custom-${sectionId}-${field}${itemIndex !== undefined ? `-${itemIndex}` : ''}`);
    
    try {
      const context = getWebsiteContext();
      let prompt = "";

      if (field === "title") {
        prompt = `Generate a section title for an About page.

Current: "${section.title}"

INSTRUCTIONS:
- Write ONLY the title (2-6 words)
- Make it engaging for a recipe blog
- NO explanations, NO quotes, NO extra text
- EXAMPLE: "Our Cooking Philosophy"

New title:`;
      } else if (field === "items") {
        if (itemIndex !== undefined) {
          prompt = `Generate exactly one bullet point for item ${itemIndex + 1} in the "${section.title}" section.

Current items:
${section.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

INSTRUCTIONS:
- Write ONLY the text for item ${itemIndex + 1}
- 10-20 words maximum
- Must be different from existing items
- Related to: "${section.title}"
- NO explanations, NO JSON, NO extra text
- EXAMPLE: "Creating memorable moments around the dinner table with loved ones"

Generate item ${itemIndex + 1}:`;
        } else {
          prompt = `Generate 4 bullet points for the "${section.title}" section.

INSTRUCTIONS:
- Return ONLY a JSON array of strings
- Each item: 10-20 words
- Related to: "${section.title}"
- For a recipe blog About page
- NO explanations outside the array

EXAMPLE FORMAT:
["First bullet point here", "Second bullet point here", "Third bullet point here", "Fourth bullet point here"]

Generate the JSON array:`;
        }
      }

      console.log(`Generated prompt:`, prompt);

      const requestData = {
        prompt,
        field: `custom-${field}${itemIndex !== undefined ? `-${itemIndex}` : ''}`,
        maxLength: field === "title" ? 50 : 100,
        contentType: field === "title" ? "title" : "description",
        websiteContext: context,
      };

      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(requestData),
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      console.log("API response data:", data);
      let generatedContent = data.content || "";

      if (field === "title") {
        console.log("Updating section title:", generatedContent.trim());
        updateCustomSection(sectionId, "title", generatedContent.trim());
        setSuccess(`Generated section title successfully!`);
      } else if (field === "items") {
        if (itemIndex !== undefined) {
          console.log(`Updating item ${itemIndex}:`, generatedContent.trim());
          updateCustomSectionItem(sectionId, itemIndex, generatedContent.trim());
          setSuccess(`Generated item ${itemIndex + 1} successfully!`);
        } else {
          // For generating all items, try to parse JSON first
          let itemsArray: string[] = [];
          
          try {
            const parsedItems = JSON.parse(generatedContent);
            if (Array.isArray(parsedItems)) {
              itemsArray = parsedItems.map((item: any) => String(item).trim()).filter((item: string) => item.length > 0);
              console.log("Successfully parsed JSON items:", itemsArray);
            }
          } catch (jsonError) {
            console.log("JSON parsing failed, using fallback method");
            // Fallback: split by lines and clean up
            const lines = generatedContent.split('\n')
              .map((line: string) => line.trim())
              .filter((line: string) => line.length > 0)
              .map((line: string) => line.replace(/^[-•*"\d+\.\s]+/, '').replace(/[",]*$/, '').trim())
              .filter((line: string) => line.length > 0);
            
            itemsArray = lines.slice(0, 4); // Take max 4 items
            console.log("Fallback parsed items:", itemsArray);
          }
          
          if (itemsArray.length > 0) {
            updateCustomSection(sectionId, "items", itemsArray);
            setSuccess(`Generated ${itemsArray.length} items successfully!`);
          } else {
            throw new Error("Could not extract valid items from AI response");
          }
        }
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate content. Please try again.");
    } finally {
      setGeneratingField(null);
    }
  };

  const renderIconSelector = (label: string, fieldName: string, currentIcon: string) => {
    const iconOptions = [
      { id: "flame", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7.885 9.176A3.98 3.98 0 0 0 5 13m2.885-3.824c1.97-.563 6.142-.925 6.942-3.169M7.885 9.176C7.885 5 12 6 12 2c2.047 0 3.503 2.11 2.827 4.007m0 0c1.627-.14 2.717 1.731 1.858 3.071m0 0c-.274.427-.724.775-1.185 1.041m1.185-1.04C18.642 9.534 19 11.293 19 13" />
        </svg>
      )},
      { id: "chef", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15.398 4.41A3.601 3.601 0 0 1 21 7.405A3.6 3.6 0 0 1 17.625 11H17m-1.602-6.59a3.602 3.602 0 0 0-6.796 0m6.796 0a3.6 3.6 0 0 1 .089 2.093m-5.769-.9A3.6 3.6 0 0 0 8.602 4.41m0 0A3.601 3.601 0 0 0 3 7.405A3.6 3.6 0 0 0 6.375 11H7m10 3v-4M7 14v-4m11 4.5c-1.599-.622-3.7-1-6-1s-4.4.378-6 1M17 17a5 5 0 0 1-10 0" />
        </svg>
      )},
      { id: "hand", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10.605 9.028L6.203 4.616a1.53 1.53 0 0 1 .012-2.162a1.523 1.523 0 0 1 2.157-.012l7.786 7.725c2.658 2.664 4.19 6.156 1.223 9.764l-.316.317a5.96 5.96 0 0 1-8.44 0l-3.188-3.15c-.593-.593-.58-1.568.027-2.177c.575-.577 1.48-.618 2.077-.115" />
        </svg>
      )},
      { id: "heart", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      )},
      { id: "star", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      )},
      { id: "utensils", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m3 2 1.578 6.671A1 1 0 0 0 5.557 9.5h0a1 1 0 0 0 .972-.758L8 2" />
          <path d="M6 16v6" />
          <path d="M6 9v7" />
          <path d="m18 2-1 8h-3l-1-8" />
          <path d="M16 16v6" />
          <path d="M16 10v6" />
        </svg>
      )},
      { id: "book", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      )},
      { id: "home", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      )},
      { id: "coffee", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" x2="6" y1="1" y2="4" />
          <line x1="10" x2="10" y1="1" y2="4" />
          <line x1="14" x2="14" y1="1" y2="4" />
        </svg>
      )},
      { id: "cake", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
          <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
          <path d="M2 21h20" />
          <path d="M7 8v2" />
          <path d="M12 8v2" />
          <path d="M17 8v2" />
          <path d="M7 4h.01" />
          <path d="M12 4h.01" />
          <path d="M17 4h.01" />
        </svg>
      )},
      { id: "leaf", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      )},
      { id: "apple", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
          <path d="M10 2c1 .5 2 2 2 5" />
        </svg>
      )},
      { id: "wheat", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 12h20" />
          <path d="M2 12v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5" />
          <path d="M7 12V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v5" />
          <path d="M22 5 12 2 2 5" />
        </svg>
      )},
      { id: "fish", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-4.44 6-7 6-3.56 0-7.56-2.54-8.5-6Z" />
          <path d="M18 12v.5" />
          <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
          <path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1.42-.23-2.48.04-2.48 1.5v10c0 1.46 1.06 1.73 2.48 1.5C5.58 18.03 7 16 7 13.33" />
          <path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h0a2 2 0 0 0-2 2v.5" />
        </svg>
      )},
      { id: "pizza", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M15 11h.01" />
          <path d="M11 15h.01" />
          <path d="M16 16h.01" />
          <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
        </svg>
      )},
      { id: "wine", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 22h8" />
          <path d="M7 10h10" />
          <path d="M12 15v7" />
          <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
        </svg>
      )},
      { id: "candy", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m9.5 7.5-3-3a4.5 4.5 0 0 0-6.364 6.364l3 3" />
          <path d="m14.5 16.5 3 3a4.5 4.5 0 0 0 6.364-6.364l-3-3" />
          <path d="m7.5 9.5 9 9" />
          <path d="M12 15l.5-.5" />
          <path d="M16 11l.5-.5" />
          <path d="M20 7l.5-.5" />
        </svg>
      )},
      { id: "soup", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 11h16a1 1 0 0 1 1 1v.5c0 3.5-2.5 6.5-6 6.5h-6c-3.5 0-6-3-6-6.5V12a1 1 0 0 1 1-1Z" />
          <path d="M6 7V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
          <path d="M10 3v1" />
          <path d="M14 3v1" />
        </svg>
      )},
      { id: "salad", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 21h10" />
          <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
          <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
          <path d="m13 12 4-4" />
          <path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2" />
        </svg>
      )},
      { id: "ice-cream", component: () => (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11" />
          <path d="M17 7A5 5 0 0 0 7 7" />
          <path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" />
        </svg>
      )}
    ];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {iconOptions.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => handleInputChange(fieldName, icon.id)}
              className={`p-2 border-2 rounded transition-all hover:shadow-md hover:scale-105 flex items-center justify-center ${
                currentIcon === icon.id
                  ? "border-[#303740] bg-[#303740] text-white"
                  : "border-gray-300 bg-white hover:border-gray-400 text-gray-600"
              }`}
              title={icon.id}
            >
              {icon.component()}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Selected: {currentIcon}
        </p>
      </div>
    );
  };

  const renderFieldWithAI = (
    label: string,
    fieldName: string,
    value: string,
    type: "input" | "textarea" = "input",
    placeholder?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => generateFieldContent(fieldName)}
          disabled={generatingField === fieldName}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Generate with AI"
        >
          {generatingField === fieldName ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Wand2 className="w-3 h-3" />
          )}
          {generatingField === fieldName ? "Generating..." : "AI Generate"}
        </button>
      </div>
      
      {type === "input" ? (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200"
        />
      )}
    </div>
  );

  const renderListField = (label: string, fieldName: string, items: string[]) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => addListItem(fieldName)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
        >
          Add Item
        </button>
      </div>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleInputChange(fieldName, e.target.value, index)}
            placeholder={`${label} item ${index + 1}`}
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          
          <button
            type="button"
            onClick={() => generateFieldContent(fieldName, index)}
            disabled={generatingField === `${fieldName}_${index}`}
            className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-110 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate with AI"
          >
            {generatingField === `${fieldName}_${index}` ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wand2 className="w-3 h-3" />
            )}
          </button>
          
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeListItem(fieldName, index)}
              className="px-2 py-2 text-xs font-medium text-white bg-[#1B79D7] hover:bg-[#2987E5] hover:scale-110 rounded transition-all duration-200"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderPositionSelector = (label: string, fieldName: string, currentPosition: "left" | "right") => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleInputChange(fieldName, "left")}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            currentPosition === "left"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Left
        </button>
        <button
          type="button"
          onClick={() => handleInputChange(fieldName, "right")}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
            currentPosition === "right"
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Right
        </button>
      </div>
    </div>
  );

  const renderCustomSection = (section: AboutPageSection, index: number) => (
    <div key={section.id} className="p-4 rounded shadow-md border-2 border-gray-300 hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Custom Section {index + 1}</h3>
        <button
          type="button"
          onClick={() => removeCustomSection(section.id)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#1B79D7] hover:bg-[#2987E5] hover:scale-105 rounded transition-all duration-200"
        >
          Remove Section
        </button>
      </div>

      {/* Section Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section Title
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateCustomSection(section.id, "title", e.target.value)}
            placeholder="Section title"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => generateCustomSectionContent(section.id, "title")}
            disabled={generatingField === `custom-${section.id}-title`}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Generate with AI"
          >
            {generatingField === `custom-${section.id}-title` ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Wand2 className="w-3 h-3" />
            )}
            AI
          </button>
        </div>
      </div>

      {/* Position Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Icon Position
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateCustomSection(section.id, "position", "left")}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              section.position === "left"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => updateCustomSection(section.id, "position", "right")}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              section.position === "right"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            Right
          </button>
        </div>
      </div>

      {/* Icon Selector */}
      {renderIconSelector("Section Icon", `custom-${section.id}-icon`, section.icon)}

      {/* Section Items */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Section Items
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => generateCustomSectionContent(section.id, "items")}
              disabled={generatingField === `custom-${section.id}-items`}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate all items with AI"
            >
              {generatingField === `custom-${section.id}-items` ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              AI All
            </button>
            <button
              type="button"
              onClick={() => addCustomSectionItem(section.id)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
            >
              Add Item
            </button>
          </div>
        </div>
        
        {section.items.map((item, itemIndex) => (
          <div key={itemIndex} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateCustomSectionItem(section.id, itemIndex, e.target.value)}
              placeholder={`Item ${itemIndex + 1}`}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            
            <button
              type="button"
              onClick={() => generateCustomSectionContent(section.id, "items", itemIndex)}
              disabled={generatingField === `custom-${section.id}-items-${itemIndex}`}
              className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 hover:scale-110 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate with AI"
            >
              {generatingField === `custom-${section.id}-items-${itemIndex}` ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
            </button>
            
            {section.items.length > 1 && (
              <button
                type="button"
                onClick={() => removeCustomSectionItem(section.id, itemIndex)}
                className="px-2 py-2 text-xs font-medium text-white bg-[#1B79D7] hover:bg-[#2987E5] hover:scale-110 rounded transition-all duration-200"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">{/* Following UI-STYLE-REFERENCE.md */}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  About
                </h1>
                <p className="text-sm text-gray-600">
                  Manage individual sections of your about page with AI assistance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={saveContent}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 hover:scale-105 disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className="bg-white border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              {error && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{success}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full px-2 py-4">
        <div className="space-y-3">
          {/* Hero and SEO in one row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Hero Section */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Hero Section
              </h2>
              
              <div className="space-y-3">
              {renderFieldWithAI(
                "Hero Title",
                "heroTitle",
                content.heroTitle,
                "input",
                "Main title for the about page"
              )}
              
              {renderFieldWithAI(
                "Hero Subtitle",
                "heroSubtitle", 
                content.heroSubtitle,
                "textarea",
                "Subtitle or description under the main title"
              )}
            </div>
          </div>

            {/* SEO Metadata */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Metadata
              </h2>
              
              <div className="space-y-3">
              {renderFieldWithAI(
                "Meta Title",
                "metaTitle",
                content.metaTitle,
                "input",
                "SEO title for search engines (50-60 characters)"
              )}
              
              {renderFieldWithAI(
                "Meta Description",
                "metaDescription",
                content.metaDescription,
                "textarea",
                "SEO description for search engines (150-160 characters)"
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Meta Title Length:</span> {content.metaTitle.length}/60
                  {content.metaTitle.length > 60 && <span className="text-red-500 ml-1">Too long!</span>}
                </div>
                <div>
                  <span className="font-medium">Meta Description Length:</span> {content.metaDescription.length}/160
                  {content.metaDescription.length > 160 && <span className="text-red-500 ml-1">Too long!</span>}
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Content Cards in grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Recipes Card */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What Will You Find Section
              </h2>
              
              <div className="space-y-3">
              {renderFieldWithAI(
                "Section Title",
                "recipesCardTitle",
                content.recipesCardTitle,
                "input",
                "Title for the recipes/content section"
              )}
              
              {renderPositionSelector(
                "Icon Position",
                "recipesCardPosition",
                content.recipesCardPosition
              )}
              
              {renderIconSelector(
                "Section Icon",
                "recipesCardIcon",
                content.recipesCardIcon
              )}
              
              {renderListField(
                "Content Items",
                "recipesCardItems",
                content.recipesCardItems
              )}
            </div>
          </div>

            {/* Meet Author Card */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Meet Author Section  
              </h2>
              
              <div className="space-y-3">
              {renderFieldWithAI(
                "Section Title",
                "meetAuthorCardTitle",
                content.meetAuthorCardTitle,
                "input",
                "Title for the author introduction section"
              )}
              
              {renderPositionSelector(
                "Icon Position",
                "meetAuthorCardPosition",
                content.meetAuthorCardPosition
              )}
              
              {renderIconSelector(
                "Section Icon",
                "meetAuthorCardIcon",
                content.meetAuthorCardIcon
              )}
              
              {renderListField(
                "Author Details",
                "meetAuthorCardItems",
                content.meetAuthorCardItems
              )}
            </div>
          </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Mission Card */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mission Section
              </h2>
              
              <div className="space-y-3">
              {renderFieldWithAI(
                "Section Title",
                "missionCardTitle",
                content.missionCardTitle,
                "input",
                "Title for the mission/purpose section"
              )}
              
              {renderPositionSelector(
                "Icon Position",
                "missionCardPosition",
                content.missionCardPosition
              )}
              
              {renderIconSelector(
                "Section Icon",
                "missionCardIcon",
                content.missionCardIcon
              )}
              
              {renderListField(
                "Mission Items",
                "missionCardItems",
                content.missionCardItems
              )}
            </div>
          </div>
          
            {/* Placeholder for future card or content */}
            <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Settings
              </h2>
              <p className="text-sm text-gray-600">Future expandable content area</p>
            </div>
          </div>

          {/* Custom Sections - Full Width */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Custom Sections
              </h2>
              <button
                type="button"
                onClick={addCustomSection}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
              >
                <span className="text-lg">+</span>
                Add New Section
              </button>
            </div>
            
            {content.customSections && content.customSections.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {content.customSections.map((section, index) => 
                  renderCustomSection(section, index)
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No custom sections yet.</p>
                <p className="text-xs mt-1">Click "Add New Section" to create your first custom section.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}