/**
 * Articles Manager Component
 * 
 * Full-featured article management interface for admin dashboard
 * Matches dashboard UI pattern with gray-50 bg, white cards, blue accents
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  EyeOff,
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  AlertCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy,
  ExternalLink,
  Save,
  RefreshCw
} from 'lucide-react';
import { adminFetch } from '@/lib/admin-fetch';

// ============================================================================
// Types
// ============================================================================

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  categoryId: string | null;
  tags: string[];
  authorId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  readingTime: number | null;
  views: number;
  status: string;
  publishedAt: string | null;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  authorRef?: { id: string; name: string; slug: string } | null;
  categoryRef?: { id: string; name: string; slug: string } | null;
}

interface Author {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  categoryId: string;
  tags: string[];
  authorId: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  status: string;
  isFeatured: boolean;
}

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  featured: number;
}

const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  featuredImageAlt: '',
  categoryId: '',
  tags: [],
  authorId: '',
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  ogImage: '',
  ogTitle: '',
  ogDescription: '',
  status: 'draft',
  isFeatured: false,
};

// Example article template for importing
const exampleArticle: ArticleFormData = {
  title: '10 Essential Kitchen Tips Every Home Cook Should Know',
  slug: '10-essential-kitchen-tips-home-cook',
  content: `<h2>Introduction</h2>
<p>Whether you're a beginner in the kitchen or looking to refine your culinary skills, these essential tips will transform the way you cook. From prep work to plating, mastering these fundamentals will save you time, reduce waste, and elevate your dishes to restaurant quality.</p>

<img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800" alt="Kitchen cooking essentials" />

<h2>1. Mise en Place - Prepare Everything First</h2>
<p>The French phrase "mise en place" means "everything in its place." Before you start cooking, read your entire recipe, gather all ingredients, and prep everything (chop vegetables, measure spices, etc.). This prevents scrambling mid-cook and ensures nothing gets forgotten.</p>

<blockquote>
<p>"Mise en place is the religion of all good cooks." - Anthony Bourdain</p>
</blockquote>

<h2>2. Let Your Meat Rest</h2>
<p>After cooking meat, let it rest for 5-10 minutes before cutting. This allows the juices to redistribute throughout the meat, resulting in a more flavorful and juicy final product. Cover loosely with foil to keep warm.</p>

<h2>3. Season in Layers</h2>
<p>Don't just season at the end! Add salt and spices at different stages of cooking to build depth of flavor. Season your proteins before cooking, add aromatics early, and adjust seasoning at the end.</p>

<h3>Pro Tips for Seasoning:</h3>
<ul>
<li>Salt pasta water until it tastes like the sea</li>
<li>Season meat 30 minutes before cooking when possible</li>
<li>Add acid (lemon, vinegar) at the end to brighten flavors</li>
<li>Taste as you go - you can always add more, but can't take away</li>
</ul>

<h2>4. Use Sharp Knives</h2>
<p>A sharp knife is actually safer than a dull one because it requires less pressure and gives you more control. Invest in a quality chef's knife and keep it sharp with regular honing and occasional professional sharpening.</p>

<h2>5. Don't Overcrowd the Pan</h2>
<p>When sautéing or searing, give your ingredients space. Overcrowding lowers the pan temperature and causes steaming instead of browning. Cook in batches if necessary to achieve that perfect golden crust.</p>

<img src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800" alt="Proper pan technique" />

<h2>6. Deglaze for Flavor</h2>
<p>After searing meat or sautéing vegetables, don't waste those brown bits (fond) stuck to the pan. Add wine, stock, or even water and scrape them up - this creates an instant, flavorful sauce base.</p>

<h2>7. Control Your Heat</h2>
<p>High heat isn't always better. Different techniques require different temperatures:</p>
<ol>
<li><strong>High heat:</strong> Searing, stir-frying, boiling water</li>
<li><strong>Medium heat:</strong> Sautéing, pan-frying</li>
<li><strong>Low heat:</strong> Simmering, melting chocolate, cooking eggs</li>
</ol>

<h2>8. Taste As You Cook</h2>
<p>Professional chefs constantly taste their food throughout the cooking process. This allows you to adjust seasonings, catch mistakes early, and understand how flavors develop with heat and time.</p>

<h2>9. Clean As You Go</h2>
<p>Keep a bowl for scraps, wipe down surfaces during downtime, and wash tools you're done with. This makes the final cleanup easier and keeps your workspace organized and safe.</p>

<h2>10. Read the Recipe Completely First</h2>
<p>Before starting any recipe, read it through entirely. Note any special equipment needed, check cooking times, and identify steps that can be done ahead. This prevents surprises and helps you plan your time effectively.</p>

<h2>Conclusion</h2>
<p>Implementing these kitchen tips will make your cooking more efficient, enjoyable, and delicious. Start with one or two tips and gradually incorporate more into your routine. Happy cooking!</p>`,
  excerpt: 'Master these 10 essential kitchen tips to transform your cooking from amateur to professional. Learn mise en place, proper seasoning techniques, and more.',
  featuredImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
  featuredImageAlt: 'Professional kitchen cooking setup with fresh ingredients',
  categoryId: '',
  tags: ['cooking tips', 'kitchen hacks', 'beginner cooking', 'culinary skills'],
  authorId: '',
  metaTitle: '10 Essential Kitchen Tips Every Home Cook Should Know | Cooking Guide',
  metaDescription: 'Discover 10 game-changing kitchen tips that will elevate your cooking skills. From mise en place to proper seasoning techniques, become a better cook today.',
  focusKeyword: 'kitchen tips',
  ogImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
  ogTitle: '10 Essential Kitchen Tips Every Home Cook Should Know',
  ogDescription: 'Transform your cooking with these professional kitchen tips. Perfect for beginners and experienced cooks alike.',
  status: 'draft',
  isFeatured: false,
};

// ============================================================================
// Main Component
// ============================================================================

export default function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ArticleStats>({ total: 0, published: 0, draft: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'social'>('content');
  const [tagInput, setTagInput] = useState('');
  
  // ID list toggle
  const [showIdList, setShowIdList] = useState(false);

  // ========================================================================
  // Data Fetching
  // ========================================================================

  useEffect(() => {
    loadArticles();
    loadAuthors();
    loadCategories();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/articles?status=all&limit=100');
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.data || []);
        // Calculate stats
        const articleList = data.data || [];
        setStats({
          total: articleList.length,
          published: articleList.filter((a: Article) => a.status === 'published').length,
          draft: articleList.filter((a: Article) => a.status === 'draft').length,
          featured: articleList.filter((a: Article) => a.isFeatured).length,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await adminFetch('/api/admin/authors', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await response.json();
      setAuthors(data.authors || data || []);
    } catch (err) {
      console.error('Error loading authors:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories || data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setFormData(initialFormData);
    setShowModal(true);
    setActiveTab('content');
  };

  const handleLoadExample = () => {
    setFormData(exampleArticle);
  };

  const handleEdit = async (article: Article) => {
    try {
      const response = await fetch(`/api/articles/${article.slug}`);
      const data = await response.json();
      
      if (data.success) {
        const fullArticle = data.data;
        setEditingArticle(fullArticle);
        setFormData({
          title: fullArticle.title || '',
          slug: fullArticle.slug || '',
          content: fullArticle.content || '',
          excerpt: fullArticle.excerpt || '',
          featuredImage: fullArticle.featuredImage || '',
          featuredImageAlt: fullArticle.featuredImageAlt || '',
          categoryId: fullArticle.categoryId || '',
          tags: fullArticle.tags || [],
          authorId: fullArticle.authorId || '',
          metaTitle: fullArticle.metaTitle || '',
          metaDescription: fullArticle.metaDescription || '',
          focusKeyword: fullArticle.focusKeyword || '',
          ogImage: fullArticle.ogImage || '',
          ogTitle: fullArticle.ogTitle || '',
          ogDescription: fullArticle.ogDescription || '',
          status: fullArticle.status || 'draft',
          isFeatured: fullArticle.isFeatured || false,
        });
        setShowModal(true);
        setActiveTab('content');
      }
    } catch (err) {
      setError('Failed to load article');
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const url = editingArticle ? `/api/articles/${editingArticle.slug}` : '/api/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        loadArticles();
      } else {
        setError(data.error || 'Failed to save article');
      }
    } catch (err) {
      setError('Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/articles/${article.slug}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        loadArticles();
      } else {
        setError(data.error || 'Failed to delete');
      }
    } catch (err) {
      setError('Failed to delete article');
    }
  };

  const handleToggleStatus = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadArticles();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleToggleFeatured = async (article: Article) => {
    try {
      await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !article.isFeatured }),
      });
      loadArticles();
    } catch (err) {
      setError('Failed to update');
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const copyIdsToClipboard = () => {
    const ids = articles.map(a => a.id).join('\n');
    navigator.clipboard.writeText(ids);
  };

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ========================================================================
  // Render
  // ========================================================================

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-600">Manage viral articles and blog content</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
        <p className="text-gray-600">Manage viral articles and blog content</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Articles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <EyeOff className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Featured</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.featured}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Article IDs List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Article IDs</h3>
              <p className="text-sm text-gray-500">List of all article identifiers ({articles.length} total)</p>
            </div>
            <div className="flex items-center gap-2">
              {showIdList && articles.length > 0 && (
                <button
                  onClick={copyIdsToClipboard}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-1"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
              )}
              <button
                onClick={() => setShowIdList(!showIdList)}
                className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center gap-1"
              >
                {showIdList ? <><ChevronUp className="w-4 h-4" />Hide IDs</> : <><ChevronDown className="w-4 h-4" />Show IDs</>}
              </button>
            </div>
          </div>

          {showIdList && (
            <div className="border-t border-gray-200 pt-4">
              {articles.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No articles found</p>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="bg-white rounded-lg px-4 py-3 text-sm font-mono text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group shadow-sm"
                        onClick={() => navigator.clipboard.writeText(article.id)}
                        title={`Click to copy: ${article.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1 truncate">{article.title}</div>
                            <div className="text-xs truncate group-hover:text-blue-600">{article.id}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Article
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Title</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Views</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No articles found</p>
                    <button onClick={handleCreate} className="mt-2 text-blue-600 hover:underline">
                      Create your first article
                    </button>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{article.title}</p>
                          <p className="text-sm text-gray-500">/{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.categoryRef?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFeatured(article)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            article.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={article.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {article.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(article)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            article.status === 'published' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {article.status === 'published' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                          title="View article"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(article)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingArticle ? 'Edit Article' : 'New Article'}
                </h3>
                {!editingArticle && (
                  <button
                    onClick={handleLoadExample}
                    className="px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center gap-1"
                    title="Load example article content"
                  >
                    <FileText className="w-4 h-4" />
                    Load Example
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {(['content', 'seo', 'social'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {activeTab === 'content' && (
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter article title..."
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="article-url-slug"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML) *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="<h2>Your Article Content</h2>&#10;<p>Write your article using HTML tags...</p>"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;img&gt;, &lt;blockquote&gt;, &lt;ul&gt;, &lt;ol&gt;
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description (auto-generated if empty)"
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                    <input
                      type="text"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Category & Author */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <select
                        value={formData.authorId}
                        onChange={(e) => setFormData(prev => ({ ...prev, authorId: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">Select author</option>
                        {authors.map(author => (
                          <option key={author.id} value={author.id}>{author.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-600">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Status & Featured */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-6">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Featured Article</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO title (uses article title if empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SEO description (uses excerpt if empty)"
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                    <input
                      type="text"
                      value={formData.focusKeyword}
                      onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Main keyword to target"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                    <input
                      type="text"
                      value={formData.ogTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Social media title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                    <textarea
                      value={formData.ogDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Social media description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={formData.ogImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, ogImage: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://... (1200x630 recommended)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
