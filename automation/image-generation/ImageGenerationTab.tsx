/**
 * Image Generation Tab - Organized and Modular
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PinterestSpyData } from '../pinterest/types';
import { useImageGeneration } from '../pinterest/hooks';

interface ImageGenerationTabProps {
  spyData: PinterestSpyData[];
  getAuthHeaders: () => Record<string, string>;
  onRefresh: () => Promise<void>;
}

const DEFAULT_MASTER_PROMPT = `You are an AI agent responsible for generating FOUR COMPLETELY DIFFERENT AND UNIQUE image prompts for a single recipe. Each prompt MUST describe a DISTINCT stage with DIFFERENT composition, angle, and subject matter. DUPLICATES ARE STRICTLY FORBIDDEN.

CRITICAL REQUIREMENTS:
- ALL images must be set in a KITCHEN ENVIRONMENT ONLY
- NO HUMANS, NO HANDS, NO BODY PARTS - completely human-free
- All four images share the same kitchen environment, decor, and visual tone
- Every image must be captured in a 16:9 tall aspect ratio

MANDATORY UNIQUENESS REQUIREMENTS - EACH IMAGE MUST BE DIFFERENT:

1. IMAGE 1 - FINISHED DISH HERO SHOT:
   - MUST show the COMPLETE finished dish as main subject
   - Close-up 45-degree angle of plated final result on kitchen surface
   - NO raw ingredients visible, NO cooking process, ONLY final result

2. IMAGE 2 - RAW INGREDIENTS LAYOUT (COMPLETELY DIFFERENT FROM IMAGE 1):
   - MUST show ONLY raw, uncooked ingredients laid out separately
   - NO finished dish visible, NO cooking in progress
   - Ingredients in bowls, measuring cups, on cutting board
   - Overhead flat lay view from directly above

3. IMAGE 3 - COOKING ACTION SHOT (COMPLETELY DIFFERENT FROM IMAGES 1 AND 2):
   - MUST show cooking/mixing/baking IN PROGRESS
   - Steam, bubbles, or action visible
   - Side angle or 3/4 view showing the process
   - NO finished dish, NO raw ingredients layout

4. IMAGE 4 - STYLED PRESENTATION (COMPLETELY DIFFERENT FROM ALL PREVIOUS):
   - MUST show finished dish in ELEGANT table setting
   - Different angle than image 1 (front view or side profile)
   - More styling and props than image 1

STRICT ANTI-DUPLICATION RULES:
- Each image MUST have different subject matter (finished vs ingredients vs cooking vs styled)
- Each image MUST have different camera angle (45-degree vs overhead vs side vs front)
- Each image MUST be visually distinct

IMPORTANT: Every prompt MUST mention "kitchen" and "no people, no hands visible, human-free".

Output ONLY valid JSON.`;

export default function ImageGenerationTab({ spyData, getAuthHeaders, onRefresh }: ImageGenerationTabProps) {
  const {
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
  } = useImageGeneration(getAuthHeaders, spyData);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT);
  const [currentProcessing, setCurrentProcessing] = useState<Record<string, any>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Stage management: 'select' | 'prompts-generated' | 'generating-images' | 'results'
  const [stage, setStage] = useState<'select' | 'prompts-generated' | 'generating-images' | 'results'>('select');
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, any>>({});
  const [editedPrompts, setEditedPrompts] = useState<Record<string, any>>({});

  // Auto-refresh data when component mounts to get latest SEO-processed entries
  useEffect(() => {
    console.log('🔄 Image Generation: Refreshing data to fetch latest SEO-processed entries...');
    onRefresh();
  }, []);

  // Filter entries ready for image generation (have SEO data but no images yet)
  const entriesReady = useMemo(() => {
    const filtered = spyData.filter(e =>
      e.seoKeyword && e.seoTitle && e.seoDescription && !e.generatedImage1Url
    );
    console.log(`📊 Image Generation: ${filtered.length} entries ready (have SEO data, need images)`);
    return filtered;
  }, [spyData]);

  // Stats
  const stats = useMemo(() => ({
    needsImages: entriesReady.length,
    alreadyGenerated: spyData.filter(e => e.generatedImage1Url).length,
    selected: selectedIds.length,
    willProcess: selectedIds.filter(id => entriesReady.find(e => e.id === id)).length
  }), [spyData, entriesReady, selectedIds]);

  // STAGE 1: Generate prompts for all selected entries
  const handleGeneratePrompts = async () => {
    const toProcess = entriesReady.filter(e => selectedIds.includes(e.id));
    if (toProcess.length === 0) {
      console.log('⚠️ No entries selected');
      return;
    }

    if (!confirm(`Generate prompts for ${toProcess.length} entries?`)) return;

    setProcessing(true);
    resetStopFlag();
    setImageProgress({ current: 0, total: toProcess.length });
    
    const allPrompts: Record<string, any> = {};

    for (let i = 0; i < toProcess.length; i++) {
      if (stoppedRef.current) break;

      const entry = toProcess[i];
      try {
        setCurrentProcessing(prev => ({ ...prev, [entry.id]: { status: 'generating-prompts' } }));
        console.log(`🎨 Generating prompts for: ${entry.seoTitle}`);
        
        const promptsResult = await generateImagePrompts(entry.id);
        allPrompts[entry.id] = {
          entryId: entry.id,
          entryTitle: entry.seoTitle,
          prompts: promptsResult.prompts,
          entry: entry
        };
        
        setCurrentProcessing(prev => ({ ...prev, [entry.id]: { status: 'prompts-ready' } }));
        console.log(`✅ Prompts generated for: ${entry.seoTitle}`);
      } catch (error) {
        console.error(`❌ Error generating prompts for ${entry.id}:`, error);
        setCurrentProcessing(prev => ({ 
          ...prev, 
          [entry.id]: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' } 
        }));
      }
      
      setImageProgress({ current: i + 1, total: toProcess.length });
    }

    setGeneratedPrompts(allPrompts);
    setEditedPrompts(JSON.parse(JSON.stringify(allPrompts))); // Deep copy for editing
    setProcessing(false);
    setStage('prompts-generated');
    console.log(`✅ Generated prompts for ${Object.keys(allPrompts).length} entries! Review and edit them, then generate images.`);
  };

  // STAGE 2: Generate images using the edited prompts
  const handleGenerateImages = async () => {
    const entriesToProcess = Object.values(editedPrompts);
    if (entriesToProcess.length === 0) {
      console.log('⚠️ No prompts available');
      return;
    }

    if (!confirm(`Generate 4 images for each of ${entriesToProcess.length} entries? This will take time.`)) return;

    setProcessing(true);
    setStage('generating-images');
    resetStopFlag();
    setImageProgress({ current: 0, total: entriesToProcess.length });

    for (let i = 0; i < entriesToProcess.length; i++) {
      if (stoppedRef.current) break;

      const promptData: any = entriesToProcess[i];
      const entry = promptData.entry;
      const prompts = promptData.prompts;

      try {
        setCurrentProcessing(prev => ({ ...prev, [entry.id]: { status: 'generating-images' } }));

        // Generate 4 images
        const imageUrls: any = {};
        const promptArray = [
          prompts.image_1_feature,
          prompts.image_2_ingredients,
          prompts.image_3_cooking,
          prompts.image_4_final_presentation
        ];

        for (let j = 0; j < 4; j++) {
          if (stoppedRef.current) break;

          // Wait if paused
          while (pausedRef.current && !stoppedRef.current) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          setCurrentProcessing(prev => ({ ...prev, [entry.id]: { ...prev[entry.id], currentImage: j + 1 } }));
          console.log(`🖼️ Generating image ${j + 1}/4 for: ${entry.seoTitle}`);
          console.log(`📝 Prompt ${j + 1}:`, promptArray[j].substring(0, 150) + '...');

          const imageResult = await generateSingleImage(entry.id, promptArray[j], j + 1, entry.seoKeyword!, entry.spyImageUrl!);
          
          // Upload image
          console.log(`📤 Uploading image ${j + 1}/4`);
          const uploadResult = await uploadImage(entry.id, imageResult.imageData, imageResult.filename);
          
          imageUrls[`image${j + 1}`] = uploadResult.url;
        }

        // Save URLs to database
        if (!stoppedRef.current && Object.keys(imageUrls).length === 4) {
          console.log(`💾 Saving image URLs for: ${entry.seoTitle}`);
          await saveImageUrls(entry.id, imageUrls, prompts);
          
          setCurrentProcessing(prev => ({ ...prev, [entry.id]: { status: 'completed', imageUrls } }));
          console.log(`✅ Completed: ${entry.seoTitle}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${entry.id}:`, error);
        setCurrentProcessing(prev => ({ 
          ...prev, 
          [entry.id]: { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' } 
        }));
      }

      setImageProgress({ current: i + 1, total: entriesToProcess.length });
    }

    setProcessing(false);
    console.log(`✅ Completed! Generated images for ${entriesToProcess.length} entries.`);
    
    // Refresh data to update stats
    await onRefresh();
    
    // Reset to selection stage
    setStage('select');
    setSelectedIds([]);
    setGeneratedPrompts({});
    setEditedPrompts({});
  };

  // Update individual prompt
  const updatePrompt = (entryId: string, promptKey: string, value: string) => {
    setEditedPrompts(prev => ({
      ...prev,
      [entryId]: {
        ...prev[entryId],
        prompts: {
          ...prev[entryId].prompts,
          [promptKey]: value
        }
      }
    }));
  };

  // Delete generated images (bulk or individual)
  const handleDeleteImages = async (entryIds: string[]) => {
    if (!confirm(`Are you sure you want to delete generated images for ${entryIds.length} entry(ies)? This will also delete the files from disk.`)) {
      return;
    }

    setDeleting(true);
    try {
      console.log(`🗑️ Deleting images for ${entryIds.length} entries...`);
      const result = await deleteGeneratedImages(entryIds);
      console.log(`✅ Deleted ${result.deletedFiles} files`);
      
      // Refresh data
      await onRefresh();
      
      // Clear selection
      setSelectedForDeletion([]);
      
      alert(`Successfully deleted ${result.deletedFiles} image files from ${result.entriesProcessed} entries`);
    } catch (error) {
      console.error('❌ Error deleting images:', error);
      alert('Failed to delete images. Check console for details.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-0">🖼️ Image Generation</h2>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6">
        {[
          { label: 'Ready', value: stats.needsImages },
          { label: 'Generated', value: stats.alreadyGenerated, clickable: true }
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => stat.clickable && stats.alreadyGenerated > 0 ? setStage('results' as any) : null}
            className={`bg-white dark:bg-gray-800 p-6 rounded border border-gray-200 dark:border-gray-700 shadow-sm w-48 ${stat.clickable && stats.alreadyGenerated > 0 ? 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors' : ''}`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {stage === 'select' && (
          <>
            <button onClick={() => setSelectedIds(entriesReady.map(e => e.id))} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Select All ({stats.needsImages})
            </button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              Clear
            </button>
            <div className="flex-1" />
            {!processing && (
              <button
                onClick={handleGeneratePrompts}
                disabled={stats.willProcess === 0}
                className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-600 dark:hover:bg-blue-700"
              >
                📝 Step 1: Generate Prompts ({stats.willProcess})
              </button>
            )}
          </>
        )}
        
        {stage === 'prompts-generated' && (
          <>
            <button onClick={() => { setStage('select'); setGeneratedPrompts({}); setEditedPrompts({}); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              ← Back to Selection
            </button>
            <div className="flex-1" />
            <button
              onClick={handleGenerateImages}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700"
            >
              🎨 Step 2: Generate Images ({Object.keys(editedPrompts).length})
            </button>
          </>
        )}
        
        {processing && (
          <>
            <div className="flex-1" />
            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded ${isPaused ? 'bg-orange-500 dark:bg-orange-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button onClick={stopProcessing} className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-700">
              ⏹️ Stop
            </button>
          </>
        )}
      </div>

      {/* Progress */}
      {processing && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300">
            <span>Processing: {imageProgress.current} / {imageProgress.total}</span>
            <span>{Math.round((imageProgress.current / imageProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div
              className={`h-2 rounded transition-all ${isPaused ? 'bg-orange-500 dark:bg-orange-600' : 'bg-blue-500 dark:bg-blue-600'}`}
              style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
            />
          </div>
          {isPaused && <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">⏸️ Paused</p>}
        </div>
      )}

      {/* Entries List - Stage 1: Selection */}
      {stage === 'select' && (
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Entries Ready for Image Generation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stats.needsImages} entries ready</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {entriesReady.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No entries ready</p>
                <p className="text-sm mt-2">Entries need SEO data first</p>
              </div>
            ) : (
              entriesReady.map(entry => {
                const status = currentProcessing[entry.id];
                const isSelected = selectedIds.includes(entry.id);

                return (
                  <div
                    key={entry.id}
                    onClick={() => !processing && setSelectedIds(prev =>
                      prev.includes(entry.id) ? prev.filter(id => id !== entry.id) : [...prev, entry.id]
                    )}
                    className={`p-4 border rounded cursor-pointer transition ${
                      isSelected 
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex gap-4">
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="mt-1" />
                      {entry.spyImageUrl && (
                        <img src={entry.spyImageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{entry.seoTitle}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{entry.seoDescription}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{entry.seoKeyword}</span>
                          {entry.seoCategory && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{entry.seoCategory}</span>
                          )}
                        </div>
                        {status && (
                          <div className="mt-2 text-sm">
                            {status.status === 'generating-prompts' && <span className="text-blue-600 dark:text-blue-400">🎨 Generating prompts...</span>}
                            {status.status === 'prompts-ready' && <span className="text-green-600 dark:text-green-400">✅ Prompts ready!</span>}
                            {status.status === 'error' && <span className="text-red-600 dark:text-red-400">❌ {status.error}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Stage 2: Review and Edit Prompts */}
      {stage === 'prompts-generated' && (
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/30">
            <h3 className="font-semibold text-green-800 dark:text-green-300">✅ Prompts Generated - Review and Edit Before Image Generation</h3>
            <p className="text-sm text-green-600 dark:text-green-400">Edit any prompt below, then click "Step 2: Generate Images"</p>
          </div>
          <div className="p-4 space-y-6 max-h-[700px] overflow-y-auto">
            {Object.entries(editedPrompts).map(([entryId, promptData]: [string, any]) => (
              <div key={entryId} className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-4 mb-4">
                  {promptData.entry.spyImageUrl && (
                    <img src={promptData.entry.spyImageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{promptData.entryTitle}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{promptData.entry.seoKeyword}</p>
                  </div>
                </div>
                
                {/* 4 Editable Prompts */}
                <div className="space-y-3">
                  {[
                    { key: 'image_1_feature', label: '1️⃣ Feature Image', color: 'blue' },
                    { key: 'image_2_ingredients', label: '2️⃣ Ingredients', color: 'green' },
                    { key: 'image_3_cooking', label: '3️⃣ Cooking Process', color: 'orange' },
                    { key: 'image_4_final_presentation', label: '4️⃣ Final Presentation', color: 'purple' }
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <label className={`text-sm font-medium text-${color}-700 dark:text-${color}-400 block mb-1`}>{label}</label>
                      <textarea
                        value={promptData.prompts[key]}
                        onChange={(e) => updatePrompt(entryId, key, e.target.value)}
                        rows={3}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  ))}
                </div>

                {/* Processing Status */}
                {currentProcessing[entryId] && (
                  <div className="mt-3 text-sm">
                    {currentProcessing[entryId].status === 'generating-images' && (
                      <span className="text-purple-600 dark:text-purple-400">🖼️ Generating image {currentProcessing[entryId].currentImage}/4...</span>
                    )}
                    {currentProcessing[entryId].status === 'completed' && (
                      <span className="text-green-600 dark:text-green-400">✅ All 4 images generated!</span>
                    )}
                    {currentProcessing[entryId].status === 'error' && (
                      <span className="text-red-600 dark:text-red-400">❌ {currentProcessing[entryId].error}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {stage === 'results' && (
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">🖼️ Generated Images - {stats.alreadyGenerated} Entries</h3>
              </div>
              <button 
                onClick={() => setStage('select')} 
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                ← Back
              </button>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const allIds = spyData.filter(e => e.generatedImage1Url).map(e => e.id);
                  setSelectedForDeletion(selectedForDeletion.length === allIds.length ? [] : allIds);
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {selectedForDeletion.length === spyData.filter(e => e.generatedImage1Url).length ? 'Deselect All' : 'Select All'}
              </button>
              
              {selectedForDeletion.length > 0 && (
                <button
                  onClick={() => handleDeleteImages(selectedForDeletion)}
                  disabled={deleting}
                  className="px-4 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {deleting ? '🗑️ Deleting...' : `🗑️ Delete ${selectedForDeletion.length} Selected`}
                </button>
              )}
            </div>
          </div>
          <div className="p-4 space-y-6 max-h-[700px] overflow-y-auto">
            {spyData.filter(e => e.generatedImage1Url).map(entry => (
              <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedForDeletion.includes(entry.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedForDeletion([...selectedForDeletion, entry.id]);
                        } else {
                          setSelectedForDeletion(selectedForDeletion.filter(id => id !== entry.id));
                        }
                      }}
                      className="mt-1.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{entry.seoTitle}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{entry.seoKeyword} • {entry.seoCategory}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteImages([entry.id])}
                    disabled={deleting}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Delete this entry's images"
                  >
                    🗑️ Delete
                  </button>
                </div>
                
                {/* 4 Generated Images Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    entry.generatedImage1Url,
                    entry.generatedImage2Url,
                    entry.generatedImage3Url,
                    entry.generatedImage4Url
                  ].map((url, idx) => (
                    <div key={idx}>
                      {url ? (
                        <div className="relative aspect-[9/16] bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          <img 
                            src={url} 
                            alt=""
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            onClick={() => setSelectedImage(url)}
                          />
                        </div>
                      ) : (
                        <div className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400 dark:text-gray-600">N/A</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal Popup */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="" 
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
