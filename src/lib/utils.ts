import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to handle external script errors
export function setupExternalErrorHandling() {
  // Store original console.error to prevent spam
  const originalConsoleError = console.error;
  let errorCount = 0;
  const maxErrors = 5;

  console.error = (...args) => {
    const errorMessage = args.join(' ');
    
    // Check if it's an external script error
    if (errorMessage.includes('share-modal.js') || 
        errorMessage.includes('addEventListener') ||
        errorMessage.includes('Cannot read properties of null')) {
      
      errorCount++;
      if (errorCount <= maxErrors) {
        console.warn('External script error detected and suppressed:', errorMessage);
      }
      return; // Don't log external errors
    }
    
    // Log legitimate errors
    originalConsoleError.apply(console, args);
  };

  // Handle global errors
  window.addEventListener('error', (event) => {
    if (event.filename && (
      event.filename.includes('share-modal.js') ||
      event.filename.includes('extension') ||
      event.filename.includes('content-script') ||
      event.filename.includes('chrome-extension')
    )) {
      event.preventDefault();
      console.warn('External script error prevented:', event.error?.message);
      return false;
    }
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (reason.includes('share-modal') || 
        reason.includes('extension') ||
        reason.includes('addEventListener')) {
      event.preventDefault();
      console.warn('External promise rejection prevented:', reason);
      return false;
    }
  });
}
