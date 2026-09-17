import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();
  const colors = useThemeColors();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}
