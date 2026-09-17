import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type EventDoc = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  dateTime: Timestamp;
  location: string;
  category: string;
  price: number;
  availableSeats: number;
  organizerId: string;
  createdAt: Timestamp;
};

export type EventInput = {
  name: string;
  description: string;
  imageUrl: string;
  dateTime: Date;
  location: string;
  category: string;
  price: number;
  availableSeats: number;
};

const eventsRef = collection(db, "events");

export async function createEvent(organizerId: string, data: EventInput) {
  await addDoc(eventsRef, {
    ...data,
    dateTime: Timestamp.fromDate(data.dateTime),
    organizerId,
    createdAt: Timestamp.now(),
  });
}

export async function getEventsByOrganizer(organizerId: string): Promise<EventDoc[]> {
  const q = query(eventsRef, where("organizerId", "==", organizerId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventDoc));
}

export async function getEventById(id: string): Promise<EventDoc | null> {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as EventDoc) : null;
}

export async function updateEvent(id: string, data: EventInput) {
  await updateDoc(doc(db, "events", id), {
    ...data,
    dateTime: Timestamp.fromDate(data.dateTime),
  });
}

export async function deleteEvent(id: string) {
  await deleteDoc(doc(db, "events", id));
}
