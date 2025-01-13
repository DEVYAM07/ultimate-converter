chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "convertToPDF") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const content = document.documentElement.innerHTML;

    doc.html(content, {
      callback: (doc) => {
        const { startPage, endPage } = request.options || {};
        const totalPages = doc.internal.getNumberOfPages();

        // Handle page range
        if (startPage && endPage) {
          for (let i = totalPages; i > endPage; i--) doc.deletePage(i);
          for (let i = startPage - 1; i > 0; i--) doc.deletePage(i);
        }

        doc.save("converted-page.pdf");
        sendResponse({ success: true });
      }
    });
  } else if (request.action === "convertToEPUB") {
    const content = document.body.innerText; // Simplified content for EPUB
    const epub = new EpubGen({
      title: "Converted Page",
      content: [{ title: "Content", data: content }]
    });

    epub.generate().then((epubContent) => {
      const blob = new Blob([epubContent], { type: "application/epub+zip" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "converted-page.epub";
      link.click();
      URL.revokeObjectURL(link.href);
      sendResponse({ success: true });
    }).catch((error) => {
      console.error("EPUB conversion failed", error);
      sendResponse({ success: false });
    });
  }

  return true; // Indicate asynchronous response
});
