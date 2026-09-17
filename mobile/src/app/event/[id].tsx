import { useCallback, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, Stack } from "expo-router";
import { EventDoc, getEventById } from "../../services/events";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<EventDoc | null>(null);
  const [loading, setLoading] = useState(true);

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
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: event.name, headerShown: true }} />

      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>No image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{event.name}</Text>
        <Text style={styles.category}>{event.category}</Text>

        <Text style={styles.description}>{event.description}</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & time</Text>
          <Text style={styles.detailValue}>{event.dateTime.toDate().toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price</Text>
          <Text style={styles.detailValue}>${event.price}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Available seats</Text>
          <Text style={styles.detailValue}>{event.availableSeats}</Text>
        </View>

        <Pressable
          style={[styles.bookButton, event.availableSeats <= 0 && styles.bookButtonDisabled]}
          disabled={event.availableSeats <= 0}
          onPress={() => Alert.alert("Coming soon", "Booking will be available in the next step.")}
        >
          <Text style={styles.bookButtonText}>
            {event.availableSeats <= 0 ? "Sold Out" : "Book Now"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666" },
  image: { width: "100%", height: 220 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#eee" },
  imagePlaceholderText: { color: "#999" },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: "bold" },
  category: { color: "#4630eb", fontWeight: "600", marginTop: 4 },
  description: { color: "#444", marginTop: 12, lineHeight: 20 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: { color: "#666" },
  detailValue: { fontWeight: "600" },
  bookButton: {
    backgroundColor: "#4630eb",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  bookButtonDisabled: { backgroundColor: "#aaa" },
  bookButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
