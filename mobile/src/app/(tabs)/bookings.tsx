import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { BookingDoc, cancelBooking, getUserBookings } from "../../services/bookings";
import { EventDoc, getEventById } from "../../services/events";

type BookingWithEvent = BookingDoc & { event: EventDoc | null };

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getUserBookings(user.uid);
      const withEvents = await Promise.all(
        list.map(async (booking) => ({ ...booking, event: await getEventById(booking.eventId) }))
      );
      withEvents.sort((a, b) => b.bookedAt.toMillis() - a.bookedAt.toMillis());
      setBookings(withEvents);
    } catch (error: any) {
      Alert.alert("Failed to load bookings", error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  function handleCancel(booking: BookingWithEvent) {
    Alert.alert("Cancel booking", `Cancel your booking for "${booking.event?.name}"?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          setCancellingId(booking.id);
          try {
            await cancelBooking(booking.id);
            loadBookings();
          } catch (error: any) {
            Alert.alert("Cancel failed", error.message);
          } finally {
            setCancellingId(null);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {bookings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven't booked any events yet.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const isUpcoming = item.event ? item.event.dateTime.toDate() > new Date() : false;
            const canCancel = item.status === "confirmed" && isUpcoming;

            return (
              <View style={styles.card}>
                <Text style={styles.eventName}>{item.event?.name ?? "Event no longer available"}</Text>
                {item.event && (
                  <>
                    <Text style={styles.meta}>{item.event.dateTime.toDate().toLocaleString()}</Text>
                    <Text style={styles.meta}>{item.event.location}</Text>
                  </>
                )}
                <Text style={styles.meta}>{item.seats} seat(s)</Text>

                <View style={styles.statusRow}>
                  <Text
                    style={[
                      styles.status,
                      item.status === "cancelled" ? styles.statusCancelled : styles.statusConfirmed,
                    ]}
                  >
                    {item.status === "cancelled" ? "Cancelled" : isUpcoming ? "Upcoming" : "Past"}
                  </Text>
                </View>

                {canCancel && (
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => handleCancel(item)}
                    disabled={cancellingId === item.id}
                  >
                    {cancellingId === item.id ? (
                      <ActivityIndicator color="#c00" />
                    ) : (
                      <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                    )}
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: "#666" },
  title: { fontSize: 24, fontWeight: "bold", padding: 16, paddingTop: 60 },
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
  },
  eventName: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 2 },
  statusRow: { marginTop: 8 },
  status: { fontWeight: "600", alignSelf: "flex-start" },
  statusConfirmed: { color: "#0a7d2c" },
  statusCancelled: { color: "#c00" },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#c00",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: { color: "#c00", fontWeight: "600" },
});
