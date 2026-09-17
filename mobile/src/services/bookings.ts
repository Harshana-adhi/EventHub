import { collection, doc, getDocs, query, where, runTransaction, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type BookingDoc = {
  id: string;
  userId: string;
  eventId: string;
  status: "confirmed" | "cancelled";
  seats: number;
  bookedAt: Timestamp;
};

const bookingsRef = collection(db, "bookings");

export async function createBooking(userId: string, eventId: string, seats: number) {
  await runTransaction(db, async (transaction) => {
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists()) throw new Error("This event no longer exists.");

    const availableSeats = eventSnap.data().availableSeats as number;
    if (seats > availableSeats) throw new Error("Not enough seats available.");

    transaction.update(eventRef, { availableSeats: availableSeats - seats });

    const bookingRef = doc(bookingsRef);
    transaction.set(bookingRef, {
      userId,
      eventId,
      status: "confirmed",
      seats,
      bookedAt: Timestamp.now(),
    });
  });
}

export async function getUserBookings(userId: string): Promise<BookingDoc[]> {
  const q = query(bookingsRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BookingDoc));
}

export async function cancelBooking(bookingId: string) {
  await runTransaction(db, async (transaction) => {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await transaction.get(bookingRef);
    if (!bookingSnap.exists()) throw new Error("Booking not found.");

    const booking = bookingSnap.data();
    if (booking.status === "cancelled") return;

    const eventRef = doc(db, "events", booking.eventId);
    const eventSnap = await transaction.get(eventRef);
    if (eventSnap.exists()) {
      const availableSeats = eventSnap.data().availableSeats as number;
      transaction.update(eventRef, { availableSeats: availableSeats + booking.seats });
    }

    transaction.update(bookingRef, { status: "cancelled" });
  });
}

export async function getBookingsForEvent(eventId: string): Promise<BookingDoc[]> {
  const q = query(bookingsRef, where("eventId", "==", eventId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BookingDoc));
}
