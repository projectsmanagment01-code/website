/**
 * Image Generation Tab - Organized and Modular
 */

'use client';

import React, { useState, useMemo } from 'react';
import { PinterestSpyData } from '../pinterest/types';
import { useImageGeneration } from '../pinterest/hooks';

interface ImageGenerationTabProps {
  spyData: PinterestSpyData[];
  getAuthHeaders: () => Record<string, string>;
}

const DEFAULT_MASTER_PROMPT = `You are an AI agent responsible for generating four separate, highly realistic, and visually cohesive image prompts for a single recipe. Each prompt must describe one stage of the same cooking scene and environment.

CRITICAL REQUIREMENTS:
- All four images share the same environment, decor, and visual tone
- Feature image focuses on the food with close-up framing
- Two images must use bright natural sunlight, two must use professional studio lighting
- Every image must be captured in a 16:9 tall aspect ratio
- Background must remain detailed, rich, and realistic — never blurred

Generate four separate, detailed, single-line descriptive prompts in valid JSON format:
- image_1_feature: Close-up view of finished dish
- image_2_ingredients: All raw ingredients neatly arranged
- image_3_cooking: Action shot of cooking/assembling process
- image_4_final_presentation: Completed dish presented creatively

Output ONLY valid JSON.`;

export default function ImageGenerationTab({ spyData, getAuthHeaders }: ImageGenerationTabProps) {
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
    saveImageUrls
  } = useImageGeneration(getAuthHeaders, spyData);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState(DEFAULT_MASTER_PROMPT);
  const [currentProcessing, setCurrentProcessing] = useState<Record<string, any>>({});
  
  // Stage management: 'select' | 'prompts-generated' | 'generating-images'
  const [stage, setStage] = useState<'select' | 'prompts-generated' | 'generating-images'>('select');
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, any>>({});
  const [editedPrompts, setEditedPrompts] = useState<Record<string, any>>({});

  // Filter entries ready for image generation
  const entriesReady = useMemo(() => {
    return spyData.filter(e =>
      e.seoKeyword && e.seoTitle && e.seoDescription && e.spyImageUrl && !e.generatedImage1Url
    );
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
      alert('No entries selected');
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
    alert(`Generated prompts for ${Object.keys(allPrompts).length} entries! Review and edit them, then generate images.`);
  };

  // STAGE 2: Generate images using the edited prompts
  const handleGenerateImages = async () => {
    const entriesToProcess = Object.values(editedPrompts);
    if (entriesToProcess.length === 0) {
      alert('No prompts available');
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
    alert(`Completed! Generated images for ${entriesToProcess.length} entries.`);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">🖼️ Image Generation</h2>
        <p className="text-gray-600">Generate 4 professional images per recipe using Google Imagen 3</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Ready', value: stats.needsImages },
          { label: 'Generated', value: stats.alreadyGenerated },
          { label: 'Selected', value: stats.selected },
          { label: 'Will Process', value: stats.willProcess, highlight: true }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded border shadow-sm">
            <div className="text-sm text-gray-600">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.highlight ? 'text-blue-600' : ''}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Master Prompt */}
      <div className="bg-white p-6 rounded border">
        <h3 className="font-semibold mb-2">✨ Master Prompt Template</h3>
        <p className="text-sm text-gray-600 mb-3">Generates 4 image descriptions from recipe data</p>
        <textarea
          value={masterPrompt}
          onChange={(e) => setMasterPrompt(e.target.value)}
          rows={6}
          className="w-full font-mono text-sm border rounded p-3 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {stage === 'select' && (
          <>
            <button onClick={() => setSelectedIds(entriesReady.map(e => e.id))} className="px-4 py-2 border rounded hover:bg-gray-50">
              Select All ({stats.needsImages})
            </button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 border rounded hover:bg-gray-50">
              Clear
            </button>
            <div className="flex-1" />
            {!processing && (
              <button
                onClick={handleGeneratePrompts}
                disabled={stats.willProcess === 0}
                className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
              >
                📝 Step 1: Generate Prompts ({stats.willProcess})
              </button>
            )}
          </>
        )}
        
        {stage === 'prompts-generated' && (
          <>
            <button onClick={() => { setStage('select'); setGeneratedPrompts({}); setEditedPrompts({}); }} className="px-4 py-2 border rounded hover:bg-gray-50">
              ← Back to Selection
            </button>
            <div className="flex-1" />
            <button
              onClick={handleGenerateImages}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600"
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
              className={`px-4 py-2 rounded ${isPaused ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button onClick={stopProcessing} className="px-4 py-2 bg-red-500 text-white rounded">
              ⏹️ Stop
            </button>
          </>
        )}
      </div>

      {/* Progress */}
      {processing && (
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-between text-sm mb-2">
            <span>Processing: {imageProgress.current} / {imageProgress.total}</span>
            <span>{Math.round((imageProgress.current / imageProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className={`h-2 rounded transition-all ${isPaused ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${(imageProgress.current / imageProgress.total) * 100}%` }}
            />
          </div>
          {isPaused && <p className="text-sm text-orange-600 mt-2">⏸️ Paused</p>}
        </div>
      )}

      {/* Entries List - Stage 1: Selection */}
      {stage === 'select' && (
        <div className="bg-white rounded border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Entries Ready for Image Generation</h3>
            <p className="text-sm text-gray-600">{stats.needsImages} entries ready</p>
          </div>
          <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {entriesReady.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
                      isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="flex gap-4">
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="mt-1" />
                      {entry.spyImageUrl && (
                        <img src={entry.spyImageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{entry.seoTitle}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{entry.seoDescription}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{entry.seoKeyword}</span>
                          {entry.seoCategory && (
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded">{entry.seoCategory}</span>
                          )}
                        </div>
                        {status && (
                          <div className="mt-2 text-sm">
                            {status.status === 'generating-prompts' && <span className="text-blue-600">🎨 Generating prompts...</span>}
                            {status.status === 'prompts-ready' && <span className="text-green-600">✅ Prompts ready!</span>}
                            {status.status === 'error' && <span className="text-red-600">❌ {status.error}</span>}
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
        <div className="bg-white rounded border">
          <div className="p-4 border-b bg-green-50">
            <h3 className="font-semibold text-green-800">✅ Prompts Generated - Review and Edit Before Image Generation</h3>
            <p className="text-sm text-green-600">Edit any prompt below, then click "Step 2: Generate Images"</p>
          </div>
          <div className="p-4 space-y-6 max-h-[700px] overflow-y-auto">
            {Object.entries(editedPrompts).map(([entryId, promptData]: [string, any]) => (
              <div key={entryId} className="border rounded p-4 bg-gray-50">
                <div className="flex gap-4 mb-4">
                  {promptData.entry.spyImageUrl && (
                    <img src={promptData.entry.spyImageUrl} alt="" className="w-20 h-20 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{promptData.entryTitle}</h4>
                    <p className="text-sm text-gray-600">{promptData.entry.seoKeyword}</p>
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
                      <label className={`text-sm font-medium text-${color}-700 block mb-1`}>{label}</label>
                      <textarea
                        value={promptData.prompts[key]}
                        onChange={(e) => updatePrompt(entryId, key, e.target.value)}
                        rows={3}
                        className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Processing Status */}
                {currentProcessing[entryId] && (
                  <div className="mt-3 text-sm">
                    {currentProcessing[entryId].status === 'generating-images' && (
                      <span className="text-purple-600">🖼️ Generating image {currentProcessing[entryId].currentImage}/4...</span>
                    )}
                    {currentProcessing[entryId].status === 'completed' && (
                      <span className="text-green-600">✅ All 4 images generated!</span>
                    )}
                    {currentProcessing[entryId].status === 'error' && (
                      <span className="text-red-600">❌ {currentProcessing[entryId].error}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
