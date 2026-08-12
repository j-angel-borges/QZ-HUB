// ==============================================================================
// QZ HUB — FIRESTORE REALTIME SYNC ENGINE
// ==============================================================================
// Replaces Google Apps Script / Drive sync with Cloud Firestore realtime DB.
// All PWA data (tasks, M.I.T., objectives, timeblocks, journal, settings)
// is synced in realtime across all devices.
// ==============================================================================

import { db } from './firebase-config.js';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
// Single master document holding ALL PWA state for this user.
// Using a simple single-doc approach since there's only one user.
const COLLECTION = 'qz_hub_users';
const USER_DOC_ID = 'master';

// ─── INTERNAL STATE ──────────────────────────────────────────────────────────
let _isListening = false;
let _isSyncing = false;
let _debounceTimer = null;
let _onDataUpdateCallback = null;
let _unsubscribe = null;

// ─── DOCUMENT REFERENCE ─────────────────────────────────────────────────────
function masterDocRef() {
  return doc(db, COLLECTION, USER_DOC_ID);
}

// ─── SERIALIZE ALL LOCALSTORAGE INTO A SINGLE OBJECT ─────────────────────────
export function gatherAllLocalData(stateTasks) {
  const result = {};

  // 1. Tasks
  const tasks = (stateTasks && stateTasks.length > 0)
    ? stateTasks
    : (() => {
        try { return JSON.parse(localStorage.getItem('zentry_tasks') || '[]'); }
        catch (e) { return []; }
      })();
  result.tasks = tasks;

  // 2. M.I.T.
  try { result.mit = JSON.parse(localStorage.getItem('zentry_mit') || '[]'); }
  catch (e) { result.mit = []; }

  // 3. Corkboard Objectives
  try { result.objectives = JSON.parse(localStorage.getItem('zentry_objectives') || '[]'); }
  catch (e) { result.objectives = []; }

  // 4. Timeblock History
  try { result.timeblockHistory = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]'); }
  catch (e) { result.timeblockHistory = []; }

  // 5. Journal History
  try { result.journalHistory = JSON.parse(localStorage.getItem('zentry_journal_history') || '[]'); }
  catch (e) { result.journalHistory = []; }

  // 6. All individual timeblock date keys (zentry_timeblock_YYYY-MM-DD)
  const timeblocks = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('zentry_timeblock_') && key !== 'zentry_timeblock_history') {
      const dateStr = key.replace('zentry_timeblock_', '');
      try {
        const blocks = JSON.parse(localStorage.getItem(key));
        if (blocks && Object.keys(blocks).length > 0) {
          timeblocks[dateStr] = blocks;
        }
      } catch (e) { /* skip corrupted */ }
    }
  }
  result.timeblocks = timeblocks;

  // 7. Settings / preferences (non-critical, but preserved)
  result.settings = {
    sidebar_collapsed: localStorage.getItem('sidebar_collapsed') || 'false',
    gcal_gas_url: localStorage.getItem('gcal_gas_url') || '',
    gemini_api_key: localStorage.getItem('gemini_api_key') || '',
    gemini_model: localStorage.getItem('gemini_model') || 'gemini-2.0-flash',
  };

  return result;
}

// ─── WRITE LOCAL DATA TO FIRESTORE (FULL PUSH) ──────────────────────────────
export async function pushAllToFirestore(stateTasks) {
  if (_isSyncing) return false;
  _isSyncing = true;

  try {
    const allData = gatherAllLocalData(stateTasks);
    allData.updatedAt = new Date().toISOString();
    allData.version = '3.0-firestore';

    await setDoc(masterDocRef(), allData, { merge: true });
    console.log('🔥 QZ Hub → Firestore: Full push complete', {
      tasks: allData.tasks.length,
      timeblockDates: Object.keys(allData.timeblocks).length,
      journalEntries: allData.journalHistory.length
    });
    return true;
  } catch (err) {
    console.error('🔥 QZ Hub → Firestore push error:', err);
    return false;
  } finally {
    _isSyncing = false;
  }
}

// ─── DEBOUNCED PUSH (CALLED AFTER EVERY USER ACTION) ────────────────────────
export function pushToFirestoreDebounced(stateTasks) {
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    pushAllToFirestore(stateTasks);
  }, 800);
}

// ─── PULL FROM FIRESTORE AND HYDRATE LOCALSTORAGE ────────────────────────────
export async function pullFromFirestore() {
  try {
    const snap = await getDoc(masterDocRef());
    if (!snap.exists()) {
      console.log('🔥 QZ Hub ← Firestore: No cloud data yet. Will push local data.');
      return null;
    }

    const data = snap.data();
    hydrateLocalStorage(data);
    return data;
  } catch (err) {
    console.error('🔥 QZ Hub ← Firestore pull error:', err);
    return null;
  }
}

// ─── HYDRATE LOCALSTORAGE FROM FIRESTORE DATA ────────────────────────────────
function hydrateLocalStorage(data) {
  if (!data) return;

  // Tasks
  if (Array.isArray(data.tasks) && data.tasks.length > 0) {
    localStorage.setItem('zentry_tasks', JSON.stringify(data.tasks));
  }

  // M.I.T.
  if (Array.isArray(data.mit) && data.mit.length > 0) {
    localStorage.setItem('zentry_mit', JSON.stringify(data.mit));
  }

  // Corkboard Objectives
  if (Array.isArray(data.objectives) && data.objectives.length > 0) {
    localStorage.setItem('zentry_objectives', JSON.stringify(data.objectives));
  }

  // Timeblock History
  if (Array.isArray(data.timeblockHistory) && data.timeblockHistory.length > 0) {
    const localHist = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]');
    if (data.timeblockHistory.length >= localHist.length) {
      localStorage.setItem('zentry_timeblock_history', JSON.stringify(data.timeblockHistory));
    }
  }

  // Journal History
  if (Array.isArray(data.journalHistory) && data.journalHistory.length > 0) {
    const localJHist = JSON.parse(localStorage.getItem('zentry_journal_history') || '[]');
    if (data.journalHistory.length >= localJHist.length) {
      localStorage.setItem('zentry_journal_history', JSON.stringify(data.journalHistory));
    }
  }

  // Individual Timeblocks per date (merge, preserving local)
  if (data.timeblocks && typeof data.timeblocks === 'object') {
    for (const [dateStr, blocks] of Object.entries(data.timeblocks)) {
      if (blocks && Object.keys(blocks).length > 0) {
        const localBlocks = JSON.parse(localStorage.getItem(`zentry_timeblock_${dateStr}`) || '{}');
        // Cloud fills gaps, local overwrites conflicts
        const merged = Object.assign({}, blocks, localBlocks);
        localStorage.setItem(`zentry_timeblock_${dateStr}`, JSON.stringify(merged));
      }
    }
  }

  // Settings
  if (data.settings) {
    if (data.settings.sidebar_collapsed) localStorage.setItem('sidebar_collapsed', data.settings.sidebar_collapsed);
    if (data.settings.gcal_gas_url) localStorage.setItem('gcal_gas_url', data.settings.gcal_gas_url);
    if (data.settings.gemini_api_key) localStorage.setItem('gemini_api_key', data.settings.gemini_api_key);
    if (data.settings.gemini_model) localStorage.setItem('gemini_model', data.settings.gemini_model);
  }
}

// ─── REALTIME LISTENER (MULTI-DEVICE SYNC) ───────────────────────────────────
export function startRealtimeSync(onDataUpdate) {
  if (_isListening) return;
  _isListening = true;
  _onDataUpdateCallback = onDataUpdate;

  _unsubscribe = onSnapshot(masterDocRef(), (snap) => {
    if (!snap.exists()) return;

    // Only hydrate if this update came from another device
    // (Firestore metadata.hasPendingWrites tells us if it's a local write)
    if (snap.metadata.hasPendingWrites) {
      // This is our own write echoing back — skip hydration
      return;
    }

    const data = snap.data();
    console.log('🔥 QZ Hub ← Firestore Realtime: Synced from another device');
    hydrateLocalStorage(data);

    // Trigger re-render callback
    if (_onDataUpdateCallback) {
      _onDataUpdateCallback(data);
    }
  });
}

// ─── STOP LISTENER ───────────────────────────────────────────────────────────
export function stopRealtimeSync() {
  if (_unsubscribe) {
    _unsubscribe();
    _unsubscribe = null;
  }
  _isListening = false;
}

// ─── INITIAL BOOTSTRAP: PULL → MERGE → PUSH ─────────────────────────────────
// Called once on app load. Ensures:
// 1. Cloud data fills any gaps in localStorage.
// 2. If local has data cloud doesn't, it pushes to cloud.
// 3. Starts realtime listener for ongoing sync.
export async function bootstrapFirestoreSync(stateTasks, onDataUpdate) {
  // Step 1: Try to pull existing cloud data
  const cloudData = await pullFromFirestore();

  // Step 2: If cloud is empty, push all local data to Firestore immediately
  if (!cloudData) {
    console.log('🔥 QZ Hub: First-time sync — pushing all local data to Firestore...');
    await pushAllToFirestore(stateTasks);
  } else {
    // Cloud had data, and we already hydrated localStorage.
    // Now check if local has extra data that cloud is missing, and push it.
    const localTasks = JSON.parse(localStorage.getItem('zentry_tasks') || '[]');
    const cloudTasks = cloudData.tasks || [];
    if (localTasks.length > cloudTasks.length) {
      // Local has more — push merge
      await pushAllToFirestore(stateTasks);
    }
  }

  // Step 3: Start realtime listener for ongoing multi-device sync
  startRealtimeSync(onDataUpdate);

  console.log('🔥 QZ Hub Firestore: Bootstrap complete — realtime sync active.');
}

// ─── SPECIFIC UPDATE HELPERS ─────────────────────────────────────────────────
// These update Firestore directly for specific sections without full re-push.

export async function syncTasks(tasks) {
  try {
    await updateDoc(masterDocRef(), {
      tasks: tasks,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    // If doc doesn't exist yet, use setDoc with merge
    await setDoc(masterDocRef(), { tasks, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

export async function syncMIT(mit) {
  try {
    await updateDoc(masterDocRef(), {
      mit: mit,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    await setDoc(masterDocRef(), { mit, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

export async function syncObjectives(objectives) {
  try {
    await updateDoc(masterDocRef(), {
      objectives: objectives,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    await setDoc(masterDocRef(), { objectives, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

export async function syncTimeblock(dateStr, blockData) {
  try {
    const updatePayload = {};
    updatePayload[`timeblocks.${dateStr}`] = blockData;
    updatePayload.updatedAt = new Date().toISOString();
    await updateDoc(masterDocRef(), updatePayload);
  } catch (err) {
    const setPayload = { timeblocks: {}, updatedAt: new Date().toISOString() };
    setPayload.timeblocks[dateStr] = blockData;
    await setDoc(masterDocRef(), setPayload, { merge: true });
  }
}

export async function syncTimeblockHistory(history) {
  try {
    await updateDoc(masterDocRef(), {
      timeblockHistory: history,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    await setDoc(masterDocRef(), { timeblockHistory: history, updatedAt: new Date().toISOString() }, { merge: true });
  }
}

export async function syncJournalHistory(journalHistory) {
  try {
    await updateDoc(masterDocRef(), {
      journalHistory: journalHistory,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    await setDoc(masterDocRef(), { journalHistory, updatedAt: new Date().toISOString() }, { merge: true });
  }
}
