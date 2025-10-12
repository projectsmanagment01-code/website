/**
 * AI SEO Enhancement Dashboard
 * Admin interface for reviewing and managing AI-generated SEO content
 */

'use client';

import { useState, useEffect } from 'react';

interface SEOEnhancement {
  id: string;
  type: 'metadata' | 'image' | 'internal-link' | 'schema' | 'content';
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  confidence: number;
  suggestedContent: string;
  reasoning: string;
  keywords: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  recipeTitle?: string;
  createdAt: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  heroImage?: string;
  ingredients?: string[];
  instructions?: string[];
}

export default function AISeODashboard() {
  const [enhancements, setEnhancements] = useState<SEOEnhancement[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    applied: 0,
    impact: { high: 0, medium: 0, low: 0 }
  });

  // Mock data for demonstration
  useEffect(() => {
    loadEnhancements();
    loadStats();
  }, []);

  const loadEnhancements = async () => {
    // In real implementation, fetch from API
    const mockEnhancements: SEOEnhancement[] = [
      {
        id: '1',
        type: 'metadata',
        status: 'pending',
        confidence: 0.92,
        suggestedContent: JSON.stringify({
          title: 'Easy Chocolate Chip Cookies - 20-Minute Homemade Recipe',
          description: 'Bake perfect chocolate chip cookies in just 20 minutes! This easy recipe uses simple ingredients for soft, chewy cookies that taste better than store-bought.',
          keywords: ['chocolate chip cookies', 'easy cookies recipe', 'homemade cookies', '20 minute cookies']
        }),
        reasoning: 'Optimized title includes cooking time and difficulty level. Description emphasizes benefits and includes emotional triggers.',
        keywords: ['chocolate chip cookies', 'easy recipe', 'homemade'],
        estimatedImpact: 'high',
        recipeTitle: 'Chocolate Chip Cookies',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'image',
        status: 'pending',
        confidence: 0.88,
        suggestedContent: JSON.stringify({
          altText: 'Golden brown chocolate chip cookies cooling on wire rack with melted chocolate chips visible',
          caption: 'Freshly baked chocolate chip cookies with perfectly melted chocolate',
          title: 'Homemade Chocolate Chip Cookies'
        }),
        reasoning: 'Alt text is descriptive and includes key visual elements. Optimized for both SEO and accessibility.',
        keywords: ['chocolate chip cookies', 'baked cookies', 'homemade'],
        estimatedImpact: 'medium',
        recipeTitle: 'Chocolate Chip Cookies',
        createdAt: '2024-01-15T10:35:00Z'
      }
    ];
    
    setEnhancements(mockEnhancements);
  };

  const loadStats = () => {
    setStats({
      total: 15,
      pending: 8,
      applied: 7,
      impact: { high: 5, medium: 7, low: 3 }
    });
  };

  const generateSEOEnhancements = async (recipe: Recipe) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeData: recipe,
          enhancementTypes: ['metadata', 'images', 'schema', 'content-analysis']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO enhancements');
      }

      const result = await response.json();
      console.log('SEO enhancements generated:', result);
      
      // Refresh enhancements list
      await loadEnhancements();
      
    } catch (error) {
      console.error('Error generating SEO enhancements:', error);
      alert('Failed to generate SEO enhancements. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const approveEnhancement = async (enhancementId: string) => {
    setEnhancements(prev => 
      prev.map(e => 
        e.id === enhancementId 
          ? { ...e, status: 'applied' as const }
          : e
      )
    );
  };

  const rejectEnhancement = async (enhancementId: string) => {
    setEnhancements(prev => 
      prev.map(e => 
        e.id === enhancementId 
          ? { ...e, status: 'rejected' as const }
          : e
      )
    );
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      applied: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getImpactBadge = (impact: string) => {
    const impactColors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${impactColors[impact as keyof typeof impactColors]}`}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </span>
    );
  };

  const filteredEnhancements = enhancements.filter(e => {
    if (activeTab === 'all') return true;
    return e.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">AI SEO Enhancement Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Review and manage AI-generated SEO improvements for your recipes
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          disabled={isGenerating}
        >
          <svg className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Enhancements</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Generated by AI</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applied</p>
              <p className="text-3xl font-bold text-green-600">{stats.applied}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Live improvements</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Impact</p>
              <p className="text-3xl font-bold text-red-600">{stats.impact.high}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Priority improvements</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-4">Generate SEO enhancements for a specific recipe</p>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              const mockRecipe: Recipe = {
                id: 'test-recipe',
                title: 'Test Recipe for SEO Generation',
                description: 'A delicious test recipe to demonstrate AI SEO enhancement capabilities.',
                category: 'Desserts',
                heroImage: 'https://example.com/test-recipe.jpg',
                ingredients: ['2 cups flour', '1 cup sugar', '1/2 cup butter'],
                instructions: ['Mix ingredients', 'Bake for 20 minutes', 'Cool and serve']
              };
              generateSEOEnhancements(mockRecipe);
            }}
            disabled={isGenerating}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isGenerating ? 'Generating...' : 'Test AI SEO Generation'}
          </button>
          <button className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Bulk Process Recipes
          </button>
        </div>
      </div>

      {/* Enhancements List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">SEO Enhancements</h2>
          <p className="text-gray-600 mt-1">Review AI-generated SEO improvements</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'pending', label: `Pending (${stats.pending})` },
              { key: 'applied', label: `Applied (${stats.applied})` },
              { key: 'rejected', label: 'Rejected' },
              { key: 'all', label: `All (${stats.total})` }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhancements Content */}
        <div className="p-6">
          {filteredEnhancements.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enhancements found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No {activeTab === 'all' ? '' : activeTab + ' '}enhancements found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEnhancements.map((enhancement) => (
                <EnhancementCard
                  key={enhancement.id}
                  enhancement={enhancement}
                  onApprove={approveEnhancement}
                  onReject={rejectEnhancement}
                  getStatusBadge={getStatusBadge}
                  getImpactBadge={getImpactBadge}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EnhancementCardProps {
  enhancement: SEOEnhancement;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getImpactBadge: (impact: string) => JSX.Element;
}

function EnhancementCard({ 
  enhancement, 
  onApprove, 
  onReject, 
  getStatusBadge, 
  getImpactBadge 
}: EnhancementCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const suggestedData = JSON.parse(enhancement.suggestedContent);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'metadata':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'internal-link':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        );
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg border-l-4 border-l-blue-500 bg-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTypeIcon(enhancement.type)}
            <div>
              <h3 className="font-semibold text-gray-900 capitalize">
                {enhancement.type.replace('-', ' ')} Enhancement
              </h3>
              <p className="text-sm text-gray-600">{enhancement.recipeTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getImpactBadge(enhancement.estimatedImpact)}
            {getStatusBadge(enhancement.status)}
          </div>
        </div>

        {/* Confidence and Keywords */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>Confidence: {Math.round(enhancement.confidence * 100)}%</span>
          {enhancement.keywords.length > 0 && (
            <span>Keywords: {enhancement.keywords.slice(0, 3).join(', ')}</span>
          )}
        </div>

        {/* Reasoning */}
        <p className="text-sm text-gray-700 mb-4">{enhancement.reasoning}</p>

        {/* Preview of suggested content */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-sm text-gray-900 mb-2">Suggested Changes:</h4>
          {enhancement.type === 'metadata' && (
            <div className="space-y-2 text-sm">
              <div><strong className="text-gray-700">Title:</strong> <span className="text-gray-600">{suggestedData.title}</span></div>
              <div><strong className="text-gray-700">Description:</strong> <span className="text-gray-600">{suggestedData.description}</span></div>
            </div>
          )}
          {enhancement.type === 'image' && (
            <div className="space-y-2 text-sm">
              <div><strong className="text-gray-700">Alt Text:</strong> <span className="text-gray-600">{suggestedData.altText}</span></div>
              {suggestedData.caption && <div><strong className="text-gray-700">Caption:</strong> <span className="text-gray-600">{suggestedData.caption}</span></div>}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {enhancement.status === 'pending' && (
          <div className="flex gap-3">
            <button 
              onClick={() => onApprove(enhancement.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button 
              onClick={() => onReject(enhancement.id)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {showDetails ? 'Hide' : 'View'} Details
            </button>
          </div>
        )}

        {/* Detailed view */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Full Suggested Content:</h4>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto border text-gray-700">
              {JSON.stringify(suggestedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}