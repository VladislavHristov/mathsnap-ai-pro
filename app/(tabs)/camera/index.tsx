import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef } from "react";
import { useColors } from "@/hooks/use-colors";
import * as ImagePicker from "expo-image-picker";

export default function CameraScreen() {
  const router = useRouter();
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <Text className="text-foreground mb-4">Requesting camera permission...</Text>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center p-6">
        <Text className="text-lg font-bold text-foreground mb-4 text-center">
          Camera Permission Required
        </Text>
        <Text className="text-muted text-center mb-6">
          We need access to your camera to capture math problems
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary rounded-lg px-6 py-3"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setIsLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (photo?.base64) {
        // Navigate to processing screen with the image
        router.push({
          pathname: "/(tabs)/processing",
          params: {
            imageBase64: photo.base64,
            mimeType: "image/jpeg",
          },
        } as any);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Failed to capture image");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        router.push({
          pathname: "/(tabs)/processing",
          params: {
            imageBase64: asset.base64,
            mimeType: asset.type === "image" ? "image/jpeg" : "image/png",
          },
        } as any);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      alert("Failed to pick image");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenContainer className="flex-1 p-0" edges={["top", "left", "right", "bottom"]}>
      <CameraView ref={cameraRef} className="flex-1">
        {/* Header */}
        <View className="bg-black bg-opacity-50 px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-white text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold">Capture Math Problem</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-6 py-6 flex-row justify-around items-center">
          <TouchableOpacity
            onPress={handlePickImage}
            disabled={isLoading}
            className="items-center"
          >
            <Text className="text-white text-2xl">📁</Text>
            <Text className="text-white text-xs mt-1">Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCapture}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-white items-center justify-center"
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <View className="w-14 h-14 rounded-full border-2 border-black" />
            )}
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-2xl">⚙️</Text>
            <Text className="text-white text-xs mt-1">Settings</Text>
          </View>
        </View>
      </CameraView>
    </ScreenContainer>
  );
}
