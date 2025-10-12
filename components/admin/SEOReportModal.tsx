/**
 * SEO Report Details Modal
 * Shows comprehensive AI-generated SEO suggestions and improvements
 */
"use client";

import React from 'react';
import { X, CheckCircle, Image, Link as LinkIcon, FileCode, Tag, ExternalLink } from 'lucide-react';

interface AIResponse {
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  images?: {
    altText?: string;
    title?: string;
    description?: string;
  };
  links?: Array<{
    anchorText?: string;
    targetUrl?: string;
    targetTitle?: string;
    context?: string;
  }>;
  schema?: any;
  error?: string;
}

interface SEOReportDetails {
  id: string;
  recipeId: string;
  recipeTitle: string;
  status: string;
  seoScore: number | null;
  enhancementsCount: number;
  processingTime: number | null;
  metadataGenerated: boolean;
  imagesProcessed: number;
  linksGenerated: number;
  schemaEnhanced: boolean;
  errorMessage: string | null;
  aiResponse: AIResponse | null;
  createdAt: string;
}

interface SEOReportModalProps {
  report: SEOReportDetails | null;
  onClose: () => void;
}

export default function SEOReportModal({ report, onClose }: SEOReportModalProps) {
  if (!report) return null;

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-blue-600';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number | null) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">SEO Report Details</h2>
            <p className="text-orange-100 text-sm mt-1">{report.recipeTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Overview */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Overall SEO Score</h3>
                <p className="text-sm text-gray-600">AI-calculated optimization score</p>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(report.seoScore)}`}>
                  {report.seoScore || 0}
                </div>
                <div className="text-sm text-gray-500 mt-1">{getScoreLabel(report.seoScore)}</div>
              </div>
            </div>

            {/* Enhancement Stats */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg ${report.metadataGenerated ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <Tag className={`w-4 h-4 ${report.metadataGenerated ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs font-medium ${report.metadataGenerated ? 'text-green-700' : 'text-red-700'}`}>
                    Metadata
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${report.metadataGenerated ? 'text-green-700' : 'text-red-700'}`}>
                  {report.metadataGenerated ? '✓' : '✗'}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${report.imagesProcessed > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <Image className={`w-4 h-4 ${report.imagesProcessed > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs font-medium ${report.imagesProcessed > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Images
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${report.imagesProcessed > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {report.imagesProcessed}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${report.linksGenerated > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <LinkIcon className={`w-4 h-4 ${report.linksGenerated > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs font-medium ${report.linksGenerated > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    Links
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${report.linksGenerated > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {report.linksGenerated}
                </div>
              </div>

              <div className={`p-3 rounded-lg ${report.schemaEnhanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  <FileCode className={`w-4 h-4 ${report.schemaEnhanced ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-xs font-medium ${report.schemaEnhanced ? 'text-green-700' : 'text-red-700'}`}>
                    Schema
                  </span>
                </div>
                <div className={`text-lg font-bold mt-1 ${report.schemaEnhanced ? 'text-green-700' : 'text-red-700'}`}>
                  {report.schemaEnhanced ? '✓' : '✗'}
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {report.errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-600 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{report.errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {report.aiResponse && (
            <>
              {/* Metadata Suggestions */}
              {report.aiResponse.metadata && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Metadata Suggestions (25 points)</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {report.aiResponse.metadata.title && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">SEO Title</label>
                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-900">
                          {report.aiResponse.metadata.title}
                        </div>
                      </div>
                    )}
                    {report.aiResponse.metadata.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">Meta Description</label>
                        <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-900">
                          {report.aiResponse.metadata.description}
                        </div>
                      </div>
                    )}
                    {report.aiResponse.metadata.keywords && report.aiResponse.metadata.keywords.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">Keywords</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {report.aiResponse.metadata.keywords.map((keyword, idx) => (
                            <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image Suggestions */}
              {report.aiResponse.images && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <Image className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Image Optimization (20 points)</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {report.aiResponse.images.altText && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">Alt Text</label>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm text-gray-900">
                          {report.aiResponse.images.altText}
                        </div>
                      </div>
                    )}
                    {report.aiResponse.images.title && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">Image Title</label>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm text-gray-900">
                          {report.aiResponse.images.title}
                        </div>
                      </div>
                    )}
                    {report.aiResponse.images.description && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 uppercase">Image Description</label>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded text-sm text-gray-900">
                          {report.aiResponse.images.description}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Internal Links */}
              {report.aiResponse.links && report.aiResponse.links.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Internal Link Suggestions (25 points)</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {report.aiResponse.links.map((link, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{link.anchorText}</div>
                            {link.targetTitle && (
                              <div className="text-xs text-gray-600 mt-1">→ {link.targetTitle}</div>
                            )}
                            {link.context && (
                              <div className="text-xs text-gray-500 mt-2 italic">"{link.context}"</div>
                            )}
                          </div>
                          {link.targetUrl && (
                            <a 
                              href={link.targetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-shrink-0 text-purple-600 hover:text-purple-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schema Enhancement */}
              {report.aiResponse.schema && report.schemaEnhanced && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">Schema Markup Enhancement (30 points)</h3>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(report.aiResponse.schema, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Processing Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Processing Time:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {report.processingTime ? `${report.processingTime}s` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Generated:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            onClick={() => window.location.href = `/admin/recipes/${report.recipeId}/edit`}
          >
            Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
