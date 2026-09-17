import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function TabsLayout() {
  const { profile } = useAuth();
  const isOrganizer = profile?.role === "organizer";

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Events" }} />
      <Tabs.Screen
        name="my-events"
        options={{ title: "My Events", href: isOrganizer ? undefined : null }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
