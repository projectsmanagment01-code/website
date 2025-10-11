"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Wand2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Mail,
  Building,
  Scale,
  ChefHat,
  Save,
  Eye,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

interface ContactCard {
  id: string;
  title: string;
  description: string;
  email: string;
  icon: string;
}

interface ContactContent {
  cards: ContactCard[];
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string | null;
}

const defaultCards: ContactCard[] = [
  {
    id: "advertisement",
    title: "Advertisement",
    description: "Looking to collaborate with Recipes By Clare? We'd love to hear from you! Reach out to discover exciting opportunities to showcase your brand through our recipes, articles, and more.",
    email: "ads@recipesbyclare.com",
    icon: "building"
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "Have questions about how we handle your personal data or our privacy practices? Contact us to learn more about our commitment to protecting your privacy. We're here to help.",
    email: "legal@recipesbyclare.com",
    icon: "scale"
  },
  {
    id: "recipes",
    title: "Recipes",
    description: "Curious about a recipe or need inspiration for your next meal? Whether it's a special dish or new ideas you're after, Recipes By Clare is here to guide you. Send us a message and let's talk cooking!",
    email: "contact@recipesbyclare.com",
    icon: "chef"
  }
];

export default function ContactContentEditor({ onBack }: { onBack?: () => void }) {
  const [content, setContent] = useState<ContactContent>({
    cards: defaultCards,
    metaTitle: "",
    metaDescription: "",
    lastUpdated: null,
  });
  
  const [generating, setGenerating] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/admin/content/contact", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.cards) {
          setContent(data);
        }
      }
    } catch (error) {
      console.error("Error loading content:", error);
      setMessage({
        type: "error",
        text: "Failed to load content"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCard = (cardId: string, field: keyof ContactCard, value: string) => {
    setContent(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId ? { ...card, [field]: value } : card
      )
    }));
  };

  const updateMetaField = (field: 'metaTitle' | 'metaDescription', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async (cardId: string, field: string) => {
    try {
      setGenerating(`${cardId}-${field}`);
      setMessage(null);

      const card = content.cards.find(c => c.id === cardId);
      if (!card) return;

      let prompt = "";
      
      switch (field) {
        case "title":
          prompt = `Generate a concise, professional title for a contact card section. The title should be 1-3 words and relate to: ${card.title}. Make it clear and direct for a recipe website contact page.`;
          break;
        case "description":
          prompt = `Generate a professional, friendly description for a contact card about "${card.title}" on a recipe website. Should explain what visitors can contact about and encourage them to reach out. Keep it warm and approachable, around 50-80 words.`;
          break;
        case "email":
          prompt = `Suggest a professional email address for "${card.title}" inquiries on a recipe website. Use format like: category@websitename.com. Make it relevant to the purpose.`;
          break;
      }

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/ai-generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt,
          field: `${cardId}-${field}`,
          contentType: field === "description" ? "description" : "text",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const generatedContent = result.content.trim();
        setLastGenerated(prev => ({ ...prev, [`${cardId}-${field}`]: generatedContent }));
        updateCard(cardId, field as keyof ContactCard, generatedContent);
        setMessage({
          type: "success",
          text: `Generated ${field} successfully!`
        });
      } else {
        throw new Error(result.error || "Failed to generate content");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to generate content"
      });
    } finally {
      setGenerating(null);
    }
  };

  const addCard = () => {
    const newCard: ContactCard = {
      id: `card-${Date.now()}`,
      title: "New Contact",
      description: "Description for this contact section",
      email: "new@example.com",
      icon: "mail"
    };
    setContent(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
  };

  const removeCard = (cardId: string) => {
    setContent(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }));
  };

  const saveContent = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/content/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...content,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Contact content saved successfully!"
        });
        await loadContent();
      } else {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save content"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open("/contact", "_blank");
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "building": return <Building className="w-4 h-4" />;
      case "scale": return <Scale className="w-4 h-4" />;
      case "chef": return <ChefHat className="w-4 h-4" />;
      case "mail": return <Mail className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact</h1>
            <p className="text-gray-600">
              Manage contact page cards and information
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded ${
          message.type === "success" 
            ? "bg-orange-50 border border-orange-200 text-orange-800" 
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveContent}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 hover:scale-105 disabled:opacity-50 transition-all duration-200"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
        <div className="space-y-3">
          {/* SEO Metadata */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SEO Metadata
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={content.metaTitle}
                  onChange={(e) => updateMetaField('metaTitle', e.target.value)}
                  placeholder="SEO title for contact page (50-60 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="text-xs text-gray-600 mt-1">
                  {content.metaTitle.length}/60 characters
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={content.metaDescription}
                  onChange={(e) => updateMetaField('metaDescription', e.target.value)}
                  placeholder="SEO description for contact page (150-160 characters)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200"
                />
                <div className="text-xs text-gray-600 mt-1">
                  {content.metaDescription.length}/160 characters
                </div>
              </div>
            </div>
          </div>

          {/* Contact Cards Header */}
          <div className="rounded border-2 border-gray-300 p-4 shadow-md hover:shadow-xl hover:scale-[1.01] transition-all duration-300" style={{backgroundColor: '#f0f0f0'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Contact Cards
              </h2>
              <button
                onClick={addCard}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-[#303740] hover:bg-[#404854] hover:scale-105 rounded transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Card
              </button>
            </div>

            {/* Contact Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {content.cards.map((card) => {
                const wasGenerated = (field: string) => lastGenerated[`${card.id}-${field}`] === card[field as keyof ContactCard];

                return (
                  <div 
                    key={card.id} 
                    className="p-4 rounded border-2 border-gray-300 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    style={{backgroundColor: '#ffffff'}}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getIcon(card.icon)}
                        <h3 className="font-medium text-gray-800">Contact Card</h3>
                      </div>
                      {content.cards.length > 1 && (
                        <button
                          onClick={() => removeCard(card.id)}
                          className="p-1 text-white bg-[#1B79D7] hover:bg-[#2987E5] hover:scale-110 rounded transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Title */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-700">Title</label>
                          <button
                            onClick={() => generateContent(card.id, "title")}
                            disabled={generating === `${card.id}-title`}
                            className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                          >
                            {generating === `${card.id}-title` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                          className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all duration-200 ${
                            wasGenerated('title') ? 'border-orange-500' : ''
                          }`}
                          placeholder="Card title"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-700">Description</label>
                          <button
                            onClick={() => generateContent(card.id, "description")}
                            disabled={generating === `${card.id}-description`}
                            className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                          >
                            {generating === `${card.id}-description` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <textarea
                          value={card.description}
                          onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                          rows={3}
                          className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm resize-none transition-all duration-200 ${
                            wasGenerated('description') ? 'border-orange-500' : ''
                          }`}
                          placeholder="Card description"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-medium text-gray-700">Email</label>
                          <button
                            onClick={() => generateContent(card.id, "email")}
                            disabled={generating === `${card.id}-email`}
                            className="p-1 text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 rounded transition-all duration-200 disabled:opacity-50"
                          >
                            {generating === `${card.id}-email` ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Wand2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <input
                          type="email"
                          value={card.email}
                          onChange={(e) => updateCard(card.id, 'email', e.target.value)}
                          className={`w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-sm transition-all duration-200 ${
                            wasGenerated('email') ? 'border-orange-500' : ''
                          }`}
                          placeholder="contact@example.com"
                        />
                      </div>

                      {/* Icon Selector */}
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Icon</label>
                        <div className="flex gap-2">
                          {["building", "scale", "chef", "mail"].map((iconName) => (
                            <button
                              key={iconName}
                              onClick={() => updateCard(card.id, 'icon', iconName)}
                              className={`p-2 border-2 rounded transition-all hover:scale-105 ${
                                card.icon === iconName
                                  ? "border-[#303740] bg-[#303740] text-white"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                              }`}
                            >
                              {getIcon(iconName)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }