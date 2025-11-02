'use client';

import React, { useState } from 'react';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
  apiEndpoint: string;
  getAuthHeaders: () => Record<string, string>;
}

export default function BulkImportModal({
  onClose,
  onSuccess,
  apiEndpoint,
  getAuthHeaders
}: BulkImportModalProps) {
  const [importMethod, setImportMethod] = useState<'text' | 'file'>('text');
  const [bulkImportText, setBulkImportText] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

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

      const response = await fetch(`${apiEndpoint}/bulk-import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ data, format: 'csv' })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully imported ${result.imported} entries!`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Import failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please check the console for details.');
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
              <h3 className="text-lg font-semibold text-gray-900">📤 Bulk Import Pinterest Spy Data</h3>
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

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors duration-200"
          >
            Cancel
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