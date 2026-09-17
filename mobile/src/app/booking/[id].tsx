import { useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { EventDoc, getEventById } from "../../services/events";
import { createBooking } from "../../services/bookings";

export default function BookEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
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
      await createBooking(user.uid, event.id, seatsRequested);
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
        <ActivityIndicator size="large" />
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Confirm Booking", headerShown: true }} />

      <Text style={styles.eventName}>{event.name}</Text>
      <Text style={styles.meta}>{event.dateTime.toDate().toLocaleString()}</Text>
      <Text style={styles.meta}>{event.location}</Text>
      <Text style={styles.meta}>{event.availableSeats} seats available</Text>

      <Text style={styles.label}>Number of seats</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={seats}
        onChangeText={setSeats}
      />

      <Text style={styles.total}>Total: ${(Number(seats) || 0) * event.price}</Text>

      <Pressable style={styles.confirmButton} onPress={handleConfirm} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666" },
  eventName: { fontSize: 22, fontWeight: "bold" },
  meta: { color: "#666", marginTop: 4 },
  label: { marginTop: 20, marginBottom: 8, color: "#444" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  total: { marginTop: 16, fontSize: 18, fontWeight: "600" },
  confirmButton: {
    backgroundColor: "#4630eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
