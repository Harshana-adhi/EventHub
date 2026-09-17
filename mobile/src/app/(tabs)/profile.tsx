import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { profile, logout, updateUserProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [saving, setSaving] = useState(false);

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
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Email</Text>
      <Text style={styles.readOnly}>{profile?.email}</Text>

      <Text style={styles.label}>Role</Text>
      <Text style={styles.readOnly}>{profile?.role === "organizer" ? "Organizer" : "Attendee"}</Text>

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save</Text>}
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24 },
  label: { color: "#666", marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  readOnly: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    color: "#333",
  },
  button: {
    backgroundColor: "#4630eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  logoutButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  logoutText: { color: "#c00", fontWeight: "600", fontSize: 16 },
});
