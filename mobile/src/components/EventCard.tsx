import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventDoc } from "../services/events";
import { ThemeColors, useThemeColors } from "../constants/theme";
import { formatPrice } from "../utils/format";

export default function EventCard({ event }: { event: EventDoc }) {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {event.name}
          </Text>
          {event.availableSeats <= 0 && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold out</Text>
            </View>
          )}
        </View>

        {!!event.category && (
          <View style={styles.categoryChip}>
            <Ionicons name="pricetag-outline" size={12} color={colors.primaryText} />
            <Text style={styles.categoryText} numberOfLines={1}>
              {event.category}
            </Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta} numberOfLines={1}>
            {event.dateTime.toDate().toLocaleString()}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.meta} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaRow}>
            <Ionicons name="cash-outline" size={16} color={colors.primary} />
            <Text style={styles.price}>{formatPrice(event.price)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.seats}>{event.availableSeats} left</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: colors.surface,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    image: { width: "100%", height: 140 },
    imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: colors.overlay },
    info: { padding: 14, gap: 6 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    name: { fontSize: 16, fontWeight: "700", flexShrink: 1, color: colors.text },
    soldOutBadge: {
      backgroundColor: colors.dangerSoft,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    soldOutText: { color: colors.danger, fontSize: 11, fontWeight: "700" },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      backgroundColor: colors.primarySoft,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    categoryText: { color: colors.primaryText, fontSize: 12, fontWeight: "600" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 18 },
    meta: { color: colors.textSecondary, flexShrink: 1 },
    footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
    price: { fontWeight: "700", color: colors.primary },
    seats: { color: colors.textSecondary },
  });
}
