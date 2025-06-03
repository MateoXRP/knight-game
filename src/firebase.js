import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection
} from "firebase/firestore";

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Submit or update user's best score and total rune count
export async function submitKnightProgress(name, level, encounter, newRunes = []) {
  const ref = doc(db, "knight_leaderboard", name);
  const current = level * 10 + encounter;

  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data() : {};
  const previous = (existing.level ?? 0) * 10 + (existing.encounter ?? 0);

  const prevRuneCount = typeof existing.totalRunes === "number" ? existing.totalRunes : 0;
  const currentRuneCount = newRunes.length;

  await setDoc(ref, {
    name,
    level: current > previous ? level : (existing.level ?? 0),
    encounter: current > previous ? encounter : (existing.encounter ?? 0),
    totalRunes: prevRuneCount + currentRuneCount,
  });
}

// Fetch top 10 scores
export async function fetchKnightLeaderboard() {
  const snapshot = await getDocs(collection(db, "knight_leaderboard"));
  const scores = snapshot.docs.map(doc => doc.data());
  return scores
    .sort((a, b) => (b.level * 10 + b.encounter) - (a.level * 10 + a.encounter))
    .slice(0, 10);
}

