import { useState, useEffect, useCallback, useRef } from 'react';
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
      const response = await fetch('/api/admin/pinterest-spy?limit=10000', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // API returns { data, pagination, stats }
        const data = Array.isArray(result) ? result : (result.data || []);
        const apiStats = result.stats || null;
        
        setSpyData(data);
        
        // Use API stats if available, otherwise calculate locally
        if (apiStats) {
          setStats(apiStats);
        } else {
          // Calculate stats locally
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
      }
    } catch (error) {
      console.error('Error loading spy data:', error);
      setSpyData([]); // Ensure it's always an array
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
  const [isPaused, setIsPaused] = useState(false);
  const pausedRef = useRef(false);

  const extractFeaturedImage = async (entry: PinterestSpyData, autoSave: boolean = false) => {
    if (!entry.spyArticleUrl) return null;

    setExtractionStatus(prev => ({ ...prev, [entry.id]: 'extracting' }));

    try {
      const response = await fetch('/api/admin/pinterest-spy/extract-image', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          url: entry.spyArticleUrl,
          title: entry.spyTitle,
          entryId: entry.id,
          autoSave: autoSave  // Tell API to save directly to database
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
    setIsPaused(false);
    pausedRef.current = false;

    // Increase batch size since we're fetching from different websites
    const BATCH_SIZE = 15; // Process 15 in parallel
    let completed = 0;

    for (let i = 0; i < selectedData.length; i += BATCH_SIZE) {
      // Check if paused using ref for immediate value
      while (pausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const batch = selectedData.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}: ${batch.length} images in parallel`);
      
      // Process batch in parallel with auto-save enabled
      const results = await Promise.allSettled(
        batch.map(async (entry) => {
          try {
            await extractFeaturedImage(entry, true);  // Auto-save to database
          } catch (error) {
            console.error(`Failed to extract image for ${entry.id}:`, error);
          }
        })
      );
      
      completed += batch.length;
      setExtractionProgress({ current: completed, total: selectedData.length });
      
      console.log(`Completed ${completed}/${selectedData.length} images`);
      
      // No delay between batches - fetching from different sites
      // No need to worry about rate limiting
    }

    setExtractionProgress({ current: 0, total: 0 });
    setIsPaused(false);
    pausedRef.current = false;
  };

  const togglePause = (newValue: boolean) => {
    pausedRef.current = newValue;
    setIsPaused(newValue);
  };

  return {
    extractionStatus,
    extractionResults,
    extractionProgress,
    extractFeaturedImage,
    extractImagesForSelected,
    setExtractionProgress,
    isPaused,
    setIsPaused: togglePause
  };
};

export const useSEOProcessing = (
  getAuthHeaders: () => Record<string, string>,
  spyData: PinterestSpyData[] // Add spyData to load existing SEO results
) => {
  const [seoResults, setSeoResults] = useState<Record<string, SEOResult>>({});
  const [seoProgress, setSeoProgress] = useState<ExtractionProgress>({ current: 0, total: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  // Load existing SEO results from spyData on mount or when spyData changes
  useEffect(() => {
    const existingResults: Record<string, SEOResult> = {};
    
    spyData.forEach(entry => {
      // Check if entry has SEO data already processed
      if (entry.seoKeyword || entry.seoTitle || entry.seoDescription) {
        existingResults[entry.id] = {
          id: entry.id,
          title: entry.seoTitle || entry.spyTitle || '',
          description: entry.seoDescription || entry.spyDescription || '',
          keywords: entry.seoKeyword || '',
          category: entry.seoCategory || '',
          status: 'completed'
        };
      }
    });

    if (Object.keys(existingResults).length > 0) {
      console.log(`✅ Loaded ${Object.keys(existingResults).length} existing SEO results from database`);
      setSeoResults(existingResults);
    }
  }, [spyData]);

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
          entryIds: [entry.id],  // API expects array
          batchSize: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(`SEO processing failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      // Extract result for this entry
      const entryResult = result.results?.[0];
      
      if (!entryResult || !entryResult.success) {
        throw new Error(entryResult?.error || 'SEO processing failed');
      }

      const seoData = entryResult.seoData || {};
      
      setSeoResults(prev => ({
        ...prev,
        [entry.id]: {
          id: entry.id,
          title: seoData.seoTitle || entry.spyTitle,
          description: seoData.seoDescription || entry.spyDescription,
          keywords: seoData.seoKeyword || '',
          category: seoData.seoCategory || '',
          status: 'completed'
        }
      }));

      return seoData;
    } catch (error) {
      console.error('SEO processing error:', error);
      setSeoResults(prev => ({
        ...prev,
        [entry.id]: { ...prev[entry.id], status: 'error' }
      }));
      return null;
    }
  };

  const togglePause = () => {
    const newValue = !isPaused;
    setIsPaused(newValue);
    pausedRef.current = newValue;
    console.log(newValue ? '⏸️ SEO Processing PAUSED' : '▶️ SEO Processing RESUMED');
  };

  const stopProcessing = () => {
    setIsStopped(true);
    stoppedRef.current = true;
    console.log('⏹️ SEO Processing STOPPED');
  };

  const resetStopFlag = () => {
    setIsStopped(false);
    stoppedRef.current = false;
    setIsPaused(false);
    pausedRef.current = false;
  };

  return {
    seoResults,
    seoProgress,
    processSEO,
    setSeoProgress,
    isPaused,
    isStopped,
    togglePause,
    stopProcessing,
    resetStopFlag
  };
};

/**
 * Image Generation Hook
 */
export const useImageGeneration = (getAuthHeaders: () => Record<string, string>, spyData: PinterestSpyData[]) => {
  const [imageResults, setImageResults] = useState<Record<string, any>>({});
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const pausedRef = useRef(false);
  const stoppedRef = useRef(false);

  // Load existing image generation results from spyData
  useEffect(() => {
    const existingResults: Record<string, any> = {};
    let loadedCount = 0;

    spyData.forEach(entry => {
      if (entry.generatedImage1Url) {
        existingResults[entry.id] = {
          id: entry.id,
          image1Url: entry.generatedImage1Url,
          image2Url: entry.generatedImage2Url,
          image3Url: entry.generatedImage3Url,
          image4Url: entry.generatedImage4Url,
          prompts: entry.generatedImagePrompts,
          status: 'completed'
        };
        loadedCount++;
      }
    });

    if (loadedCount > 0) {
      setImageResults(existingResults);
      console.log(`✅ Loaded ${loadedCount} existing image generation results from database`);
    }
  }, [spyData]);

  const generateImagePrompts = async (entryId: string) => {
    const response = await fetch('/api/admin/pinterest-spy/generate-prompts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryId })
    });

    if (!response.ok) throw new Error('Failed to generate prompts');
    return await response.json();
  };

  const generateSingleImage = async (entryId: string, prompt: string, imageNumber: number, seoKeyword: string, referenceImageUrl: string) => {
    const response = await fetch('/api/admin/pinterest-spy/generate-image', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryId, prompt, imageNumber, seoKeyword, referenceImageUrl })
    });

    if (!response.ok) throw new Error('Failed to generate image');
    return await response.json();
  };

  const uploadImage = async (entryId: string, imageData: string, filename: string) => {
    const response = await fetch('/api/admin/pinterest-spy/upload-image', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryId, imageData, filename })
    });

    if (!response.ok) throw new Error('Failed to upload image');
    return await response.json();
  };

  const saveImageUrls = async (entryId: string, imageUrls: any, prompts: any) => {
    const response = await fetch('/api/admin/pinterest-spy/save-images', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryId, imageUrls, prompts })
    });

    if (!response.ok) throw new Error('Failed to save image URLs');
    return await response.json();
  };

  const deleteGeneratedImages = async (entryIds: string[]) => {
    const response = await fetch('/api/admin/pinterest-spy/delete-images', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ entryIds })
    });

    if (!response.ok) throw new Error('Failed to delete images');
    return await response.json();
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
    pausedRef.current = !pausedRef.current;
    console.log(pausedRef.current ? '⏸️ Image Generation PAUSED' : '▶️ Image Generation RESUMED');
  };

  const stopProcessing = () => {
    setIsStopped(true);
    stoppedRef.current = true;
    console.log('⏹️ Image Generation STOPPED');
  };

  const resetStopFlag = () => {
    setIsStopped(false);
    stoppedRef.current = false;
    setIsPaused(false);
    pausedRef.current = false;
  };

  return {
    imageResults,
    imageProgress,
    setImageProgress,
    isPaused,
    isStopped,
    pausedRef,
    stoppedRef,
    togglePause,
    stopProcessing,
    resetStopFlag,
    generateImagePrompts,
    generateSingleImage,
    uploadImage,
    saveImageUrls,
    deleteGeneratedImages
  };
};