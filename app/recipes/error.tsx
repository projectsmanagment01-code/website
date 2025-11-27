'use client'

import { useEffect } from 'react'

/**
 * Error Boundary for Recipes Pages
 * 
 * This catches errors specific to the recipes section
 * and provides a contextual error message.
 * 
 * Location: app/recipes/error.tsx
 */
export default function RecipesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[RECIPES ERROR]', error)
  }, [error])

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg
            className="w-6 h-6 text-red-600 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Failed to Load Recipes
            </h2>
            
            <p className="text-red-700 mb-4">
              We encountered an error while loading the recipes. This might be a temporary issue.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-white border border-red-300 rounded">
                <p className="text-sm text-red-900 font-mono">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded hover:bg-red-50 transition-colors"
              >
                Return Home
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded hover:bg-red-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
