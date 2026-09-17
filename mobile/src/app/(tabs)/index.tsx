import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import EventCard from "../../components/EventCard";
import { EventDoc, getEvents } from "../../services/events";
import { ThemeColors, useThemeColors } from "../../constants/theme";

export default function Events() {
  const colors = useThemeColors();
  const styles = createStyles(colors);

  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getEvents();
      setEvents(list);
    } catch (error: any) {
      Alert.alert("Failed to load events", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const categories = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const e of events) {
      if (!e.category) continue;
      const key = e.category.trim().toLowerCase();
      if (!byKey.has(key)) byKey.set(key, e.category.trim());
    }
    return Array.from(byKey.values());
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = !category || e.category.trim().toLowerCase() === category.trim().toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.placeholder} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {["All", ...categories].map((item) => {
            const isActive = item === "All" ? category === null : category === item;
            return (
              <Pressable
                key={item}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setCategory(item === "All" ? null : item)}
              >
                <Ionicons
                  name={item === "All" ? "apps-outline" : "pricetag-outline"}
                  size={13}
                  color={isActive ? "#fff" : colors.textSecondary}
                />
                <Text
                  style={isActive ? styles.filterTextActive : styles.filterText}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : filteredEvents.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="calendar-clear-outline" size={40} color={colors.border} />
          <Text style={styles.emptyText}>No events found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push({ pathname: "/event/[id]", params: { id: item.id } })}>
              <EventCard event={item} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: 26, fontWeight: "800", padding: 16, paddingTop: 60, paddingBottom: 8, color: colors.text },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      marginHorizontal: 16,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceAlt,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      color: colors.text,
    },
    filterScroll: { flexGrow: 0, flexShrink: 0 },
    filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, alignItems: "center" },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 34,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 7,
      paddingHorizontal: 14,
      marginRight: 8,
      backgroundColor: colors.surfaceAlt,
    },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterText: { color: colors.text },
    filterTextActive: { color: "#fff", fontWeight: "600" },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
    emptyText: { color: colors.textSecondary },
  });
}
