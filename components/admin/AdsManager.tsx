"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  BarChart,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";

interface Ad {
  id: string;
  name: string;
  type: "GOOGLE_ADSENSE" | "CUSTOM_HTML" | "IMAGE";
  placement: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  width?: number;
  height?: number;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  impressionCount: number;
  clickCount: number;
  createdAt: string;
}

const AD_PLACEMENTS = [
  { value: "recipe_sidebar_top", label: "Recipe Sidebar - Top" },
  { value: "recipe_sidebar_middle", label: "Recipe Sidebar - Middle" },
  { value: "recipe_sidebar_bottom", label: "Recipe Sidebar - Bottom" },
  { value: "recipe_below_image", label: "Recipe - Below Featured Image" },
  { value: "recipe_in_content_1", label: "Recipe - In Content (First)" },
  { value: "recipe_in_content_2", label: "Recipe - In Content (Second)" },
  { value: "recipe_in_content_3", label: "Recipe - In Content (Third)" },
  { value: "recipe_card_top", label: "Recipe Card - Top" },
  { value: "recipe_card_bottom", label: "Recipe Card - Bottom" },
  { value: "home_hero_below", label: "Home - Below Hero" },
  { value: "category_top", label: "Category - Top" },
  { value: "search_top", label: "Search - Top" },
  { value: "article_sidebar", label: "Article - Sidebar" },
  { value: "article_in_content", label: "Article - In Content" },
];

export default function AdsManager({ onBack }: { onBack?: () => void }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "GOOGLE_ADSENSE" as "GOOGLE_ADSENSE" | "CUSTOM_HTML" | "IMAGE",
    placement: "recipe_sidebar_top",
    content: "",
    imageUrl: "",
    linkUrl: "",
    width: 300,
    height: 250,
    priority: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const response = await fetch("/api/admin/ads", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAds(data.ads);
      }
    } catch (error) {
      console.error("Error loading ads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingAd
        ? `/api/admin/ads/${editingAd.id}`
        : "/api/admin/ads";
      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadAds();
        resetForm();
      } else {
        alert("Failed to save ad");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      alert("Error saving ad");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        await loadAds();
      } else {
        alert("Failed to delete ad");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ads/${id}/toggle`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        await loadAds();
      }
    } catch (error) {
      console.error("Error toggling ad status:", error);
    }
  };

  const startEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name,
      type: ad.type,
      placement: ad.placement,
      content: ad.content,
      imageUrl: ad.imageUrl || "",
      linkUrl: ad.linkUrl || "",
      width: ad.width || 300,
      height: ad.height || 250,
      priority: ad.priority,
      isActive: ad.isActive,
      startDate: ad.startDate || "",
      endDate: ad.endDate || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingAd(null);
    setShowForm(false);
    setFormData({
      name: "",
      type: "GOOGLE_ADSENSE",
      placement: "recipe_sidebar_top",
      content: "",
      imageUrl: "",
      linkUrl: "",
      width: 300,
      height: 250,
      priority: 0,
      isActive: true,
      startDate: "",
      endDate: "",
    });
  };

  const getCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return "0.00";
    return ((clicks / impressions) * 100).toFixed(2);
  };

  if (loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {editingAd ? "Edit Ad" : "Create New Ad"}
          </h2>
          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          {/* Ad Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Ad Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Ad Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Ad Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "GOOGLE_ADSENSE" | "CUSTOM_HTML" | "IMAGE",
                })
              }
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="GOOGLE_ADSENSE">Google AdSense</option>
              <option value="CUSTOM_HTML">Custom HTML</option>
              <option value="IMAGE">Image Ad</option>
            </select>
          </div>

          {/* Placement */}
          <div>
            <label className="block text-sm font-medium mb-2">Placement</label>
            <select
              value={formData.placement}
              onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {AD_PLACEMENTS.map((placement) => (
                <option key={placement.value} value={placement.value}>
                  {placement.label}
                </option>
              ))}
            </select>
          </div>

          {/* Content/Code (for AdSense and Custom HTML) */}
          {(formData.type === "GOOGLE_ADSENSE" || formData.type === "CUSTOM_HTML") && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.type === "GOOGLE_ADSENSE" ? "AdSense Code" : "HTML Code"}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                rows={8}
                placeholder={
                  formData.type === "GOOGLE_ADSENSE"
                    ? "<script async src='...'></script>\n<ins class='adsbygoogle'..."
                    : "<div>Your HTML code here</div>"
                }
                required
              />
            </div>
          )}

          {/* Image Ad Fields */}
          {formData.type === "IMAGE" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) =>
                      setFormData({ ...formData, width: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority (higher = shown first)
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border rounded-lg"
              min="0"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date (optional)
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                End Date (optional)
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active (show this ad)
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingAd ? "Update Ad" : "Create Ad"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-3xl font-bold">Ads Manager</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-5 h-5" />
          Create Ad
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Ads</div>
          <div className="text-3xl font-bold">{ads.length}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Active Ads</div>
          <div className="text-3xl font-bold text-green-600">
            {ads.filter((ad) => ad.isActive).length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Impressions</div>
          <div className="text-3xl font-bold">
            {ads.reduce((sum, ad) => sum + ad.impressionCount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Ads List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Placement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Impressions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ads.map((ad) => (
              <tr key={ad.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium">{ad.name}</div>
                  <div className="text-sm text-gray-500">Priority: {ad.priority}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {ad.type.replace("_", " ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {AD_PLACEMENTS.find((p) => p.value === ad.placement)?.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {ad.impressionCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {ad.clickCount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getCTR(ad.impressionCount, ad.clickCount)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(ad.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      ad.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ad.isActive ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(ad)}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ads.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No ads yet. Create your first ad to get started.
          </div>
        )}
      </div>
    </div>
  );
}
