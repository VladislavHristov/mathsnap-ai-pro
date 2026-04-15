import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { processImageForOCR, setPendingImage } from "@/lib/image-utils";

export default function CameraScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleTakePhoto = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatusText("Opening camera...");
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Camera permission is required to take photos.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.5,
        base64: false, // Don't request base64 — we compress separately
      });

      if (!result.canceled && result.assets[0]) {
        // Route to crop screen with image URI
        router.push({
          pathname: "/(tabs)/crop/[uri]",
          params: { uri: result.assets[0].uri },
        } as any);
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      alert("Failed to take photo: " + (error?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const handlePickImage = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatusText("Opening gallery...");
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Gallery permission is required to select images.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: false, // Don't request base64 — we compress separately
      });

      if (!result.canceled && result.assets[0]) {
        // Route to crop screen with image URI
        router.push({
          pathname: "/(tabs)/crop/[uri]",
          params: { uri: result.assets[0].uri },
        } as any);
      }
    } catch (error: any) {
      console.error("Image picker error:", error);
      alert("Failed to pick image: " + (error?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
      setStatusText("");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 p-6">
      <View className="flex-1 justify-center items-center gap-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Capture Math Problem
          </Text>
          <Text className="text-muted text-center">
            Take a photo or select an image from your gallery
          </Text>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center gap-3 mb-4">
            <ActivityIndicator size="large" color="#0A7EA4" />
            <Text className="text-muted text-sm">{statusText}</Text>
          </View>
        )}

        {/* Take Photo Button */}
        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.5 : 1 }}
          className="w-full bg-primary rounded-2xl p-5 items-center"
        >
          <Text className="text-4xl mb-2">📸</Text>
          <Text className="text-white text-lg font-bold">Take Photo</Text>
          <Text className="text-white text-sm opacity-80 mt-1">
            Use your camera to capture a math problem
          </Text>
        </TouchableOpacity>

        {/* Pick from Gallery Button */}
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.5 : 1 }}
          className="w-full bg-surface border border-border rounded-2xl p-5 items-center"
        >
          <Text className="text-4xl mb-2">📁</Text>
          <Text className="text-foreground text-lg font-bold">
            Choose from Gallery
          </Text>
          <Text className="text-muted text-sm mt-1">
            Select an existing photo of a math problem
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={handleCancel}
          disabled={isLoading}
          className="mt-4"
        >
          <Text className="text-muted text-base">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
