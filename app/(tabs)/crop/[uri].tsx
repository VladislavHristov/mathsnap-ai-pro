import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useEffect } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { setPendingImage } from "@/lib/image-utils";

export default function CropScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (uri) {
      Image.getSize(uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  }, [uri]);

  const handleCrop = async () => {
    if (!uri) return;
    
    setIsProcessing(true);
    try {
      // Compress and resize the image
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to base64
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];
        
        setPendingImage({
          base64: base64Data,
          mimeType: "image/jpeg",
        });

        router.replace("/(tabs)/processing" as any);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Crop error:", error);
      alert("Failed to crop image: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!uri) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <Text className="text-error">No image provided</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 p-4">
      <View className="flex-1 gap-4">
        {/* Header */}
        <View className="items-center mb-2">
          <Text className="text-2xl font-bold text-foreground">
            Изрязване на снимка
          </Text>
          <Text className="text-muted text-sm mt-1">
            Преглед на снимката преди качване
          </Text>
        </View>

        {/* Crop Preview Area */}
        <ScrollView 
          className="flex-1 bg-surface rounded-2xl border-2 border-border"
          contentContainerStyle={{ alignItems: "center", justifyContent: "center", flexGrow: 1 }}
          scrollEnabled={true}
        >
          {imageSize.width > 0 ? (
            <Image
              source={{ uri }}
              style={{
                width: Math.min(imageSize.width, 300),
                height: Math.min(imageSize.height, 400),
                resizeMode: "contain",
              }}
            />
          ) : (
            <ActivityIndicator size="large" color="#0A7EA4" />
          )}
        </ScrollView>

        {/* Instructions */}
        <View className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-900 dark:text-blue-100 text-sm">
            💡 Совет: Проверка че математическата задача е видима и ясна на снимката.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={handleCrop}
            disabled={isProcessing}
            style={{ opacity: isProcessing ? 0.5 : 1 }}
            className="bg-primary rounded-xl p-4 items-center"
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                ✓ Продължи с тази снимка
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={isProcessing}
            className="bg-surface border border-border rounded-xl p-4 items-center"
          >
            <Text className="text-foreground font-semibold">Отмени</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
