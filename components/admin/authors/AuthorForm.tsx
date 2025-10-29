'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Save, 
  X, 
  Upload,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { AuthorEntity } from '@/outils/types';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import CategoryTagSelector from './SimpleCategorySelector';
import { adminFetch } from '@/lib/admin-fetch';

interface AuthorFormData {
  name: string;
  bio: string;
  img: string;
  avatar: string;
  link: string;
  tags: string[]; // Category tag names typed by user
}

interface AuthorFormProps {
  author?: AuthorEntity; // If provided, this is edit mode
  onSave?: (author: AuthorEntity) => void;
  onCancel?: () => void;
  className?: string;
}

export default function AuthorForm({ 
  author,
  onSave,
  onCancel,
  className = ''
}: AuthorFormProps) {
  const [formData, setFormData] = useState<AuthorFormData>({
    name: '',
    bio: '',
    img: '',
    avatar: '',
    link: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatingField, setGeneratingField] = useState<keyof AuthorFormData | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [existingImages, setExistingImages] = useState<Array<{name: string; url: string; size: number; modified: string}>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  // File upload hook
  const { uploadFile, uploading: imageUploading, error: uploadError } = useFileUpload();

  const isEditMode = !!author;

  // Load AI Context Settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await adminFetch("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  // Initialize form data
  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name,
        bio: author.bio || '',
        img: author.img || '',
        avatar: author.avatar || '',
        link: author.link || '',
        tags: author.tags || []
      });
    }
  }, [author]);

  // Handle form input changes
  const handleChange = (field: keyof AuthorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Generate slug preview
  const generateSlugPreview = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submissions
    if (loading) {
      return;
    }
    
    if (!formData.name.trim()) {
      setError('Author name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const submitData = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        img: formData.img.trim() || undefined,
        avatar: formData.avatar.trim() || undefined,
        link: formData.link.trim() || undefined,
        tags: formData.tags
      };

      // If onSave callback is provided, use it instead of making direct API call
      if (onSave) {
        await onSave(submitData as any);
        
        setSuccess(isEditMode ? 'Author updated successfully!' : 'Author created successfully!');
        
        // Reset form if creating new author
        if (!isEditMode) {
          setFormData({
            name: '',
            bio: '',
            img: '',
            avatar: '',
            link: '',
            tags: []
          });
        }
        return;
      }

      // Fallback: Direct API call if no callback provided
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('No admin token found');
      }

      const url = isEditMode 
        ? `/api/admin/authors/${author.id}`
        : '/api/admin/authors';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await adminFetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save author');
      }

      const result = await response.json();
      
      setSuccess(isEditMode ? 'Author updated successfully!' : 'Author created successfully!');

      // Reset form if creating new author
      if (!isEditMode) {
        setFormData({
          name: '',
          bio: '',
          img: '',
          avatar: '',
          link: '',
          tags: []
        });
      }

    } catch (err) {
      console.error('❌ Error saving author:', err);
      setError(err instanceof Error ? err.message : 'Failed to save author');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      
      // Upload file to authors category
      const result = await uploadFile(file, 'authors');
      
      if (result.success && result.url) {
        // Update form data with uploaded image path
        setFormData(prev => ({
          ...prev,
          img: result.url || ''
        }));
        
        setSuccess('Image uploaded successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  // Load existing images
  const loadExistingImages = async () => {
    try {
      setLoadingImages(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await adminFetch('/api/admin/author-images', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load images');
      }
      
      const data = await response.json();
      setExistingImages(data.images || []);
      setShowImagePicker(true);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load existing images');
    } finally {
      setLoadingImages(false);
    }
  };

  const selectExistingImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      img: imageUrl
    }));
    setShowImagePicker(false);
    setSuccess('Image selected successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const getWebsiteContext = () => {
    const aiWebsiteName = settings?.aiContextSettings?.websiteName;
    const aiBusinessType = settings?.aiContextSettings?.businessType;
    const aiCountry = settings?.aiContextSettings?.country;
    const aiLanguage = settings?.aiContextSettings?.primaryLanguage;
    const aiDomain = settings?.aiContextSettings?.siteDomain;
    
    return {
      websiteName: aiWebsiteName || settings?.logoText || "Your Website",
      businessType: aiBusinessType || "Recipe Blog",
      country: aiCountry || "United States",
      primaryLanguage: aiLanguage || "English",
      siteDomain: aiDomain || settings?.siteDomain || ""
    };
  };

  const generateFieldContent = async (fieldName: keyof AuthorFormData) => {
    try {
      setGeneratingField(fieldName);
      setError(null);

      const websiteCtx = getWebsiteContext();
      const contextInfo = `Website: "${websiteCtx.websiteName}"
Business Type: ${websiteCtx.businessType}
Language: ${websiteCtx.primaryLanguage}
Country: ${websiteCtx.country}
Domain: ${websiteCtx.siteDomain}`;

      // Create context-aware prompts based on field type
      let prompt = '';
      
      switch (fieldName) {
        case 'name':
          prompt = `Context:
${contextInfo}

Task: Generate a realistic human first name only for a food blogger/recipe creator for ${websiteCtx.websiteName}. Requirements:
- Must be a real human first name (like "Sarah", "Michael", "Emma", "David")
- No last names, no titles, no descriptions
- Suitable for a professional ${websiteCtx.businessType} author
- Easy to pronounce and remember in ${websiteCtx.primaryLanguage}
- Culturally appropriate for ${websiteCtx.country}
- Maximum 15 characters
- Return ONLY the first name, nothing else`;
          break;
          
        case 'bio':
          const authorName = formData.name || 'the author';
          prompt = `Context:
${contextInfo}

Task: Write a compelling author bio for ${authorName}, a food blogger and recipe creator at ${websiteCtx.websiteName} (${websiteCtx.businessType}). The bio should be:
- 100-200 words
- Professional yet approachable
- Highlight culinary expertise and passion for ${websiteCtx.businessType}
- Mention experience with recipe development and ${websiteCtx.websiteName}
- Include connection with readers/food community
- Written in third person
- In ${websiteCtx.primaryLanguage} language
- Relevant to ${websiteCtx.country} audience
Return only the bio text, no additional formatting.`;
          break;
          
        case 'link':
          const linkName = formData.name || 'food-blogger';
          const slugifiedName = linkName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const domain = websiteCtx.siteDomain ? websiteCtx.siteDomain.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'example.com';
          prompt = `Context:
${contextInfo}

Task: Generate a professional social media handle or website URL for author "${linkName}" at ${websiteCtx.websiteName}. Options could include:
- Instagram handle (e.g., @${slugifiedName}_kitchen)
- Website URL (e.g., https://${domain}/author/${slugifiedName})
- YouTube channel (e.g., youtube.com/c/${slugifiedName}cooks)
- Twitter/X handle (e.g., @${slugifiedName}recipes)
Return only one clean URL or handle that fits ${websiteCtx.businessType}, no additional text.`;
          break;
          
        default:
          throw new Error(`AI generation not supported for field: ${fieldName}`);
      }

      const requestData = {
        prompt,
        field: fieldName,
        maxLength: fieldName === 'name' ? 50 : fieldName === 'bio' ? 200 : 100,
        contentType: fieldName === 'bio' ? 'description' : 'title',
        websiteContext: websiteCtx,
      };

      const response = await adminFetch('/api/admin/ai-generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      
      // Update the specific field with generated content
      setFormData(prev => ({
        ...prev,
        [fieldName]: data.content || ''
      }));

    } catch (err) {
      console.error('Content generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setGeneratingField(null);
    }
  };

  const slugPreview = generateSlugPreview(formData.name);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Author' : 'Create New Author'}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditMode 
                  ? `Update ${author?.name}'s information and settings`
                  : 'Add a new recipe author to your blog'
                }
              </p>
            </div>
          </div>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-sm"
              type="button"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700 font-medium">{success}</span>
          </div>
        )}

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Author Name *
                </label>
                <button
                  type="button"
                  onClick={() => generateFieldContent('name')}
                  disabled={generatingField === 'name'}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate with AI"
                >
                  {generatingField === 'name' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  {generatingField === 'name' ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter author's full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              {formData.name && (
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  URL: /authors/{slugPreview}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
                  Biography
                </label>
                <button
                  type="button"
                  onClick={() => generateFieldContent('bio')}
                  disabled={generatingField === 'bio'}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate with AI"
                >
                  {generatingField === 'bio' ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  {generatingField === 'bio' ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Brief description of the author's background and expertise..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200"
              />
              <p className="mt-2 text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Categories - Dropdown Selection */}
            <CategoryTagSelector
              selectedTags={formData.tags}
              onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
            />
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            {/* Profile Image (Local Upload) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image (Upload)
              </label>
              
              {/* Image Preview Section */}
              {formData.img && (
                <div className="mb-3 p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={formData.img}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Profile Image</p>
                      <p className="text-xs text-gray-600 truncate">{formData.img}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, img: '' }))}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Image Picker Modal */}
              {showImagePicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Select Existing Image</h3>
                      <button
                        type="button"
                        onClick={() => setShowImagePicker(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                      {loadingImages ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : existingImages.length === 0 ? (
                        <div className="text-center py-12">
                          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No existing author images found</p>
                          <p className="text-sm text-gray-400 mt-2">Upload your first author image below</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {existingImages.map((image) => (
                            <button
                              key={image.url}
                              type="button"
                              onClick={() => selectExistingImage(image.url)}
                              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all hover:scale-105"
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load image:', image.url);
                                  e.currentTarget.src = '/placeholder-recipe.jpg';
                                }}
                              />
                              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center pointer-events-none">
                                <CheckCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs truncate">{image.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        Click an image to select it, or close this dialog to upload a new one
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={loadExistingImages}
                  disabled={loadingImages}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="w-4 h-4" />
                  {loadingImages ? 'Loading...' : 'Select Existing Image'}
                </button>
                
                <label
                  htmlFor="image-upload"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </label>
              </div>

              {/* Upload Area */}
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                imageUploading 
                  ? 'border-blue-300 bg-blue-50' 
                  : formData.img 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="flex flex-col items-center gap-2">
                  {imageUploading ? (
                    <>
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-blue-600 font-medium">Uploading...</p>
                    </>
                  ) : formData.img ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">Image selected</p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">No image selected</p>
                      <p className="text-xs text-gray-500">Use buttons above to upload or select</p>
                    </>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                  disabled={imageUploading}
                />
              </div>
              
              {/* Upload Error */}
              {uploadError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                  {uploadError}
                </div>
              )}
              
              {/* Manual Path Input (Advanced) */}
              {formData.img && (
                <details className="mt-3">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    Advanced: Edit image path manually
                  </summary>
                  <input
                    type="text"
                    value={formData.img}
                    onChange={(e) => handleChange('img', e.target.value)}
                    placeholder="Image path"
                    className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </details>
              )}
            </div>

            {/* Hidden fields - Avatar and Link kept for backend but not shown in UI */}
            <input type="hidden" value={formData.avatar} />
            <input type="hidden" value={formData.link} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditMode ? 'Update Author' : 'Create Author'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}