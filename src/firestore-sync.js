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
  updateDoc
} from 'firebase/firestore';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
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

  // 7. Settings / preferences
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
    return allData;
  } catch (err) {
    console.error('🔥 QZ Hub → Firestore push error:', err);
    throw err;
  } finally {
    _isSyncing = false;
  }
}

// ─── DEBOUNCED PUSH (CALLED AFTER EVERY USER ACTION) ────────────────────────
export function pushToFirestoreDebounced(stateTasks) {
  if (_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(() => {
    pushAllToFirestore(stateTasks).catch(e => console.warn('Debounced push caught error:', e));
  }, 800);
}

// ─── PULL FROM FIRESTORE AND HYDRATE LOCALSTORAGE ────────────────────────────
export async function pullFromFirestore() {
  try {
    const snap = await getDoc(masterDocRef());
    if (!snap.exists()) {
      console.log('🔥 QZ Hub ← Firestore: No cloud data yet.');
      return null;
    }

    const data = snap.data();
    hydrateLocalStorage(data);
    return data;
  } catch (err) {
    console.error('🔥 QZ Hub ← Firestore pull error:', err);
    throw err;
  }
}

// ─── HYDRATE LOCALSTORAGE FROM FIRESTORE DATA ────────────────────────────────
export function hydrateLocalStorage(data) {
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

  // Individual Timeblocks per date
  if (data.timeblocks && typeof data.timeblocks === 'object') {
    for (const [dateStr, blocks] of Object.entries(data.timeblocks)) {
      if (blocks && Object.keys(blocks).length > 0) {
        const localBlocks = JSON.parse(localStorage.getItem(`zentry_timeblock_${dateStr}`) || '{}');
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

  try {
    _unsubscribe = onSnapshot(masterDocRef(), (snap) => {
      if (!snap.exists()) return;

      if (snap.metadata.hasPendingWrites) {
        return;
      }

      const data = snap.data();
      console.log('🔥 QZ Hub ← Firestore Realtime: Synced from another device');
      hydrateLocalStorage(data);

      if (_onDataUpdateCallback) {
        _onDataUpdateCallback(data);
      }
    }, (error) => {
      console.error('🔥 Firestore Realtime Listener Error:', error);
    });
  } catch (e) {
    console.error('Failed to start Firestore Realtime listener:', e);
  }
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
export async function bootstrapFirestoreSync(stateTasks, onDataUpdate) {
  try {
    const cloudData = await pullFromFirestore();

    if (!cloudData) {
      console.log('🔥 QZ Hub: First-time sync — pushing all local data to Firestore...');
      await pushAllToFirestore(stateTasks);
    } else {
      const localTasks = JSON.parse(localStorage.getItem('zentry_tasks') || '[]');
      const cloudTasks = cloudData.tasks || [];
      if (localTasks.length > cloudTasks.length) {
        await pushAllToFirestore(stateTasks);
      }
    }

    startRealtimeSync(onDataUpdate);
    console.log('🔥 QZ Hub Firestore: Bootstrap complete — realtime sync active.');
  } catch(e) {
    console.warn('Bootstrap Firestore sync completed with warning:', e);
  }
}

// ─── SPECIFIC UPDATE HELPERS ─────────────────────────────────────────────────
export async function syncTasks(tasks) {
  try {
    await updateDoc(masterDocRef(), {
      tasks: tasks,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
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

// ─── REMOTE AGENT & TELEMETRY HELPERS (REMOTE CONTROL COCKPIT) ───────────────
export async function sendRemoteTask(action, payload = {}) {
  const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const taskDocRef = doc(db, 'qz_remote_tasks', 'current_task');
  const taskData = {
    id: taskId,
    action: action, // 'exec_command', 'take_screenshot', 'read_markdown', 'run_agent'
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...payload
  };
  await setDoc(taskDocRef, taskData);
  return taskId;
}

export function listenToRemoteTask(callback) {
  const taskDocRef = doc(db, 'qz_remote_tasks', 'current_task');
  return onSnapshot(taskDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export function listenToRemoteTelemetry(callback) {
  const telemDocRef = doc(db, 'qz_remote_telemetry', 'pc_host');
  return onSnapshot(telemDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback({ status: 'offline' });
    }
  });
}

export function listenToLatestScreenshot(callback) {
  const mediaDocRef = doc(db, 'qz_remote_media', 'latest_screenshot');
  return onSnapshot(mediaDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export function listenToTerminalStream(callback) {
  const logDocRef = doc(db, 'qz_remote_terminal_logs', 'live_stream');
  return onSnapshot(logDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export async function sendRemoteStdin(text) {
  return await sendRemoteTask('send_stdin', { input: text });
}

export async function killRemoteProcess() {
  return await sendRemoteTask('kill_process', {});
}

export function listenToActiveSession(callback) {
  const sessionDocRef = doc(db, 'qz_remote_sessions', 'active_session');
  return onSnapshot(sessionDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export function listenToSessionList(callback) {
  const listDocRef = doc(db, 'qz_remote_sessions', 'session_list');
  return onSnapshot(listDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}

export async function switchRemoteSession(sessionId) {
  return await sendRemoteTask('switch_session', { sessionId });
}

export async function readRemoteArtifact(sessionId, filename) {
  return await sendRemoteTask('read_artifact', { sessionId, filename });
}


// ─── GOOGLE CLOUD VERTEX AI / GEMINI DIRECT ENGINE ───────────────────────────
export async function callVertexGemini(prompt, systemInstruction = '', model = 'gemini-2.5-flash', apiKey = '') {
  const key = (apiKey || localStorage.getItem('gemini_api_key') || '').trim();
  const projectId = (localStorage.getItem('gemini_project_id') || 'quarz-group').trim();
  const cleanModel = model || 'gemini-2.5-flash';

  // 1. First attempt: Serverless backend /api/chat (with server-side GCP Vertex AI & environment keys)
  try {
    const backendRes = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(key ? { 'x-api-key': key } : {})
      },
      body: JSON.stringify({
        message: prompt,
        systemInstruction,
        model: cleanModel,
        projectId,
        apiKey: key
      })
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data && data.reply && !data.isConfigWarning) {
        return data.reply;
      }
    }
  } catch (e) {
    // Continue to direct call
  }

  // 2. Direct call: Determine whether it's a Bearer Token (ya29...) or API Key (AIzaSy...)
  if (!key) {
    throw new Error("No hay credenciales de Google Cloud configuradas. Ingresa tu Clave o Token en '⚙️ Config GCP' o selecciona '📖 Motor SSOT Local'.");
  }

  const isBearerToken = key.startsWith('ya29.') || key.length > 80;
  let endpoint = '';
  let headers = { 'Content-Type': 'application/json' };

  if (isBearerToken) {
    endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/${cleanModel}:generateContent`;
    headers['Authorization'] = `Bearer ${key}`;
  } else {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key}`;
  }
  
  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `HTTP ${response.status}: Error en Vertex AI / Google Cloud`;
    
    if (errMsg.includes('prepayment') || errorData.error?.code === 429) {
      throw new Error(`Los créditos de prepago están agotados. Usa el proyecto empresarial 'quarz-group' con Vertex AI o selecciona '📖 Motor SSOT Local'.`);
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta del modelo.";
  return text;
}

