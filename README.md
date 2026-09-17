# EventHub

A cross-platform event booking mobile app built with React Native (Expo) and Firebase, developed for the Cross-Platform App Development exercise ("Event Booking Mobile Application").

## Features
- User accounts (register with role selection, login, logout, view/update profile)
- Browse events with search-by-name and category filtering
- Event details with seat availability
- Event booking with seat validation and confirmation
- My Bookings (view current/past bookings, cancel upcoming ones)
- Organizer tools (create, edit, delete events; view bookings per event)
- Local notifications (booking confirmation, cancellation, event reminder, event update)

## Tech stack
- React Native via Expo (managed), TypeScript, Expo Router (file-based navigation)
- Firebase Firestore (users/events/bookings) and Firebase Auth, called directly from the client SDK
- AsyncStorage for local storage (auth session persistence)
- expo-notifications for local device notifications (no backend exists to trigger real push, so booking/cancellation/reminder/update notifications are triggered client-side)

## Firestore security rules
`mobile/firestore.rules` contains the production rules (users can only write their own profile, organizers can only edit/delete their own events, bookings are only writable by their owner). Paste this into Firebase Console → Firestore Database → Rules before final submission.

## Getting started
```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) on a device on the same Wi-Fi network, or press `w` to run in a browser.

## Project structure
```
mobile/src/
  app/            # Expo Router routes ((auth), (tabs), event/[id], booking/[id])
  components/      # EventCard
  context/         # AuthContext (Firebase Auth + user profile)
  services/        # firebase.ts, events.ts, bookings.ts, notifications.ts
  utils/           # validation helpers
```
