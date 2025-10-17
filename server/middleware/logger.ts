import { Request, Response, NextFunction } from 'express';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 500) {
      console.error(logMessage);
    } else if (res.statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
};
