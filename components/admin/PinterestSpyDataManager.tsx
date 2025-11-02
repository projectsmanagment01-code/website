/**
 * Pinterest Spy Data Management Page
 * 
 * Simple admin interface for managing Pinterest spy data
 */

'use client';

import { useState, useEffect } from 'react';



interface PinterestSpyData {
  id: string;
  spyTitle: string;
  spyDescription: string;
  spyImageUrl: string;
  spyArticleUrl: string;
  spyPinImage?: string;
  annotation?: string;
  authorName?: string;
  authorUrl?: string;
  authorBio?: string;
  seoKeyword?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: string;
  isMarkedForGeneration: boolean;
  isProcessed: boolean;
  priority: number;
  createdAt: string;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  markedForGeneration: number;
}

export default function PinterestSpyDataManager() {
  // Main component state
  const [spyData, setSpyData] = useState<PinterestSpyData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {}, markedForGeneration: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'data' | 'extract' | 'seo' | 'settings'>('data');

  // SEO Results tab state (always initialized to avoid hook order issues)
  const [seoFilter, setSeoFilter] = useState('all');
  const [seoPage, setSeoPage] = useState(1);

  // Prompt settings (simplified)
  const [customPrompt, setCustomPrompt] = useState('');

  // Image modal state
  const [selectedImage, setSelectedImage] = useState<{url: string, title: string, author?: string} | null>(null);

  // Image extraction state
  const [extractionStatus, setExtractionStatus] = useState<{[key: string]: 'idle' | 'extracting' | 'success' | 'error'}>({});
  const [extractionResults, setExtractionResults] = useState<{[key: string]: {imageUrl: string, alt?: string, selector?: string}}>({});
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });

  // Pagination constants
  const ITEMS_PER_PAGE = 20;

  // Filter and paginate data
  const filteredData = spyData.filter(entry => {
    const matchesSearch = entry.spyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.spyDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Helper function to get authenticated headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load data
  useEffect(() => {
    loadSpyData();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Load saved prompt on component mount
  useEffect(() => {
    const savedPrompt = localStorage.getItem('pinterest_seo_prompt');
    if (savedPrompt) {
      setCustomPrompt(savedPrompt);
    }
  }, []);

  // Keyboard support for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  const loadSpyData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Load more data for client-side pagination
      });

      const response = await fetch(`/api/admin/pinterest-spy?${params}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to load spy data: ${response.status === 401 ? 'Unauthorized' : 'Server error'}`);
      }

      const data = await response.json();
      setSpyData(data.data);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load spy data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target?.result as string;
        setBulkImportText(csvText);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = `Recipe Title,Description,Main Image,Source Link,Pinterest Pin,Notes,Extra Field
"Easy Chocolate Cake","Delicious homemade chocolate cake recipe perfect for beginners","https://example.com/chocolate-cake.jpg","https://foodblog.com/easy-chocolate-cake","https://pinterest.com/pin/chocolate-cake","Family favorite dessert","This will be ignored"
"Quick Pasta Recipe","20-minute pasta dish with fresh ingredients","https://example.com/pasta.jpg","https://foodblog.com/quick-pasta","https://pinterest.com/pin/pasta","Popular weeknight meal",""
"Healthy Smoothie Bowl","Nutritious breakfast smoothie bowl with toppings","https://example.com/smoothie.jpg","https://foodblog.com/smoothie-bowl","","Trending breakfast option","Empty fields are OK"`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pinterest-spy-data-flexible-sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const smartColumnMapping = (header: string): string | null => {
    const cleanHeader = header.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    
    // Smart mapping for SPY Title
    if (cleanHeader.includes('title') || cleanHeader.includes('name') || cleanHeader.includes('heading')) {
      return 'spyTitle';
    }
    
    // Smart mapping for SPY Description
    if (cleanHeader.includes('description') || cleanHeader.includes('desc') || 
        cleanHeader.includes('content') || cleanHeader.includes('text') || cleanHeader.includes('summary')) {
      return 'spyDescription';
    }
    
    // Smart mapping for SPY Image URL
    if ((cleanHeader.includes('image') || cleanHeader.includes('img') || cleanHeader.includes('photo')) && 
        (cleanHeader.includes('url') || cleanHeader.includes('link') || cleanHeader.includes('src'))) {
      return 'spyImageUrl';
    }
    
    // Smart mapping for SPY Article URL
    if ((cleanHeader.includes('article') || cleanHeader.includes('post') || cleanHeader.includes('blog') || 
         cleanHeader.includes('page') || cleanHeader.includes('source')) && 
        (cleanHeader.includes('url') || cleanHeader.includes('link') || cleanHeader.includes('href'))) {
      return 'spyArticleUrl';
    }
    
    // Smart mapping for SPY PIN Image
    if ((cleanHeader.includes('pin') || cleanHeader.includes('pinterest')) && 
        (cleanHeader.includes('image') || cleanHeader.includes('img') || cleanHeader.includes('photo'))) {
      return 'spyPinImage';
    }
    
    // Smart mapping for Annotation
    if (cleanHeader.includes('annotation') || cleanHeader.includes('note') || 
        cleanHeader.includes('comment') || cleanHeader.includes('remark') || cleanHeader.includes('tag')) {
      return 'annotation';
    }
    
    return null; // Unknown column - will be ignored
  };

  const parseCSVData = (csvText: string) => {
    const lines = csvText.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse CSV with proper quote handling
    const parseCSVLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      return values;
    };
    
    const headers = parseCSVLine(lines[0]);
    
    // Create column mapping
    const columnMapping: { [key: number]: string } = {};
    headers.forEach((header, index) => {
      const mappedField = smartColumnMapping(header);
      if (mappedField) {
        columnMapping[index] = mappedField;
      }
    });
    
    console.log('📊 Smart column mapping detected:', 
      Object.entries(columnMapping).map(([idx, field]) => `${headers[parseInt(idx)]} → ${field}`)
    );
    
    return lines.slice(1).map((line, lineIndex) => {
      if (!line.trim()) return null;
      
      const values = parseCSVLine(line);
      
      // Map values to database fields using smart mapping
      const entry: any = {};
      Object.entries(columnMapping).forEach(([colIndex, fieldName]) => {
        const value = values[parseInt(colIndex)]?.trim() || '';
        if (value) {
          entry[fieldName] = value;
        }
      });
      
      // Require at least title or description
      if (!entry.spyTitle && !entry.spyDescription) {
        return null;
      }
      
      // Set defaults for missing required fields
      if (!entry.spyTitle) entry.spyTitle = `Entry ${lineIndex + 1}`;
      if (!entry.spyDescription) entry.spyDescription = 'No description';
      if (!entry.spyImageUrl) entry.spyImageUrl = '';
      if (!entry.spyArticleUrl) entry.spyArticleUrl = '';
      
      return entry;
    }).filter(entry => entry !== null);
  };

  const handleBulkImport = async () => {
    try {
      setProcessing(true);
      
      const importData = parseCSVData(bulkImportText);
      
      if (importData.length === 0) {
        alert('No valid entries found. Please check your CSV format.');
        return;
      }

      const token = localStorage.getItem('admin_token');
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('/api/admin/pinterest-spy', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          data: importData,
          batchId: `import_${Date.now()}`,
          autoProcessSEO: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Import request failed:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (response.ok) {
        alert(`Successfully imported ${result.created} entries`);
        setBulkImportText('');
        setCsvFile(null);
        setShowBulkImport(false);
        loadSpyData();
      } else {
        alert(`Import failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please check the format.');
    } finally {
      setProcessing(false);
    }
  };

  const processSEO = async (entryIds: string[]) => {
    try {
      setProcessing(true);
      
      const response = await fetch('/api/admin/pinterest-spy/process-seo', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ entryIds })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert(`SEO processing complete: ${result.processed} success, ${result.failed} failed`);
        loadSpyData();
      } else {
        alert(`SEO processing failed: ${result.error}`);
      }
    } catch (error) {
      console.error('SEO processing error:', error);
      alert('SEO processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const toggleMarkedForGeneration = async (entryId: string, marked: boolean) => {
    try {
      const response = await fetch('/api/admin/pinterest-spy', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: entryId,
          updates: { isMarkedForGeneration: marked }
        })
      });

      if (response.ok) {
        loadSpyData();
      }
    } catch (error) {
      console.error('Toggle marked error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'SEO_PROCESSING': 'bg-blue-100 text-blue-800',
      'SEO_COMPLETED': 'bg-green-100 text-green-800',
      'READY_FOR_GENERATION': 'bg-purple-100 text-purple-800',
      'GENERATING': 'bg-orange-100 text-orange-800',
      'COMPLETED': 'bg-emerald-100 text-emerald-800',
      'FAILED': 'bg-red-100 text-red-800'
    };

    const colorClass = colors[status as keyof typeof colors] || colors.PENDING;

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowBulkImport(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          📤 Bulk Import
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'data', name: 'Data Management', icon: '📊' },
            { id: 'seo', name: 'SEO Results', icon: '🧠' },
            { id: 'settings', name: 'Prompt Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Entries</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {stats.byStatus['SEO_COMPLETED'] || 0}
          </div>
          <div className="text-sm text-gray-600">SEO Processed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-purple-600">
            {stats.markedForGeneration}
          </div>
          <div className="text-sm text-gray-600">Ready to Generate</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {stats.byStatus['COMPLETED'] || 0}
          </div>
          <div className="text-sm text-gray-600">Recipes Generated</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search spy data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="SEO_COMPLETED">SEO Completed</option>
            <option value="READY_FOR_GENERATION">Ready</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>

          {selectedEntries.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => processSEO(selectedEntries)}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                🧠 Process SEO ({selectedEntries.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(item => selectedEntries.includes(item.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const pageIds = paginatedData.map(item => item.id);
                        setSelectedEntries([...new Set([...selectedEntries, ...pageIds])]);
                      } else {
                        const pageIds = paginatedData.map(item => item.id);
                        setSelectedEntries(selectedEntries.filter(id => !pageIds.includes(id)));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pin Image
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEntries.includes(entry.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEntries([...selectedEntries, entry.id]);
                        } else {
                          setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sm text-gray-900 max-w-xs truncate" title={entry.spyTitle}>
                      {entry.spyTitle}
                    </div>
                    {entry.annotation && (
                      <div className="text-xs text-purple-600 max-w-xs truncate mt-1" title={entry.annotation}>
                        📝 {entry.annotation}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-md" title={entry.spyDescription}>
                      {entry.spyDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {entry.spyImageUrl ? (
                        <div 
                          className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 hover:border-rose-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg"
                          onClick={() => setSelectedImage({
                            url: entry.spyImageUrl,
                            title: entry.spyTitle,
                            author: entry.authorName
                          })}
                        >
                          <img 
                            src={entry.spyImageUrl} 
                            alt="Spy content preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.classList.add('bg-gray-100');
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-500 text-xs font-medium">Failed to load</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-slate-400 text-lg mb-1">🖼️</div>
                            <span className="text-slate-500 text-xs font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-1">
                        {entry.authorName && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 text-xs">👤</span>
                            </div>
                            <div className="text-sm font-medium text-slate-800 truncate" title={entry.authorName}>
                              {entry.authorName}
                            </div>
                          </div>
                        )}
                        {entry.authorUrl && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-amber-50 rounded-full flex items-center justify-center">
                              <span className="text-amber-600 text-xs">🔗</span>
                            </div>
                            <a 
                              href={entry.authorUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800 truncate transition-colors duration-200"
                              title={entry.authorUrl}
                            >
                              View Profile
                            </a>
                          </div>
                        )}
                        {entry.authorBio && (
                          <div className="flex items-start space-x-2">
                            <div className="w-6 h-6 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-violet-600 text-xs">ℹ️</span>
                            </div>
                            <div className="text-xs text-slate-600 leading-relaxed" title={entry.authorBio}>
                              {entry.authorBio.length > 50 ? `${entry.authorBio.slice(0, 50)}...` : entry.authorBio}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry.spyArticleUrl ? (
                      <a 
                        href={entry.spyArticleUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-800 text-sm max-w-xs truncate block"
                        title={entry.spyArticleUrl}
                      >
                        🔗 View Article
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">No Article URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {entry.spyPinImage ? (
                      <a 
                        href={entry.spyPinImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-rose-600 hover:text-rose-800 text-sm max-w-xs truncate block"
                        title={entry.spyPinImage}
                      >
                        📌 View Pin Image
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">No Pin Image</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-rose-50 border-rose-500 text-rose-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Bulk Import Pinterest Spy Data</h2>
            
            {/* Import Method Selection */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="importMethod"
                    value="file"
                    checked={importMethod === 'file'}
                    onChange={(e) => setImportMethod(e.target.value as 'text' | 'file')}
                    className="mr-2"
                  />
                  Upload CSV File
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="importMethod"
                    value="text"
                    checked={importMethod === 'text'}
                    onChange={(e) => setImportMethod(e.target.value as 'text' | 'file')}
                    className="mr-2"
                  />
                  Paste CSV Text
                </label>
              </div>
              

            </div>

            <div className="space-y-4">
              {importMethod === 'file' ? (
                /* File Upload Option */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Select CSV File
                    </label>
                    <button
                      onClick={downloadSampleCSV}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      📥 Download Sample
                    </button>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csvFileInput"
                    />
                    <label 
                      htmlFor="csvFileInput" 
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      📁 Choose CSV File
                    </label>
                    {csvFile && (
                      <div className="mt-2 text-sm text-green-600">
                        ✅ Selected: {csvFile.name}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Text Input Option */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV Data (Flexible Format)
                  </label>
                  <div className="text-xs text-gray-600 mb-2">
                    <strong>Use any column names!</strong> System will auto-detect: title, description, image URLs, article links, notes, etc.
                  </div>
                  <textarea
                    value={bulkImportText}
                    onChange={(e) => setBulkImportText(e.target.value)}
                    placeholder={`Recipe Name,Summary,Photo URL,Source Link,Pinterest Image,Comments
"Easy Chocolate Cake","Delicious homemade recipe","https://example.com/cake.jpg","https://foodblog.com/cake","","Family favorite"
"Quick Pasta","20-minute dinner","https://example.com/pasta.jpg","https://foodblog.com/pasta","https://pin.com/pasta","Popular meal"`}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              )}
              
              {/* Preview/Status */}
              {bulkImportText && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Smart Mapping Preview:</strong>
                  </div>
                  {(() => {
                    const lines = bulkImportText.trim().split('\n');
                    if (lines.length < 2) return <div className="text-red-600 text-sm">Invalid CSV format</div>;
                    
                    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                    const mappedFields: string[] = [];
                    const unmappedFields: string[] = [];
                    
                    headers.forEach(header => {
                      const mapped = smartColumnMapping(header);
                      if (mapped) {
                        mappedFields.push(`"${header}" → ${mapped.replace('spy', 'SPY ')}`);
                      } else {
                        unmappedFields.push(`"${header}"`);
                      }
                    });
                    
                    const validEntries = parseCSVData(bulkImportText).length;
                    
                    return (
                      <div className="space-y-2">
                        {mappedFields.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-green-700 mb-1">✅ Mapped Fields:</div>
                            <div className="text-xs text-green-600 pl-2">
                              {mappedFields.join(', ')}
                            </div>
                          </div>
                        )}
                        {unmappedFields.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-yellow-700 mb-1">⚠️ Ignored Fields:</div>
                            <div className="text-xs text-yellow-600 pl-2">
                              {unmappedFields.join(', ')} (will be skipped)
                            </div>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-300">
                          <div className="text-sm font-medium text-gray-900">
                            📊 {validEntries} valid entries ready for import
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button 
                  onClick={() => {
                    setShowBulkImport(false);
                    setBulkImportText('');
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkImport}
                  disabled={processing || !bulkImportText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? '⏳ Processing...' : '📤 Import & Process SEO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* SEO Results Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-6">
          {/* SEO Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus['SEO_COMPLETED'] || 0}
              </div>
              <div className="text-sm text-gray-600">SEO Processed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-orange-600">
                {stats.total - (stats.byStatus['SEO_COMPLETED'] || 0)}
              </div>
              <div className="text-sm text-gray-600">Pending SEO</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-red-600">
                {stats.byStatus['FAILED'] || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex gap-4 items-center">
              <select
                value={seoFilter}
                onChange={(e) => setSeoFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Entries</option>
                <option value="processed">SEO Processed</option>
                <option value="pending">Pending SEO</option>
              </select>
              <button
                onClick={loadSpyData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* SEO Results Table */}
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Original Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SEO Keyword
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SEO Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      SEO Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const filteredData = spyData.filter(item => {
                      if (seoFilter === 'processed') return item.seoKeyword;
                      if (seoFilter === 'pending') return !item.seoKeyword;
                      return true;
                    });
                    const limit = 10;
                    const paginatedData = filteredData.slice((seoPage - 1) * limit, seoPage * limit);
                    
                    return paginatedData.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-sm text-gray-900 max-w-xs truncate" title={entry.spyTitle}>
                              {entry.spyTitle}
                            </div>
                            <div className="text-xs text-gray-600 max-w-xs truncate" title={entry.spyDescription}>
                              {entry.spyDescription}
                            </div>
                            <div className="flex gap-2 text-xs">
                              {entry.spyArticleUrl && (
                                <a href={entry.spyArticleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                  🔗
                                </a>
                              )}
                              {entry.spyImageUrl && (
                                <a href={entry.spyImageUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                                  🖼️
                                </a>
                              )}
                              {entry.spyPinImage && (
                                <a href={entry.spyPinImage} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                                  📌
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.seoKeyword ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {entry.seoKeyword}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Not processed</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-md truncate" title={entry.seoTitle}>
                            {entry.seoTitle || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md truncate" title={entry.seoDescription}>
                            {entry.seoDescription || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.seoKeyword 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.seoKeyword ? 'Processed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* SEO Prompt Configuration */}
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Extraction Prompt</h2>
            <p className="text-gray-600 mb-6">
              Customize the AI prompt used to generate SEO metadata from Pinterest spy data. 
              The prompt will be sent to your configured AI provider.
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom SEO Prompt Template
                </label>
                <button
                  onClick={() => setCustomPrompt(`Analyze this Pinterest spy data and extract SEO metadata for recipe content generation:

**SPY DATA:**
Title: {spyTitle}
Description: {spyDescription}
Article URL: {spyArticleUrl}
Image URL: {spyImageUrl}
{annotation ? \`Annotation: {annotation}\` : ''}

**TASK:**
Extract the following SEO metadata optimized for recipe content:

1. **SEO Keyword**: The primary keyword this recipe should target (2-4 words max)
2. **SEO Title**: Optimized title for search engines (50-60 characters ideal)
3. **SEO Description**: Meta description for search results (150-160 characters ideal)

**GUIDELINES:**
- Focus on food/recipe keywords with good search potential
- Ensure titles are clickable and include the main keyword
- Descriptions should be compelling and include key benefits
- Consider search intent (people looking for recipes)
- Analyze the spy data to understand the core recipe concept
- Use natural, appetizing language

**OUTPUT FORMAT:**
Return your response as valid JSON:
{
  "seoKeyword": "primary keyword phrase",
  "seoTitle": "Optimized SEO title",
  "seoDescription": "Compelling meta description",
  "confidence": 0.85,
  "reasoning": "Brief explanation of your choices"
}

Analyze the provided spy data and return the SEO metadata in the exact JSON format shown above.`)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset to Default
                </button>
              </div>
              <textarea
                value={customPrompt || `Analyze this Pinterest spy data and extract SEO metadata for recipe content generation:

**SPY DATA:**
Title: {spyTitle}
Description: {spyDescription}
Article URL: {spyArticleUrl}
Image URL: {spyImageUrl}
{annotation ? \`Annotation: {annotation}\` : ''}

**TASK:**
Extract the following SEO metadata optimized for recipe content:

1. **SEO Keyword**: The primary keyword this recipe should target (2-4 words max)
2. **SEO Title**: Optimized title for search engines (50-60 characters ideal)
3. **SEO Description**: Meta description for search results (150-160 characters ideal)

**GUIDELINES:**
- Focus on food/recipe keywords with good search potential
- Ensure titles are clickable and include the main keyword
- Descriptions should be compelling and include key benefits
- Consider search intent (people looking for recipes)
- Analyze the spy data to understand the core recipe concept
- Use natural, appetizing language

**OUTPUT FORMAT:**
Return your response as valid JSON:
{
  "seoKeyword": "primary keyword phrase",
  "seoTitle": "Optimized SEO title",
  "seoDescription": "Compelling meta description",
  "confidence": 0.85,
  "reasoning": "Brief explanation of your choices"
}

Analyze the provided spy data and return the SEO metadata in the exact JSON format shown above.`}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={25}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                placeholder="Enter your custom prompt for SEO extraction..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Available variables: <code>{'{spyTitle}'}</code>, <code>{'{spyDescription}'}</code>, <code>{'{spyArticleUrl}'}</code>, <code>{'{spyImageUrl}'}</code>, <code>{'{annotation}'}</code>
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Save prompt to localStorage or API
                  localStorage.setItem('pinterest_seo_prompt', customPrompt);
                  alert('SEO prompt saved successfully!');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                💾 Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold truncate pr-4">{selectedImage.title}</h3>
                  {selectedImage.author && (
                    <p className="text-slate-300 text-sm">by {selectedImage.author}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-white hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                  title="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <div className="flex justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTIwIDkwSDgwTDEwMCA3MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTcwIDExMEgxMzBWMTMwSDcwVjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTAwIiB5PSIxNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjczODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+SW1hZ2UgRmFpbGVkPC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => window.open(selectedImage.url, '_blank')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open Original</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedImage.url);
                    alert('Image URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
