import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "../context/AuthContext";
import { requestNotificationPermissions } from "../services/notifications";
import { ThemeProvider, useThemeColors, useThemeMode } from "../constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  useEffect(() => {
    if (Platform.OS !== "web") {
      requestNotificationPermissions();
    }
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutInner onLayout={onLayoutRootView} />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutInner({ onLayout }: { onLayout: () => void }) {
  const colors = useThemeColors();
  const { isDark } = useThemeMode();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayout}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </View>
  );
}
