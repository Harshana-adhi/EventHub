import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/validation";
import { ThemeColors, useThemeColors } from "../../constants/theme";

export default function Login() {
  const { login } = useAuth();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Ionicons name="calendar" size={36} color={colors.primary} />
      </View>
      <Text style={styles.title}>EventHub</Text>
      <Text style={styles.subtitle}>Log in to your account</Text>

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
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <Pressable style={styles.button} onPress={handleLogin} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Log In</Text>
          </>
        )}
      </Pressable>

      <Link href="/(auth)/register" style={styles.link}>
        Don't have an account? Register
      </Link>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: colors.background },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 16,
    },
    title: { fontSize: 32, fontWeight: "800", textAlign: "center", color: colors.text },
    subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: "center", marginBottom: 32 },
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
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 14,
      marginTop: 8,
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    link: { marginTop: 20, textAlign: "center", color: colors.primaryText },
  });
}
