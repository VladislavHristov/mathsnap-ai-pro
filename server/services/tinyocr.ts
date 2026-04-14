/**
 * TinyOCR Service
 * Extracts LaTeX and text from math problem images using TinyOCR API
 */

import axios from "axios";

interface TinyOCRResponse {
  success: boolean;
  data?: {
    text: string;
    latex?: string;
  };
  error?: string;
}

export async function extractLatexFromImage(
  imageUrl: string
): Promise<{ latex: string; text: string }> {
  try {
    // TinyOCR API endpoint for math OCR
    const response = await axios.post<TinyOCRResponse>(
      "https://api.tinyocr.app/v1/math",
      {
        image_url: imageUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TINYOCR_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "TinyOCR extraction failed");
    }

    const latex = response.data.data?.latex || response.data.data?.text || "";
    const text = response.data.data?.text || latex || "";

    if (!latex && !text) {
      throw new Error("No text or LaTeX extracted from image");
    }

    return {
      latex,
      text,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `TinyOCR API error: ${error.response?.status} - ${error.response?.data?.error || error.message}`
      );
    }
    throw error;
  }
}

/**
 * Extract LaTeX from a base64-encoded image
 */
export async function extractLatexFromBase64(
  base64Image: string,
  mimeType: string = "image/jpeg"
): Promise<{ latex: string; text: string }> {
  try {
    const response = await axios.post<TinyOCRResponse>(
      "https://api.tinyocr.app/v1/math",
      {
        image_data: base64Image,
        mime_type: mimeType,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TINYOCR_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "TinyOCR extraction failed");
    }

    const latex = response.data.data?.latex || response.data.data?.text || "";
    const text = response.data.data?.text || latex || "";

    if (!latex && !text) {
      throw new Error("No text or LaTeX extracted from image");
    }

    return {
      latex,
      text,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `TinyOCR API error: ${error.response?.status} - ${error.response?.data?.error || error.message}`
      );
    }
    throw error;
  }
}
