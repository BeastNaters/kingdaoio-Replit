/**
 * Error handling utilities to prevent leaking sensitive information
 */

/**
 * Sanitizes error messages before sending to clients
 * In development, returns full error message for debugging
 * In production, returns generic fallback message to prevent information leakage
 * 
 * @param error - The error object
 * @param fallbackMessage - Generic message to show in production
 * @returns Sanitized error message safe for client consumption
 */
export function sanitizeError(error: any, fallbackMessage: string): string {
  console.error('API Error:', error);
  
  if (process.env.NODE_ENV === 'development') {
    return error?.message || fallbackMessage;
  }
  
  return fallbackMessage;
}

/**
 * Creates a standardized error response object
 * 
 * @param error - The error object
 * @param fallbackMessage - Generic message for production
 * @returns Standardized error response { success: false, message: string }
 */
export function createErrorResponse(error: any, fallbackMessage: string) {
  return {
    success: false,
    message: sanitizeError(error, fallbackMessage),
  };
}
