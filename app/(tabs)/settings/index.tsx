import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === "dark");
  const [language, setLanguage] = useState("bg");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("app_language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleToggleDarkMode = async () => {
    setDarkMode(!darkMode);
    // Note: Dark mode toggle would require updating the theme provider
  };

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    await AsyncStorage.setItem("app_language", newLanguage);
  };

  const handleClearCache = async () => {
    try {
      await AsyncStorage.removeItem("problem_history");
      alert("Cache cleared successfully");
    } catch (error) {
      console.error("Error clearing cache:", error);
      alert("Failed to clear cache");
    }
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView>
        {/* Header */}
        <View className="bg-primary px-6 py-6">
          <Text className="text-white text-2xl font-bold">Settings</Text>
        </View>

        {/* Settings Sections */}
        <View className="px-6 py-6 gap-6">
          {/* Display Settings */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Display</Text>

            <View className="bg-surface rounded-xl p-4 border border-border flex-row justify-between items-center mb-2">
              <Text className="text-foreground font-semibold">Dark Mode</Text>
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: "#E5E7EB", true: "#0A7EA4" }}
              />
            </View>
          </View>

          {/* Language Settings */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Language</Text>

            <View className="gap-2">
              {[
                { code: "bg", label: "Български (Bulgarian)" },
                { code: "en", label: "English" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  className={`rounded-xl p-4 border flex-row justify-between items-center ${
                    language === lang.code
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      language === lang.code ? "text-white" : "text-foreground"
                    }`}
                  >
                    {lang.label}
                  </Text>
                  {language === lang.code && <Text className="text-white text-lg">✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data Management */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Data</Text>

            <TouchableOpacity
              onPress={handleClearCache}
              className="bg-surface rounded-xl p-4 border border-border active:opacity-70"
            >
              <Text className="text-foreground font-semibold">Clear Cache</Text>
              <Text className="text-xs text-muted mt-1">
                Remove downloaded problems and temporary files
              </Text>
            </TouchableOpacity>
          </View>

          {/* About */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">About</Text>

            <View className="bg-surface rounded-xl p-4 border border-border">
              <View className="flex-row justify-between mb-3">
                <Text className="text-muted">App Version</Text>
                <Text className="text-foreground font-semibold">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted">Build</Text>
                <Text className="text-foreground font-semibold">2026.04.14</Text>
              </View>
            </View>
          </View>

          {/* Links */}
          <View className="gap-2">
            <TouchableOpacity className="bg-surface rounded-xl p-4 border border-border active:opacity-70">
              <Text className="text-primary font-semibold">Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-surface rounded-xl p-4 border border-border active:opacity-70">
              <Text className="text-primary font-semibold">Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
