import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCyaly88hUiERr_xHS2OBr91nr6FEr2VS4",
  authDomain: "eventhub-harshana.firebaseapp.com",
  projectId: "eventhub-harshana",
  storageBucket: "eventhub-harshana.firebasestorage.app",
  messagingSenderId: "836833165518",
  appId: "1:836833165518:web:15ffe1475374726e52109f"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});