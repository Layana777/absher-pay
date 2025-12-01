import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCx0GXCgSaNJlrg1a_goaLHp58IuwviL3M",
  authDomain: "absher-pay.firebaseapp.com",
  databaseURL:
    "https://absher-pay-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "absher-pay",
  storageBucket: "absher-pay.firebasestorage.app",
  messagingSenderId: "523633067316",
  appId: "1:523633067316:web:862ec426fee4e8abb85161",
  measurementId: "G-NGTKK52CB7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);

export default app;
