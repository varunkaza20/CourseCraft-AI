import * as pdfjsLib from "pdfjs-dist"
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPDF(file) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result)
        const pdf        = await pdfjsLib.getDocument({ data: typedArray }).promise

        let fullText = ""

        for (let i = 1; i <= pdf.numPages; i++) {
          const page    = await pdf.getPage(i)
          const content = await page.getTextContent()

          // Join text items with space, add newline between pages
          const pageText = content.items
            .map(item => item.str)
            .join(" ")

          fullText += pageText + "\n\n"
        }

        // Clean up excessive whitespace
        const cleaned = fullText
          .replace(/[ \t]{2,}/g, " ")   // collapse horizontal spaces
          .replace(/\n{3,}/g, "\n\n")   // max 2 consecutive newlines
          .trim()

        if (cleaned.length < 50) {
          reject(new Error(
            "Could not extract readable text from this PDF. " +
            "It may be a scanned image. Please paste the syllabus manually."
          ))
        } else {
          resolve(cleaned)
        }

      } catch (err) {
        reject(new Error("PDF extraction failed: " + err.message))
      }
    }

    reader.onerror = () => reject(new Error("Failed to read the file"))
    reader.readAsArrayBuffer(file)
  })
}
