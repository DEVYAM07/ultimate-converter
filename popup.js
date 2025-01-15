document.getElementById('convert-btn').addEventListener('click', () => {
  const url = document.getElementById('url-input').value.trim();
  const statusElement = document.getElementById('status');

  // Validate the URL input
  if (!url) {
    alert('Please enter a valid URL.');
    return;
  }

  // Update status
  statusElement.textContent = 'Converting... Please wait...';

  // Send the URL to the background script for PDF conversion
  chrome.runtime.sendMessage(
    { action: 'convertToPDF', url },
    (response) => {
      console.log('Response from background.js:', response);

      if (response && response.success) {
        statusElement.textContent = 'Conversion successful! Downloading...';
      } else {
        const errorMessage = response?.error || 'Unknown error occurred.';
        statusElement.textContent = `Error: ${errorMessage}`;
        console.error('Error received from background.js:', errorMessage);
      }
    }
  );
});

