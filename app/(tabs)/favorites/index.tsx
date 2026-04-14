import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoriteItem {
  id: string;
  problem: string;
  type: string;
  date: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const favs = await AsyncStorage.getItem("favorite_problems");
      if (favs) {
        setFavorites(JSON.parse(favs));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const handleViewProblem = (problemId: string) => {
    router.push({
      pathname: "/(tabs)/solution/[id]",
      params: { id: problemId },
    } as any);
  };

  const handleRemoveFavorite = async (problemId: string) => {
    try {
      const updated = favorites.filter((f) => f.id !== problemId);
      setFavorites(updated);
      await AsyncStorage.setItem("favorite_problems", JSON.stringify(updated));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  return (
    <ScreenContainer className="p-0">
      {/* Header */}
      <View className="bg-primary px-6 py-6">
        <Text className="text-white text-2xl font-bold">Favorites</Text>
        <Text className="text-white opacity-90 text-sm">
          {favorites.length} saved problems
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-6 py-4">
        {favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-muted text-center">
              No favorite problems yet. Save problems you want to revisit!
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleViewProblem(item.id)}
                className="bg-surface rounded-xl p-4 mb-3 border border-border active:opacity-70"
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-lg">⭐</Text>
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
                    onPress={() => handleRemoveFavorite(item.id)}
                    className="ml-2"
                  >
                    <Text className="text-error text-lg">✕</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
