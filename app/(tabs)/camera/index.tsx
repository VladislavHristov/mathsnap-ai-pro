import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function CameraScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTakePhoto = async () => {
    setIsLoading(true);
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Camera permission is required to take photos.");
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.uri?.endsWith(".png") ? "image/png" : "image/jpeg";

        router.push({
          pathname: "/(tabs)/processing",
          params: {
            imageBase64: asset.base64,
            mimeType: mimeType,
          },
        } as any);
      }
    } catch (error: any) {
      console.error("Camera error:", error);
      alert("Failed to take photo: " + (error?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    setIsLoading(true);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Gallery permission is required to select images.");
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const mimeType = asset.uri?.endsWith(".png") ? "image/png" : "image/jpeg";

        router.push({
          pathname: "/(tabs)/processing",
          params: {
            imageBase64: asset.base64,
            mimeType: mimeType,
          },
        } as any);
      }
    } catch (error: any) {
      console.error("Image picker error:", error);
      alert("Failed to pick image: " + (error?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
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

        {/* Take Photo Button */}
        <TouchableOpacity
          onPress={handleTakePhoto}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.6 : 1 }}
          className="w-full bg-primary rounded-2xl p-5 items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <Text className="text-4xl mb-2">📸</Text>
              <Text className="text-white text-lg font-bold">Take Photo</Text>
              <Text className="text-white text-sm opacity-80 mt-1">
                Use your camera to capture a math problem
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Pick from Gallery Button */}
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.6 : 1 }}
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
          className="mt-4"
        >
          <Text className="text-muted text-base">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
