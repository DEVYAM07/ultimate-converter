chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'convertToPDF') {
    const url = message.url;

    // Validate the URL
    if (!url) {
      sendResponse({ success: false, error: 'Invalid URL provided.' });
      console.error('Error: No URL provided.');
      return;
    }

    console.log('Starting PDF conversion for URL:', url);

    // Fetch the page content
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch URL. Status: ${response.status}`);
        }
        return response.text();
      })
      .then((htmlContent) => {
        console.log('Content fetched successfully. Initializing jsPDF...');

        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
          console.error('Error: jsPDF library is not loaded.');
          sendResponse({ success: false, error: 'jsPDF library not loaded.' });
          return;
        }

        // Initialize jsPDF and generate PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.html(htmlContent, {
          callback: function (doc) {
            const pdfBlob = doc.output('blob');
            const blobURL = URL.createObjectURL(pdfBlob);

            // Trigger the download
            chrome.downloads.download(
              {
                url: blobURL,
                filename: 'converted.pdf',
                saveAs: true,
              },
              (downloadId) => {
                if (chrome.runtime.lastError) {
                  console.error('Error during download:', chrome.runtime.lastError.message);
                  sendResponse({ success: false, error: chrome.runtime.lastError.message });
                } else {
                  console.log('PDF downloaded successfully. Download ID:', downloadId);
                  sendResponse({ success: true });
                }
              }
            );
          },
          x: 10,
          y: 10,
        });
      })
      .catch((error) => {
        console.error('Error during PDF conversion:', error.message);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open
  }
});
