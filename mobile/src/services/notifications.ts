import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SchedulableTriggerInputTypes } from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.requestPermissionsAsync();
}

export async function notifyBookingConfirmed(eventName: string, seats: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Booking confirmed",
      body: `You've booked ${seats} seat(s) for "${eventName}".`,
    },
    trigger: null,
  });
}

export async function notifyBookingCancelled(eventName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Booking cancelled",
      body: `Your booking for "${eventName}" has been cancelled.`,
    },
    trigger: null,
  });
}

export async function notifyEventUpdated(eventName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Event updated",
      body: `"${eventName}" has been updated.`,
    },
    trigger: null,
  });
}

const REMINDER_LEAD_TIME_MS = 60 * 60 * 1000;

export async function scheduleEventReminder(bookingId: string, eventName: string, eventDate: Date) {
  const reminderTime = new Date(eventDate.getTime() - REMINDER_LEAD_TIME_MS);
  if (reminderTime.getTime() <= Date.now()) return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Event reminder",
      body: `"${eventName}" starts in an hour.`,
    },
    trigger: { type: SchedulableTriggerInputTypes.DATE, date: reminderTime },
  });

  await AsyncStorage.setItem(`reminder_${bookingId}`, id);
}

export async function cancelEventReminder(bookingId: string) {
  const id = await AsyncStorage.getItem(`reminder_${bookingId}`);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(`reminder_${bookingId}`);
  }
}
