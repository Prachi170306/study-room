
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAqyD5bCAeCDx1s58RBFIHMDff4cyGQiGc",
  authDomain: "study-room-cc.firebaseapp.com",
  databaseURL: "https://study-room-cc-default-rtdb.firebaseio.com",
  projectId: "study-room-cc",
  storageBucket: "study-room-cc.firebasestorage.app",
  messagingSenderId: "996912719364",
  appId: "1:996912719364:web:192fb8b3f95d05fb983751",
  measurementId: "G-RQXW9X3K51"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export const loginAnonymously = () => {
  return signInAnonymously(auth);
};

export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;

