/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as pdfjsLib from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

// Set the worker source correctly for Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/legacy/build/pdf.worker.mjs",
	import.meta.url,
).toString();

interface Page {
	id: number;
	thumbnail: string;
	text: string;
}

export async function extractPdfThumbnails(file: File): Promise<Page[]> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	const pages: Page[] = [];

	// Loop through each page in the PDF
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i);

		// Extract text content from the page
		const textContent = await page.getTextContent();
		const text = textContent.items.map((item: any) => item.str).join(" ");
		console.log(text, "text");
		// Render the page to a canvas for the thumbnail
		const viewport = page.getViewport({ scale: 1 });
		const canvas = document.createElement("canvas");
		canvas.width = viewport.width;
		canvas.height = viewport.height;

		// Render the page
		await page.render({ canvas, viewport }).promise;

		// Push the page data (text + thumbnail) to the result array
		pages.push({
			id: i,
			thumbnail: canvas.toDataURL("image/png"),
			text: text,
		});
	}

	return pages;
}

/**
 * Extract page count from a PDF file
 * @param file The uploaded PDF file
 * @returns The number of pages in the PDF
 */
export const getPdfPageCount = async (file: File): Promise<number> => {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const pdf = await getDocument({ data: arrayBuffer }).promise;
		return pdf.numPages; // Return the number of pages in the PDF
	} catch (error) {
		console.error("Error reading PDF file:", error);
		throw new Error("Unable to extract page count from PDF.");
	}
};
