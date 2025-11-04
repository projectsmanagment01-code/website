"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ImagePickerModal from "./ImagePickerModal";
import { ImagePlus, Sparkles } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null); // "title", "description", or "both"

  // Form state with default values
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "/recipes", // Default to recipes page
    backgroundImage: "",
    isActive: true,
  });

  // Fetch slides
  const fetchSlides = async () => {
    try {
      const response = await fetch("/api/admin/hero-slides");
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error("Error fetching slides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create new slide
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSlides();
        setIsCreating(false);
        resetForm();
        alert("Slide created successfully!");
      } else {
        alert("Failed to create slide");
      }
    } catch (error) {
      console.error("Error creating slide:", error);
      alert("Error creating slide");
    }
  };

  // Update existing slide
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    try {
      const response = await fetch(`/api/admin/hero-slides/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchSlides();
        setEditingSlide(null);
        resetForm();
      } else {
        alert("Failed to update slide");
      }
    } catch (error) {
      console.error("Error updating slide:", error);
      alert("Error updating slide");
    }
  };

  // Delete slide
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const response = await fetch(`/api/admin/hero-slides/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSlides();
        alert("Slide deleted successfully!");
      } else {
        alert("Failed to delete slide");
      }
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert("Error deleting slide");
    }
  };

  // Toggle active status
  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const response = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slide.isActive }),
      });

      if (response.ok) {
        await fetchSlides();
      }
    } catch (error) {
      console.error("Error toggling slide status:", error);
    }
  };

  // Edit slide
  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      backgroundImage: slide.backgroundImage,
      isActive: slide.isActive,
    });
    setIsCreating(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "/recipes", // Reset to default
      backgroundImage: "",
      isActive: true,
    });
  };

  // Handle image selection from picker
  const handleImageSelect = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      backgroundImage: imageUrl,
    }));
    setShowImagePicker(false);
  };

  // Generate content with AI
  const handleAIGenerate = async (type: "title" | "description" | "both") => {
    setGeneratingAI(type);
    try {
      const response = await fetch("/api/admin/hero-slides/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          context: formData.title || formData.description || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response:", data);
        if (type === "both") {
          setFormData((prev) => ({
            ...prev,
            title: data.title,
            description: data.description,
          }));
        } else if (type === "title") {
          setFormData((prev) => ({
            ...prev,
            title: data.content,
          }));
        } else if (type === "description") {
          setFormData((prev) => ({
            ...prev,
            description: data.content,
          }));
        }
      } else {
        const error = await response.json();
        console.error("AI Error Response:", error);
        alert(`Failed: ${error.error || "Unknown error"}\n${error.details || ""}`);
      }
    } catch (error) {
      console.error("Error generating AI content:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setGeneratingAI(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingSlide(null);
    setIsCreating(false);
    resetForm();
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    newSlides.splice(draggedIndex, 1);
    newSlides.splice(index, 0, draggedSlide);

    setSlides(newSlides);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    // Update order in database
    const updatedSlides = slides.map((slide, index) => ({
      id: slide.id,
      order: index,
    }));

    try {
      await fetch("/api/admin/hero-slides/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: updatedSlides }),
      });
    } catch (error) {
      console.error("Error reordering slides:", error);
      alert("Failed to save new order");
      fetchSlides(); // Reload to get correct order
    }

    setDraggedIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading slides...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hero Slides Manager</h1>
        <p className="text-gray-600">
          Manage homepage hero slider. Drag and drop to reorder slides.
        </p>
      </div>

      {/* Create New Button */}
      {!isCreating && !editingSlide && (
        <button
          onClick={() => setIsCreating(true)}
          className="mb-6 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add New Slide
        </button>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingSlide) && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold mb-4">
            {editingSlide ? "Edit Slide" : "Create New Slide"}
          </h2>
          <form onSubmit={editingSlide ? handleUpdate : handleCreate}>
            <div className="space-y-4">
              {/* AI Generate Both Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAIGenerate("both")}
                  disabled={generatingAI !== null}
                  className="px-6 py-2.5 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-all shadow-sm hover:shadow-md"
                  title="Generate both title and description with AI"
                >
                  <Sparkles size={18} />
                  {generatingAI === "both" ? "Generating Both..." : "AI Generate Both"}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., Discover Delicious Recipes"
                  />
                  <button
                    type="button"
                    onClick={() => handleAIGenerate("title")}
                    disabled={generatingAI !== null}
                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-colors"
                    title="Generate title with AI"
                  >
                    <Sparkles size={16} />
                    {generatingAI === "title" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <div className="space-y-2">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., Easy, healthy, and flavorful meals for every occasion"
                  />
                  <button
                    type="button"
                    onClick={() => handleAIGenerate("description")}
                    disabled={generatingAI !== null}
                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap transition-colors"
                    title="Generate description with AI"
                  >
                    <Sparkles size={16} />
                    {generatingAI === "description" ? "Generating..." : "AI Generate"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Button Text *
                  </label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., Explore Recipes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Button Link *
                  </label>
                  <input
                    type="text"
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="e.g., /recipes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Background Image *
                </label>
                <div className="space-y-3">
                  {/* Image Picker Button */}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {formData.backgroundImage
                        ? "Change Image"
                        : "Select or Upload Image"}
                    </span>
                  </button>

                  {/* Manual URL Input (Optional) */}
                  <div className="relative">
                    <input
                      type="text"
                      name="backgroundImage"
                      value={formData.backgroundImage}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black text-sm"
                      placeholder="Or paste image URL manually"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.backgroundImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                      <Image
                        src={`${formData.backgroundImage}${formData.backgroundImage.includes('?') ? '&' : '?'}w=800&q=70`}
                        alt="Preview"
                        fill
                        quality={70}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            backgroundImage: "",
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Remove image"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label className="ml-2 text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                {editingSlide ? "Update Slide" : "Create Slide"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">
          Existing Slides ({slides.length})
        </h2>
        {slides.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No slides yet. Create your first slide to get started!
            </p>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow ${
                !slide.isActive ? "opacity-60" : ""
              }`}
            >
              <div className="flex gap-4">
                {/* Drag Handle */}
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                </div>

                {/* Image Preview */}
                <div className="relative w-32 h-20 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={`${slide.backgroundImage}${slide.backgroundImage.includes('?') ? '&' : '?'}w=200&q=60`}
                    alt={slide.title}
                    fill
                    quality={60}
                    className="object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Slide Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{slide.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {slide.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Order: {slide.order}</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        slide.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {slide.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      slide.isActive
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                  >
                    {slide.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelectImage={handleImageSelect}
        currentImage={formData.backgroundImage}
      />
    </div>
  );
}
