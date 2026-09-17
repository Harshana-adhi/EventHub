import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { ThemeColors, ThemeMode, useThemeColors, useThemeMode } from "../../constants/theme";

const modeOptions: { value: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "system", label: "Auto", icon: "phone-portrait-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

export default function Profile() {
  const { profile, loading, logout, updateUserProfile } = useAuth();
  const colors = useThemeColors();
  const { mode, setMode } = useThemeMode();
  const styles = createStyles(colors);

  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Invalid name", "Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(name.trim());
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (error: any) {
      Alert.alert("Update failed", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={40} color={colors.primary} />
      </View>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.labelRow}>
        <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.label}>Name</Text>
      </View>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.placeholder}
      />

      <View style={styles.labelRow}>
        <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.label}>Email</Text>
      </View>
      <Text style={styles.readOnly}>{profile.email}</Text>

      <View style={styles.labelRow}>
        <Ionicons name="briefcase-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.label}>Role</Text>
      </View>
      <Text style={styles.readOnly}>{profile.role === "organizer" ? "Organizer" : "Attendee"}</Text>

      <View style={styles.labelRow}>
        <Ionicons name="contrast-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.label}>Appearance</Text>
      </View>
      <View style={styles.modeRow}>
        {modeOptions.map((option) => {
          const isActive = mode === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.modeButton, isActive && styles.modeButtonActive]}
              onPress={() => setMode(option.value)}
            >
              <Ionicons name={option.icon} size={16} color={isActive ? "#fff" : colors.text} />
              <Text style={isActive ? styles.modeTextActive : styles.modeText}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Save</Text>
          </>
        )}
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout} disabled={loggingOut}>
        {loggingOut ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 12,
    },
    title: { fontSize: 24, fontWeight: "800", marginBottom: 24, textAlign: "center", color: colors.text },
    labelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, marginTop: 12 },
    label: { color: colors.textSecondary },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.surfaceAlt,
    },
    readOnly: {
      padding: 12,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 8,
      color: colors.textSecondary,
    },
    modeRow: { flexDirection: "row", flexWrap: "wrap", rowGap: 8, columnGap: 8 },
    modeButton: {
      flexGrow: 1,
      flexBasis: 90,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    modeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    modeText: { color: colors.text },
    modeTextActive: { color: "#fff", fontWeight: "600" },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 14,
      marginTop: 24,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 8,
      padding: 14,
      marginTop: 12,
    },
    logoutText: { color: colors.danger, fontWeight: "600", fontSize: 16 },
  });
}
