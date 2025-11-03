'use client';

import React, { useState } from 'react';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
  apiEndpoint: string;
  getAuthHeaders: () => Record<string, string>;
  onBackgroundExtractionStart?: () => void;
  onBackgroundExtractionEnd?: () => void;
}

// Smart CSV parsing function - handles various formats automatically
function parseCSVData(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Smart CSV parsing that handles quoted fields, commas in quotes, etc.
  function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        if (nextChar === quoteChar) {
          // Escaped quote
          currentValue += char;
          i++; // Skip next quote
        } else {
          inQuotes = false;
          quoteChar = '';
        }
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    return values.map(val => val.replace(/^["']|["']$/g, ''));
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  const entries = [];

  console.log('📋 Detected CSV headers:', headers);

  // Smart field mapping - much more flexible
  const fieldMappings = {
    spyTitle: [
      'spy title', 'title', 'name', 'spy_title', 'spytitle',
      'pin title', 'pintitle', 'pin_title', 'article title',
      'headline', 'subject', 'post title', 'content title'
    ],
    spyDescription: [
      'spy description', 'description', 'desc', 'spy_description', 'spydescription',
      'pin description', 'pindescription', 'pin_description', 'article description',
      'content', 'body', 'text', 'summary', 'excerpt', 'details'
    ],
    spyImageUrl: [
      'spy image url', 'image url', 'spy_image_url', 'spyimageurl',
      'pin image', 'pinimage', 'pin_image', 'image', 'img_url',
      'picture', 'photo', 'thumbnail', 'img', 'image_link'
    ],
    spyArticleUrl: [
      'spy article url', 'article url', 'spy_article_url', 'spyarticleurl',
      'pin url', 'pinurl', 'pin_url', 'url', 'link', 'article_link',
      'source', 'source_url', 'webpage', 'destination', 'target_url'
    ],
    spyPinImage: [
      'spy pin image', 'pin image', 'spy_pin_image', 'spypinimage',
      'pin_image', 'pinimage', 'pinterest image', 'pinterest_image'
    ],
    annotation: [
      'annotation', 'notes', 'comment', 'remarks', 'memo',
      'tag', 'tags', 'category', 'label', 'keywords'
    ],
    spyAuthor: [
      'author', 'spy author', 'spy_author', 'spyauthor',
      'creator', 'writer', 'by', 'posted_by', 'username',
      'user', 'account', 'profile', 'source_author'
    ],
    spyCategory: [
      'category', 'spy category', 'spy_category', 'spycategory',
      'topic', 'section', 'genre', 'type', 'group', 'classification'
    ],
    spyKeywords: [
      'keywords', 'spy keywords', 'spy_keywords', 'spykeywords',
      'tags', 'hashtags', 'labels', 'topics', 'seo_keywords'
    ]
  };

  // Create reverse mapping for quick lookup
  const headerToField: { [key: string]: string } = {};
  Object.entries(fieldMappings).forEach(([field, variations]) => {
    variations.forEach(variation => {
      headerToField[variation] = field;
    });
  });

  // Analyze headers and create mapping
  const columnMapping: { [index: number]: string } = {};
  headers.forEach((header, index) => {
    const cleanHeader = header.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Direct match
    if (headerToField[cleanHeader]) {
      columnMapping[index] = headerToField[cleanHeader];
      return;
    }
    
    // Fuzzy matching for partial matches
    for (const [field, variations] of Object.entries(fieldMappings)) {
      for (const variation of variations) {
        if (cleanHeader.includes(variation) || variation.includes(cleanHeader)) {
          columnMapping[index] = field;
          return;
        }
      }
    }
    
    // Special pattern matching
    if (cleanHeader.match(/title|name|subject|headline/)) {
      columnMapping[index] = 'spyTitle';
    } else if (cleanHeader.match(/desc|content|body|text|summary/)) {
      columnMapping[index] = 'spyDescription';
    } else if (cleanHeader.match(/image|img|photo|picture|thumbnail/) && cleanHeader.match(/url|link/)) {
      columnMapping[index] = 'spyImageUrl';
    } else if (cleanHeader.match(/url|link/) && !cleanHeader.match(/image|img/)) {
      columnMapping[index] = 'spyArticleUrl';
    } else if (cleanHeader.match(/author|creator|writer|by/)) {
      columnMapping[index] = 'spyAuthor';
    } else if (cleanHeader.match(/category|topic|section|type/)) {
      columnMapping[index] = 'spyCategory';
    } else if (cleanHeader.match(/keyword|tag|label/)) {
      columnMapping[index] = 'spyKeywords';
    }
  });

  console.log('🔗 Column mapping:', columnMapping);

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const entry: any = {};

    // Apply column mapping
    Object.entries(columnMapping).forEach(([colIndex, fieldName]) => {
      const value = values[parseInt(colIndex)] || '';
      if (value.trim()) {
        entry[fieldName] = value.trim();
      }
    });

    // Smart defaults and cleanup
    if (!entry.spyTitle && !entry.spyDescription) {
      // Try to use first non-empty value as title
      const firstValue = values.find(v => v && v.trim());
      if (firstValue) {
        entry.spyTitle = firstValue.trim();
      }
    }

    // Set reasonable defaults
    entry.spyTitle = entry.spyTitle || entry.spyDescription?.substring(0, 50) || `Entry ${i}`;
    entry.spyDescription = entry.spyDescription || entry.spyTitle || '';

    // Clean up URLs - be more lenient with URL formats
    if (entry.spyImageUrl && entry.spyImageUrl.trim()) {
      let imageUrl = entry.spyImageUrl.trim();
      if (!imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('//')) {
          entry.spyImageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('www.')) {
          entry.spyImageUrl = 'https://' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          // Relative URL - keep as is, will be marked as invalid later
          entry.spyImageUrl = imageUrl;
        } else if (imageUrl.includes('.')) {
          // Looks like a domain without protocol
          entry.spyImageUrl = 'https://' + imageUrl;
        }
      }
    }

    if (entry.spyArticleUrl && entry.spyArticleUrl.trim()) {
      let articleUrl = entry.spyArticleUrl.trim();
      if (!articleUrl.startsWith('http')) {
        if (articleUrl.startsWith('//')) {
          entry.spyArticleUrl = 'https:' + articleUrl;
        } else if (articleUrl.startsWith('www.')) {
          entry.spyArticleUrl = 'https://' + articleUrl;
        } else if (articleUrl.includes('.')) {
          // Looks like a domain without protocol
          entry.spyArticleUrl = 'https://' + articleUrl;
        }
      }
    }

    entries.push(entry);
  }

  console.log(`✅ Parsed ${entries.length} entries from CSV`);
  console.log('📄 Sample entry:', entries[0]);

  return entries;
}

export default function BulkImportModal({
  onClose,
  onSuccess,
  apiEndpoint,
  getAuthHeaders,
  onBackgroundExtractionStart,
  onBackgroundExtractionEnd
}: BulkImportModalProps) {
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text');
  const [bulkImportText, setBulkImportText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    try {
      let data = '';

      if (importMethod === 'text') {
        if (!bulkImportText.trim()) {
          alert('Please enter some data to preview.');
          return;
        }
        data = bulkImportText;
      } else if (importMethod === 'file') {
        if (!csvFile) {
          alert('Please select a CSV file to preview.');
          return;
        }
        data = await csvFile.text();
      }

      const parsedData = parseCSVData(data);
      setPreviewData(parsedData.slice(0, 5)); // Show first 5 rows
      setShowPreview(true);
    } catch (error) {
      console.error('Preview error:', error);
      alert(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkImport = async () => {
    if (importMethod === 'text' && !bulkImportText.trim()) {
      alert('Please enter some data to import.');
      return;
    }

    if (importMethod === 'file' && !csvFile) {
      alert('Please select a CSV file to import.');
      return;
    }

    setProcessing(true);

    try {
      let data;
      if (importMethod === 'text') {
        data = bulkImportText;
      } else {
        const text = await csvFile!.text();
        data = text;
      }

      // Parse CSV data before sending to main endpoint
      let parsedData;
      try {
        parsedData = parseCSVData(data);
      } catch (parseError) {
        alert(`CSV parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        return;
      }

      console.log('🔍 Sending bulk import data:', {
        dataCount: parsedData.length,
        sampleEntry: parsedData[0],
        batchId: `bulk_${Date.now()}`
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          data: parsedData, 
          batchId: `bulk_${Date.now()}`,
          autoExtractImages: false  // Don't extract during import
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bulk import successful:', result);
        
        alert(`Successfully imported ${result.created} entries! Image extraction will start in the background.`);
        onSuccess();
        
        // Start background image extraction after successful import
        if (result.created > 0 && result.data && Array.isArray(result.data)) {
          // Sort entries by ID to match the table's default display order
          const entriesInTableOrder = result.data.sort((a: any, b: any) => {
            return a.id.localeCompare(b.id);
          });
          
          const entriesNeedingImages = entriesInTableOrder.filter((entry: any) => 
            entry.spyArticleUrl && entry.spyArticleUrl.trim() && (!entry.spyImageUrl || !entry.spyImageUrl.trim())
          );
          
          console.log(`🔍 Background extraction order (ID sorted - matches table):`, 
            entriesNeedingImages.map((e: any, i: number) => `${i + 1}. ${e.spyTitle} (ID: ${e.id})`).join(', '));
          
          if (entriesNeedingImages.length > 0) {
            console.log(`🔄 Starting background extraction for ${entriesNeedingImages.length} entries in table order`);
            
            // Notify parent that background extraction is starting
            onBackgroundExtractionStart?.();
            
            setTimeout(async () => {
              try {
                const extractResponse = await fetch(`${apiEndpoint}/extract-images-batch`, {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({ 
                    batchId: `bulk_${Date.now()}`,
                    entries: entriesNeedingImages,
                    processInOrder: true,
                    estimatedDuration: entriesNeedingImages.length * 5 // 5 seconds per extraction estimate
                  })
                });
                
                if (extractResponse.ok) {
                  console.log('✅ Background image extraction started successfully');
                } else {
                  console.error('❌ Failed to start background image extraction');
                  onBackgroundExtractionEnd?.(); // End tracking if failed to start
                }
              } catch (error) {
                console.error('❌ Background image extraction error:', error);
                onBackgroundExtractionEnd?.(); // End tracking on error
              }
            }, 2000); // Start extraction 2 seconds after import success
          } else {
            console.log('ℹ️ No entries need image extraction');
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Import failed:', errorData);
        
        let errorMessage = `Import failed: ${errorData.error || 'Unknown error'}`;
        
        // Show validation details if available
        if (errorData.invalidEntries && errorData.invalidEntries.length > 0) {
          errorMessage += '\n\nValidation errors:';
          errorData.invalidEntries.slice(0, 5).forEach((entry: any) => {
            errorMessage += `\nRow ${entry.index + 2}: ${entry.errors.join(', ')}`;
          });
          if (errorData.invalidEntries.length > 5) {
            errorMessage += `\n... and ${errorData.invalidEntries.length - 5} more errors`;
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('❌ Import error:', error);
      alert(`Import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🧠 Smart CSV Import</h3>
              <p className="text-sm text-gray-600 mt-1">Intelligent column detection for any CSV format</p>
              <button
                onClick={() => {
                  const csvExample = `SPY Title,SPY Description,SPY Image URL,SPY Article URL,SPY PIN Image,Annotation
"Chocolate Chip Cookies","Delicious homemade cookies","https://example.com/image1.jpg","https://example.com/recipe1","https://pinterest.com/pin1.jpg","Chef John - Desserts"
"Pasta Carbonara","Classic Italian pasta dish","https://example.com/image2.jpg","https://example.com/recipe2","https://pinterest.com/pin2.jpg","Chef Maria - Italian"
"Green Smoothie","Healthy breakfast smoothie","https://example.com/image3.jpg","https://example.com/recipe3","https://pinterest.com/pin3.jpg","Chef Amy - Healthy"`;
                  const blob = new Blob([csvExample], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'pinterest-spy-import-example.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                📥 Download Example CSV
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Smart Detection Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Automatic Column Detection</h4>
            <div className="text-xs text-blue-700 grid grid-cols-2 gap-2">
              <div>
                <strong>Title:</strong> title, name, spy title, headline
              </div>
              <div>
                <strong>Description:</strong> description, content, summary
              </div>
              <div>
                <strong>Article URL:</strong> url, link, article url, source
              </div>
              <div>
                <strong>Image URL:</strong> image url, picture, photo
              </div>
              <div>
                <strong>Author:</strong> author, creator, writer, by
              </div>
              <div>
                <strong>Category:</strong> category, topic, section, type
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Use the Preview button to see how your columns will be mapped before importing!
            </p>
          </div>

          {/* Import Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Import Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="importMethod"
                  value="text"
                  checked={importMethod === 'text'}
                  onChange={(e) => setImportMethod(e.target.value as 'text')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Paste CSV Text</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="importMethod"
                  value="file"
                  checked={importMethod === 'file'}
                  onChange={(e) => setImportMethod(e.target.value as 'file')}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Upload CSV File</span>
              </label>
            </div>
          </div>

          {/* Import Content */}
          {importMethod === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV Data
              </label>
              <textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Paste your CSV data here...
Example:
Title,Description,Image URL,Article URL,Author
Recipe 1,Delicious recipe,https://...,https://...,Chef Name
Recipe 2,Another recipe,https://...,https://...,Chef Name"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {csvFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          )}

        </div>

        {/* Preview section */}
        {showPreview && previewData && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Preview (First 5 rows)</h3>
            <div className="max-h-60 overflow-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1 text-left">Title</th>
                    <th className="border px-2 py-1 text-left">Description</th>
                    <th className="border px-2 py-1 text-left">Article URL</th>
                    <th className="border px-2 py-1 text-left">Image URL</th>
                    <th className="border px-2 py-1 text-left">Author</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border px-2 py-1 max-w-32 truncate" title={entry.spyTitle}>
                        {entry.spyTitle || '-'}
                      </td>
                      <td className="border px-2 py-1 max-w-32 truncate" title={entry.spyDescription}>
                        {entry.spyDescription || '-'}
                      </td>
                      <td className="border px-2 py-1 max-w-32 truncate" title={entry.spyArticleUrl}>
                        {entry.spyArticleUrl || '-'}
                      </td>
                      <td className="border px-2 py-1 max-w-32 truncate" title={entry.spyImageUrl}>
                        {entry.spyImageUrl || '-'}
                      </td>
                      <td className="border px-2 py-1 max-w-32 truncate" title={entry.spyAuthor}>
                        {entry.spyAuthor || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              This shows how your CSV data will be interpreted. If the mapping looks wrong, please adjust your CSV headers.
            </p>
          </div>
        )}

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handlePreview}
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            <span>👁️</span>
            <span>Preview</span>
          </button>
          <button
            onClick={handleBulkImport}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
          >
            {processing ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Import Data</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}