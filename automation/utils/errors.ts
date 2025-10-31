/**
 * Custom error classes for automation
 */

export class AutomationError extends Error {
  constructor(
    message: string,
    public code: string,
    public step?: number,
    public retryable = false
  ) {
    super(message);
    this.name = 'AutomationError';
  }
}

export class ConfigError extends AutomationError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', undefined, false);
    this.name = 'ConfigError';
  }
}

export class SheetError extends AutomationError {
  constructor(message: string, step?: number) {
    super(message, 'SHEET_ERROR', step, true);
    this.name = 'SheetError';
  }
}

export class ImageError extends AutomationError {
  constructor(message: string, step?: number) {
    super(message, 'IMAGE_ERROR', step, true);
    this.name = 'ImageError';
  }
}

export class AIError extends AutomationError {
  constructor(message: string, step?: number) {
    super(message, 'AI_ERROR', step, true);
    this.name = 'AIError';
  }
}

export class PublishError extends AutomationError {
  constructor(message: string, step?: number) {
    super(message, 'PUBLISH_ERROR', step, true);
    this.name = 'PublishError';
  }
}

export class ValidationError extends AutomationError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', undefined, false);
    this.name = 'ValidationError';
  }
}
