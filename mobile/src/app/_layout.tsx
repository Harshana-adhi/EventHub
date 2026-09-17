import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { requestNotificationPermissions } from "../services/notifications";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web") {
      requestNotificationPermissions();
    }
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
