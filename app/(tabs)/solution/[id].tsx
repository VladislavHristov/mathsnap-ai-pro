import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Solution {
  extracted: { latex: string; text: string };
  classification: {
    type: string;
    difficulty: string;
    requires_graph: boolean;
    description: string;
  };
  solution: {
    problem: string;
    steps: string[];
    final_answer: string;
    explanation: string;
  };
  solver_used: string;
}

export default function SolutionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const problemId = params.id as string;
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolution();
  }, [problemId]);

  const loadSolution = async () => {
    try {
      const history = await AsyncStorage.getItem("problem_history");
      if (history) {
        const problems = JSON.parse(history);
        const problem = problems.find((p: any) => p.id === problemId);
        if (problem) {
          setSolution(problem.solution);
        }
      }
    } catch (error) {
      console.error("Error loading solution:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0A7EA4" />
      </ScreenContainer>
    );
  }

  if (!solution) {
    return (
      <ScreenContainer className="flex-1 justify-center items-center">
        <Text className="text-foreground">Solution not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#22C55E";
      case "medium":
        return "#F59E0B";
      case "hard":
        return "#EF4444";
      default:
        return "#0A7EA4";
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView>
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-white text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            {solution.classification.type.charAt(0).toUpperCase() +
              solution.classification.type.slice(1)}
          </Text>
        </View>

        {/* Problem Classification */}
        <View className="px-6 py-6 gap-4">
          <View className="flex-row gap-2">
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: getDifficultyColor(solution.classification.difficulty) }}
            >
              <Text className="text-white text-xs font-semibold">
                {solution.classification.difficulty.toUpperCase()}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-blue-100">
              <Text className="text-blue-700 text-xs font-semibold">
                {solution.solver_used === "wolfram" ? "Wolfram" : "OpenAI"}
              </Text>
            </View>
          </View>

          {/* Problem */}
          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-xs text-muted mb-2">Problem</Text>
            <Text className="text-foreground font-semibold">
              {solution.extracted.text}
            </Text>
          </View>

          {/* Steps */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Solution Steps</Text>
            <FlatList
              scrollEnabled={false}
              data={solution.solution.steps}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View className="bg-surface rounded-lg p-4 mb-2 border border-border">
                  <Text className="text-xs text-primary font-bold mb-1">
                    Step {index + 1}
                  </Text>
                  <Text className="text-sm text-foreground leading-relaxed">{item}</Text>
                </View>
              )}
            />
          </View>

          {/* Final Answer */}
          <View className="bg-success bg-opacity-10 rounded-xl p-4 border border-success">
            <Text className="text-xs text-success font-bold mb-2">Final Answer</Text>
            <Text className="text-lg font-bold text-foreground">
              {solution.solution.final_answer}
            </Text>
          </View>

          {/* Explanation */}
          {solution.solution.explanation && (
            <View className="bg-surface rounded-xl p-4 border border-border">
              <Text className="text-sm font-semibold text-foreground mb-2">Explanation</Text>
              <Text className="text-sm text-muted leading-relaxed">
                {solution.solution.explanation}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity className="flex-1 bg-primary rounded-lg py-3">
              <Text className="text-white text-center font-semibold">💾 Save</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-surface border border-border rounded-lg py-3">
              <Text className="text-foreground text-center font-semibold">📤 Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
