import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { processImageForOCR, setPendingImage } from "@/lib/image-utils";

interface RecentProblem {
  id: string;
  problem: string;
  type: string;
  date: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [recentProblems, setRecentProblems] = useState<RecentProblem[]>([]);
  const [solvedToday, setSolvedToday] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecentProblems();
    }, [])
  );

  const loadRecentProblems = async () => {
    try {
      const history = await AsyncStorage.getItem("problem_history");
      if (history) {
        const problems = JSON.parse(history) as RecentProblem[];
        setRecentProblems(problems.slice(0, 3));

        const today = new Date().toDateString();
        const todayCount = problems.filter(
          (p) => new Date(p.date).toDateString() === today
        ).length;
        setSolvedToday(todayCount);
      }
    } catch (error) {
      console.error("Error loading recent problems:", error);
    }
  };

  const handleTakePhoto = () => {
    router.push("/(tabs)/camera" as any);
  };

  const handleUploadImage = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access media library is required");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        base64: false, // Don't request base64 from picker — we compress separately
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Compress and convert to base64 in background
        const imageData = await processImageForOCR(asset.uri);

        // Store in module-level cache instead of route params
        setPendingImage(imageData);

        // Navigate to processing screen (no large data in params)
        router.push("/(tabs)/processing" as any);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert("Failed to pick image: " + errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewProblem = (problemId: string) => {
    router.push(`/(tabs)/solution/${problemId}` as any);
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="bg-primary px-6 py-8 pb-12">
          <Text className="text-4xl font-bold text-white mb-2">MathSnap AI</Text>
          <Text className="text-sm text-white opacity-90">
            Solve math problems with AI
          </Text>
        </View>

        {/* Main Content */}
        <View className="px-6 py-8 gap-8">
          {/* Stats Cards */}
          <View className="flex-row gap-4">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Solved Today</Text>
              <Text className="text-3xl font-bold text-foreground">{solvedToday}</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-xs text-muted mb-1">Favorites</Text>
              <Text className="text-3xl font-bold text-foreground">0</Text>
            </View>
          </View>

          {/* Primary Action */}
          <TouchableOpacity
            onPress={handleTakePhoto}
            disabled={isProcessing}
            style={{ opacity: isProcessing ? 0.6 : 1 }}
            className="bg-primary rounded-2xl py-6 px-6 active:opacity-80"
          >
            <Text className="text-white text-center font-bold text-lg">
              📷 Take Photo
            </Text>
          </TouchableOpacity>

          {/* Secondary Action */}
          <TouchableOpacity
            onPress={handleUploadImage}
            disabled={isProcessing}
            style={{ opacity: isProcessing ? 0.6 : 1 }}
            className="bg-surface border border-border rounded-2xl py-4 px-6 active:opacity-70"
          >
            {isProcessing ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#0A7EA4" />
                <Text className="text-foreground font-semibold">
                  Compressing image...
                </Text>
              </View>
            ) : (
              <Text className="text-foreground text-center font-semibold">
                📁 Upload Image
              </Text>
            )}
          </TouchableOpacity>

          {/* Recent Problems */}
          {recentProblems.length > 0 && (
            <View>
              <Text className="text-lg font-bold text-foreground mb-3">
                Recent Problems
              </Text>
              <FlatList
                scrollEnabled={false}
                data={recentProblems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleViewProblem(item.id)}
                    className="bg-surface rounded-xl p-4 mb-3 border border-border active:opacity-70"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground mb-1">
                          {item.type}
                        </Text>
                        <Text className="text-xs text-muted" numberOfLines={2}>
                          {item.problem}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted ml-2">
                        {new Date(item.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {recentProblems.length === 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <Text className="text-center text-muted text-sm">
                No problems solved yet. Take a photo to get started!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
