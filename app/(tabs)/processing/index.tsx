import { View, Text, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const imageBase64 = params.imageBase64 as string;
  const mimeType = params.mimeType as string;

  const solveMutation = trpc.math.solve.useMutation();

  useEffect(() => {
    processProblem();
  }, []);

  const processProblem = async () => {
    try {
      if (!imageBase64) {
        throw new Error("No image provided");
      }

      // Send to backend
      const result = await solveMutation.mutateAsync({
        image_base64: imageBase64,
        mime_type: mimeType || "image/jpeg",
      });

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
      router.push({
        pathname: "/(tabs)/solution/[id]",
        params: { id: problemId },
      } as any);
    } catch (error) {
      console.error("Processing error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      router.back();
    }
  };

  return (
    <ScreenContainer className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0A7EA4" />
      <Text className="text-foreground mt-4 text-lg font-semibold">
        Analyzing problem...
      </Text>
      <Text className="text-muted mt-2 text-center">
        Extracting LaTeX, classifying, and solving
      </Text>
    </ScreenContainer>
  );
}
