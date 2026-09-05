// ==============================================================================
// QZ HUB — Firebase Configuration
// ==============================================================================
// Project ID: quarz-group
// ==============================================================================

import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBurwKhFJL5Dkt_f5R_FAJFdsIz0QhJBEo",
  authDomain: "quarz-group.firebaseapp.com",
  projectId: "quarz-group",
  storageBucket: "quarz-group.firebasestorage.app",
  messagingSenderId: "1065709368788",
  appId: "1:1065709368788:web:dc0a0d9a84df766ddb1241"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust multi-tab offline cache and auto long polling for mobile/Brave shields
let db;
try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  console.warn('Firestore fallback to standard initialization:', e);
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
}

export { db, app, firebaseConfig };
