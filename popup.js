// Dynamically load required libraries
const loadLibrary = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

// Load jsPDF and EPUB libraries
Promise.all([
  loadLibrary('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js'),
  loadLibrary('https://cdn.jsdelivr.net/npm/epub-gen')
]).then(() => console.log("Libraries loaded successfully!"));

// Handle conversions
document.getElementById('convert-tab').addEventListener('click', () => {
  const format = document.getElementById('output-format').value;
  if (format === 'pdf') {
    chrome.runtime.sendMessage({ action: 'convertToPDF', options: getPDFOptions() });
  } else if (format === 'epub') {
    chrome.runtime.sendMessage({ action: 'convertToEPUB' });
  }
});

// Get PDF options from inputs
const getPDFOptions = () => {
  const startPage = parseInt(document.getElementById('start-page').value, 10);
  const endPage = parseInt(document.getElementById('end-page').value, 10);
  return { startPage, endPage };
};

// Status updates
const updateStatus = (message, isError = false) => {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = isError ? '#e74c3c' : '#1abc9c';
};
