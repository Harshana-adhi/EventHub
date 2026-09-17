import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../services/firebase";
import {
  EventDoc,
  EventInput,
  createEvent,
  deleteEvent,
  getEventsByOrganizer,
  updateEvent,
} from "../../services/events";
import { BookingDoc, getBookingsForEvent } from "../../services/bookings";

type BookingWithAttendee = BookingDoc & { attendeeName: string; attendeeEmail: string };

const emptyForm = {
  name: "",
  description: "",
  imageUrl: "",
  dateTime: "",
  location: "",
  category: "",
  price: "",
  availableSeats: "",
};

export default function MyEvents() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [bookingsEvent, setBookingsEvent] = useState<EventDoc | null>(null);
  const [eventBookings, setEventBookings] = useState<BookingWithAttendee[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getEventsByOrganizer(user.uid);
      setEvents(list);
    } catch (error: any) {
      Alert.alert("Failed to load events", error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  }

  function openEditModal(event: EventDoc) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description,
      imageUrl: event.imageUrl,
      dateTime: event.dateTime.toDate().toISOString().slice(0, 16).replace("T", " "),
      location: event.location,
      category: event.category,
      price: String(event.price),
      availableSeats: String(event.availableSeats),
    });
    setModalVisible(true);
  }

  async function handleSubmit() {
    if (!user) return;
    if (!form.name.trim() || !form.description.trim() || !form.location.trim() || !form.category.trim()) {
      Alert.alert("Missing info", "Please fill in all required fields.");
      return;
    }

    const dateTime = new Date(form.dateTime.replace(" ", "T"));
    if (isNaN(dateTime.getTime())) {
      Alert.alert("Invalid date", "Use the format YYYY-MM-DD HH:MM, e.g. 2026-03-05 18:00");
      return;
    }

    const price = Number(form.price);
    const availableSeats = Number(form.availableSeats);
    if (isNaN(price) || price < 0) {
      Alert.alert("Invalid price", "Price must be a non-negative number.");
      return;
    }
    if (isNaN(availableSeats) || availableSeats < 0 || !Number.isInteger(availableSeats)) {
      Alert.alert("Invalid seats", "Available seats must be a whole number.");
      return;
    }

    const data: EventInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      dateTime,
      location: form.location.trim(),
      category: form.category.trim(),
      price,
      availableSeats,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateEvent(editingId, data);
      } else {
        await createEvent(user.uid, data);
      }
      setModalVisible(false);
      loadEvents();
    } catch (error: any) {
      Alert.alert("Save failed", error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function openBookingsModal(event: EventDoc) {
    setBookingsEvent(event);
    setLoadingBookings(true);
    try {
      const list = await getBookingsForEvent(event.id);
      const withAttendees = await Promise.all(
        list.map(async (booking) => {
          const userSnap = await getDoc(doc(db, "users", booking.userId));
          const userData = userSnap.data();
          return {
            ...booking,
            attendeeName: userData?.name ?? "Unknown",
            attendeeEmail: userData?.email ?? "",
          };
        })
      );
      setEventBookings(withAttendees);
    } catch (error: any) {
      Alert.alert("Failed to load bookings", error.message);
    } finally {
      setLoadingBookings(false);
    }
  }

  function handleDelete(event: EventDoc) {
    Alert.alert("Delete event", `Remove "${event.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            loadEvents();
          } catch (error: any) {
            Alert.alert("Delete failed", error.message);
          }
        },
      },
    ]);
  }

  if (profile && profile.role !== "organizer") {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>This section is only available to organizers.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <Pressable style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Event</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : events.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You haven't created any events yet.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.category} • {item.dateTime.toDate().toLocaleString()}
              </Text>
              <Text style={styles.cardMeta}>{item.location}</Text>
              <Text style={styles.cardMeta}>
                ${item.price} • {item.availableSeats} seats left
              </Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.cardButton} onPress={() => openEditModal(item)}>
                  <Text style={styles.cardButtonText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.cardButton} onPress={() => openBookingsModal(item)}>
                  <Text style={styles.cardButtonText}>View Bookings</Text>
                </Pressable>
                <Pressable style={[styles.cardButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                  <Text style={[styles.cardButtonText, styles.deleteButtonText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{editingId ? "Edit Event" : "Add Event"}</Text>

          <TextInput
            style={styles.input}
            placeholder="Event name"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Description"
            multiline
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            autoCapitalize="none"
            value={form.imageUrl}
            onChangeText={(v) => setForm({ ...form, imageUrl: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Date & time (YYYY-MM-DD HH:MM)"
            value={form.dateTime}
            onChangeText={(v) => setForm({ ...form, dateTime: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={form.location}
            onChangeText={(v) => setForm({ ...form, location: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={form.category}
            onChangeText={(v) => setForm({ ...form, category: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={form.price}
            onChangeText={(v) => setForm({ ...form, price: v })}
          />
          <TextInput
            style={styles.input}
            placeholder="Available seats"
            keyboardType="numeric"
            value={form.availableSeats}
            onChangeText={(v) => setForm({ ...form, availableSeats: v })}
          />

          <Pressable style={styles.addButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>{editingId ? "Save Changes" : "Create Event"}</Text>
            )}
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        visible={bookingsEvent !== null}
        animationType="slide"
        onRequestClose={() => setBookingsEvent(null)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Bookings for {bookingsEvent?.name}</Text>

          {loadingBookings ? (
            <ActivityIndicator size="large" style={{ marginTop: 24 }} />
          ) : eventBookings.length === 0 ? (
            <Text style={[styles.emptyText, { marginTop: 24 }]}>No bookings for this event yet.</Text>
          ) : (
            <FlatList
              data={eventBookings}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12, paddingVertical: 16 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.attendeeName}</Text>
                  <Text style={styles.cardMeta}>{item.attendeeEmail}</Text>
                  <Text style={styles.cardMeta}>{item.seats} seat(s)</Text>
                  <Text
                    style={[
                      styles.cardMeta,
                      item.status === "cancelled" ? styles.deleteButtonText : styles.cardButtonText,
                    ]}
                  >
                    {item.status === "cancelled" ? "Cancelled" : "Confirmed"}
                  </Text>
                </View>
              )}
            />
          )}

          <Pressable style={styles.cancelButton} onPress={() => setBookingsEvent(null)}>
            <Text style={styles.cancelButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  addButton: {
    backgroundColor: "#4630eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: "#666", textAlign: "center" },
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardMeta: { color: "#666", marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 12, marginTop: 10 },
  cardButton: {
    borderWidth: 1,
    borderColor: "#4630eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cardButtonText: { color: "#4630eb", fontWeight: "600" },
  deleteButton: { borderColor: "#c00" },
  deleteButtonText: { color: "#c00" },
  modalContainer: { flex: 1, padding: 24, paddingTop: 60 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  cancelButton: { alignItems: "center", padding: 12, marginTop: 8 },
  cancelButtonText: { color: "#666" },
});
