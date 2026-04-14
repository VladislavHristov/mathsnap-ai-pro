/**
 * Google Vision API Service
 * Extracts text and LaTeX from math problem images using Google Vision API
 */

import axios from "axios";

interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
    };
    textAnnotations?: Array<{
      description: string;
    }>;
    error?: {
      code: number;
      message: string;
    };
  }>;
}

/**
 * Extract text from a base64-encoded image using Google Vision API
 */
export async function extractTextFromBase64(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<{ latex: string; text: string }> {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_VISION_API_KEY environment variable is not set");
    }

    const response = await axios.post<GoogleVisionResponse>(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 10,
              },
              {
                type: "DOCUMENT_TEXT_DETECTION",
              },
            ],
            imageContext: {
              languageHints: ["en", "bg"],
            },
          },
        ],
      },
      {
        timeout: 30000,
      }
    );

    if (response.data.responses[0]?.error) {
      throw new Error(
        `Google Vision API error: ${response.data.responses[0].error.message}`
      );
    }

    // Extract text from the response
    const fullText =
      response.data.responses[0]?.fullTextAnnotation?.text || "";

    if (!fullText) {
      throw new Error("No text detected in the image");
    }

    // For now, we'll use the extracted text as both text and latex
    // In a real scenario, we might use additional processing to identify LaTeX
    return {
      latex: fullText,
      text: fullText,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.statusText ||
        error.message;
      throw new Error(`Google Vision API error: ${errorMessage}`);
    }
    throw error;
  }
}

/**
 * Extract text from an image URL using Google Vision API
 */
export async function extractTextFromUrl(
  imageUrl: string
): Promise<{ latex: string; text: string }> {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_VISION_API_KEY environment variable is not set");
    }

    const response = await axios.post<GoogleVisionResponse>(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              source: {
                imageUri: imageUrl,
              },
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 10,
              },
              {
                type: "DOCUMENT_TEXT_DETECTION",
              },
            ],
            imageContext: {
              languageHints: ["en", "bg"],
            },
          },
        ],
      },
      {
        timeout: 30000,
      }
    );

    if (response.data.responses[0]?.error) {
      throw new Error(
        `Google Vision API error: ${response.data.responses[0].error.message}`
      );
    }

    // Extract text from the response
    const fullText =
      response.data.responses[0]?.fullTextAnnotation?.text || "";

    if (!fullText) {
      throw new Error("No text detected in the image");
    }

    return {
      latex: fullText,
      text: fullText,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.statusText ||
        error.message;
      throw new Error(`Google Vision API error: ${errorMessage}`);
    }
    throw error;
  }
}
