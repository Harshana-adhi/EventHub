import { useCallback, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EventDoc, getEventById } from "../../services/events";
import { ThemeColors, useThemeColors } from "../../constants/theme";
import { formatPrice } from "../../utils/format";

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const styles = createStyles(colors);

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
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: event.name,
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />

      {event.imageUrl ? (
        <Image source={{ uri: event.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{event.name}</Text>

        {!!event.category && (
          <View style={styles.categoryChip}>
            <Ionicons name="pricetag-outline" size={13} color={colors.primaryText} />
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        )}

        {!!event.description && <Text style={styles.description}>{event.description}</Text>}

        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Date & time</Text>
          </View>
          <Text style={styles.detailValue}>{event.dateTime.toDate().toLocaleString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Location</Text>
          </View>
          <Text style={styles.detailValue}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Price</Text>
          </View>
          <Text style={styles.detailValue}>{formatPrice(event.price)}</Text>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailLabelRow}>
            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailLabel}>Available seats</Text>
          </View>
          <Text style={styles.detailValue}>{event.availableSeats}</Text>
        </View>

        <Pressable
          style={[styles.bookButton, event.availableSeats <= 0 && styles.bookButtonDisabled]}
          disabled={event.availableSeats <= 0}
          onPress={() => router.push({ pathname: "/booking/[id]", params: { id: event.id } })}
        >
          <Ionicons
            name={event.availableSeats <= 0 ? "close-circle-outline" : "ticket-outline"}
            size={18}
            color="#fff"
          />
          <Text style={styles.bookButtonText}>
            {event.availableSeats <= 0 ? "Sold Out" : "Book Now"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
    emptyText: { color: colors.textSecondary },
    image: { width: "100%", height: 220 },
    imagePlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: colors.overlay },
    content: { padding: 20 },
    name: { fontSize: 24, fontWeight: "800", color: colors.text },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      alignSelf: "flex-start",
      backgroundColor: colors.primarySoft,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: 8,
    },
    categoryText: { color: colors.primaryText, fontSize: 12, fontWeight: "600" },
    description: { color: colors.textSecondary, marginTop: 14, lineHeight: 20 },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    detailLabel: { color: colors.textSecondary },
    detailValue: { fontWeight: "600", color: colors.text },
    bookButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 16,
      marginTop: 24,
    },
    bookButtonDisabled: { backgroundColor: colors.textSecondary },
    bookButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  });
}
