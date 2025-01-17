// Ensure the service worker is active and log its status
console.log('Service worker started');
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, service worker active');
});

// Listener to keep the service worker awake
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in service worker:', message);

  if (message.action === 'ping') {
    console.log('Ping received, service worker is awake');
    sendResponse({ success: true, message: 'Service worker is active' });
    return;
  }

  if (message.action === 'convert') {
    const { url, format } = message;

    console.log(`Received request to convert ${url} to ${format}`);

    // Fetch the webpage content
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then((html) => {
        console.log('Webpage fetched successfully.');
        if (format === 'pdf') {
          generatePDF(html, sendResponse);
        } else if (format === 'epub') {
          generateEPUB(html, sendResponse);
        } else {
          throw new Error('Unsupported format.');
        }
      })
      .catch((error) => {
        console.error('Error during fetch or conversion:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keeps the response channel open
  }
});

// Function to generate PDF
function generatePDF(html, sendResponse) {
  try {
    console.log('Starting PDF generation...');
    importScripts('libs/jspdf.umd.min.js');
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();
    doc.html(html, {
      callback: () => {
        console.log('PDF generated successfully.');
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        chrome.downloads.download(
          { url, filename: 'webpage.pdf' },
          () => {
            console.log('PDF download initiated.');
            sendResponse({ success: true });
          }
        );
      },
      x: 10,
      y: 10,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Function to generate EPUB
function generateEPUB(html, sendResponse) {
  try {
    console.log('Starting EPUB generation...');
    const epubBlob = new Blob([html], { type: 'application/epub+zip' });
    const url = URL.createObjectURL(epubBlob);

    chrome.downloads.download(
      { url, filename: 'webpage.epub' },
      () => {
        console.log('EPUB download initiated.');
        sendResponse({ success: true });
      }
    );
  } catch (error) {
    console.error('Error generating EPUB:', error);
    sendResponse({ success: false, error: error.message });
  }
}
