// Function to extract the content of the webpage
function getPageContent() {
  try {
    // Extract the entire HTML content of the page
    const content = document.documentElement.innerHTML;
    console.log("Page content extracted successfully.");
    return content;
  } catch (error) {
    console.error("Error extracting page content:", error);
    return null;
  }
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getContent') {
    const content = getPageContent();

    if (content) {
      sendResponse({ success: true, content: content });
    } else {
      sendResponse({ success: false, error: 'Failed to extract content from the page.' });
    }
  }
});
