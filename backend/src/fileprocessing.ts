import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

/**
 * Extracts text content from a file based on its mimetype.
 * Currently supports PDF and plain text files.
 * @param filePath The path to the file.
 * @param mimetype The mimetype of the file.
 * @returns A promise that resolves with the extracted text content.
 */
export const extractTextFromFile = async (filePath: string, mimetype: string): Promise<string> => {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found at path: ${absolutePath}`);
  }

  const buffer = fs.readFileSync(absolutePath);

  if (mimetype === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } else if (mimetype.startsWith('text/')) {
    return buffer.toString('utf-8');
  } else {
    console.warn(`Unsupported file type: ${mimetype}. Returning empty string.`);
    return '';
  }
};
