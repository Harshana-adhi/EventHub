import { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import EventCard from "../../components/EventCard";
import { EventDoc, getEvents } from "../../services/events";

export default function Events() {
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
    const set = new Set(events.map((e) => e.category).filter(Boolean));
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesCategory = !category || e.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [events, search, category]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search events"
        value={search}
        onChangeText={setSearch}
      />

      {categories.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["All", ...categories]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const isActive = item === "All" ? category === null : category === item;
            return (
              <Pressable
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setCategory(item === "All" ? null : item)}
              >
                <Text style={isActive ? styles.filterTextActive : styles.filterText}>{item}</Text>
              </Pressable>
            );
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : filteredEvents.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No events found.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", padding: 16, paddingTop: 60, paddingBottom: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
  },
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: "#4630eb", borderColor: "#4630eb" },
  filterText: { color: "#444" },
  filterTextActive: { color: "#fff", fontWeight: "600" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: "#666" },
});
