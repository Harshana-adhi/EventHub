import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

export type UserRole = "user" | "organizer";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setProfile(snap.exists() ? (snap.data() as UserProfile) : null);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function register(name: string, email: string, password: string, role: UserRole) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    const newProfile: UserProfile = {
      uid: credential.user.uid,
      name,
      email,
      role,
    };
    await setDoc(doc(db, "users", credential.user.uid), newProfile);
    setProfile(newProfile);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function updateUserProfile(name: string) {
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await updateDoc(doc(db, "users", user.uid), { name });
    setProfile((prev) => (prev ? { ...prev, name } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
