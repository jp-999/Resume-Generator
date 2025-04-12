// Getting pdfjs to work is tricky. The following lines make it work in a browser environment
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm";
import { PDFJS_WORKER_URL } from "../constants.js";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

/**
 * Step 1. Read a pdf resume file into text items to prepare for processing.
 *
 * The core of this function utilizes PDF.js to extract text from PDF documents.
 * Each text item comes with its text content and positioning data (x, y).
 */
export async function readPdf(fileUrl) {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not found!");
  }

  try {
    // Load the PDF document using PDF.js
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Extract text from all pages
    let allTextItems = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageTextItems = textContent.items.map((item) => {
        // Extract position from transform matrix
        const x = item.transform[4];
        const y = item.transform[5];
        
        return {
          text: item.str,
          x,
          y,
          width: item.width || 0,
          height: item.height || 10,
          fontName: item.fontName || '',
        };
      });

      allTextItems = [...allTextItems, ...pageTextItems];
    }

    // Filter out empty text items
    return allTextItems.filter((item) => item.text.trim() !== "");
  } catch (error) {
    console.error("Error reading PDF:", error);
    throw error;
  }
}
