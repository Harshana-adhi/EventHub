import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { isValidEmail, isValidPassword } from "../../utils/validation";

export default function Register() {
  const { register } = useAuth();
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
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>I am a:</Text>
      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleButton, role === "user" && styles.roleButtonActive]}
          onPress={() => setRole("user")}
        >
          <Text style={role === "user" ? styles.roleTextActive : styles.roleText}>Attendee</Text>
        </Pressable>
        <Pressable
          style={[styles.roleButton, role === "organizer" && styles.roleButtonActive]}
          onPress={() => setRole("organizer")}
        >
          <Text style={role === "organizer" ? styles.roleTextActive : styles.roleText}>Organizer</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleRegister} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
      </Pressable>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  label: { marginTop: 4, marginBottom: 8, color: "#444" },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  roleButtonActive: { backgroundColor: "#4630eb", borderColor: "#4630eb" },
  roleText: { color: "#444" },
  roleTextActive: { color: "#fff", fontWeight: "600" },
  button: {
    backgroundColor: "#4630eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { marginTop: 20, textAlign: "center", color: "#4630eb" },
});
