import { View, Text, StyleSheet } from "react-native";

export default function Events() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Events list coming in a later step.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#666" },
});
