import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoHpgOjvi5tdn-RlK8Ij4YRff5HGRKuMM",
  authDomain: "skipq-5e224.firebaseapp.com",
  projectId: "skipq-5e224",
  storageBucket: "skipq-5e224.appspot.com",
  messagingSenderId: "580894213408",
  appId: "1:580894213408:web:a38e55936a0c397d8c8345"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// ⚠️ TEMPORARY DEBUG: Expose Firebase globally
if (typeof window !== 'undefined') {
  (window as any).__SKIPQ_FIREBASE = { app, auth, db };
  console.log('🔥 Firebase exposed at window.__SKIPQ_FIREBASE');
}
