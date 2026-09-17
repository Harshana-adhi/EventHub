import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

// Expo Router also bundles this file for a Node/web target (route manifest generation),
// where firebase/auth's React Native persistence isn't available — only use it on native.
let auth: Auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}
export { auth };