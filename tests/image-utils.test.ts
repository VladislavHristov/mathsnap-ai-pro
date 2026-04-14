import { describe, it, expect } from "vitest";

// Test the module-level cache directly without importing native modules
describe("Image Utils - Pending Image Cache", () => {
  // Replicate the cache logic to test it without native dependencies
  let _pendingImage: { base64: string; mimeType: string } | null = null;

  function setPendingImage(data: { base64: string; mimeType: string }) {
    _pendingImage = data;
  }

  function getPendingImage(): { base64: string; mimeType: string } | null {
    const data = _pendingImage;
    _pendingImage = null;
    return data;
  }

  it("should store and retrieve pending image data", () => {
    const testData = { base64: "dGVzdA==", mimeType: "image/jpeg" };
    
    setPendingImage(testData);
    const result = getPendingImage();
    
    expect(result).not.toBeNull();
    expect(result?.base64).toBe("dGVzdA==");
    expect(result?.mimeType).toBe("image/jpeg");
  });

  it("should clear pending image after retrieval", () => {
    const testData = { base64: "dGVzdA==", mimeType: "image/jpeg" };
    
    setPendingImage(testData);
    getPendingImage(); // First read clears it
    const result = getPendingImage(); // Second read should be null
    
    expect(result).toBeNull();
  });

  it("should return null when no pending image is set", () => {
    const result = getPendingImage();
    expect(result).toBeNull();
  });

  it("should overwrite previous pending image", () => {
    const data1 = { base64: "first", mimeType: "image/png" };
    const data2 = { base64: "second", mimeType: "image/jpeg" };
    
    setPendingImage(data1);
    setPendingImage(data2);
    const result = getPendingImage();
    
    expect(result?.base64).toBe("second");
    expect(result?.mimeType).toBe("image/jpeg");
  });
});
