'use client';

import React from 'react';
import { BookOpen, Database, Brain, Image, FileText, Settings, PlayCircle, Calendar } from 'lucide-react';

export default function AutomationHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Automation System Guide
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Complete guide from data import to recipe generation
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📚 Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#overview" className="block text-blue-600 dark:text-blue-400 hover:underline">1. System Overview</a>
            <a href="#import" className="block text-blue-600 dark:text-blue-400 hover:underline">2. Importing Pinterest Spy Data</a>
            <a href="#seo" className="block text-blue-600 dark:text-blue-400 hover:underline">3. SEO Extraction</a>
            <a href="#images" className="block text-blue-600 dark:text-blue-400 hover:underline">4. Image Generation</a>
            <a href="#recipe" className="block text-blue-600 dark:text-blue-400 hover:underline">5. Recipe Generation</a>
            <a href="#automation" className="block text-blue-600 dark:text-blue-400 hover:underline">6. Automated Pipelines</a>
            <a href="#manual" className="block text-blue-600 dark:text-blue-400 hover:underline">7. Manual Processing</a>
            <a href="#prompts" className="block text-blue-600 dark:text-blue-400 hover:underline">8. Prompt Customization</a>
            <a href="#troubleshooting" className="block text-blue-600 dark:text-blue-400 hover:underline">9. Troubleshooting</a>
          </nav>
        </div>

        {/* 1. System Overview */}
        <div id="overview" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            1. System Overview
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            The automation system transforms Pinterest spy data into complete recipe articles through a 4-stage pipeline:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Stage 1: Data Import</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Import Pinterest recipe data with title, description, and reference image</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Stage 2: SEO Extraction</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI analyzes data to extract SEO keyword, title, description, and category</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Stage 3: Image Generation</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate 4 unique images: hero shot, ingredients, cooking process, styled presentation</p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Stage 4: Recipe Generation</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI writes complete recipe article with all sections and publishes to website</p>
            </div>
          </div>
        </div>

        {/* 2. Importing Data */}
        <div id="import" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            2. Importing Pinterest Spy Data
          </h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📌 Required Fields</h3>
              <ul className="list-disc list-inside text-blue-800 dark:text-blue-400 space-y-1 text-sm">
                <li><strong>Spy Title:</strong> Original Pinterest recipe title</li>
                <li><strong>Spy Description:</strong> Original recipe description</li>
                <li><strong>Spy Image URL:</strong> URL to reference image from Pinterest</li>
                <li><strong>Spy Article URL:</strong> Original Pinterest pin URL</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Best Practices</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                <li>• Use clear, descriptive titles that indicate the recipe type</li>
                <li>• Include detailed descriptions with ingredients or cooking methods</li>
                <li>• Ensure image URLs are accessible and high-quality</li>
                <li>• Import in batches for better organization</li>
              </ul>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 Import Process</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>Navigate to <strong>Data Manager</strong></li>
                <li>Click <strong>"Add New Entry"</strong> or use bulk import</li>
                <li>Fill in required fields</li>
                <li>Save - status will be <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">PENDING</code></li>
              </ol>
            </div>
          </div>
        </div>

        {/* 3. SEO Extraction */}
        <div id="seo" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            3. SEO Extraction
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              AI analyzes your spy data to extract optimized SEO metadata for search engine visibility.
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">🎯 What Gets Extracted</h3>
              <ul className="list-disc list-inside text-purple-800 dark:text-purple-400 space-y-1 text-sm">
                <li><strong>SEO Keyword:</strong> 2-4 word target keyword phrase</li>
                <li><strong>SEO Title:</strong> 50-60 character optimized title</li>
                <li><strong>SEO Description:</strong> 150-160 character meta description</li>
                <li><strong>Category:</strong> Best matching category from your website</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Manual Processing</h3>
                <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Go to <strong>SEO Results</strong></li>
                  <li>Select entries with <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">PENDING</code> status</li>
                  <li>Click <strong>"Extract SEO"</strong></li>
                  <li>Wait for processing to complete</li>
                  <li>Review and edit if needed</li>
                </ol>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ Automated Processing</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                  SEO extraction runs automatically as part of the pipeline when using:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Pipeline Schedules</li>
                  <li>Recipe Generation workflow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Image Generation */}
        <div id="images" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
            4. Image Generation
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Generates 4 unique, high-quality images for each recipe using AI image generation.
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">🖼️ The 4 Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm">
                  <strong className="text-green-800 dark:text-green-400">Image 1: Finished Dish Hero Shot</strong>
                  <p className="text-green-700 dark:text-green-500 text-xs mt-1">Close-up 45° angle of plated final result</p>
                </div>
                <div className="text-sm">
                  <strong className="text-green-800 dark:text-green-400">Image 2: Raw Ingredients</strong>
                  <p className="text-green-700 dark:text-green-500 text-xs mt-1">Overhead flat lay of uncooked ingredients</p>
                </div>
                <div className="text-sm">
                  <strong className="text-green-800 dark:text-green-400">Image 3: Cooking Action</strong>
                  <p className="text-green-700 dark:text-green-500 text-xs mt-1">Side angle showing cooking in progress</p>
                </div>
                <div className="text-sm">
                  <strong className="text-green-800 dark:text-green-400">Image 4: Styled Presentation</strong>
                  <p className="text-green-700 dark:text-green-500 text-xs mt-1">Elegant table setting with different angle</p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">⚠️ Important Notes</h3>
              <ul className="text-yellow-800 dark:text-yellow-400 space-y-1 text-sm">
                <li>• SEO extraction must be completed first</li>
                <li>• Images are saved as WebP format (optimized for web)</li>
                <li>• All images are human-free, kitchen environment only</li>
                <li>• Uses reference image from Pinterest as style guide</li>
              </ul>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 Generation Process</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>Navigate to <strong>Image Generation</strong></li>
                <li>Select entries with status <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">SEO_PROCESSED</code></li>
                <li>Click <strong>"Generate Images"</strong></li>
                <li>AI creates 4 unique image prompts</li>
                <li>Review and edit prompts if needed</li>
                <li>Confirm to generate actual images</li>
                <li>Wait for processing (1-2 minutes per entry)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 5. Recipe Generation */}
        <div id="recipe" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            5. Recipe Generation
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              The final stage where AI writes a complete recipe article and publishes it to your website.
            </p>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">📝 What Gets Generated</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-orange-800 dark:text-orange-400">
                <div>• Full recipe title & description</div>
                <div>• Ingredient list with quantities</div>
                <div>• Step-by-step instructions</div>
                <div>• Cooking times & servings</div>
                <div>• Nutritional information</div>
                <div>• Chef tips & variations</div>
                <div>• Storage recommendations</div>
                <div>• Internal links to related recipes</div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Prerequisites</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>SEO extraction completed</li>
                <li>4 images generated</li>
                <li>Status: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">READY_FOR_GENERATION</code></li>
              </ul>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🚀 Generation Process</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>Go to <strong>Recipe Generation</strong></li>
                <li>Select entries ready for generation</li>
                <li>Choose author for the recipe</li>
                <li>Click <strong>"Generate Recipe"</strong></li>
                <li>AI writes complete article (2-3 minutes)</li>
                <li>Recipe is automatically published</li>
                <li>Review on your website</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 6. Automated Pipelines */}
        <div id="automation" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            6. Automated Pipelines (Scheduled)
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Set up scheduled automation to process recipes automatically without manual intervention.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">⏰ Schedule Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong className="text-blue-800 dark:text-blue-400">Hourly:</strong>
                  <p className="text-blue-700 dark:text-blue-500 text-xs">Process 1 recipe every hour</p>
                </div>
                <div>
                  <strong className="text-blue-800 dark:text-blue-400">Every 2 Hours:</strong>
                  <p className="text-blue-700 dark:text-blue-500 text-xs">Process 1 recipe every 2 hours</p>
                </div>
                <div>
                  <strong className="text-blue-800 dark:text-blue-400">Daily:</strong>
                  <p className="text-blue-700 dark:text-blue-500 text-xs">Process 1 recipe daily at specific time</p>
                </div>
                <div>
                  <strong className="text-blue-800 dark:text-blue-400">Custom Cron:</strong>
                  <p className="text-blue-700 dark:text-blue-500 text-xs">Advanced scheduling with cron expressions</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 Setting Up Automation</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>Navigate to <strong>Pipeline Schedules</strong></li>
                <li>Click <strong>"Create New Schedule"</strong></li>
                <li>Choose schedule frequency (hourly, daily, etc.)</li>
                <li>Set time of day (for daily schedules)</li>
                <li>Select author for generated recipes</li>
                <li>Enable the schedule</li>
                <li>Monitor in <strong>Execution Reports</strong></li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✅ How It Works</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                Each schedule run processes <strong>1 recipe</strong> through the complete pipeline:
              </p>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>Finds next pending spy data entry</li>
                <li>Extracts SEO metadata</li>
                <li>Generates 4 images</li>
                <li>Creates complete recipe article</li>
                <li>Publishes to website</li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-900/20 p-3">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">💡 Pro Tips</h3>
              <ul className="text-purple-800 dark:text-purple-400 space-y-1 text-sm">
                <li>• Start with every 2 hours to avoid overwhelming your AI API limits</li>
                <li>• Monitor <strong>Execution Reports</strong> to track success rate</li>
                <li>• Keep at least 10-20 pending entries in Data Manager for continuous operation</li>
                <li>• Review generated recipes periodically for quality control</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 7. Manual Processing */}
        <div id="manual" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            7. Manual Processing Workflow
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Process recipes one-by-one with full control over each stage.
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">📋 Complete Manual Workflow</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-3">
                  <strong className="text-indigo-800 dark:text-indigo-400">Step 1: Import Data</strong>
                  <p className="text-sm text-indigo-700 dark:text-indigo-500 mt-1">
                    Go to <strong>Data Manager</strong> → Add new entry → Fill required fields → Save
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-3">
                  <strong className="text-purple-800 dark:text-purple-400">Step 2: Extract SEO</strong>
                  <p className="text-sm text-purple-700 dark:text-purple-500 mt-1">
                    Go to <strong>SEO Results</strong> → Select entry → Click "Extract SEO" → Wait for completion
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-3">
                  <strong className="text-green-800 dark:text-green-400">Step 3: Generate Images</strong>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    Go to <strong>Image Generation</strong> → Select entry → Generate → Review prompts → Confirm
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-3">
                  <strong className="text-orange-800 dark:text-orange-400">Step 4: Generate Recipe</strong>
                  <p className="text-sm text-orange-700 dark:text-orange-500 mt-1">
                    Go to <strong>Recipe Generation</strong> → Select entry → Choose author → Generate
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Advantages</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Full control over each step</li>
                  <li>Review and edit at each stage</li>
                  <li>Quality control before publishing</li>
                  <li>Learn the system workflow</li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚠️ Considerations</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                  <li>Time-consuming for bulk processing</li>
                  <li>Requires monitoring each stage</li>
                  <li>Must complete stages in order</li>
                  <li>Cannot skip prerequisites</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Prompt Customization */}
        <div id="prompts" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            8. Prompt Customization
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              Customize AI prompts to control the style, tone, and output of your generated content.
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">🎨 Customizable Prompts</h3>
              
              <div className="space-y-3">
                <div>
                  <strong className="text-purple-800 dark:text-purple-400 text-sm">SEO Extraction Prompts</strong>
                  <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">
                    Controls how AI analyzes spy data to extract keywords, titles, and descriptions. Customize to match your SEO strategy.
                  </p>
                </div>
                
                <div>
                  <strong className="text-purple-800 dark:text-purple-400 text-sm">Image Generation Prompts (4 types)</strong>
                  <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">
                    Individual prompts for each of the 4 images. Customize angles, composition, styling, and visual elements.
                  </p>
                </div>
                
                <div>
                  <strong className="text-purple-800 dark:text-purple-400 text-sm">Recipe Generation Prompts</strong>
                  <p className="text-xs text-purple-700 dark:text-purple-500 mt-1">
                    Defines writing style, tone, structure, and personality of recipe articles. Set author voice and content rules.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔧 How to Customize</h3>
              <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                <li>Navigate to <strong>Automation Settings</strong> (bottom of Automation menu)</li>
                <li>Select the tab for the prompt type you want to edit</li>
                <li>Modify the prompt text in the editor</li>
                <li>Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{`{variables}`}</code> for dynamic content</li>
                <li>Click <strong>"Save Changes"</strong></li>
                <li>Test with a sample entry to verify results</li>
              </ol>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 bg-yellow-50 dark:bg-yellow-900/20 p-3">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-1">⚡ Available Variables</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-yellow-800 dark:text-yellow-400">
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{recipeTitle}`}</code> - Recipe name</div>
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{spyTitle}`}</code> - Original spy title</div>
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{spyDescription}`}</code> - Spy description</div>
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{keyword}`}</code> - SEO keyword</div>
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{category}`}</code> - Recipe category</div>
                <div><code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{`{imageUrl}`}</code> - Reference image</div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Prompt Best Practices</h3>
              <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                <li>• Be specific about requirements and constraints</li>
                <li>• Include examples of desired output format</li>
                <li>• Specify tone, style, and personality clearly</li>
                <li>• Use <strong>CAPS</strong> for critical requirements</li>
                <li>• Test changes incrementally before bulk processing</li>
                <li>• Use "Reset to Defaults" if prompts aren't working</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 9. Troubleshooting */}
        <div id="troubleshooting" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Troubleshooting</h2>
          
          <div className="space-y-3">
            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                ❌ Images not showing (404 errors)
              </summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2"><strong>Solution:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Images are saved to <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">public/uploads/generated-recipes/</code></li>
                  <li>Restart server after generating images</li>
                  <li>Check if files exist in the directory</li>
                  <li>Verify WebP format conversion worked</li>
                </ul>
              </div>
            </details>

            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                ⚠️ Pipeline execution fails (500 errors)
              </summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2"><strong>Solution:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check <strong>Execution Reports</strong> for detailed error logs</li>
                  <li>Verify AI API keys are configured correctly</li>
                  <li>Ensure Prisma Client is regenerated: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">npx prisma generate</code></li>
                  <li>Restart server after code changes</li>
                  <li>Check database connection</li>
                </ul>
              </div>
            </details>

            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                🔄 Schedules not running automatically
              </summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2"><strong>Solution:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verify schedule is <strong>enabled</strong></li>
                  <li>Check automation worker is running (see server logs)</li>
                  <li>Ensure Redis connection is working</li>
                  <li>Restart server to reload schedule configuration</li>
                  <li>Check <strong>Execution Reports</strong> for schedule runs</li>
                </ul>
              </div>
            </details>

            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                💬 AI responses are poor quality
              </summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2"><strong>Solution:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review and customize prompts in <strong>Automation Settings</strong></li>
                  <li>Add more specific requirements to prompts</li>
                  <li>Adjust temperature settings (lower = more focused)</li>
                  <li>Provide better spy data (more detailed descriptions)</li>
                  <li>Test with different AI models if available</li>
                </ul>
              </div>
            </details>

            <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                📊 No pending entries for automation
              </summary>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                <p className="mb-2"><strong>Solution:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Import more Pinterest spy data in <strong>Data Manager</strong></li>
                  <li>Schedule will skip runs if no pending entries exist</li>
                  <li>Maintain a buffer of 10-20 pending entries</li>
                  <li>Check filters in schedule configuration</li>
                </ul>
              </div>
            </details>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
          <p className="text-blue-100 mb-4">
            Check the Execution Reports for detailed logs of each pipeline run
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/admin/automation/reports" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              View Execution Reports
            </a>
            <a href="/admin/automation/settings" className="bg-white/20 text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              Customize Prompts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
