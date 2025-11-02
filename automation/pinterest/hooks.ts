import { useState, useEffect, useCallback } from 'react';
import { PinterestSpyData, Stats, ExtractionResult, ExtractionProgress, SEOResult } from './types';

export const usePinterestData = () => {
  const [spyData, setSpyData] = useState<PinterestSpyData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, byStatus: {}, markedForGeneration: 0 });
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadSpyData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/pinterest-spy', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSpyData(data);
        
        // Calculate stats
        const total = data.length;
        const byStatus: Record<string, number> = {};
        let markedForGeneration = 0;
        
        data.forEach((entry: PinterestSpyData) => {
          const status = entry.spyStatus || 'PENDING';
          byStatus[status] = (byStatus[status] || 0) + 1;
          if (entry.markForGeneration) markedForGeneration++;
        });
        
        setStats({ total, byStatus, markedForGeneration });
      }
    } catch (error) {
      console.error('Error loading spy data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpyData();
  }, [loadSpyData]);

  const updateSpyData = async (id: string, updates: Partial<PinterestSpyData>) => {
    try {
      const response = await fetch('/api/admin/pinterest-spy', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, updates })
      });

      if (response.ok) {
        await loadSpyData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating spy data:', error);
      return false;
    }
  };

  const deleteSpyData = async (ids: string[]) => {
    try {
      const response = await fetch('/api/admin/pinterest-spy', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids })
      });

      if (response.ok) {
        await loadSpyData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting spy data:', error);
      return false;
    }
  };

  return {
    spyData,
    stats,
    loading,
    loadSpyData,
    updateSpyData,
    deleteSpyData,
    getAuthHeaders
  };
};

export const useImageExtraction = (getAuthHeaders: () => Record<string, string>) => {
  const [extractionStatus, setExtractionStatus] = useState<Record<string, 'idle' | 'extracting' | 'success' | 'error'>>({});
  const [extractionResults, setExtractionResults] = useState<Record<string, ExtractionResult>>({});
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({ current: 0, total: 0 });

  const extractFeaturedImage = async (entry: PinterestSpyData) => {
    if (!entry.spyArticleUrl) return null;

    setExtractionStatus(prev => ({ ...prev, [entry.id]: 'extracting' }));

    try {
      const response = await fetch('/api/admin/pinterest-spy/extract-image', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          url: entry.spyArticleUrl,
          title: entry.spyTitle,
          entryId: entry.id
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to extract image: ${response.statusText}`);
      }

      const result = await response.json();
      
      setExtractionResults(prev => ({
        ...prev,
        [entry.id]: {
          imageUrl: result.imageUrl,
          alt: result.alt,
          selector: result.selector
        }
      }));

      setExtractionStatus(prev => ({ ...prev, [entry.id]: 'success' }));
      return result;
    } catch (error) {
      console.error('Image extraction error:', error);
      setExtractionStatus(prev => ({ ...prev, [entry.id]: 'error' }));
      return null;
    }
  };

  const extractImagesForSelected = async (selectedData: PinterestSpyData[]) => {
    if (selectedData.length === 0) return;

    setExtractionProgress({ current: 0, total: selectedData.length });

    for (let i = 0; i < selectedData.length; i++) {
      const entry = selectedData[i];
      setExtractionProgress({ current: i + 1, total: selectedData.length });
      
      await extractFeaturedImage(entry);
      
      // Add delay between requests
      if (i < selectedData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setExtractionProgress({ current: 0, total: 0 });
  };

  return {
    extractionStatus,
    extractionResults,
    extractionProgress,
    extractFeaturedImage,
    extractImagesForSelected,
    setExtractionProgress
  };
};

export const useSEOProcessing = (getAuthHeaders: () => Record<string, string>) => {
  const [seoResults, setSeoResults] = useState<Record<string, SEOResult>>({});
  const [seoProgress, setSeoProgress] = useState<ExtractionProgress>({ current: 0, total: 0 });

  const processSEO = async (entry: PinterestSpyData, prompt: string) => {
    setSeoResults(prev => ({
      ...prev,
      [entry.id]: { ...prev[entry.id], status: 'processing' }
    }));

    try {
      const response = await fetch('/api/admin/pinterest-spy/process-seo', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          entryId: entry.id,
          title: entry.spyTitle,
          description: entry.spyDescription,
          content: entry.spyIngredients + ' ' + entry.spyInstructions,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error(`SEO processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setSeoResults(prev => ({
        ...prev,
        [entry.id]: {
          id: entry.id,
          title: result.title,
          description: result.description,
          keywords: result.keywords,
          category: result.category,
          tags: result.tags,
          author: result.author,
          cookingTime: result.cookingTime,
          prepTime: result.prepTime,
          servings: result.servings,
          difficulty: result.difficulty,
          status: 'completed'
        }
      }));

      return result;
    } catch (error) {
      console.error('SEO processing error:', error);
      setSeoResults(prev => ({
        ...prev,
        [entry.id]: { ...prev[entry.id], status: 'error' }
      }));
      return null;
    }
  };

  return {
    seoResults,
    seoProgress,
    processSEO,
    setSeoProgress
  };
};