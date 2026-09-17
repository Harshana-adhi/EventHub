import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, UserRole } from "../../context/AuthContext";
import { isValidEmail, isValidPassword } from "../../utils/validation";
import { ThemeColors, useThemeColors } from "../../constants/theme";

export default function Register() {
  const { register } = useAuth();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email || !password) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(password)) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.inputRow}>
          <Ionicons name="person-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.placeholder}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="mail-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed-outline" size={18} color={colors.placeholder} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Text style={styles.label}>I am a:</Text>
        <View style={styles.roleRow}>
          <Pressable
            style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
            onPress={() => setRole("user")}
          >
            <Ionicons name="person-outline" size={16} color={role === "user" ? "#fff" : colors.text} />
            <Text style={role === "user" ? styles.roleTextActive : styles.roleText}>Attendee</Text>
          </Pressable>
          <Pressable
            style={[styles.roleButton, role === "organizer" && styles.roleButtonActive]}
            onPress={() => setRole("organizer")}
          >
            <Ionicons name="briefcase-outline" size={16} color={role === "organizer" ? "#fff" : colors.text} />
            <Text style={role === "organizer" ? styles.roleTextActive : styles.roleText}>Organizer</Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Register</Text>
            </>
          )}
        </Pressable>

        <Link href="/(auth)/login" style={styles.link}>
          Already have an account? Log in
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, justifyContent: "center", padding: 24, paddingVertical: 40 },
    title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 24, color: colors.text },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginBottom: 12,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceAlt,
    },
    inputIcon: { marginRight: 8 },
    input: {
      flex: 1,
      paddingVertical: 12,
      color: colors.text,
    },
    label: { marginTop: 4, marginBottom: 8, color: colors.textSecondary },
    roleRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
    roleButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
    },
    roleButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    roleText: { color: colors.text },
    roleTextActive: { color: "#fff", fontWeight: "600" },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 14,
      marginTop: 16,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    link: { marginTop: 20, textAlign: "center", color: colors.primaryText },
  });
}
