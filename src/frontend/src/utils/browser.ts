/**
 * Browser utility for opening URLs
 * Uses Chrome browser via backend endpoint for File System Access API support
 */

const BACKEND_URL = 'http://localhost:8000';

/**
 * Open a URL in Chrome browser
 * 
 * This function calls the backend to open URLs in Chrome instead of Safari,
 * because Safari doesn't support the File System Access API for saving files
 * to user-selected directories.
 * 
 * @param url - The URL to open
 * @returns Promise that resolves when the URL is opened
 */
export async function openInChrome(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/open-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Failed to open URL: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.warn('Failed to open URL via backend, falling back to window.open:', error);
    // Fall back to opening in current browser
    window.open(url, '_blank');
    return false;
  }
}

/**
 * Check if the backend is available
 * 
 * @returns Promise that resolves to true if backend is available
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Open an external link, preferring Chrome if backend is available
 * 
 * @param url - The URL to open
 * @param preferChrome - Whether to prefer opening in Chrome (default: true)
 */
export async function openExternalLink(url: string, preferChrome = true): Promise<void> {
  if (preferChrome) {
    const opened = await openInChrome(url);
    if (opened) return;
  }
  
  // Fall back to default browser behavior
  window.open(url, '_blank');
}
