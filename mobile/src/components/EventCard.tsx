import { View, Text, Image, StyleSheet } from "react-native";
import { EventDoc } from "../services/events";

export default function EventCard({ event }: { event: EventDoc }) {
  return (
    <View style={styles.card}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>No image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {event.name}
        </Text>
        <Text style={styles.meta}>{event.category}</Text>
        <Text style={styles.meta}>{event.dateTime.toDate().toLocaleString()}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {event.location}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${event.price}</Text>
          <Text style={styles.seats}>{event.availableSeats} seats left</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: { width: "100%", height: 140 },
  imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#eee" },
  imagePlaceholderText: { color: "#999" },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { color: "#666", marginTop: 2 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  price: { fontWeight: "600", color: "#4630eb" },
  seats: { color: "#666" },
});
