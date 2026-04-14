import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface HistoryItem {
  id: string;
  problem: string;
  type: string;
  date: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [problems, setProblems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const history = await AsyncStorage.getItem("problem_history");
      if (history) {
        const parsed = JSON.parse(history);
        setProblems(parsed);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const filteredProblems = problems.filter(
    (p) =>
      p.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewProblem = (problemId: string) => {
    router.push({
      pathname: "/(tabs)/solution/[id]",
      params: { id: problemId },
    } as any);
  };

  const handleDeleteProblem = async (problemId: string) => {
    try {
      const updated = problems.filter((p) => p.id !== problemId);
      setProblems(updated);
      await AsyncStorage.setItem("problem_history", JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting problem:", error);
    }
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="bg-primary px-6 py-6">
        <Text className="text-white text-2xl font-bold">History</Text>
        <Text className="text-white opacity-90 text-sm">
          {problems.length} problems solved
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-4">
        {problems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-muted text-center">
              No problems solved yet. Start by taking a photo!
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProblems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleViewProblem(item.id)}
                className="bg-surface rounded-xl p-4 mb-3 border border-border active:opacity-70 flex-row justify-between items-start"
              >
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <View className="bg-primary px-2 py-1 rounded">
                      <Text className="text-white text-xs font-bold">
                        {item.type.substring(0, 3).toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-xs text-muted">
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-sm text-foreground font-semibold" numberOfLines={2}>
                    {item.problem}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteProblem(item.id)}
                  className="ml-2"
                >
                  <Text className="text-error text-lg">✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
