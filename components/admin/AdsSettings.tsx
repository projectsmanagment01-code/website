"use client";

/**
 * AdsSettings Component - Redesigned
 * 
 * Admin dashboard for managing ad placements.
 * Features:
 * - Create, edit, delete ads
 * - Multi-placement selection (one ad in multiple places)
 * - Preview ad placements
 * - Toggle active status
 * - Clean admin theme styling
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Save,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Copy,
  Info,
  Settings2,
  Target,
  Clock,
  Code,
  Image as ImageIcon,
  LayoutGrid
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";
import { Ad, AdPlacement, AdType, PLACEMENT_LABELS, AD_TYPE_LABELS } from "@/types/ads";

const PLACEMENTS: AdPlacement[] = [
  // Recipe Page - Hero Area
  'before-hero',
  'after-hero',
  // Recipe Page - Content Sections
  'before-content',
  'in-content',
  'in-content-2',
  'in-content-3',
  'after-story',
  'after-ingredients',
  'after-instructions',
  'after-tips',
  'after-essential-ingredients',
  'after-taste-profile',
  'after-timeline',
  'after-equipment',
  'after-temperature',
  'after-pairings',
  'after-pro-tips',
  'after-serving-suggestions',
  'after-special-notes',
  'after-variations',
  'before-recipe-card',
  // Sidebar
  'sidebar-top',
  'sidebar-middle',
  'sidebar-sticky',
  // Footer & Between
  'footer',
  'between-recipes',
  // Home Page
  'home-hero',
  'home-after-featured',
  'home-mid-content',
  'home-before-categories',
  'home-after-categories',
  'home-before-footer'
];

const PLACEMENT_DESCRIPTIONS: Record<AdPlacement, string> = {
  'before-hero': 'Top of recipe page, before hero image',
  'after-hero': 'Below hero image, above content',
  'before-content': 'Before main content starts',
  'in-content': 'Auto-inserted between recipe sections',
  'in-content-2': 'Second in-content slot',
  'in-content-3': 'Third in-content slot',
  'after-story': 'After the recipe story section',
  'after-ingredients': 'Below ingredients list',
  'after-instructions': 'Below cooking instructions',
  'after-tips': 'After "Why You\'ll Love This" tips',
  'after-essential-ingredients': 'After essential ingredient guide',
  'after-taste-profile': 'After taste/texture profile card',
  'after-timeline': 'After cooking timeline',
  'after-equipment': 'After equipment & shopping card',
  'after-temperature': 'After temperature guide',
  'after-pairings': 'After perfect pairings section',
  'after-pro-tips': 'After pro tips & mistakes card',
  'after-serving-suggestions': 'After serving suggestions',
  'after-special-notes': 'After chef\'s special notes',
  'after-variations': 'After recipe variations',
  'before-recipe-card': 'Before the recipe card at bottom',
  'sidebar-top': 'Top of sidebar on recipe pages',
  'sidebar-middle': 'Middle position in sidebar',
  'sidebar-sticky': 'Sticky ad that follows scroll in sidebar',
  'footer': 'At the bottom of pages',
  'between-recipes': 'In recipe card grids',
  'home-hero': 'Home page: after hero section',
  'home-after-featured': 'Home page: after featured/latest recipes',
  'home-mid-content': 'Home page: middle of content area',
  'home-before-categories': 'Home page: before categories section',
  'home-after-categories': 'Home page: after categories section',
  'home-before-footer': 'Home page: before footer/subscription'
};

const AD_TYPES: AdType[] = ['adsense', 'custom', 'affiliate', 'house'];

const PAGE_TYPES = ['home', 'recipe', 'category', 'article', 'search', 'author'];

interface AdFormData {
  name: string;
  description: string;
  adType: AdType;
  provider: string;
  slotId: string;
  publisherId: string;
  adFormat: string;
  placements: AdPlacement[]; // Changed from single placement to array
  position: number;
  sizes: string[];
  responsive: boolean;
  minWidth: number | null;
  maxWidth: number | null;
  targetPages: string[];
  targetCategories: string[];
  excludePages: string[];
  adCode: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  isActive: boolean;
  priority: number;
  lazyLoad: boolean;
  lazyOffset: string;
  startDate: string;
  endDate: string;
}

const defaultFormData: AdFormData = {
  name: '',
  description: '',
  adType: 'adsense',
  provider: 'google',
  slotId: '',
  publisherId: '',
  adFormat: 'auto',
  placements: [], // Changed to array
  position: 0,
  sizes: [],
  responsive: true,
  minWidth: null,
  maxWidth: null,
  targetPages: [],
  targetCategories: [],
  excludePages: [],
  adCode: '',
  imageUrl: '',
  linkUrl: '',
  altText: '',
  isActive: true,
  priority: 0,
  lazyLoad: true,
  lazyOffset: '200px',
  startDate: '',
  endDate: ''
};

export default function AdsSettings() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AdFormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<'basic' | 'targeting' | 'advanced'>('basic');
  
  // Filter state
  const [filterPlacement, setFilterPlacement] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  
  // View state
  const [viewMode, setViewMode] = useState<'placement' | 'list'>('list');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Fetch ads
  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterPlacement) params.append('placement', filterPlacement);
      if (filterType) params.append('adType', filterType);
      if (filterActive) params.append('isActive', filterActive);
      
      const response = await adminFetch(`/api/admin/ads?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      } else {
        throw new Error('Failed to fetch ads');
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      setMessage({ type: "error", text: "Failed to load ads" });
    } finally {
      setLoading(false);
    }
  }, [filterPlacement, filterType, filterActive]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Handle form submission - Creates multiple ads if multiple placements selected
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.placements.length === 0) {
      setMessage({ type: "error", text: "Please select at least one placement" });
      return;
    }
    
    setSaving(true);
    setMessage(null);

    try {
      if (editingId) {
        // Editing single ad - use first placement
        const response = await adminFetch(`/api/admin/ads/${editingId}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            placement: formData.placements[0] // Use first for edit
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update ad');
        }
        setMessage({ type: "success", text: "Ad updated successfully!" });
      } else {
        // Creating new - create one ad per placement
        const results = await Promise.all(
          formData.placements.map(placement =>
            adminFetch('/api/admin/ads', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...formData,
                placement,
                name: formData.placements.length > 1 
                  ? `${formData.name} (${PLACEMENT_LABELS[placement]})`
                  : formData.name
              })
            })
          )
        );

        const failed = results.filter(r => !r.ok);
        if (failed.length > 0) {
          throw new Error(`Failed to create ${failed.length} ad(s)`);
        }
        
        setMessage({ 
          type: "success", 
          text: formData.placements.length > 1 
            ? `${formData.placements.length} ads created successfully!`
            : "Ad created successfully!"
        });
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData(defaultFormData);
      setActiveTab('basic');
      fetchAds();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save ad" });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const response = await adminFetch(`/api/admin/ads/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Ad deleted!" });
        fetchAds();
      } else {
        throw new Error('Failed to delete ad');
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete ad" });
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const response = await adminFetch(`/api/admin/ads/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState })
      });

      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  // Open edit form
  const openEditForm = (ad: Ad) => {
    setFormData({
      name: ad.name,
      description: ad.description || '',
      adType: ad.adType,
      provider: ad.provider || '',
      slotId: ad.slotId || '',
      publisherId: ad.publisherId || '',
      adFormat: ad.adFormat || 'auto',
      placements: [ad.placement], // Convert single to array
      position: ad.position,
      sizes: ad.sizes || [],
      responsive: ad.responsive,
      minWidth: ad.minWidth ?? null,
      maxWidth: ad.maxWidth ?? null,
      targetPages: ad.targetPages || [],
      targetCategories: ad.targetCategories || [],
      excludePages: ad.excludePages || [],
      adCode: ad.adCode || '',
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      altText: ad.altText || '',
      isActive: ad.isActive,
      priority: ad.priority,
      lazyLoad: ad.lazyLoad,
      lazyOffset: ad.lazyOffset || '200px',
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
    });
    setEditingId(ad.id);
    setActiveTab('basic');
    setShowForm(true);
  };

  // Duplicate ad
  const duplicateAd = (ad: Ad) => {
    setFormData({
      name: `${ad.name} (Copy)`,
      description: ad.description || '',
      adType: ad.adType,
      provider: ad.provider || '',
      slotId: ad.slotId || '',
      publisherId: ad.publisherId || '',
      adFormat: ad.adFormat || 'auto',
      placements: [ad.placement],
      position: ad.position,
      sizes: ad.sizes || [],
      responsive: ad.responsive,
      minWidth: ad.minWidth ?? null,
      maxWidth: ad.maxWidth ?? null,
      targetPages: ad.targetPages || [],
      targetCategories: ad.targetCategories || [],
      excludePages: ad.excludePages || [],
      adCode: ad.adCode || '',
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      altText: ad.altText || '',
      isActive: false, // Start inactive
      priority: ad.priority,
      lazyLoad: ad.lazyLoad,
      lazyOffset: ad.lazyOffset || '200px',
      startDate: '',
      endDate: ''
    });
    setEditingId(null);
    setActiveTab('basic');
    setShowForm(true);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Toggle placement selection
  const togglePlacement = (placement: AdPlacement) => {
    setFormData(prev => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter(p => p !== placement)
        : [...prev.placements, placement]
    }));
  };

  // Group ads by placement
  const adsByPlacement = ads.reduce((acc, ad) => {
    if (!acc[ad.placement]) {
      acc[ad.placement] = [];
    }
    acc[ad.placement].push(ad);
    return acc;
  }, {} as Record<string, Ad[]>);

  // Stats
  const activeAds = ads.filter(a => a.isActive).length;
  const totalPlacements = new Set(ads.map(a => a.placement)).size;

  if (loading && ads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Ad Management</h2>
                  <p className="text-sm text-gray-500">Manage ads across your recipe pages</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setFormData(defaultFormData);
                setEditingId(null);
                setActiveTab('basic');
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Ad
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
              <div className="text-xs text-gray-500">Total Ads</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{activeAds}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{totalPlacements}</div>
              <div className="text-xs text-gray-500">Placements Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-6 mt-4 flex items-center gap-2 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="flex-1">{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Filters and View Toggle */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 flex flex-wrap gap-3">
            <select
              value={filterPlacement}
              onChange={(e) => setFilterPlacement(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Placements</option>
              {PLACEMENTS.map(p => (
                <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {AD_TYPES.map(t => (
                <option key={t} value={t}>{AD_TYPE_LABELS[t]}</option>
              ))}
            </select>
            
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('placement')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'placement' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              By Placement
            </button>
          </div>
        </div>

        {/* Ads List */}
        {ads.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ads Created Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first ad to start monetizing your recipe content. 
              You can add AdSense, custom HTML, or banner ads.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Your First Ad
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Placement</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{ad.name}</div>
                      {ad.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{ad.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ad.adType === 'adsense' ? 'bg-blue-100 text-blue-700' :
                        ad.adType === 'custom' ? 'bg-purple-100 text-purple-700' :
                        ad.adType === 'affiliate' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {AD_TYPE_LABELS[ad.adType]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{PLACEMENT_LABELS[ad.placement]}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleActive(ad.id, ad.isActive)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          ad.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ad.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => duplicateAd(ad)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditForm(ad)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>
        ) : (
          /* Placement View */
          <div className="space-y-3">
            {PLACEMENTS.map(placement => {
              const placementAds = adsByPlacement[placement] || [];
              const isExpanded = expandedSections[placement] ?? placementAds.length > 0;
              
              return (
                <div key={placement} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(placement)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${placementAds.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="font-medium text-gray-900">{PLACEMENT_LABELS[placement]}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        placementAds.length > 0 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {placementAds.length} ad{placementAds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-2 bg-blue-50 text-sm text-blue-700">
                        <Info className="w-4 h-4 inline mr-1" />
                        {PLACEMENT_DESCRIPTIONS[placement]}
                      </div>
                      {placementAds.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                          <p className="mb-3">No ads in this placement</p>
                          <button
                            onClick={() => {
                              setFormData({ ...defaultFormData, placements: [placement] });
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            + Add ad here
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {placementAds.map(ad => (
                            <div key={ad.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${ad.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <div>
                                  <div className="font-medium text-gray-900">{ad.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {AD_TYPE_LABELS[ad.adType]} • Priority: {ad.priority}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggleActive(ad.id, ad.isActive)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                  title={ad.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {ad.isActive ? (
                                    <Eye className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => openEditForm(ad)}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-500" />
                                </button>
                                <button
                                  onClick={() => handleDelete(ad.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Placement Guide */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Quick Tip</h4>
              <p className="text-sm text-blue-700">
                Use the <strong>sidebar-top</strong> and <strong>sidebar-sticky</strong> placements for maximum visibility on recipe pages.
                Sticky ads follow users as they scroll, increasing engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Ad' : 'Create New Ad'}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingId 
                    ? 'Update ad configuration and settings'
                    : 'Configure a new ad for your site'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6 bg-white">
              {[
                { id: 'basic', label: 'Basic Info', icon: Settings2 },
                { id: 'targeting', label: 'Targeting', icon: Target },
                { id: 'advanced', label: 'Advanced', icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Tab */}
                {activeTab === 'basic' && (
                  <>
                    {/* Name & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ad Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                          placeholder="e.g., Sidebar AdSense"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Ad Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.adType}
                          onChange={(e) => setFormData({ ...formData, adType: e.target.value as AdType })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {AD_TYPES.map(t => (
                            <option key={t} value={t}>{AD_TYPE_LABELS[t]}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Internal notes about this ad"
                      />
                    </div>

                    {/* Placements Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placements <span className="text-red-500">*</span>
                        {!editingId && (
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            (Select multiple to create ads in multiple locations)
                          </span>
                        )}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PLACEMENTS.map(placement => (
                          <label
                            key={placement}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              formData.placements.includes(placement)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.placements.includes(placement)}
                              onChange={() => togglePlacement(placement)}
                              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              disabled={editingId !== null && formData.placements.length === 1 && formData.placements.includes(placement)}
                            />
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{PLACEMENT_LABELS[placement]}</div>
                              <div className="text-xs text-gray-500">{PLACEMENT_DESCRIPTIONS[placement]}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {formData.placements.length > 1 && !editingId && (
                        <p className="mt-2 text-sm text-blue-600">
                          <Info className="w-4 h-4 inline mr-1" />
                          {formData.placements.length} ads will be created with the same settings
                        </p>
                      )}
                    </div>

                    {/* AdSense Settings */}
                    {formData.adType === 'adsense' && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-4">
                        <div className="flex items-center gap-2 text-blue-800">
                          <Code className="w-4 h-4" />
                          <h4 className="font-medium">AdSense Configuration</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slot ID</label>
                            <input
                              type="text"
                              value={formData.slotId}
                              onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="1234567890"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Publisher ID</label>
                            <input
                              type="text"
                              value={formData.publisherId}
                              onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="ca-pub-XXXXXXXX"
                            />
                            <p className="text-xs text-gray-500 mt-1">Or use NEXT_PUBLIC_ADSENSE_PUBLISHER_ID env</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ad Format</label>
                            <select
                              value={formData.adFormat}
                              onChange={(e) => setFormData({ ...formData, adFormat: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="auto">Auto</option>
                              <option value="horizontal">Horizontal</option>
                              <option value="vertical">Vertical</option>
                              <option value="rectangle">Rectangle</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.responsive}
                                onChange={(e) => setFormData({ ...formData, responsive: e.target.checked })}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Responsive sizing</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Custom Ad Code */}
                    {(formData.adType === 'custom' || formData.adType === 'adsense') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          <Code className="w-4 h-4 inline mr-1" />
                          Custom Ad Code {formData.adType === 'custom' && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          value={formData.adCode}
                          onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={5}
                          placeholder="<script>...</script> or HTML content"
                        />
                      </div>
                    )}

                    {/* Banner Settings */}
                    {(formData.adType === 'affiliate' || formData.adType === 'house') && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-100 space-y-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <ImageIcon className="w-4 h-4" />
                          <h4 className="font-medium">Banner Configuration</h4>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                            <input
                              type="url"
                              value={formData.imageUrl}
                              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="https://example.com/banner.jpg"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                              <input
                                type="url"
                                value={formData.linkUrl}
                                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com/landing"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text</label>
                              <input
                                type="text"
                                value={formData.altText}
                                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ad description"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Targeting Tab */}
                {activeTab === 'targeting' && (
                  <>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-4">
                      <div className="flex items-center gap-2 text-purple-800">
                        <Target className="w-4 h-4" />
                        <h4 className="font-medium">Page Targeting</h4>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Show on Pages</label>
                        <div className="flex flex-wrap gap-2">
                          {PAGE_TYPES.map(page => (
                            <label 
                              key={page} 
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                formData.targetPages.includes(page)
                                  ? 'border-purple-500 bg-purple-100 text-purple-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.targetPages.includes(page)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({ ...formData, targetPages: [...formData.targetPages, page] });
                                  } else {
                                    setFormData({ ...formData, targetPages: formData.targetPages.filter(p => p !== page) });
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className="text-sm capitalize">{page}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Leave empty to show on all pages</p>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-4">
                      <div className="flex items-center gap-2 text-orange-800">
                        <LayoutGrid className="w-4 h-4" />
                        <h4 className="font-medium">Viewport Restrictions</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Width (px)</label>
                          <input
                            type="number"
                            value={formData.minWidth || ''}
                            onChange={(e) => setFormData({ ...formData, minWidth: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 768 (hide on mobile)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Maximum Width (px)</label>
                          <input
                            type="number"
                            value={formData.maxWidth || ''}
                            onChange={(e) => setFormData({ ...formData, maxWidth: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 1024 (hide on desktop)"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Use these to show different ads on mobile vs desktop</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                      <input
                        type="number"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={0}
                        max={100}
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher priority ads are shown first when multiple ads target the same placement</p>
                    </div>
                  </>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                      <h4 className="font-medium text-gray-900">Loading Behavior</h4>
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.lazyLoad}
                            onChange={(e) => setFormData({ ...formData, lazyLoad: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Enable Lazy Loading</span>
                        </label>
                      </div>
                      
                      {formData.lazyLoad && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Lazy Load Offset</label>
                          <input
                            type="text"
                            value={formData.lazyOffset}
                            onChange={(e) => setFormData({ ...formData, lazyOffset: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="200px"
                          />
                          <p className="text-xs text-gray-500 mt-1">Load ad when within this distance from viewport</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                      <h4 className="font-medium text-gray-900">Scheduling</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Leave empty for no scheduling restrictions</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Active</span>
                          <p className="text-xs text-gray-500">Ad will be displayed on the site when active</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Form Footer */}
              <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || formData.placements.length === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update Ad' : `Create ${formData.placements.length > 1 ? `${formData.placements.length} Ads` : 'Ad'}`}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
