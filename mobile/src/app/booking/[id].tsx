import { useCallback, useState } from "react";
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
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { EventDoc, getEventById } from "../../services/events";
import { createBooking } from "../../services/bookings";
import { notifyBookingConfirmed, scheduleEventReminder } from "../../services/notifications";
import { ThemeColors, useThemeColors } from "../../constants/theme";
import { formatPrice } from "../../utils/format";

export default function BookEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      getEventById(id)
        .then((result) => {
          if (!cancelled) setEvent(result);
        })
        .catch((error: any) => Alert.alert("Failed to load event", error.message))
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  async function handleConfirm() {
    if (!user || !event) return;

    const seatsRequested = Number(seats);
    if (!Number.isInteger(seatsRequested) || seatsRequested < 1) {
      Alert.alert("Invalid seats", "Enter a whole number of at least 1.");
      return;
    }
    if (seatsRequested > event.availableSeats) {
      Alert.alert("Not enough seats", `Only ${event.availableSeats} seats are available.`);
      return;
    }

    setSubmitting(true);
    try {
      const bookingId = await createBooking(user.uid, event.id, seatsRequested);
      await notifyBookingConfirmed(event.name, seatsRequested);
      await scheduleEventReminder(bookingId, event.name, event.dateTime.toDate());
      Alert.alert("Booking confirmed", `You've booked ${seatsRequested} seat(s) for "${event.name}".`, [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Booking failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Event not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen
        options={{
          title: "Confirm Booking",
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.eventName}>{event.name}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.meta}>{event.dateTime.toDate().toLocaleString()}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.meta}>{event.location}</Text>
      </View>
      <View style={styles.metaRow}>
        <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.meta}>{event.availableSeats} seats available</Text>
      </View>

      <Text style={styles.label}>Number of seats</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={seats}
        onChangeText={setSeats}
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.total}>Total: {formatPrice((Number(seats) || 0) * event.price)}</Text>

      <Pressable style={styles.confirmButton} onPress={handleConfirm} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </>
        )}
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flexGrow: 1, padding: 20, paddingBottom: 40 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    emptyText: { color: colors.textSecondary },
    eventName: { fontSize: 22, fontWeight: "800", color: colors.text },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, minHeight: 18 },
    meta: { color: colors.textSecondary },
    label: { marginTop: 20, marginBottom: 8, color: colors.textSecondary },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.surfaceAlt,
    },
    total: { marginTop: 16, fontSize: 18, fontWeight: "600", color: colors.text },
    confirmButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      marginTop: 24,
    },
    confirmButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  });
}
