import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.6;

/**
 * Compress and resize an image, then return its base64 string.
 * This avoids passing huge base64 through route params.
 */
export async function processImageForOCR(uri: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  try {
    // On web, just read the file directly
    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve({ base64, mimeType: "image/jpeg" });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Resize and compress the image
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      {
        compress: JPEG_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Read the compressed file as base64
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return { base64, mimeType: "image/jpeg" };
  } catch (error) {
    console.error("Image processing error:", error);
    throw new Error("Failed to process image: " + (error instanceof Error ? error.message : "Unknown error"));
  }
}

/**
 * Store image data in a temporary variable (module-level cache).
 * This avoids passing large base64 through navigation params.
 */
let _pendingImage: { base64: string; mimeType: string } | null = null;

export function setPendingImage(data: { base64: string; mimeType: string }) {
  _pendingImage = data;
}

export function getPendingImage(): { base64: string; mimeType: string } | null {
  const data = _pendingImage;
  _pendingImage = null; // Clear after reading
  return data;
}
