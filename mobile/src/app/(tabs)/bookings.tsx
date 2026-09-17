import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { BookingDoc, cancelBooking, getUserBookings } from "../../services/bookings";
import { EventDoc, getEventById } from "../../services/events";
import { cancelEventReminder, notifyBookingCancelled } from "../../services/notifications";
import { ThemeColors, useThemeColors } from "../../constants/theme";

type BookingWithEvent = BookingDoc & { event: EventDoc | null };

export default function Bookings() {
  const { user } = useAuth();
  const colors = useThemeColors();
  const styles = createStyles(colors);

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
            await cancelEventReminder(booking.id);
            if (booking.event) await notifyBookingCancelled(booking.event.name);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      {bookings.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="ticket-outline" size={40} color={colors.border} />
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
            const statusIcon =
              item.status === "cancelled"
                ? "close-circle-outline"
                : isUpcoming
                ? "time-outline"
                : "checkmark-done-outline";
            const statusColor = item.status === "cancelled" ? colors.danger : colors.success;

            return (
              <View style={styles.card}>
                <View style={styles.titleRow}>
                  <Text style={styles.eventName} numberOfLines={1}>
                    {item.event?.name ?? "Event no longer available"}
                  </Text>
                  <View style={styles.statusChip}>
                    <Ionicons name={statusIcon} size={13} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {item.status === "cancelled" ? "Cancelled" : isUpcoming ? "Upcoming" : "Past"}
                    </Text>
                  </View>
                </View>

                {item.event && (
                  <>
                    <View style={styles.metaRow}>
                      <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.meta} numberOfLines={1}>
                        {item.event.dateTime.toDate().toLocaleString()}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.meta} numberOfLines={1}>
                        {item.event.location}
                      </Text>
                    </View>
                  </>
                )}
                <View style={styles.metaRow}>
                  <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.meta}>{item.seats} seat(s)</Text>
                </View>

                {canCancel && (
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => handleCancel(item)}
                    disabled={cancellingId === item.id}
                  >
                    {cancellingId === item.id ? (
                      <ActivityIndicator color={colors.danger} />
                    ) : (
                      <>
                        <Ionicons name="close-outline" size={16} color={colors.danger} />
                        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                      </>
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
    emptyText: { color: colors.textSecondary },
    title: { fontSize: 26, fontWeight: "800", padding: 16, paddingTop: 60, color: colors.text },
    card: {
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      gap: 4,
    },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    eventName: { fontSize: 16, fontWeight: "700", flexShrink: 1, color: colors.text },
    statusChip: { flexDirection: "row", alignItems: "center", gap: 4 },
    statusText: { fontWeight: "600", fontSize: 12 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 18 },
    meta: { color: colors.textSecondary, flexShrink: 1 },
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: 6,
      paddingVertical: 8,
      marginTop: 8,
    },
    cancelButtonText: { color: colors.danger, fontWeight: "600" },
  });
}
