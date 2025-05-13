import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, collection } from "firebase/firestore";

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

// Submit or update user's best Knight Game score
export async function submitKnightScore(name, level, encounter) {
  const ref = doc(db, "knight_leaderboard", name);
  await setDoc(ref, { name, level, encounter });
}

// Fetch top 10 Knight Game scores
export async function fetchKnightLeaderboard() {
  const snapshot = await getDocs(collection(db, "knight_leaderboard"));
  const scores = snapshot.docs.map(doc => doc.data());
  return scores.sort((a, b) => (b.level * 10 + b.encounter) - (a.level * 10 + a.encounter)).slice(0, 10);
}

