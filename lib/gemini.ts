import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_PDF_TEXT = 12000;

/**
 * Summarizes PDF text and answers a specific question using Gemini 1.5 Flash.
 */
export async function summarizePdfWithGemini(
  pdfText: string,
  question: string
) {
  // 1. Setup API Key
  const key =
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.API_KEY;

  if (!key) {
    throw new Error("Gemini API key is not configured. Please check your .env file.");
  }

  // 2. Initialize the SDK and the Model
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 3. Prepare Content
  const trimmedText = normalizePdfText(pdfText);
// TODO: this annoying ass is giving trimmed text every time so have to change it 

//   const prompt = `
// Summarize the following PDF content and then answer the user's question.

// PDF CONTENT:
// ${trimmedText}

// USER QUESTION:
// ${question}

// INSTRUCTIONS:
// Answer the question using the content as context if the user asks summary then give him summary.
// `;
  const prompt = `
  You should answer from the PDF text below.

  If user asks for a summary:
  - Return a short summary (3-8 bullet points).

  If user asks a question:
  - Answer directly from PDF content.
  - If not found, say: "I couldn't find this in the provided PDF."
  - and proceeds to answer it with caution saying this is not from pdf
  - Add 1-3 short evidence lines from the PDF.

  PDF:
  """${trimmedText}"""

  Question:
  """${question}"""
  `;

  try {
    // 4. Generate Content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Handle the specific 404/Model Not Found error gracefully
    if (error.message?.includes("not found")) {
      throw new Error("Model 'gemini-1.5-flash' not found. Ensure your API Key has access to this model.");
    }
    throw error;
  }
}

/**
 * Normalizes and trims PDF text to stay within token/character limits.
 */
export function normalizePdfText(pdfText: string) {
  const normalized = pdfText.trim();
  if (!normalized) return "";

  return normalized.length > MAX_PDF_TEXT
    ? normalized.slice(0, MAX_PDF_TEXT)
    : normalized;
}