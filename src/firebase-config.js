// ==============================================================================
// QZ HUB — Firebase Configuration
// ==============================================================================
// Project ID: qz-hub
// ==============================================================================

import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDW665aZqLsgW5FN9yez35Nj8_6weXDWAw",
  authDomain: "qz-hub.firebaseapp.com",
  projectId: "qz-hub",
  storageBucket: "qz-hub.firebasestorage.app",
  messagingSenderId: "779313034264",
  appId: "1:779313034264:web:128bcdcfc5507706037f6d",
  measurementId: "G-G2WV90X4MG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable offline persistence so the PWA works without internet
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('QZ Hub Firestore: Multiple tabs open, persistence active in primary tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('QZ Hub Firestore: Browser does not support persistence.');
    }
  });
} catch (e) {
  console.warn('QZ Hub Firestore: Persistence setup completed.');
}

export { db, app };
