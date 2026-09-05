import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyBurwKhFJL5Dkt_f5R_FAJFdsIz0QhJBEo",
  authDomain: "quarz-group.firebaseapp.com",
  projectId: "quarz-group",
  storageBucket: "quarz-group.firebasestorage.app",
  messagingSenderId: "1065709368788",
  appId: "1:1065709368788:web:dc0a0d9a84df766ddb1241"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  const dumpPath = path.resolve(__dirname, '../live_browser_dump.json');
  console.log('Reading dump from:', dumpPath);
  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  const payload = {
    version: '3.0-firestore',
    updatedAt: new Date().toISOString(),
    tasks: JSON.parse(dump.zentry_tasks || '[]'),
    mit: JSON.parse(dump.zentry_mit || '[]'),
    mit_personal: JSON.parse(dump.zentry_mit_personal || 'null') || [],
    mit_quarz: JSON.parse(dump.zentry_mit_quarz || 'null') || [],
    mit_zentry: JSON.parse(dump.zentry_mit_zentry || 'null') || [],
    mit_global: JSON.parse(dump.zentry_mit_global || 'null') || [],
    objectives: JSON.parse(dump.zentry_objectives || '[]'),
    timeblockHistory: JSON.parse(dump.zentry_timeblock_history || '[]'),
    journalHistory: JSON.parse(dump.zentry_journal_history || '[]'),
    bioTracker: JSON.parse(dump.qz_bio_tracker || '{}'),
    timeblocks: {},
    settings: {
      sidebar_collapsed: dump.sidebar_collapsed || 'false',
      gcal_gas_url: dump.gcal_gas_url || '',
      gemini_api_key: dump.gemini_api_key || '',
      gemini_model: dump.gemini_model || 'gemini-2.5-flash',
      gemini_project_id: 'quarz-group'
    }
  };

  for (const [k, v] of Object.entries(dump)) {
    if (k.startsWith('zentry_timeblock_') && k !== 'zentry_timeblock_history') {
      const dateStr = k.replace('zentry_timeblock_', '');
      try {
        payload.timeblocks[dateStr] = JSON.parse(v);
      } catch(e) {}
    }
  }

  console.log(`Writing to quarz-group Firestore:
  - Tasks: ${payload.tasks.length}
  - Timeblock days: ${Object.keys(payload.timeblocks).length}
  - Journal entries: ${payload.journalHistory.length}
  - Bio tracker metrics: ${Object.keys(payload.bioTracker).length}
  - MITs: default(${payload.mit.length}), personal(${payload.mit_personal.length}), quarz(${payload.mit_quarz.length})`);

  const masterRef = doc(db, 'qz_hub_users', 'master');
  await setDoc(masterRef, payload, { merge: true });

  console.log('Successfully saved to Firestore quarz-group qz_hub_users/master!');

  // Verify by reading back
  const snap = await getDoc(masterRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log('Verified from cloud:');
    console.log(`- Tasks count: ${data.tasks?.length}`);
    console.log(`- Timeblock days count: ${Object.keys(data.timeblocks || {}).length}`);
    console.log(`- Today's block (2026-09-05):`, Object.keys(data.timeblocks?.['2026-09-05'] || {}));
  } else {
    throw new Error('Document did not exist after writing!');
  }
}

seed().then(() => {
  console.log('Migration to quarz-group Firestore complete.');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
