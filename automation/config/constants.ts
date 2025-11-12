/**
 * Constants for Automation System
 */

export const AUTOMATION_CONSTANTS = {
  // Workflow Steps
  STEPS: {
    FETCH_RECIPE: 1,
    GENERATE_PROMPTS: 2,
    DOWNLOAD_REFERENCE: 3,
    GENERATE_IMAGES: 4,
    UPLOAD_IMAGES: 5,
    UPDATE_SHEET_IMAGES: 6,
    GENERATE_ARTICLE: 7,
    PUBLISH_RECIPE: 8,
    UPDATE_SHEET_PUBLISH: 9,
    PINTEREST: 10,
    INDEXING: 11,
  },

  // Google Sheets
  SHEETS: {
    COLUMNS: {
      TITLE: 'A',
      KEYWORD: 'B',
      DESCRIPTION: 'C',
      CATEGORY: 'D',
      SPY_IMAGE: 'E',
      SKIP: 'F',
      IS_PUBLISHED: 'G',
      IMAGE_1: 'H',
      IMAGE_2: 'I',
      IMAGE_3: 'J',
      IMAGE_4: 'K',
      POST_LINK: 'L',
      RECIPE_ID: 'M',
      IS_INDEXED: 'N',
      PIN_IMAGE: 'O',
      PIN_TITLE: 'P',
      PIN_DESCRIPTION: 'Q',
      PIN_CATEGORY: 'R',
      PUBLISHED_STATUS: 'S',
    },
    PUBLISHED_MARKER: 'Go',
    SKIP_MARKER: 'true',
    INDEXED_MARKER: 'sent',
  },

  // Image Generation
  IMAGES: {
    COUNT: 4,
    ASPECT_RATIO: '16:9',
    TYPES: ['feature', 'ingredients', 'cooking', 'final'],
    MAX_FILE_SIZE_MB: 10,
    ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  },

  // API Timeouts
  TIMEOUTS: {
    GEMINI_API: 60000, // 60 seconds
    IMAGE_GENERATION: 120000, // 2 minutes
    UPLOAD: 30000, // 30 seconds
    SHEET_UPDATE: 10000, // 10 seconds
  },

  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 1000, // 1 second
    MAX_DELAY: 10000, // 10 seconds
    BACKOFF_MULTIPLIER: 2,
  },

  // Job Queue
  QUEUE: {
    NAME: 'automation-queue',
    CONCURRENCY: 1, // Process one recipe at a time
    MAX_JOBS: 100,
    REMOVE_ON_COMPLETE: 50, // Keep last 50 completed
    REMOVE_ON_FAIL: 100, // Keep last 100 failed
  },

  // Logging
  LOG: {
    MAX_FILES: 10,
    MAX_SIZE: '10m',
    DATE_PATTERN: 'YYYY-MM-DD',
  },
} as const;

/**
 * Event Names for Logging
 */
export const AUTOMATION_EVENTS = {
  // Workflow
  WORKFLOW_STARTED: 'WORKFLOW_STARTED',
  WORKFLOW_COMPLETED: 'WORKFLOW_COMPLETED',
  WORKFLOW_FAILED: 'WORKFLOW_FAILED',

  // Data Fetching
  RECIPE_FETCHED: 'RECIPE_FETCHED',
  NO_RECIPES_FOUND: 'NO_RECIPES_FOUND',

  // AI Operations
  PROMPTS_GENERATED: 'PROMPTS_GENERATED',
  ARTICLE_GENERATED: 'ARTICLE_GENERATED',
  PINTEREST_DESC_GENERATED: 'PINTEREST_DESC_GENERATED',

  // Image Operations
  REFERENCE_DOWNLOADED: 'REFERENCE_DOWNLOADED',
  IMAGE_GENERATED: 'IMAGE_GENERATED',
  IMAGE_UPLOADED: 'IMAGE_UPLOADED',
  ALL_IMAGES_UPLOADED: 'ALL_IMAGES_UPLOADED',

  // Publishing
  RECIPE_POSTED: 'RECIPE_POSTED',
  SHEET_UPDATED: 'SHEET_UPDATED',

  // External Services
  INDEXING_REQUESTED: 'INDEXING_REQUESTED',
  PINTEREST_WEBHOOK_SENT: 'PINTEREST_WEBHOOK_SENT',

  // Errors
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NO_CONFIG: 'Automation configuration not found in database',
  NO_PENDING_RECIPES: 'No pending recipes found in Google Sheet',
  INVALID_RECIPE_DATA: 'Invalid recipe data received from sheet',
  IMAGE_GENERATION_FAILED: 'Failed to generate images',
  UPLOAD_FAILED: 'Failed to upload image to website',
  RECIPE_POST_FAILED: 'Failed to post recipe to website',
  SHEET_UPDATE_FAILED: 'Failed to update Google Sheet',
  INDEXING_FAILED: 'Failed to request Google indexing',
  GEMINI_API_ERROR: 'Gemini API request failed',
} as const;
