// Content Script - Bridge between page and background

// Inject provider script into page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = () => {
  script.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from page
window.addEventListener('message', async (event) => {
  // Only accept messages from same window
  if (event.source !== window) return;

  // Only handle messages from page to content script
  if (event.data.type === 'FROM_PAGE_TO_CONTENT') {
    const { id, method, params } = event.data;

    try {
      // Forward to background
      const response = await chrome.runtime.sendMessage({
        type: method,
        payload: params,
        id: `content_${id}`,
        timestamp: Date.now(),
      });

      // Send response back to page
      window.postMessage(
        {
          type: 'FROM_BACKGROUND_TO_PAGE',
          id,
          result: response,
        },
        '*'
      );
    } catch (error) {
      // Send error back to page
      window.postMessage(
        {
          type: 'FROM_BACKGROUND_TO_PAGE',
          id,
          result: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        '*'
      );
    }
  }
});

