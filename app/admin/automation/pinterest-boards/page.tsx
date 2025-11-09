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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin-token');
      
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

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📌 How to get your Pinterest Board ID:
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Go to your Pinterest profile and click on the board you want to use</li>
            <li>Look at the URL in your browser: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">pinterest.com/username/board-name/</code></li>
            <li>The Board ID is the last part of the URL (e.g., "delicious-desserts")</li>
            <li>Or use Pinterest's API to get the numeric Board ID</li>
          </ol>
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

        {/* Footer Info */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-900 dark:text-purple-300">
            <strong>💡 How this works:</strong> When a recipe is generated in a specific category, the automation will automatically 
            use the corresponding Pinterest Board ID when sending the webhook to Make.com. Make sure each category has a board mapped!
          </p>
        </div>
      </div>
    </div>
  );
}
