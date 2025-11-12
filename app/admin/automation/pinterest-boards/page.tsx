'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Loader2, Link as LinkIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PinterestBoard {
  id: string;
  boardName: string;
  boardId: string;
  categoryId: string;
  category?: Category;
  isActive: boolean;
}

export default function PinterestBoardsPage() {
  const [boards, setBoards] = useState<PinterestBoard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBoard, setNewBoard] = useState<Partial<PinterestBoard> | null>(null);
  
  // Pinterest settings state
  const [enablePinterest, setEnablePinterest] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [settingsChanged, setSettingsChanged] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      
      // Load automation settings for Pinterest config
      const settingsRes = await fetch('/api/admin/automation/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const settingsData = await settingsRes.json();
      
      if (settingsData.success) {
        setEnablePinterest(settingsData.settings.enablePinterest || false);
        setWebhookUrl(settingsData.settings.pinterestWebhookUrl || '');
        setImageEditPrompt(settingsData.settings.pinterestImageEditPrompt || '');
      }
      
      // Load categories
      const categoriesRes = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const categoriesData = await categoriesRes.json();
      
      if (categoriesData.success) {
        setCategories(categoriesData.categories || []);
      }

      // Load Pinterest boards
      const boardsRes = await fetch('/api/admin/automation/pinterest-boards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const boardsData = await boardsRes.json();
      
      if (boardsData.success) {
        setBoards(boardsData.boards || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('❌ Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setNewBoard({
      boardName: '',
      boardId: '',
      categoryId: '',
      isActive: true
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/automation/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          enablePinterest,
          pinterestWebhookUrl: webhookUrl,
          pinterestImageEditPrompt: imageEditPrompt
        })
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('✅ Pinterest settings saved successfully!', 'success');
        setSettingsChanged(false);
      } else {
        showMessage(`❌ ${data.error || 'Failed to save settings'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('❌ Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNew = () => {
    setNewBoard(null);
  };

  const handleSaveNew = async () => {
    if (!newBoard?.boardName || !newBoard?.boardId || !newBoard?.categoryId) {
      showMessage('⚠️ Please fill all required fields', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/automation/pinterest-boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBoard)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('✅ Pinterest board added successfully!', 'success');
        setNewBoard(null);
        await loadData();
      } else {
        showMessage(`❌ ${data.error || 'Failed to add board'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to save board:', error);
      showMessage('❌ Failed to add board', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<PinterestBoard>) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/automation/pinterest-boards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('✅ Board updated successfully!', 'success');
        setEditingId(null);
        await loadData();
      } else {
        showMessage(`❌ ${data.error || 'Failed to update board'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to update board:', error);
      showMessage('❌ Failed to update board', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Pinterest board mapping?')) {
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/automation/pinterest-boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showMessage('✅ Board deleted successfully!', 'success');
        await loadData();
      } else {
        showMessage(`❌ ${data.error || 'Failed to delete board'}`, 'error');
      }
    } catch (error) {
      console.error('Failed to delete board:', error);
      showMessage('❌ Failed to delete board', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading Pinterest boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LinkIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pinterest Board Mapping
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Map your recipe categories to Pinterest boards
                </p>
              </div>
            </div>
            
            <button
              onClick={handleAddNew}
              disabled={newBoard !== null}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Board
            </button>
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded-lg border ${
              message.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
              message.includes('❌') ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' :
              'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Pinterest Configuration Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              📌 Pinterest Automation Settings
            </h2>
            {settingsChanged && (
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            )}
          </div>

          {/* Enable Pinterest Toggle */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Enable Pinterest Automation</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enablePinterest}
                onChange={(e) => {
                  setEnablePinterest(e.target.checked);
                  setSettingsChanged(true);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Webhook URL */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Make.com Webhook URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://hook.us1.make.com/xxxxxxxxxxxxx"
              value={webhookUrl}
              onChange={(e) => {
                setWebhookUrl(e.target.value);
                setSettingsChanged(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 font-mono text-sm"
            />
          </div>

          {/* Image Edit Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Image Editing Prompt (Optional)
            </label>
            <textarea
              value={imageEditPrompt}
              onChange={(e) => {
                setImageEditPrompt(e.target.value);
                setSettingsChanged(true);
              }}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 font-mono text-sm"
              placeholder="Optional: Add custom prompt for Gemini to edit images"
            />
          </div>
        </div>

        {/* Boards Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Board Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Board ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* New Board Row */}
              {newBoard && (
                <tr className="bg-purple-50 dark:bg-purple-900/10">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g., Delicious Desserts"
                      value={newBoard.boardName || ''}
                      onChange={(e) => setNewBoard({ ...newBoard, boardName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      placeholder="e.g., 1234567890 or board-slug"
                      value={newBoard.boardId || ''}
                      onChange={(e) => setNewBoard({ ...newBoard, boardId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={newBoard.categoryId || ''}
                      onChange={(e) => setNewBoard({ ...newBoard, categoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleSaveNew}
                        disabled={isSaving}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelNew}
                        disabled={isSaving}
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing Boards */}
              {boards.length === 0 && !newBoard && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No Pinterest boards configured yet. Click "Add Board" to get started.
                  </td>
                </tr>
              )}

              {boards.map(board => (
                <tr key={board.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    {board.boardName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-sm">
                    {board.boardId}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {getCategoryName(board.categoryId)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      board.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {board.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(board.id)}
                      disabled={isSaving}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
