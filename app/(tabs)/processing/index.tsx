import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPendingImage } from "@/lib/image-utils";

export default function ProcessingScreen() {
  const router = useRouter();
  const [statusText, setStatusText] = useState("Preparing image...");
  const [hasError, setHasError] = useState(false);

  const solveMutation = trpc.math.solve.useMutation();

  useEffect(() => {
    processProblem();
  }, []);

  const processProblem = async () => {
    try {
      // Get image from module-level cache (not route params)
      const imageData = getPendingImage();
      if (!imageData) {
        throw new Error("No image data found. Please try again.");
      }

      setStatusText("Sending to AI for analysis...");

      // Send to backend
      const result = await solveMutation.mutateAsync({
        image_base64: imageData.base64,
        mime_type: imageData.mimeType,
      });

      setStatusText("Saving result...");

      // Save to history
      const history = await AsyncStorage.getItem("problem_history");
      const problems = history ? JSON.parse(history) : [];

      const problemId = Date.now().toString();
      const newProblem = {
        id: problemId,
        problem: result.extracted.text || result.extracted.latex,
        type: result.classification.type,
        date: new Date().toISOString(),
        solution: result,
      };

      problems.unshift(newProblem);
      await AsyncStorage.setItem("problem_history", JSON.stringify(problems));

      // Navigate to solution screen
      router.replace({
        pathname: "/(tabs)/solution/[id]",
        params: { id: problemId },
      } as any);
    } catch (error) {
      console.error("Processing error:", error);
      setHasError(true);
      setStatusText(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <ScreenContainer className="flex-1 justify-center items-center p-6">
      {hasError ? (
        <View className="items-center gap-4">
          <Text className="text-error text-lg font-bold">Error</Text>
          <Text className="text-muted text-center">{statusText}</Text>
          <View className="mt-4">
            <Text
              className="text-primary text-base font-semibold"
              onPress={() => router.back()}
            >
              Go Back
            </Text>
          </View>
        </View>
      ) : (
        <View className="items-center gap-4">
          <ActivityIndicator size="large" color="#0A7EA4" />
          <Text className="text-foreground text-lg font-semibold">
            Analyzing problem...
          </Text>
          <Text className="text-muted text-center text-sm">{statusText}</Text>
        </View>
      )}
    </ScreenContainer>
  );
}
