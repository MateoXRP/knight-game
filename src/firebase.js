// firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📝 Submit Knight Game Progress
export async function submitKnightProgress(name, level, encounter, runePayload = [], newKills = 1) {
  try {
    const docRef = doc(db, "knight_leaderboard", name);
    const snapshot = await getDoc(docRef);

    let previousKills = 0;
    let previousRunes = 0;

    if (snapshot.exists()) {
      const data = snapshot.data();
      previousKills = typeof data.kills === "number" ? data.kills : 0;
      previousRunes = typeof data.totalRunes === "number" ? data.totalRunes : 0;
    }

    const newTotalRunes = previousRunes + runePayload.length;
    const newTotalKills = previousKills + newKills;

    const payload = {
      name,
      level,
      encounter,
      kills: newTotalKills,
      totalRunes: newTotalRunes,
    };

    await setDoc(docRef, payload);
  } catch (err) {
    console.error("❌ Firebase write error:", err);
  }
}

// 📊 Fetch Knight Game Leaderboard
export async function fetchKnightLeaderboard() {
  try {
    const snapshot = await getDocs(collection(db, "knight_leaderboard"));
    return snapshot.docs.map((doc) => doc.data());
  } catch (err) {
    console.error("❌ Firebase read error:", err);
    return [];
  }
}

