// ==============================================================================
// QZ-HUB — TICK TOOL (WHATSAPP CAMPAIGNS & BLUETICKS ALTERNATIVE)
// ==============================================================================
// - Wizard de 4 pasos (Audience, Message & Follow-ups, Timing & Jitter, Review & Firestore)
// - Sincronización en tiempo real con Firestore: whatsapp_campaigns y whatsapp_outbox
// - Estados: pending, dispatched, replied, cancelled
// - Comunicación postMessage con el iframe de CRM (izquierda) y con la extensión
//   Chrome Manifest V3 (zentry-ws-dispatcher)
// - Vista previa interactiva en vivo (Burbuja WhatsApp + Popup Extensión + Simulador Anti-Ban)
// ==============================================================================

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db as qzDb } from './firebase-config.js';

// Conexión directa al proyecto Firestore de Zentry Prospecc CRM (zentryos)
const zentryFirebaseConfig = {
  apiKey: "AIzaSyD36pVBqXzjlxSXmQD0LhVvJpQtvEp1xmk",
  authDomain: "zentryos.firebaseapp.com",
  projectId: "zentryos",
  storageBucket: "zentryos.firebasestorage.app",
  messagingSenderId: "730964985085",
  appId: "1:730964985085:web:56ebd3ff12561d14566a94"
};

let zentryDb = qzDb;
try {
  const existing = getApps().find((a) => a.name === 'zentry-crm-bridge');
  const zentryApp = existing || initializeApp(zentryFirebaseConfig, 'zentry-crm-bridge');
  zentryDb = getFirestore(zentryApp);
} catch (err) {
  console.warn('[TickTool] Fallback a qzDb:', err);
}

const CAMPAIGNS_COL = 'whatsapp_campaigns';
const OUTBOX_COL = 'whatsapp_outbox';
const LEADS_COL = 'leads_expo_maternidad';

// Semilla de respaldo con los leads reales de Zentry Prospecc CRM (Expo M (JA), Expo M (R), Villa Caritas, La Rambla, Hijos F-Rp, MT)
const FALLBACK_LEADS = [
  { id: 'id-fb1', momName: 'Kumar Barrueta', phone: '987806711', origin: 'Expo M (JA)', district: 'San Miguel', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-fb2', momName: 'Susan Espinoza', phone: '987333219', origin: 'Expo M (JA)', district: 'Jesús María', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-fb3', momName: 'Andrés Mur', phone: '949469251', origin: 'Expo M (JA)', district: 'Surco', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-fb4', momName: 'Karin Capelli', phone: '947311449', origin: 'Expo M (JA)', district: 'Miraflores', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-fb5', momName: 'María José Arrunategui', phone: '997619772', origin: 'Expo M (JA)', district: 'San Isidro', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-fb6', momName: 'Mirian Rosales', phone: '981239914', origin: 'Expo M (JA)', district: 'Magdalena', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-c72ca661', momName: 'Cindy Huarcaya Castaneda', phone: '984549686', origin: 'Expo M (JA)', district: 'Bellavista Callao', childAge: 'Menores (-)', interestNotes: '3 hijos, arquitecta' },
  { id: 'id-df2ed100', momName: 'Roxana Castilla', phone: '989886719', origin: 'Expo M (JA)', district: 'Jesús María', childAge: 'Menores (-)', interestNotes: 'Expo Maternidad' },
  { id: 'id-dc74c4f4', momName: 'Yixy Linares', phone: '928162856', origin: 'Expo M (JA)', district: 'San Borja', childAge: 'Ambas', interestNotes: 'Expo Maternidad' },
  { id: 'seed-01', momName: 'Estefani', phone: '989079092', origin: 'Expo M (JA)', district: 'San Miguel', childAge: 'Bebé en camino', interestNotes: 'Expo Maternidad' },
  { id: 'seed-02', momName: 'Mariela', phone: '955153294', origin: 'Expo M (JA)', district: 'Magdalena', childAge: 'Bebé en camino', interestNotes: 'Expo Maternidad' },
  { id: 'seed-03', momName: 'Diana', phone: '986011510', origin: 'Expo M (JA)', district: 'Jesús María', childAge: '1 año', interestNotes: 'Expo Maternidad' },
  { id: 'seed-04', momName: 'Brenda', phone: '984768334', origin: 'Expo M (R)', district: 'Pueblo Libre', childAge: 'Bebé en camino', interestNotes: 'Expo Maternidad' },
  { id: 'seed-05', momName: 'Katy', phone: '940229892', origin: 'Expo M (R)', district: 'Lince', childAge: '2 años', interestNotes: 'Expo Maternidad' },
  { id: 'seed-06', momName: 'Milagros', phone: '947313179', origin: 'Expo M (R)', district: 'Surco', childAge: 'Bebé en camino', interestNotes: 'Expo Maternidad' },
  { id: 'seed-07', momName: 'Fabiola', phone: '997654239', origin: 'Villa Caritas', district: 'La Molina', childAge: '1 año', interestNotes: 'Villa Caritas' },
  { id: 'seed-08', momName: 'Gisela', phone: '989598541', origin: 'Villa Caritas', district: 'San Borja', childAge: 'Bebé en camino', interestNotes: 'Villa Caritas' },
  { id: 'seed-19', momName: 'Paola', phone: '981234567', origin: 'La Rambla', district: 'San Borja', childAge: '4 años', interestNotes: 'Captación La Rambla' },
  { id: 'seed-20', momName: 'Carla', phone: '982345678', origin: 'La Rambla', district: 'Surco', childAge: '5 años', interestNotes: 'Captación La Rambla' },
  { id: 'seed-21', momName: 'Monica', phone: '983456789', origin: 'La Rambla', district: 'San Borja', childAge: '3 años', interestNotes: 'Captación La Rambla' },
  { id: 'seed-34', momName: 'Elena', phone: '961122334', origin: 'Hijos F-Rp', district: 'Miraflores', childAge: '2 años', interestNotes: 'Referido Royal Prestige' },
  { id: 'seed-35', momName: 'Rosa', phone: '962233445', origin: 'Hijos F-Rp', district: 'Surco', childAge: '3 años', interestNotes: 'Referido Royal Prestige' },
  { id: 'seed-36', momName: 'Carmen', phone: '963344556', origin: 'MT', district: 'San Borja', childAge: '1 año', interestNotes: 'Mesa de Trabajo' }
];

const BASE_LEADS_BY_ID = new Map(FALLBACK_LEADS.map((l) => [l.id, l]));

function getOrCreateOperatorId() {
  try {
    let op = localStorage.getItem('zentry_ticktool_operator_id');
    if (!op) {
      op = 'OP-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem('zentry_ticktool_operator_id', op);
    }
    return op;
  } catch (_) {
    return 'OP-LOCAL';
  }
}

// Utilidades de normalización y plantillas
export function normalizePeruPhone(rawPhone = '') {
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) {
    return { valid: true, normalized: `+51${digits}`, cleanDigits: `51${digits}` };
  }
  if (digits.length === 11 && digits.startsWith('519')) {
    return { valid: true, normalized: `+${digits}`, cleanDigits: digits };
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return { valid: true, normalized: `+${digits}`, cleanDigits: digits };
  }
  return { valid: false, normalized: rawPhone || 'Sin número', cleanDigits: digits };
}

export function extractFirstName(fullName = '') {
  const clean = String(fullName).trim();
  if (!clean || clean.toLowerCase() === 'mamá' || clean.toLowerCase() === 'sin nombre') return 'Mamá';
  const first = clean.split(/\s+/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function interpolateTemplate(template = '', vars = {}) {
  return String(template)
    .replace(/\{First Name\}/gi, vars.firstName || 'Mamá')
    .replace(/\{Display Name\}/gi, vars.displayName || 'Mamá')
    .replace(/\{Phone\}/gi, vars.phone || '+51987806711')
    .replace(/\{Origin\}/gi, vars.origin || 'Expo M (JA)')
    .replace(/\{District\}/gi, vars.district || 'Lima')
    .trim();
}

export function getRandomJitterMs(minSec = 45, maxSec = 110) {
  const minMs = minSec * 1000;
  const maxMs = maxSec * 1000;
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const DELAY_LABELS = {
  '1 min': '1 minuto sin respuesta',
  '5 min': '5 minutos sin respuesta',
  '10 min': '10 minutos sin respuesta',
  '15 min': '15 minutos sin respuesta',
  '30 min': '30 minutos sin respuesta',
  '1 hour': '1 hora sin respuesta',
  '6 hours': '6 horas sin respuesta',
  '12 hours': '12 horas sin respuesta',
  '24 hours': '24 horas sin respuesta',
  '2 days': '2 días sin respuesta',
  '3 days': '3 días sin respuesta',
  custom_rel: 'Tiempo personalizado',
  custom_datetime: 'Fecha y hora exacta'
};

const SVG = {
  chat: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  zap: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  layers: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  user: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  inbox: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  cpu: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>',
  tag: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  paperclip: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  file: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  folder: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  send: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  refresh: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  archive: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
  play: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  pause: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
  shield: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
};

const DELAY_MS = {
  '1 min': 1 * 60 * 1000,
  '5 min': 5 * 60 * 1000,
  '10 min': 10 * 60 * 1000,
  '15 min': 15 * 60 * 1000,
  '30 min': 30 * 60 * 1000,
  '1 hour': 1 * 3600 * 1000,
  '6 hours': 6 * 3600 * 1000,
  '12 hours': 12 * 3600 * 1000,
  '24 hours': 24 * 3600 * 1000,
  '2 days': 48 * 3600 * 1000,
  '3 days': 72 * 3600 * 1000
};

function toLocalDateTimeInputValue(ms = Date.now() + 5 * 60 * 1000) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolveFollowUpTiming(fu, baseTimeMs = Date.now()) {
  const preset = fu.delayPreset || '24 hours';
  if (preset === 'custom_datetime' && fu.customDateTime) {
    const parsedMs = new Date(fu.customDateTime).getTime();
    if (Number.isFinite(parsedMs)) {
      const diffMs = Math.max(5000, parsedMs - baseTimeMs);
      const formatted = new Date(parsedMs).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
      return {
        scheduledForMs: parsedMs,
        delayMs: diffMs,
        useJitter: false,
        displayLabel: `📅 ${formatted}`
      };
    }
  }

  if (preset === 'custom_rel') {
    const val = Math.max(1, Number(fu.customValue) || 5);
    const unit = fu.customUnit || 'minutes';
    const unitMult = unit === 'days' ? 86400000 : unit === 'hours' ? 3600000 : 60000;
    const delayMs = val * unitMult;
    const unitLabel = unit === 'days' ? 'día(s)' : unit === 'hours' ? 'hora(s)' : 'min';
    return {
      scheduledForMs: baseTimeMs + delayMs,
      delayMs,
      useJitter: delayMs > 30 * 60 * 1000,
      displayLabel: `${val} ${unitLabel}`
    };
  }

  const delayMs = DELAY_MS[preset] || 24 * 3600 * 1000;
  return {
    scheduledForMs: baseTimeMs + delayMs,
    delayMs,
    useJitter: delayMs > 30 * 60 * 1000,
    displayLabel: preset
  };
}

// Estado reactivo interno del módulo Tick Tool en QZ-Hub
const tickState = {
  embedMode: 'native', // 'native' | 'iframe'
  activeTab: 'wizard', // 'wizard' | 'outbox' | 'preview'
  step: 1, // 1: Audience, 2: Message & Follow-ups, 3: Timing, 4: Review & Save
  leads: [...FALLBACK_LEADS],
  crmSyncedFromIframe: false,
  crmSelectedIds: [],
  audienceMode: 'origin', // 'origin' | 'manual'
  selectedOrigins: ['Expo M (JA)'],
  manualLeadIds: new Set(FALLBACK_LEADS.filter((l) => l.origin === 'Expo M (JA)').map((l) => l.id)),
  campaignName: 'Campaña VIP Expo Maternidad — ZentryOS',
  initialMessage:
    '¡Hola {First Name}! 👋 Qué gusto saludarte, soy Jose Angel del equipo de ZentryOS (conversamos en {Origin}). Te escribo para enviarte el acceso exclusivo a la evaluación familiar y coordinar tu demostración personalizada en {District}. ¿Te queda mejor hoy por la tarde o mañana?',
  followUps: [
    {
      id: 'fu-1',
      stepOrder: 1,
      delayPreset: '5 min',
      delayMs: 5 * 60 * 1000,
      customValue: 5,
      customUnit: 'minutes',
      customDateTime: toLocalDateTimeInputValue(Date.now() + 5 * 60 * 1000),
      messageTemplate:
        'Hola {First Name} ✨, paso por aquí rapidito por si no llegaste a ver mi mensaje anterior. Aún tengo 2 cupos esta semana para las familias de {Origin}. Avísame si te gustaría agendarlo.'
    }
  ],
  stopOnReply: true,
  previewLeadIndex: 0,
  scheduleMode: 'now_jitter', // 'now_jitter' | 'scheduled'
  scheduledDateTime: toLocalDateTimeInputValue(Date.now() + 3600 * 1000),
  jitterMinSec: 45,
  jitterMaxSec: 110,
  dailyBatchLimit: 35,
  campaigns: [],
  outbox: [],
  outboxFilter: 'all', // 'all' | 'pending' | 'dispatched' | 'replied' | 'cancelled' | 'archived'
  outboxCampaignFilter: 'all',
  outboxSearch: '',
  selectedOutboxIds: new Set(),
  archivedOutboxIds: new Set(
    (() => {
      try {
        return JSON.parse(localStorage.getItem('zentry_archived_outbox_v1') || '[]');
      } catch (_) {
        return [];
      }
    })()
  ),
  audienceSearch: '',
  audienceExpanded: false,
  audienceScrollPct: 0,
  isSaving: false,
  saveFeedback: null,
  // Estado real de conexión con la extensión Chrome MV3 y WhatsApp Web local
  operatorId: getOrCreateOperatorId(),
  extInstalled: false,
  waConnected: false,
  waSessionInfo: null,
  lastPingAt: null,
  // Adjuntos para Campañas (Wizard Paso 2 y Follow-ups) y para Envío Individual
  campaignAttachments: [], // [{ id, name, size, mimeType, dataUrl }]
  indivAttachments: [], // [{ id, name, size, mimeType, dataUrl }]
  // Agenda de Contactos capturada de WhatsApp Web + Envío Individual
  waAgendaContacts: [],
  agendaSearchQuery: '',
  indivSelectedContactName: 'Berta Albaracin / Ref Margarita Morán / Royal',
  indivSelectedPhone: '989925110',
  indivMessage:
    'Hola Berta 👋, te escribo desde ZentryOS para confirmar tu información. ¿Cómo estás?',
  indivSendMode: 'now', // 'now' | 'delay_10s' | 'scheduled'
  indivScheduledDateTime: new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16),
  testPhoneInput: '987806711',
  simRunning: false,
  simTimer: null,
  simProgress: 0,
  simCurrentJitterSec: 68,
  simLogs: [
    '[12:00:02] zentry-ws-dispatcher (Manifest V3 v1.3) listo para handshake.',
    '[12:00:04] Conectado a Firestore: whatsapp_campaigns & whatsapp_outbox.',
    '[12:00:05] Soporte de Archivos Adjuntos (Imágenes, PDFs, Videos) + Envío 0s activo.'
  ],
  unsubLeads: null,
  unsubCampaigns: null,
  unsubOutbox: null
};

function formatAttachmentSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readFilesAsAttachmentObjects(fileList) {
  const files = Array.from(fileList || []);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: file.name,
              size: file.size,
              mimeType: file.type || 'application/octet-stream',
              dataUrl: String(reader.result || '')
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        })
    )
  ).then((list) => list.filter(Boolean));
}

function appendSimLog(line) {
  const ts = new Date().toLocaleTimeString('es-PE', { hour12: false });
  tickState.simLogs = [`[${ts}] ${line}`, ...tickState.simLogs.slice(0, 24)];
}

function getSelectedLeads() {
  if (tickState.audienceMode === 'origin') {
    if (tickState.selectedOrigins.length === 0) return tickState.leads;
    return tickState.leads.filter((l) => tickState.selectedOrigins.includes(l.origin || 'Expo M (JA)'));
  }
  return tickState.leads.filter((l) => tickState.manualLeadIds.has(l.id));
}

function getValidSelectedLeads() {
  return getSelectedLeads().filter((l) => normalizePeruPhone(l.phone).valid);
}

function getOriginSummary() {
  const map = new Map();
  tickState.leads.forEach((l) => {
    const key = l.origin || 'Expo M (JA)';
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries());
}

export function renderTickToolCardHTML() {
  return `
    <div class="tick-tool-embedded-section" style="background: #ffffff; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 14px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04); overflow: hidden; display: flex; flex-direction: column;">
      
      <!-- Tick Tool Barra Superior / Acciones -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 14px 18px; background: linear-gradient(90deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.97) 100%); border-bottom: 1px solid rgba(16, 185, 129, 0.25);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);">
            ${SVG.chat}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 14.5px; color: #f8fafc; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              Tick Tool — Campañas WhatsApp
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; display: inline-block;"></span> Activo
              </span>
            </div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="tick-toggle-mode-btn" type="button" style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 8px; border: 1px solid rgba(148, 163, 184, 0.3); background: rgba(30, 41, 59, 0.9); color: #e2e8f0; font-size: 11.5px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">
            ${SVG.zap} <span>Cambiar Vista</span>
          </button>
          <a href="https://zentry-prospecc.web.app/?view=tick-tool" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; border: none; background: #10b981; color: #052e16; font-size: 11.5px; font-weight: 700; text-decoration: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);">
            <span>↗ Abrir</span>
          </a>
        </div>
      </div>

      <!-- Contenedor Principal de Tick Tool -->
      <div id="tick-tool-root" style="position: relative; width: 100%; height: 750px; min-height: 550px; background: #f8fafc; overflow-y: auto; display: flex; flex-direction: column;">
      </div>
    </div>
  `;
}

function renderTickToolBody() {
  const root = document.getElementById('tick-tool-root');
  if (!root) return;

  if (tickState.embedMode === 'iframe') {
    root.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 14px; background:#eff6ff; border-bottom:1px solid #bfdbfe; font-size:11.5px; color:#1e40af;">
        <span>Modo Embed Remoto</span>
        <button id="tick-back-native-btn" type="button" style="padding:3px 10px; border-radius:6px; border:1px solid #3b82f6; background:#ffffff; color:#1d4ed8; font-weight:600; font-size:11px; cursor:pointer;">Volver a Consola Nativa</button>
      </div>
      <iframe
        src="https://zentry-prospecc.web.app/?view=tick-tool"
        title="Tick Tool - ZentryOS"
        style="width:100%; flex:1; border:none; display:block;"
        allow="clipboard-read; clipboard-write;"
      ></iframe>
    `;
    const backBtn = document.getElementById('tick-back-native-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        tickState.embedMode = 'native';
        renderTickToolBody();
      });
    }
    return;
  }

  const validLeads = getValidSelectedLeads();
  const previewLead = validLeads[tickState.previewLeadIndex] || validLeads[0] || tickState.leads[0] || {
    momName: 'Kumar Barrueta',
    phone: '987806711',
    origin: 'Expo M (JA)',
    district: 'San Miguel'
  };
  const normPreviewPhone = normalizePeruPhone(previewLead.phone).normalized || '+51987806711';
  const previewVars = {
    firstName: extractFirstName(previewLead.momName),
    displayName: previewLead.momName || 'Kumar Barrueta',
    phone: normPreviewPhone,
    origin: previewLead.origin || 'Expo M (JA)',
    district: previewLead.district || 'Lima'
  };

  const isItemArchived = (m) => Boolean(m.archived || tickState.archivedOutboxIds.has(m.id));
  const activeOutboxList = tickState.outbox.filter((m) => !isItemArchived(m));
  const pendingCount = activeOutboxList.filter((m) => m.status === 'pending').length;
  const dispatchedCount = activeOutboxList.filter((m) => m.status === 'dispatched').length;
  const repliedCount = activeOutboxList.filter((m) => m.status === 'replied').length;
  const cancelledCount = activeOutboxList.filter((m) => m.status === 'cancelled').length;

  // Diagnóstico en tiempo real de la conexión con la extensión Chrome local y WhatsApp Web
  const extBadge = tickState.extInstalled
    ? tickState.waConnected
      ? {
          bg: '#ecfdf5',
          border: '#6ee7b7',
          color: '#065f46',
          dot: '#10b981',
          text: 'WhatsApp Web Conectado'
        }
      : {
          bg: '#fffbeb',
          border: '#fde68a',
          color: '#92400e',
          dot: '#f59e0b',
          text: 'Extensión Activa · Abre web.whatsapp.com'
        }
    : {
        bg: '#fef2f2',
        border: '#fecaca',
        color: '#991b1b',
        dot: '#ef4444',
        text: 'Extensión No Detectada'
      };

  root.innerHTML = `
    <!-- Sub-Navegación Interna de Tick Tool -->
    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 16px; background:#ffffff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; z-index:10;">
      <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
        <button data-tick-tab="wizard" class="tick-tab-btn" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:none; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${
          tickState.activeTab === 'wizard'
            ? 'background:#0f172a; color:#ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.18);'
            : 'background:#f1f5f9; color:#475569;'
        }">
          ${SVG.layers} Campañas
        </button>
        <button data-tick-tab="individual" class="tick-tab-btn" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:none; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${
          tickState.activeTab === 'individual'
            ? 'background:#059669; color:#ffffff; box-shadow:0 2px 6px rgba(5,150,105,0.28);'
            : 'background:#ecfdf5; color:#065f46; border:1px solid #6ee7b7;'
        }">
          ${SVG.user} Individual
        </button>
        <button data-tick-tab="outbox" class="tick-tab-btn" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:none; transition:all 0.15s; display:inline-flex; align-items:center; gap:6px; ${
          tickState.activeTab === 'outbox'
            ? 'background:#0f172a; color:#ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.18);'
            : 'background:#f1f5f9; color:#475569;'
        }">
          ${SVG.inbox} Cola
          <span style="padding:1px 6px; border-radius:999px; font-size:10px; background:${
            pendingCount > 0 ? '#10b981' : '#cbd5e1'
          }; color:${pendingCount > 0 ? '#052e16' : '#334155'};">${activeOutboxList.length}</span>
        </button>
        <button data-tick-tab="preview" class="tick-tab-btn" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:none; transition:all 0.15s; display:inline-flex; align-items:center; gap:5px; ${
          tickState.activeTab === 'preview'
            ? 'background:#0f172a; color:#ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.18);'
            : 'background:#f1f5f9; color:#475569;'
        }">
          ${SVG.cpu} Extensión
        </button>
      </div>

      <div style="display:flex; align-items:center; gap:8px; font-size:11px; color:#475569;">
        <span style="padding:3px 8px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; font-weight:600;">
          Seleccionados: <strong style="color:#059669;">${validLeads.length}</strong>/${tickState.leads.length}
        </span>
      </div>
    </div>

    <!-- Barra de Validación de Conexión WhatsApp Web -->
    <div style="margin:10px 16px 0; padding:9px 12px; border-radius:10px; background:${extBadge.bg}; border:1px solid ${extBadge.border}; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span style="width:8px; height:8px; border-radius:50%; background:${extBadge.dot}; display:inline-block;"></span>
        <span style="font-size:11.5px; font-weight:800; color:${extBadge.color};">${extBadge.text}</span>
        <span style="padding:2px 7px; border-radius:6px; background:rgba(15,23,42,0.08); color:#334155; font-family:monospace; font-size:10.5px; font-weight:700;">
          ${tickState.operatorId}
        </span>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <button type="button" id="tick-verify-ws-btn" style="padding:4px 9px; border-radius:6px; border:1px solid #059669; background:#ffffff; color:#065f46; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
          ${SVG.refresh} Validar
        </button>
        <button type="button" id="tick-quick-test-ws-btn" style="padding:4px 9px; border-radius:6px; border:none; background:#0f172a; color:#ffffff; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="Envía un mensaje automático inmediato al contacto en vista previa">
          ${SVG.zap} Probar: ${previewVars.firstName}
        </button>
      </div>
    </div>

    ${
      tickState.saveFeedback
        ? `<div style="margin:10px 16px 0; padding:10px 14px; border-radius:10px; background:#ecfdf5; border:1px solid #6ee7b7; color:#065f46; font-size:12px; font-weight:600; display:flex; align-items:center; justify-content:space-between;">
            <span>✓ ${tickState.saveFeedback}</span>
            <button id="tick-close-feedback" style="background:none; border:none; color:#047857; font-weight:700; cursor:pointer;">✕</button>
          </div>`
        : ''
    }

    <!-- Contenido Dinámico según Tab -->
    <div style="padding:14px 16px; flex:1; display:flex; flex-direction:column; gap:14px;">
      ${
        tickState.activeTab === 'wizard'
          ? renderWizardTabHTML(validLeads, previewLead, previewVars)
          : tickState.activeTab === 'individual'
          ? renderIndividualAgendaTabHTML()
          : tickState.activeTab === 'outbox'
          ? renderOutboxTabHTML(pendingCount, dispatchedCount, repliedCount, cancelledCount)
          : renderPreviewTabHTML(validLeads, previewLead, previewVars, pendingCount, dispatchedCount, repliedCount)
      }
    </div>
  `;

  bindTickToolEvents();
}

function renderWizardTabHTML(validLeads, previewLead, previewVars) {
  const origins = getOriginSummary();
  const steps = [
    { num: 1, title: '1. Audiencia', sub: `${validLeads.length} válidos` },
    { num: 2, title: '2. Mensaje', sub: `${1 + tickState.followUps.length} pasos` },
    { num: 3, title: '3. Envío', sub: `${tickState.jitterMinSec}-${tickState.jitterMaxSec}s` },
    { num: 4, title: '4. Confirmar', sub: `Lote ${tickState.dailyBatchLimit}/día` }
  ];

  return `
    <!-- Stepper de 4 Pasos -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px;">
      ${steps
        .map(
          (s) => `
        <button type="button" data-tick-step="${s.num}" class="tick-step-btn" style="text-align:left; padding:9px 10px; border-radius:10px; border:1px solid ${
            tickState.step === s.num
              ? '#10b981'
              : tickState.step > s.num
              ? '#a7f3d0'
              : '#e2e8f0'
          }; background:${
            tickState.step === s.num
              ? '#ecfdf5'
              : tickState.step > s.num
              ? '#f0fdf4'
              : '#ffffff'
          }; cursor:pointer; transition:all 0.15s;">
          <div style="font-size:11.5px; font-weight:700; color:${
            tickState.step === s.num ? '#065f46' : '#1e293b'
          };">${s.title}</div>
          <div style="font-size:10px; color:#64748b; margin-top:2px;">${s.sub}</div>
        </button>
      `
        )
        .join('')}
    </div>

    ${
      tickState.step === 1
        ? (() => {
            const q = String(tickState.audienceSearch || '').trim().toLowerCase();
            const isLeadChecked = (lead) =>
              tickState.audienceMode === 'origin'
                ? tickState.selectedOrigins.includes(lead.origin || 'Expo M (JA)')
                : tickState.manualLeadIds.has(lead.id);

            const filteredLeads = tickState.leads.filter((lead) => {
              if (!q) return true;
              const p = normalizePeruPhone(lead.phone);
              return (
                String(lead.momName || '').toLowerCase().includes(q) ||
                String(lead.phone || '').toLowerCase().includes(q) ||
                String(p.normalized || '').toLowerCase().includes(q) ||
                String(lead.origin || '').toLowerCase().includes(q) ||
                String(lead.district || '').toLowerCase().includes(q)
              );
            });

            // Ordenar para que los contactos del grupo seleccionado o marcados aparezcan SIEMPRE de primeros
            const sortedLeads = [...filteredLeads].sort((a, b) => {
              const aChecked = isLeadChecked(a) ? 1 : 0;
              const bChecked = isLeadChecked(b) ? 1 : 0;
              if (aChecked !== bChecked) return bChecked - aChecked;
              const aOriginIdx = tickState.selectedOrigins.indexOf(a.origin || 'Expo M (JA)');
              const bOriginIdx = tickState.selectedOrigins.indexOf(b.origin || 'Expo M (JA)');
              if (aOriginIdx !== -1 && bOriginIdx !== -1 && aOriginIdx !== bOriginIdx) {
                return aOriginIdx - bOriginIdx;
              }
              return 0;
            });

            const checkedVisibleCount = sortedLeads.filter((l) => isLeadChecked(l)).length;
            const tableMaxHeight = tickState.audienceExpanded ? '560px' : '260px';

            return `
      <!-- PASO 1: AUDIENCE -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:13.5px; font-weight:700; color:#0f172a;">Paso 1: Selección de Audiencia</div>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" id="tick-aud-origin" style="padding:5px 10px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px; border:1px solid ${
              tickState.audienceMode === 'origin' ? '#533b87' : '#cbd5e1'
            }; background:${tickState.audienceMode === 'origin' ? '#533b87' : '#ffffff'}; color:${
              tickState.audienceMode === 'origin' ? '#ffffff' : '#334155'
            };">${SVG.tag} Por Grupo</button>
            <button type="button" id="tick-aud-manual" style="padding:5px 10px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; border:1px solid ${
              tickState.audienceMode === 'manual' ? '#533b87' : '#cbd5e1'
            }; background:${tickState.audienceMode === 'manual' ? '#533b87' : '#ffffff'}; color:${
              tickState.audienceMode === 'manual' ? '#ffffff' : '#334155'
            };">Manual: ${tickState.manualLeadIds.size}</button>
            <button type="button" id="tick-aud-expand-btn" style="padding:5px 11px; border-radius:7px; font-size:11px; font-weight:800; cursor:pointer; border:1px solid ${
              tickState.audienceExpanded ? '#10b981' : '#94a3b8'
            }; background:${tickState.audienceExpanded ? '#ecfdf5' : '#0f172a'}; color:${
              tickState.audienceExpanded ? '#065f46' : '#ffffff'
            }; display:inline-flex; align-items:center; gap:5px;">
              ${tickState.audienceExpanded ? 'Compactar' : 'Expandir'}
            </button>
          </div>
        </div>

        ${
          tickState.audienceMode === 'origin'
            ? `
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(145px, 1fr)); gap:8px;">
            ${origins
              .map(([originName, count]) => {
                const active = tickState.selectedOrigins.includes(originName);
                return `
                <button type="button" data-origin-toggle="${originName}" class="tick-origin-chip" style="padding:10px 12px; border-radius:10px; border:1.5px solid ${
                  active ? '#10b981' : '#e2e8f0'
                }; background:${
                  active ? '#ecfdf5' : '#f8fafc'
                }; display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
                  <div style="text-align:left;">
                    <div style="font-size:12px; font-weight:700; color:#0f172a;">${originName}</div>
                  </div>
                  <span style="padding:2px 8px; border-radius:999px; font-size:11px; font-weight:700; background:${
                    active ? '#10b981' : '#e2e8f0'
                  }; color:${active ? '#ffffff' : '#334155'};">${count}</span>
                </button>
              `;
              })
              .join('')}
          </div>
        `
            : ''
        }

        <!-- Barra de Buscador + Selección Rápida -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; padding:10px 12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
          <div style="position:relative; flex:1; min-width:210px;">
            <input
              type="text"
              id="tick-aud-search-input"
              value="${(tickState.audienceSearch || '').replace(/"/g, '&quot;')}"
              placeholder="Buscar lead por nombre, teléfono, grupo o distrito..."
              style="width:100%; padding:7px 28px 7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:11.5px; background:#ffffff; color:#0f172a; box-sizing:border-box;"
            />
            ${
              tickState.audienceSearch
                ? `<button type="button" id="tick-aud-search-clear" title="Limpiar búsqueda" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); border:none; background:none; color:#64748b; font-weight:800; cursor:pointer; font-size:11px;">✕</button>`
                : ''
            }
          </div>
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-size:11px; color:#065f46; background:#ecfdf5; border:1px solid #a7f3d0; padding:4px 8px; border-radius:6px; font-weight:700;">
              ${checkedVisibleCount} seleccionados / ${sortedLeads.length} visibles
            </span>
            <button type="button" id="tick-sel-all" style="padding:5px 9px; border-radius:6px; border:1px solid #a7f3d0; background:#ffffff; color:#059669; font-weight:700; cursor:pointer; font-size:11px;">Marcar visibles</button>
            <button type="button" id="tick-sel-none" style="padding:5px 9px; border-radius:6px; border:1px solid #fecaca; background:#ffffff; color:#dc2626; font-weight:700; cursor:pointer; font-size:11px;">Limpiar</button>
          </div>
        </div>

        <!-- Tabla de validación de WhatsApp Perú -->
        <div id="tick-aud-table-wrap" style="max-height:${tableMaxHeight}; overflow-y:auto; border:1px solid #e2e8f0; border-radius:8px; scroll-behavior:auto; transition:max-height 0.2s ease;">
          <table style="width:100%; border-collapse:collapse; font-size:11.5px;">
            <thead style="background:#f1f5f9; position:sticky; top:0; z-index:2;">
              <tr>
                <th style="padding:7px 10px; text-align:left; color:#475569; width:30px;">✓</th>
                <th style="padding:7px 10px; text-align:left; color:#475569;">Contacto</th>
                <th style="padding:7px 10px; text-align:left; color:#475569;">WhatsApp</th>
                <th style="padding:7px 10px; text-align:left; color:#475569;">Grupo</th>
                <th style="padding:7px 10px; text-align:left; color:#475569;">Distrito</th>
              </tr>
            </thead>
            <tbody>
              ${
                sortedLeads.length === 0
                  ? `<tr><td colspan="5" style="padding:22px; text-align:center; color:#64748b;">No se encontraron leads con "${tickState.audienceSearch}".</td></tr>`
                  : sortedLeads
                      .map((lead) => {
                        const p = normalizePeruPhone(lead.phone);
                        const checked = isLeadChecked(lead);
                        return `
                  <tr style="border-top:1px solid #f1f5f9; background:${checked ? '#f0fdf4' : '#ffffff'};">
                    <td style="padding:6px 10px;">
                      <input type="checkbox" data-lead-check="${lead.id}" ${checked ? 'checked' : ''} style="cursor:pointer; accent-color:#10b981;" />
                    </td>
                    <td style="padding:6px 10px; font-weight:600; color:#0f172a;">
                      ${lead.momName || 'Sin nombre'}
                    </td>
                    <td style="padding:6px 10px; font-family:monospace; color:${p.valid ? '#059669' : '#dc2626'};">${p.normalized} ${p.valid ? '✓' : '✕'}</td>
                    <td style="padding:6px 10px;"><span style="padding:1px 6px; border-radius:6px; background:${checked ? '#d1fae5' : '#ede9fe'}; color:${checked ? '#065f46' : '#5b21b6'}; font-size:10.5px; font-weight:700;">${lead.origin || 'General'}</span></td>
                    <td style="padding:6px 10px; color:#64748b;">${lead.district || '-'}</td>
                  </tr>
                `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
          })()
        : ''
    }

    ${
      tickState.step === 2
        ? `
      <!-- PASO 2: MESSAGE & FOLLOW-UPS -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:13.5px; font-weight:700; color:#0f172a;">Paso 2: Mensaje Inicial & Árbol de Follow-ups</div>
            <div style="font-size:11.5px; color:#64748b;">Inserta variables dinámicas y encadena mensajes automáticos si el prospecto no responde.</div>
          </div>
          <label style="display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:#065f46; background:#ecfdf5; padding:5px 10px; border-radius:8px; border:1px solid #6ee7b7; cursor:pointer;">
            <input type="checkbox" id="tick-stop-on-reply" ${tickState.stopOnReply ? 'checked' : ''} style="accent-color:#10b981;" />
            🛑 Detener si el prospecto responde
          </label>
        </div>

        <!-- Botones de Variables Dinámicas -->
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <span style="font-size:11px; color:#64748b; font-weight:600;">Variables:</span>
          ${['{First Name}', '{Display Name}', '{Phone}', '{Origin}', '{District}']
            .map(
              (v) => `
            <button type="button" data-insert-var="${v}" class="tick-var-btn" style="padding:3px 8px; border-radius:6px; border:1px solid #c4b5fd; background:#f5f3ff; color:#5b21b6; font-size:11px; font-family:monospace; font-weight:700; cursor:pointer;">
              + ${v}
            </button>
          `
            )
            .join('')}
        </div>

        <textarea id="tick-initial-msg" rows="4" style="width:100%; border-radius:10px; border:1px solid #cbd5e1; padding:10px; font-size:12.5px; font-family:inherit; resize:vertical; box-sizing:border-box;">${tickState.initialMessage}</textarea>

        <!-- Adjuntar Archivos al Mensaje Inicial de la Campaña (Imágenes, PDF, Video, Brochure) -->
        <div style="background:#f8fafc; border:1.5px dashed #10b981; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:7px;">
              <span style="font-size:15px;">📎</span>
              <div>
                <div style="font-size:12px; font-weight:800; color:#0f172a;">Adjuntar Archivos a la Campaña (Imágenes, PDF, Brochure, Video)</div>
                <div style="font-size:10.5px; color:#64748b;">La extensión adjuntará y enviará automáticamente tus archivos junto con el texto en WhatsApp Web.</div>
              </div>
            </div>
            <label style="padding:6px 12px; border-radius:8px; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px; box-shadow:0 2px 6px rgba(16,185,129,0.25);">
              <span>📁 Seleccionar Archivos</span>
              <input type="file" id="tick-campaign-files-input" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,video/*,audio/*" style="display:none;" />
            </label>
          </div>

          ${
            tickState.campaignAttachments && tickState.campaignAttachments.length > 0
              ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:2px;">
              ${tickState.campaignAttachments
                .map(
                  (att) => `
                <div style="display:inline-flex; align-items:center; gap:8px; padding:5px 9px; border-radius:8px; background:#ffffff; border:1px solid #a7f3d0; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
                  ${
                    att.mimeType && att.mimeType.startsWith('image/')
                      ? `<img src="${att.dataUrl}" alt="${att.name}" style="width:28px; height:28px; object-fit:cover; border-radius:5px; border:1px solid #cbd5e1;" />`
                      : `<span style="font-size:16px;">${att.mimeType && att.mimeType.includes('pdf') ? '📄' : att.mimeType && att.mimeType.startsWith('video/') ? '🎬' : '📎'}</span>`
                  }
                  <div style="max-width:170px;">
                    <div style="font-size:11px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${att.name}</div>
                    <div style="font-size:9.5px; color:#059669; font-weight:600;">${formatAttachmentSize(att.size)}</div>
                  </div>
                  <button type="button" data-remove-camp-att="${att.id}" title="Quitar archivo" style="background:#fee2e2; border:none; color:#dc2626; width:20px; height:20px; border-radius:50%; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
                </div>
              `
                )
                .join('')}
            </div>
          `
              : `<div style="font-size:10.5px; color:#94a3b8; font-style:italic;">Sin archivos adjuntos aún. Haz clic en "📁 Seleccionar Archivos" para incluir fotos, flyers o catálogos PDF.</div>`
          }
        </div>

        <!-- Lista de Follow-ups encadenados -->
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${tickState.followUps
            .map(
              (fu, idx) => {
                const resolvedFu = resolveFollowUpTiming(fu, Date.now());
                return `
            <div style="background:#f8fafc; border:1px dashed #94a3b8; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span style="padding:2px 8px; border-radius:999px; background:#0f172a; color:#ffffff; font-size:10.5px; font-weight:700;">Follow-up #${idx + 1}</span>
                  <span style="font-size:11px; color:#475569; font-weight:600;">Si no responde tras:</span>
                  <select data-fu-delay="${fu.id}" style="padding:4px 8px; border-radius:6px; border:1px solid #cbd5e1; font-size:11px; font-weight:700; background:#ffffff; color:#0f172a;">
                    ${Object.keys(DELAY_LABELS)
                      .map(
                        (k) => `<option value="${k}" ${fu.delayPreset === k ? 'selected' : ''}>${DELAY_LABELS[k]}</option>`
                      )
                      .join('')}
                  </select>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <label style="padding:3px 8px; border-radius:6px; border:1px solid #10b981; background:#ecfdf5; color:#065f46; font-size:10.5px; font-weight:700; cursor:pointer;">
                    📎 Adjuntar a Follow-up
                    <input type="file" data-fu-file-input="${fu.id}" multiple accept="image/*,.pdf,.doc,.docx,video/*" style="display:none;" />
                  </label>
                  <button type="button" data-fu-remove="${fu.id}" style="background:none; border:none; color:#dc2626; font-size:11px; font-weight:700; cursor:pointer;">🗑️ Quitar</button>
                </div>
              </div>

              <!-- Controles de Precisión de Tiempo del Follow-up (Minutos exactos o Calendario Fecha/Hora) -->
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; background:#ffffff; padding:7px 10px; border-radius:8px; border:1px solid #e2e8f0;">
                ${
                  fu.delayPreset === 'custom_rel'
                    ? `
                  <span style="font-size:11px; font-weight:700; color:#0f172a;">⏱️ Enviar exactamente tras:</span>
                  <input type="number" data-fu-custom-val="${fu.id}" value="${fu.customValue ?? 5}" min="1" max="10080" style="width:68px; padding:4px 7px; border-radius:6px; border:1px solid #10b981; font-size:11.5px; font-weight:800; color:#0f172a;" />
                  <select data-fu-custom-unit="${fu.id}" style="padding:4px 8px; border-radius:6px; border:1px solid #cbd5e1; font-size:11px; font-weight:700;">
                    <option value="minutes" ${(fu.customUnit || 'minutes') === 'minutes' ? 'selected' : ''}>minutos después</option>
                    <option value="hours" ${fu.customUnit === 'hours' ? 'selected' : ''}>horas después</option>
                    <option value="days" ${fu.customUnit === 'days' ? 'selected' : ''}>días después</option>
                  </select>
                `
                    : ''
                }
                ${
                  fu.delayPreset === 'custom_datetime'
                    ? `
                  <span style="font-size:11px; font-weight:700; color:#0f172a;">📅 Elegir Fecha y Hora exacta:</span>
                  <input type="datetime-local" data-fu-custom-dt="${fu.id}" value="${fu.customDateTime || toLocalDateTimeInputValue(Date.now() + 5 * 60 * 1000)}" style="padding:4px 8px; border-radius:6px; border:1.5px solid #10b981; font-size:11.5px; font-weight:700; color:#0f172a;" />
                `
                    : ''
                }
                <div style="display:flex; align-items:center; gap:5px; margin-left:auto;">
                  <span style="font-size:10px; color:#64748b; font-weight:600;">Atajos rápidos:</span>
                  ${['1 min', '5 min', '15 min', '1 hour', '24 hours']
                    .map(
                      (qPreset) => `
                    <button type="button" data-fu-quick-preset="${fu.id}" data-preset-val="${qPreset}" style="padding:2px 7px; border-radius:5px; border:1px solid ${
                        fu.delayPreset === qPreset ? '#10b981' : '#cbd5e1'
                      }; background:${fu.delayPreset === qPreset ? '#ecfdf5' : '#f8fafc'}; color:${
                        fu.delayPreset === qPreset ? '#047857' : '#334155'
                      }; font-size:10px; font-weight:700; cursor:pointer;">${qPreset}</button>
                  `
                    )
                    .join('')}
                  <button type="button" data-fu-quick-preset="${fu.id}" data-preset-val="custom_datetime" style="padding:2px 7px; border-radius:5px; border:1px solid ${
                    fu.delayPreset === 'custom_datetime' ? '#10b981' : '#cbd5e1'
                  }; background:${fu.delayPreset === 'custom_datetime' ? '#ecfdf5' : '#f8fafc'}; color:${
                    fu.delayPreset === 'custom_datetime' ? '#047857' : '#334155'
                  }; font-size:10px; font-weight:700; cursor:pointer;">📅 Fecha/Hora</button>
                </div>
              </div>

              <textarea data-fu-msg="${fu.id}" rows="2" style="width:100%; border-radius:8px; border:1px solid #cbd5e1; padding:8px; font-size:12px; font-family:inherit; box-sizing:border-box;">${fu.messageTemplate}</textarea>
              ${
                Array.isArray(fu.attachments) && fu.attachments.length > 0
                  ? `<div style="display:flex; flex-wrap:wrap; gap:6px;">
                      ${fu.attachments
                        .map(
                          (att) => `
                        <span style="display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:6px; background:#ffffff; border:1px solid #cbd5e1; font-size:10.5px; font-weight:600; color:#334155;">
                          📎 ${att.name} (${formatAttachmentSize(att.size)})
                          <button type="button" data-remove-fu-att="${fu.id}" data-att-id="${att.id}" style="background:none; border:none; color:#dc2626; font-weight:800; cursor:pointer;">✕</button>
                        </span>
                      `
                        )
                        .join('')}
                    </div>`
                  : ''
              }
              <div style="font-size:10px; color:#059669; font-weight:700;">
                ✓ Programación calculada: <strong>${resolvedFu.displayLabel}</strong> ${
                  resolvedFu.useJitter ? '(+ pausa anti-ban)' : '(precisión exacta al minuto, sin espera extra)'
                }
              </div>
            </div>
          `;
              }
            )
            .join('')}
        </div>

        <div>
          <button type="button" id="tick-add-followup" style="padding:6px 12px; border-radius:8px; border:1px dashed #10b981; background:#ecfdf5; color:#047857; font-size:11.5px; font-weight:700; cursor:pointer;">
            + Añadir Follow-up Automático
          </button>
        </div>
      </div>
    `
        : ''
    }

    ${
      tickState.step === 3
        ? `
      <!-- PASO 3: TIMING & ANTI-BAN JITTER -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:14px;">
        <div>
          <div style="font-size:13.5px; font-weight:700; color:#0f172a;">Paso 3: ¿Cuándo enviar y cómo proteger tu número de WhatsApp?</div>
          <div style="font-size:11.5px; color:#64748b;">El <strong>1er contacto sale de inmediato (0 seg)</strong>. Si envías a varios contactos, el sistema hace una pausa aleatoria humana entre cada persona para que WhatsApp nunca bloquee tu cuenta.</div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <label style="padding:10px 12px; border-radius:10px; border:1.5px solid ${
            tickState.scheduleMode === 'now_jitter' ? '#10b981' : '#e2e8f0'
          }; background:${tickState.scheduleMode === 'now_jitter' ? '#ecfdf5' : '#f8fafc'}; cursor:pointer; display:flex; align-items:flex-start; gap:8px;">
            <input type="radio" name="tick-sched-mode" value="now_jitter" ${
              tickState.scheduleMode === 'now_jitter' ? 'checked' : ''
            } style="margin-top:3px; accent-color:#10b981;" />
            <div>
              <div style="font-size:12px; font-weight:700; color:#0f172a;">⚡ Enviar ahora (1er mensaje inmediato)</div>
              <div style="font-size:10.5px; color:#64748b;">El primer contacto se envía al instante y los siguientes con pausa segura.</div>
            </div>
          </label>

          <label style="padding:10px 12px; border-radius:10px; border:1.5px solid ${
            tickState.scheduleMode === 'scheduled' ? '#10b981' : '#e2e8f0'
          }; background:${tickState.scheduleMode === 'scheduled' ? '#ecfdf5' : '#f8fafc'}; cursor:pointer; display:flex; align-items:flex-start; gap:8px;">
            <input type="radio" name="tick-sched-mode" value="scheduled" ${
              tickState.scheduleMode === 'scheduled' ? 'checked' : ''
            } style="margin-top:3px; accent-color:#10b981;" />
            <div>
              <div style="font-size:12px; font-weight:700; color:#0f172a;">📅 Programar fecha y hora</div>
              <div style="font-size:10.5px; color:#64748b;">Deja programado el envío para que arranque a una hora exacta.</div>
            </div>
          </label>
        </div>

        ${
          tickState.scheduleMode === 'scheduled'
            ? `
          <div>
            <label style="font-size:11.5px; font-weight:600; color:#334155; display:block; margin-bottom:4px;">Fecha y Hora de Inicio:</label>
            <input type="datetime-local" id="tick-sched-datetime" value="${tickState.scheduledDateTime}" style="padding:7px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:12px;" />
          </div>
        `
            : ''
        }

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block;" title="Tiempo mínimo de espera antes de pasar al 2do contacto de la lista">Pausa Mínima (Jitter seg)</label>
            <input type="number" id="tick-jitter-min" value="${tickState.jitterMinSec}" min="10" max="300" style="width:100%; margin-top:4px; padding:6px 8px; border-radius:7px; border:1px solid #cbd5e1; font-size:12px; font-weight:700; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block;" title="Tiempo máximo de espera antes de pasar al siguiente contacto">Pausa Máxima (Jitter seg)</label>
            <input type="number" id="tick-jitter-max" value="${tickState.jitterMaxSec}" min="15" max="600" style="width:100%; margin-top:4px; padding:6px 8px; border-radius:7px; border:1px solid #cbd5e1; font-size:12px; font-weight:700; box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:11px; font-weight:700; color:#475569; display:block;" title="Cantidad máxima de contactos nuevos por día recomendada para cuentas sin API oficial">Tope Diario Seguro</label>
            <input type="number" id="tick-batch-limit" value="${tickState.dailyBatchLimit}" min="1" max="200" style="width:100%; margin-top:4px; padding:6px 8px; border-radius:7px; border:1px solid #cbd5e1; font-size:12px; font-weight:700; box-sizing:border-box;" />
          </div>
        </div>

        <div style="padding:10px 12px; border-radius:10px; background:#eff6ff; border:1px solid #bfdbfe; color:#1e3a8a; font-size:11.5px; line-height:1.45;">
          💡 <strong>¿Para qué sirven estos 3 números?</strong>
          <br/>• <strong>Si envías a 1 sola persona:</strong> El mensaje sale <strong>de inmediato (0 segundos de espera)</strong>.
          <br/>• <strong>Si envías una campaña a varias personas (ej. 20 mamás):</strong> WhatsApp bloquea números que disparan 20 mensajes en el mismo segundo como un robot. Con la <strong>Pausa Mínima (${tickState.jitterMinSec}s) y Máxima (${tickState.jitterMaxSec}s)</strong>, la extensión envía el 1ro al instante, espera p. ej. 62 seg para el 2do, luego 85 seg para el 3ro, simulando que estás escribiendo a mano.
        </div>
      </div>
    `
        : ''
    }

    ${
      tickState.step === 4
        ? `
      <!-- PASO 4: REVIEW & GUARDAR EN FIRESTORE -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px;">
        <div>
          <div style="font-size:13.5px; font-weight:700; color:#0f172a;">Paso 4: Revisión & Publicación en Firestore</div>
          <div style="font-size:11.5px; color:#64748b;">Se registrará en las colecciones <code>whatsapp_campaigns</code> y <code>whatsapp_outbox</code>.</div>
        </div>

        <div>
          <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Nombre de la Campaña:</label>
          <input type="text" id="tick-campaign-name" value="${tickState.campaignName}" style="width:100%; padding:8px 10px; border-radius:8px; border:1px solid #cbd5e1; font-size:12.5px; font-weight:600; box-sizing:border-box;" />
        </div>

        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; font-size:11.5px;">
          <div style="padding:9px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
            <span style="color:#64748b;">Contactos Válidos (+51):</span>
            <div style="font-size:14px; font-weight:800; color:#0f172a; margin-top:2px;">${validLeads.length} prospectos (Lote máx: ${tickState.dailyBatchLimit}/día)</div>
          </div>
          <div style="padding:9px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
            <span style="color:#64748b;">Secuencia & Anti-Ban:</span>
            <div style="font-size:14px; font-weight:800; color:#059669; margin-top:2px;">1 Inicial + ${tickState.followUps.length} Follow-ups (${tickState.jitterMinSec}-${tickState.jitterMaxSec}s)</div>
          </div>
          <div style="padding:9px 12px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
            <span style="color:#64748b;">Archivos Adjuntos:</span>
            <div style="font-size:14px; font-weight:800; color:#5b21b6; margin-top:2px;">📎 ${(tickState.campaignAttachments || []).length} archivo(s)</div>
          </div>
        </div>

        <button type="button" id="tick-save-firestore-btn" ${tickState.isSaving ? 'disabled' : ''} style="width:100%; padding:11px 16px; border-radius:10px; border:none; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; font-size:13px; font-weight:800; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.35);">
          ${tickState.isSaving ? '⏳ Guardando en Firestore...' : '🚀 Guardar Campaña en Firestore & Encolar en whatsapp_outbox'}
        </button>
      </div>
    `
        : ''
    }

    <!-- Vista Previa Dinámica en Tiempo Real (Siempre visible debajo del Wizard) -->
    <div style="background:#efeae2; background-image:radial-gradient(#d1cbbf 0.8px, transparent 0.8px); background-size:16px 16px; border:1px solid #cbd5e1; border-radius:12px; padding:12px 14px; display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(15,23,42,0.08); padding-bottom:6px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:28px; height:28px; border-radius:50%; background:#075e54; color:#ffffff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700;">
            ${previewVars.firstName.charAt(0)}
          </div>
          <div>
            <div style="font-size:12px; font-weight:700; color:#111b21;">Vista Previa WhatsApp: ${previewVars.displayName} (${previewVars.phone})</div>
            <div style="font-size:10px; color:#059669; font-weight:700;">✓ Sin marca de agua Blueticks · Origen: ${previewVars.origin}</div>
          </div>
        </div>
        <button type="button" id="tick-next-preview-lead" style="padding:3px 8px; border-radius:6px; border:1px solid #94a3b8; background:#ffffff; font-size:10.5px; font-weight:600; cursor:pointer;">🔄 Otro Lead</button>
      </div>

      <!-- Burbuja Inicial -->
      <div style="align-self:flex-end; max-width:90%; background:#d9fdd3; color:#111b21; padding:8px 11px; border-radius:10px 0 10px 10px; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-size:12px; line-height:1.45;">
        ${
          tickState.campaignAttachments && tickState.campaignAttachments.length > 0
            ? `<div style="display:flex; flex-direction:column; gap:5px; margin-bottom:6px;">
                ${tickState.campaignAttachments
                  .map((att) =>
                    att.mimeType && att.mimeType.startsWith('image/')
                      ? `<img src="${att.dataUrl}" alt="${att.name}" style="max-height:130px; max-width:220px; border-radius:7px; object-fit:cover; border:1px solid rgba(0,0,0,0.08);" />`
                      : `<div style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.75); padding:5px 8px; border-radius:6px; font-size:11px; font-weight:700; color:#0f172a;">📄 ${att.name} <span style="font-size:9.5px; color:#475569;">(${formatAttachmentSize(att.size)})</span></div>`
                  )
                  .join('')}
              </div>`
            : ''
        }
        <div style="white-space:pre-wrap;">${interpolateTemplate(tickState.initialMessage, previewVars)}</div>
        <div style="text-align:right; font-size:9.5px; color:#667781; margin-top:3px;">12:05 PM ✓✓</div>
      </div>

      ${tickState.followUps
        .map(
          (fu, i) => {
            const resolvedFu = resolveFollowUpTiming(fu, Date.now());
            return `
        <div style="align-self:center; font-size:10px; background:rgba(255,255,255,0.85); color:#475569; padding:2px 8px; border-radius:999px; font-weight:600;">
          ⏱️ Si no responde (${resolvedFu.displayLabel}) → Follow-up #${i + 1}
        </div>
        <div style="align-self:flex-end; max-width:90%; background:#d9fdd3; color:#111b21; padding:8px 11px; border-radius:10px 0 10px 10px; box-shadow:0 1px 2px rgba(0,0,0,0.1); font-size:12px; line-height:1.45; white-space:pre-wrap;">${interpolateTemplate(fu.messageTemplate, previewVars)}<div style="text-align:right; font-size:9.5px; color:#667781; margin-top:3px;">+${resolvedFu.displayLabel} ✓✓</div></div>
      `;
          }
        )
        .join('')}
    </div>

    <!-- Navegación Inferior del Wizard -->
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <button type="button" id="tick-prev-step" ${tickState.step <= 1 ? 'disabled' : ''} style="padding:7px 14px; border-radius:8px; border:1px solid #cbd5e1; background:#ffffff; color:#334155; font-size:12px; font-weight:700; cursor:pointer; opacity:${tickState.step <= 1 ? '0.4' : '1'};">← Anterior</button>
      <div style="font-size:11px; color:#64748b; font-weight:600;">Paso ${tickState.step} de 4</div>
      ${
        tickState.step < 4
          ? `<button type="button" id="tick-next-step" style="padding:7px 16px; border-radius:8px; border:none; background:#0f172a; color:#ffffff; font-size:12px; font-weight:700; cursor:pointer;">Siguiente Paso →</button>`
          : `<button type="button" id="tick-go-preview-btn" style="padding:7px 14px; border-radius:8px; border:1px solid #10b981; background:#ecfdf5; color:#047857; font-size:12px; font-weight:700; cursor:pointer;">Ver Preview Extensión 🧩</button>`
      }
    </div>
  `;
}

function renderOutboxTabHTML(pendingCount, dispatchedCount, repliedCount, cancelledCount) {
  const isItemArchived = (m) => Boolean(m.archived || tickState.archivedOutboxIds.has(m.id));
  const archivedCount = tickState.outbox.filter((m) => isItemArchived(m)).length;
  const activeTotalCount = tickState.outbox.length - archivedCount;

  // Extraer lista única de campañas presentes en outbox
  const campaignOptionsMap = new Map();
  tickState.outbox.forEach((m) => {
    const cName = String(m.campaignName || 'Campaña General').trim();
    if (!campaignOptionsMap.has(cName)) {
      campaignOptionsMap.set(cName, 0);
    }
    campaignOptionsMap.set(cName, campaignOptionsMap.get(cName) + 1);
  });
  const campaignOptions = Array.from(campaignOptionsMap.entries());

  const q = String(tickState.outboxSearch || '').trim().toLowerCase();

  const filtered = tickState.outbox.filter((m) => {
    const archived = isItemArchived(m);
    if (tickState.outboxFilter === 'archived') {
      if (!archived) return false;
    } else {
      if (archived) return false;
      if (tickState.outboxFilter !== 'all' && m.status !== tickState.outboxFilter) {
        return false;
      }
    }

    if (tickState.outboxCampaignFilter && tickState.outboxCampaignFilter !== 'all') {
      const cName = String(m.campaignName || 'Campaña General').trim();
      if (cName !== tickState.outboxCampaignFilter) return false;
    }

    if (q) {
      return (
        String(m.leadName || '').toLowerCase().includes(q) ||
        String(m.phone || '').toLowerCase().includes(q) ||
        String(m.campaignName || '').toLowerCase().includes(q) ||
        String(m.renderedMessage || '').toLowerCase().includes(q)
      );
    }

    return true;
  });

  const badgeColors = {
    pending: 'background:#fef3c7; color:#92400e;',
    dispatched: 'background:#dbeafe; color:#1e40af;',
    replied: 'background:#d1fae5; color:#065f46;',
    cancelled: 'background:#fee2e2; color:#991b1b;'
  };

  const selectedVisibleIds = filtered.filter((m) => tickState.selectedOutboxIds.has(m.id)).map((m) => m.id);
  const allVisibleSelected = filtered.length > 0 && selectedVisibleIds.length === filtered.length;

  return `
    <!-- Métricas de whatsapp_outbox + Pestaña de Archivados -->
    <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px;">
      <button type="button" data-outbox-filter="pending" style="padding:10px; border-radius:10px; border:${tickState.outboxFilter === 'pending' ? '2px solid #f59e0b' : '1px solid #fde68a'}; background:#fffbeb; text-align:left; cursor:pointer;">
        <div style="font-size:10.5px; color:#92400e; font-weight:700;">⏳ PENDING</div>
        <div style="font-size:18px; font-weight:800; color:#78350f;">${pendingCount}</div>
      </button>
      <button type="button" data-outbox-filter="dispatched" style="padding:10px; border-radius:10px; border:${tickState.outboxFilter === 'dispatched' ? '2px solid #2563eb' : '1px solid #bfdbfe'}; background:#eff6ff; text-align:left; cursor:pointer;">
        <div style="font-size:10.5px; color:#1e40af; font-weight:700;">📤 DISPATCHED</div>
        <div style="font-size:18px; font-weight:800; color:#1e3a8a;">${dispatchedCount}</div>
      </button>
      <button type="button" data-outbox-filter="replied" style="padding:10px; border-radius:10px; border:${tickState.outboxFilter === 'replied' ? '2px solid #059669' : '1px solid #a7f3d0'}; background:#ecfdf5; text-align:left; cursor:pointer;">
        <div style="font-size:10.5px; color:#065f46; font-weight:700;">💬 REPLIED</div>
        <div style="font-size:18px; font-weight:800; color:#064e3b;">${repliedCount}</div>
      </button>
      <button type="button" data-outbox-filter="cancelled" style="padding:10px; border-radius:10px; border:${tickState.outboxFilter === 'cancelled' ? '2px solid #dc2626' : '1px solid #fecaca'}; background:#fef2f2; text-align:left; cursor:pointer;">
        <div style="font-size:10.5px; color:#991b1b; font-weight:700;">🛑 CANCELLED</div>
        <div style="font-size:18px; font-weight:800; color:#7f1d1d;">${cancelledCount}</div>
      </button>
      <button type="button" data-outbox-filter="archived" style="padding:10px; border-radius:10px; border:${tickState.outboxFilter === 'archived' ? '2px solid #475569' : '1px solid #cbd5e1'}; background:#f1f5f9; text-align:left; cursor:pointer;">
        <div style="font-size:10.5px; color:#334155; font-weight:700;">📦 ARCHIVADOS</div>
        <div style="font-size:18px; font-weight:800; color:#0f172a;">${archivedCount}</div>
      </button>
    </div>

    <!-- Barra de Filtros (Por Campaña + Buscador + Acciones de Archivo Masivo) -->
    <div style="display:flex; flex-direction:column; gap:8px; padding:10px 12px; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="font-size:12px; font-weight:700; color:#0f172a;">
          Cola en Tiempo Real (<code>whatsapp_outbox</code>) — Estado: <code>${tickState.outboxFilter}</code> (${filtered.length} visibles)
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <button type="button" data-outbox-filter="all" style="padding:4px 10px; border-radius:6px; border:1px solid ${tickState.outboxFilter === 'all' ? '#0f172a' : '#cbd5e1'}; background:${tickState.outboxFilter === 'all' ? '#0f172a' : '#ffffff'}; color:${tickState.outboxFilter === 'all' ? '#ffffff' : '#334155'}; font-size:11px; font-weight:700; cursor:pointer;">📬 Ver Activos (${activeTotalCount})</button>
          <button type="button" data-outbox-filter="archived" style="padding:4px 10px; border-radius:6px; border:1px solid ${tickState.outboxFilter === 'archived' ? '#475569' : '#cbd5e1'}; background:${tickState.outboxFilter === 'archived' ? '#475569' : '#ffffff'}; color:${tickState.outboxFilter === 'archived' ? '#ffffff' : '#475569'}; font-size:11px; font-weight:700; cursor:pointer;">📦 Ver Archivados (${archivedCount})</button>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <!-- Selector para Filtrar por Campaña -->
        <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:220px;">
          <span style="font-size:11px; font-weight:700; color:#475569; white-space:nowrap;">🎯 Campaña:</span>
          <select id="tick-outbox-campaign-filter" style="flex:1; padding:6px 10px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; color:#0f172a; font-size:11.5px; font-weight:700; cursor:pointer;">
            <option value="all" ${tickState.outboxCampaignFilter === 'all' ? 'selected' : ''}>🌐 Todas las campañas (${tickState.outbox.length})</option>
            ${campaignOptions
              .map(
                ([cName, count]) => `
              <option value="${cName.replace(/"/g, '&quot;')}" ${tickState.outboxCampaignFilter === cName ? 'selected' : ''}>
                📁 ${cName} (${count})
              </option>
            `
              )
              .join('')}
          </select>
        </div>

        <!-- Buscador rápido en la cola -->
        <div style="flex:1; min-width:190px; position:relative;">
          <input
            type="text"
            id="tick-outbox-search-input"
            value="${(tickState.outboxSearch || '').replace(/"/g, '&quot;')}"
            placeholder="🔍 Buscar en cola por contacto, teléfono o texto..."
            style="width:100%; padding:6px 10px; border-radius:7px; border:1px solid #cbd5e1; background:#ffffff; font-size:11.5px; box-sizing:border-box;"
          />
        </div>

        <!-- Botones de Seleccionar y Archivar / Restaurar -->
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          ${
            tickState.outboxFilter === 'archived'
              ? `<button type="button" id="tick-outbox-unarchive-selected" ${selectedVisibleIds.length === 0 ? 'disabled' : ''} style="padding:6px 11px; border-radius:7px; border:1px solid #10b981; background:${selectedVisibleIds.length > 0 ? '#10b981' : '#e2e8f0'}; color:${selectedVisibleIds.length > 0 ? '#052e16' : '#64748b'}; font-size:11px; font-weight:800; cursor:${selectedVisibleIds.length > 0 ? 'pointer' : 'not-allowed'};">
                  ♻️ Restaurar seleccionados (${selectedVisibleIds.length})
                </button>`
              : `<button type="button" id="tick-outbox-archive-selected" ${selectedVisibleIds.length === 0 ? 'disabled' : ''} style="padding:6px 11px; border-radius:7px; border:1px solid ${selectedVisibleIds.length > 0 ? '#0f172a' : '#cbd5e1'}; background:${selectedVisibleIds.length > 0 ? '#0f172a' : '#e2e8f0'}; color:${selectedVisibleIds.length > 0 ? '#ffffff' : '#64748b'}; font-size:11px; font-weight:800; cursor:${selectedVisibleIds.length > 0 ? 'pointer' : 'not-allowed'};">
                  📦 Archivar seleccionados (${selectedVisibleIds.length})
                </button>`
          }
          ${
            tickState.selectedOutboxIds.size > 0
              ? `<button type="button" id="tick-outbox-clear-sel" style="padding:5px 8px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; color:#64748b; font-size:10.5px; font-weight:700; cursor:pointer;">Limpiar (${tickState.selectedOutboxIds.size})</button>`
              : ''
          }
        </div>
      </div>
    </div>

    <div style="border:1px solid #e2e8f0; border-radius:10px; background:#ffffff; overflow:hidden; max-height:480px; overflow-y:auto;">
      ${
        filtered.length === 0
          ? `<div style="padding:28px; text-align:center; color:#64748b; font-size:12px;">No hay mensajes en <code>whatsapp_outbox</code> con este filtro (${tickState.outboxFilter}${tickState.outboxCampaignFilter !== 'all' ? ` · ${tickState.outboxCampaignFilter}` : ''}).</div>`
          : `<table style="width:100%; border-collapse:collapse; font-size:11.5px;">
              <thead style="background:#f8fafc; position:sticky; top:0; z-index:2;">
                <tr>
                  <th style="padding:8px 10px; text-align:left; width:30px;">
                    <input type="checkbox" id="tick-outbox-select-all" ${allVisibleSelected ? 'checked' : ''} title="Seleccionar todos los visibles" style="cursor:pointer; accent-color:#0f172a;" />
                  </th>
                  <th style="padding:8px 10px; text-align:left; color:#475569;">Prospecto</th>
                  <th style="padding:8px 10px; text-align:left; color:#475569;">Campaña / Paso</th>
                  <th style="padding:8px 10px; text-align:left; color:#475569;">Mensaje Renderizado</th>
                  <th style="padding:8px 10px; text-align:left; color:#475569;">Estado</th>
                  <th style="padding:8px 10px; text-align:right; color:#475569;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map((item) => {
                    const isChecked = tickState.selectedOutboxIds.has(item.id);
                    const archived = isItemArchived(item);
                    const cName = item.campaignName || 'Campaña General';
                    return `
                  <tr style="border-top:1px solid #f1f5f9; background:${isChecked ? '#f0fdf4' : archived ? '#f8fafc' : '#ffffff'};">
                    <td style="padding:8px 10px;">
                      <input type="checkbox" data-outbox-check="${item.id}" ${isChecked ? 'checked' : ''} style="cursor:pointer; accent-color:#10b981;" />
                    </td>
                    <td style="padding:8px 10px;">
                      <div style="font-weight:700; color:#0f172a;">${item.leadName || 'Lead'}</div>
                      <div style="font-family:monospace; font-size:10.5px; color:#64748b;">${item.phone}</div>
                    </td>
                    <td style="padding:8px 10px;">
                      <div style="font-size:10.5px; font-weight:700; color:#533b87; max-width:165px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${cName.replace(/"/g, '&quot;')}">
                        📁 ${cName}
                      </div>
                      <div style="font-size:10px; font-weight:600; color:#475569; margin-top:1px;">
                        ${item.stepLabel || (item.stepOrder === 0 ? 'Inicial' : `Follow-up #${item.stepOrder}`)}
                      </div>
                    </td>
                    <td style="padding:8px 10px; max-width:210px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#334155;" title="${(item.renderedMessage || '').replace(/"/g, '&quot;')}">
                      ${item.renderedMessage || ''}
                    </td>
                    <td style="padding:8px 10px;">
                      <span style="padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; ${badgeColors[item.status] || ''}">
                        ${item.status}
                      </span>
                      ${archived ? '<span style="margin-left:4px; padding:1px 6px; border-radius:999px; font-size:9.5px; font-weight:700; background:#e2e8f0; color:#334155;">📦 Archivado</span>' : ''}
                    </td>
                    <td style="padding:8px 10px; text-align:right;">
                      <div style="display:inline-flex; gap:4px; align-items:center;">
                        <a href="https://web.whatsapp.com/send?phone=${String(item.phone).replace(/\D/g, '')}&text=${encodeURIComponent(item.renderedMessage || '')}" target="_blank" rel="noopener noreferrer" title="Despachar en WhatsApp Web" style="padding:3px 7px; border-radius:6px; background:#ecfdf5; color:#047857; border:1px solid #6ee7b7; text-decoration:none; font-size:10.5px; font-weight:700;">↗ WS</a>
                        <button type="button" data-simulate-reply="${item.id}" data-reply-phone="${item.phone}" title="Simular Respuesta Inbound (Marca replied y cancela follow-ups)" style="padding:3px 7px; border-radius:6px; background:#eff6ff; color:#1d4ed8; border:1px solid #93c5fd; font-size:10.5px; font-weight:700; cursor:pointer;">💬 Respondió</button>
                        <button type="button" data-outbox-archive-one="${item.id}" data-archive-mode="${archived ? 'unarchive' : 'archive'}" title="${archived ? 'Restaurar a la cola activa' : 'Archivar mensaje de la cola'}" style="padding:3px 7px; border-radius:6px; background:${archived ? '#ecfdf5' : '#f1f5f9'}; color:${archived ? '#065f46' : '#334155'}; border:1px solid #cbd5e1; font-size:10.5px; font-weight:700; cursor:pointer;">
                          ${archived ? '♻️' : '📦'}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
                  })
                  .join('')}
              </tbody>
            </table>`
      }
    </div>
  `;
}

function renderPreviewTabHTML(validLeads, previewLead, previewVars, pendingCount, dispatchedCount, repliedCount) {
  const activeBatchCount = Math.min(dispatchedCount || tickState.simProgress, tickState.dailyBatchLimit);
  const pct = Math.min(100, Math.round((activeBatchCount / tickState.dailyBatchLimit) * 100));

  return `
    <!-- Explicación de Conexión & Aislamiento Multi-Sesión (Cómo sabe qué WhatsApp Web usar) -->
    <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div style="font-size:13px; font-weight:800; color:#0f172a;">
          🔌 ¿Cómo funciona la conexión a WhatsApp Web y el Aislamiento entre Sesiones?
        </div>
        <span style="padding:2px 8px; border-radius:999px; background:#ecfdf5; color:#065f46; border:1px solid #6ee7b7; font-size:10.5px; font-weight:700;">
          🔒 100% Local a tu Perfil de Chrome (${tickState.operatorId})
        </span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:8px; font-size:11px; color:#334155; line-height:1.45;">
        <div style="padding:9px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
          <strong style="color:#0f172a; display:block; margin-bottom:2px;">1. ¿Cómo valido si estoy conectado?</strong>
          Arriba verás el indicador en vivo:
          <br/>• 🟢 <strong>WhatsApp Web Conectado:</strong> Extensión activa + pestaña <code>web.whatsapp.com</code> abierta.
          <br/>• 🟡 <strong>Abre web.whatsapp.com:</strong> Extensión activa, falta abrir WhatsApp.
          <br/>• 🔴 <strong>Extensión No Cargada:</strong> Carga <code>extensions/zentry-ws-dispatcher</code> en <code>chrome://extensions</code>.
        </div>
        <div style="padding:9px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
          <strong style="color:#0f172a; display:block; margin-bottom:2px;">2. ¿Qué pasa si otra persona entra desde otro Chrome?</strong>
          La extensión corre en el navegador local de cada persona y filtra por su <code>operatorId</code> (<code>${tickState.operatorId}</code>). <strong>Nunca se mezclan sesiones:</strong> tus campañas salen por TU WhatsApp Web y las de otro operador salen por SU WhatsApp Web.
        </div>
        <div style="padding:9px 10px; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0;">
          <strong style="color:#0f172a; display:block; margin-bottom:2px;">3. Herramientas Superpuestas en WhatsApp Web (Estilo Blueticks)</strong>
          Al abrir <code>web.whatsapp.com</code> con la extensión activa, verás inyectadas automáticamente:
          <br/>• <strong>Barra Superior:</strong> Filtros (<em>Todos, Bandeja, No Leídos, ⏰ Programados</em>).
          <br/>• <strong>Botón Reloj ⏰ junto a "Escribe un mensaje":</strong> Abre el programador rápido dentro del chat para pruebas (ej. enviar en 10 seg o 1 min sin marca de agua).
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:14px; align-items:start;">
      
      <!-- Mockup Interactivo del Popup de la Extensión Chrome (popup.html) -->
      <div style="background:#0f172a; color:#f8fafc; border-radius:14px; padding:16px; border:1px solid #334155; box-shadow:0 10px 25px rgba(15,23,42,0.2);">
        <div style="display:flex; align-items:center; justify-content:space-between; padding-bottom:10px; border-bottom:1px solid #1e293b;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:10px; height:10px; border-radius:50%; background:${tickState.waConnected || tickState.simRunning ? '#10b981' : '#f59e0b'}; display:inline-block; box-shadow:0 0 8px #10b981;"></span>
            <span style="font-size:12.5px; font-weight:800;">Zentry WS Dispatcher (MV3)</span>
          </div>
          <span style="font-size:10px; padding:2px 7px; border-radius:999px; background:#064e3b; color:#6ee7b7; font-weight:700;">popup.html</span>
        </div>

        <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px; font-size:11.5px;">
          <div style="display:flex; justify-content:space-between; padding:7px 10px; border-radius:8px; background:#1e293b;">
            <span style="color:#94a3b8;">Estado de Sesión:</span>
            <strong style="color:${tickState.waConnected ? '#34d399' : '#fbbf24'};">${
              tickState.waConnected ? '🟢 WhatsApp Web Conectado' : '🟡 Modo Simulador / Local'
            }</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:7px 10px; border-radius:8px; background:#1e293b;">
            <span style="color:#94a3b8;">Operador / Sesión:</span>
            <strong style="color:#a7f3d0; font-family:monospace;">${tickState.operatorId}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:7px 10px; border-radius:8px; background:#1e293b;">
            <span style="color:#94a3b8;">Campaña Activa:</span>
            <strong style="color:#f8fafc;">${tickState.campaignName.slice(0, 22)}...</strong>
          </div>
          <div style="padding:8px 10px; border-radius:8px; background:#1e293b;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
              <span style="color:#94a3b8;">Lote en Progreso:</span>
              <strong style="color:#38bdf8;">${activeBatchCount}/${tickState.dailyBatchLimit} enviados</strong>
            </div>
            <div style="width:100%; height:7px; border-radius:999px; background:#0f172a; overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, #10b981, #38bdf8);"></div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; padding:7px 10px; border-radius:8px; background:#1e293b;">
            <span style="color:#94a3b8;">Próximo Jitter Anti-Ban:</span>
            <strong style="color:#fcd34d; font-family:monospace;">⏱️ ${tickState.simCurrentJitterSec}s (45s-110s)</strong>
          </div>
        </div>

        <div style="margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button type="button" id="tick-sim-start-btn" style="padding:8px 10px; border-radius:8px; border:none; background:#10b981; color:#052e16; font-size:11.5px; font-weight:800; cursor:pointer;">
            ${tickState.simRunning ? '⚡ Despachando...' : '▶️ Simular Despacho'}
          </button>
          <button type="button" id="tick-sim-pause-btn" style="padding:8px 10px; border-radius:8px; border:1px solid #ef4444; background:#7f1d1d; color:#fecaca; font-size:11.5px; font-weight:800; cursor:pointer;">
            🛑 Pausa Emergencia
          </button>
        </div>
      </div>

      <!-- Consola de Telemetría Anti-Ban & Detector de Interrupción Inbound -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-size:12.5px; font-weight:800; color:#0f172a;">🛡️ Motor Anti-Baneo & Trigger Inbound</div>
          <button type="button" id="tick-sim-inbound-btn" style="padding:4px 9px; border-radius:6px; border:1px solid #3b82f6; background:#eff6ff; color:#1d4ed8; font-size:10.5px; font-weight:700; cursor:pointer;">
            📩 Simular Respuesta Entrante
          </button>
        </div>

        <div style="font-size:11px; color:#475569; line-height:1.45;">
          Carpeta para cargar en <code>chrome://extensions</code> (Modo Desarrollador → Cargar descomprimida):
          <br/><code style="color:#0f172a; font-weight:700;">D:\\1_jose_angel\\1_GitHub\\Quarz\\QZ-HUB\\extensions\\zentry-ws-dispatcher</code>
        </div>

        <div style="background:#0f172a; color:#a7f3d0; font-family:monospace; font-size:10.5px; padding:10px; border-radius:8px; height:175px; overflow-y:auto; display:flex; flex-direction:column; gap:4px;">
          ${tickState.simLogs.map((l) => `<div>${l}</div>`).join('')}
        </div>
      </div>

    </div>
  `;
}

function getCombinedAgendaContacts() {
  const map = new Map();

  // 1. Contactos capturados en vivo desde la sesión abierta de WhatsApp Web (#pane-side)
  (tickState.waAgendaContacts || []).forEach((c) => {
    if (!c || !c.name) return;
    const key = (c.phone || c.name).toLowerCase();
    map.set(key, {
      id: c.id || `wa-${key}`,
      name: c.name,
      phone: c.phone || '',
      source: c.source || 'Agenda WhatsApp Web',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5'
    });
  });

  // 2. Contactos del CRM (incluyendo a Berta Albaracin y todos los leads de eventos)
  const crmWithBerta = [
    {
      id: 'lead-berta-royal',
      momName: 'Berta Albaracin / Ref Margarita Morán / Royal',
      phone: '989925110',
      origin: 'Royal / Referido',
      district: 'Lima'
    },
    ...tickState.leads
  ];

  crmWithBerta.forEach((l) => {
    if (!l || (!l.momName && !l.phone)) return;
    const p = normalizePeruPhone(l.phone);
    const key = (p.cleanDigits || l.momName).toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: l.id || `crm-${key}`,
        name: l.momName || p.normalized,
        phone: p.valid ? p.normalized : l.phone || '',
        source: `CRM · ${l.origin || 'General'}`,
        badgeColor: '#5b21b6',
        badgeBg: '#ede9fe'
      });
    }
  });

  return Array.from(map.values());
}

function renderIndividualAgendaTabHTML() {
  const allContacts = getCombinedAgendaContacts();
  const q = (tickState.agendaSearchQuery || '').trim().toLowerCase();
  const filteredContacts = q
    ? allContacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          String(c.phone || '').toLowerCase().includes(q) ||
          String(c.source || '').toLowerCase().includes(q)
      )
    : allContacts;

  const waScrapedCount = (tickState.waAgendaContacts || []).length;

  return `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div>
          <div style="font-size:14px; font-weight:800; color:#0f172a;">
            👤 Envío Individual & Buscador de Agenda de WhatsApp Web
          </div>
          <div style="font-size:11.5px; color:#64748b;">
            Busca cualquier contacto de tu agenda de WhatsApp Web o del CRM, selecciónalo y envíale un mensaje automático al instante o programado.
          </div>
        </div>
        <button type="button" id="tick-scrape-wa-contacts-btn" style="padding:6px 11px; border-radius:8px; border:1px solid #059669; background:#ecfdf5; color:#065f46; font-size:11.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
          🔄 Capturar Agenda de mi WhatsApp Web (${waScrapedCount} capturados)
        </button>
      </div>

      <!-- Buscador de Agenda en Vivo -->
      <div style="display:flex; gap:8px; align-items:center;">
        <input
          type="text"
          id="tick-agenda-search-input"
          value="${(tickState.agendaSearchQuery || '').replace(/"/g, '&quot;')}"
          placeholder="🔍 Buscar en tu Agenda de WhatsApp Web o CRM por nombre o número (ej. Berta, Yixy, Karen, 989...)"
          style="flex:1; padding:9px 12px; border-radius:9px; border:1.5px solid #cbd5e1; font-size:12.5px; font-weight:600;"
        />
      </div>

      <!-- Lista scrolleable de contactos de la Agenda de WhatsApp Web + CRM -->
      <div style="max-height:175px; overflow-y:auto; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:6px; display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:6px;">
        ${
          filteredContacts.length === 0
            ? `<div style="grid-column:1/-1; padding:14px; text-align:center; font-size:11.5px; color:#64748b;">
                No se encontraron contactos con "${tickState.agendaSearchQuery}". Puedes escribir el nombre exacto o número abajo.
              </div>`
            : filteredContacts
                .slice(0, 60)
                .map((c) => {
                  const isSelected =
                    tickState.indivSelectedContactName === c.name ||
                    (c.phone && tickState.indivSelectedPhone && c.phone.includes(tickState.indivSelectedPhone));
                  return `
                  <button
                    type="button"
                    data-pick-agenda-name="${c.name.replace(/"/g, '&quot;')}"
                    data-pick-agenda-phone="${(c.phone || '').replace(/"/g, '&quot;')}"
                    style="text-align:left; padding:7px 10px; border-radius:8px; border:1.5px solid ${
                      isSelected ? '#10b981' : '#e2e8f0'
                    }; background:${
                    isSelected ? '#ecfdf5' : '#ffffff'
                  }; cursor:pointer; display:flex; flex-direction:column; gap:2px; transition:all 0.12s;"
                  >
                    <div style="font-size:11.5px; font-weight:700; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${c.name}
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:4px;">
                      <span style="font-size:10px; font-family:monospace; color:#475569;">${
                        c.phone || 'Por nombre en WS'
                      }</span>
                      <span style="font-size:9.5px; font-weight:700; padding:1px 6px; border-radius:999px; background:${
                        c.badgeBg
                      }; color:${c.badgeColor};">${c.source}</span>
                    </div>
                  </button>
                `;
                })
                .join('')
        }
      </div>

      <!-- Destinatario Seleccionado (Editable manualmente también) -->
      <div style="display:grid; grid-template-columns:1.3fr 1fr; gap:10px; background:#f8fafc; padding:10px 12px; border-radius:10px; border:1px solid #e2e8f0;">
        <div>
          <label style="font-size:11px; font-weight:700; color:#334155; display:block; margin-bottom:3px;">
            Nombre del Contacto en WhatsApp:
          </label>
          <input
            type="text"
            id="tick-indiv-name"
            value="${(tickState.indivSelectedContactName || '').replace(/"/g, '&quot;')}"
            placeholder="Ej. Berta Albaracin o nombre en tu agenda"
            style="width:100%; padding:7px 9px; border-radius:7px; border:1px solid #cbd5e1; font-size:12px; font-weight:700; box-sizing:border-box;"
          />
        </div>
        <div>
          <label style="font-size:11px; font-weight:700; color:#334155; display:block; margin-bottom:3px;">
            Celular WhatsApp (+51 o 9 dígitos):
          </label>
          <input
            type="text"
            id="tick-indiv-phone"
            value="${(tickState.indivSelectedPhone || '').replace(/"/g, '&quot;')}"
            placeholder="Ej. 989925110 (Opcional si está en tu agenda)"
            style="width:100%; padding:7px 9px; border-radius:7px; border:1px solid #cbd5e1; font-size:12px; font-family:monospace; font-weight:700; box-sizing:border-box;"
          />
        </div>
      </div>

      <!-- Mensaje Individual -->
      <div>
        <label style="font-size:11.5px; font-weight:700; color:#0f172a; display:block; margin-bottom:4px;">
          Mensaje para este contacto (Se enviará limpio, sin marca de agua):
        </label>
        <textarea
          id="tick-indiv-msg"
          rows="3"
          style="width:100%; border-radius:9px; border:1px solid #cbd5e1; padding:9px 11px; font-size:12.5px; font-family:inherit; box-sizing:border-box;"
        >${tickState.indivMessage}</textarea>
      </div>

      <!-- Adjuntar Archivos al Envío Individual -->
      <div style="background:#f8fafc; border:1.5px dashed #10b981; border-radius:10px; padding:9px 12px; display:flex; flex-direction:column; gap:7px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="font-size:11.5px; font-weight:700; color:#0f172a;">
            📎 Adjuntar Archivo / Imagen / PDF a este mensaje:
          </div>
          <label style="padding:5px 11px; border-radius:7px; background:#059669; color:#ffffff; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
            <span>📁 Adjuntar Archivo</span>
            <input type="file" id="tick-indiv-files-input" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,video/*,audio/*" style="display:none;" />
          </label>
        </div>
        ${
          tickState.indivAttachments && tickState.indivAttachments.length > 0
            ? `<div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${tickState.indivAttachments
                  .map(
                    (att) => `
                  <div style="display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:7px; background:#ffffff; border:1px solid #a7f3d0; font-size:11px; font-weight:700; color:#0f172a;">
                    ${
                      att.mimeType && att.mimeType.startsWith('image/')
                        ? `<img src="${att.dataUrl}" alt="${att.name}" style="width:22px; height:22px; object-fit:cover; border-radius:4px;" />`
                        : `<span>📄</span>`
                    }
                    <span>${att.name} (${formatAttachmentSize(att.size)})</span>
                    <button type="button" data-remove-indiv-att="${att.id}" style="background:#fee2e2; border:none; color:#dc2626; width:18px; height:18px; border-radius:50%; font-size:10px; font-weight:800; cursor:pointer;">✕</button>
                  </div>
                `
                  )
                  .join('')}
              </div>`
            : `<div style="font-size:10.5px; color:#94a3b8;">Opcional: Adjunta imágenes, catálogos PDF o videos que se enviarán automáticamente.</div>`
        }
      </div>

      <!-- Cuándo enviar -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <button type="button" data-indiv-mode="now" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:1.5px solid ${
            tickState.indivSendMode === 'now' ? '#10b981' : '#cbd5e1'
          }; background:${tickState.indivSendMode === 'now' ? '#ecfdf5' : '#ffffff'}; color:${
    tickState.indivSendMode === 'now' ? '#065f46' : '#334155'
  };">
            ⚡ Enviar Ahora Mismo (0 seg)
          </button>
          <button type="button" data-indiv-mode="delay_10s" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:1.5px solid ${
            tickState.indivSendMode === 'delay_10s' ? '#10b981' : '#cbd5e1'
          }; background:${tickState.indivSendMode === 'delay_10s' ? '#ecfdf5' : '#ffffff'}; color:${
    tickState.indivSendMode === 'delay_10s' ? '#065f46' : '#334155'
  };">
            ⏱️ En 10 seg (Prueba)
          </button>
          <button type="button" data-indiv-mode="scheduled" style="padding:6px 11px; border-radius:8px; font-size:11.5px; font-weight:700; cursor:pointer; border:1.5px solid ${
            tickState.indivSendMode === 'scheduled' ? '#10b981' : '#cbd5e1'
          }; background:${tickState.indivSendMode === 'scheduled' ? '#ecfdf5' : '#ffffff'}; color:${
    tickState.indivSendMode === 'scheduled' ? '#065f46' : '#334155'
  };">
            📅 Programar Hora
          </button>
          ${
            tickState.indivSendMode === 'scheduled'
              ? `<input type="datetime-local" id="tick-indiv-datetime" value="${tickState.indivScheduledDateTime}" style="padding:5px 8px; border-radius:7px; border:1px solid #cbd5e1; font-size:11.5px;" />`
              : ''
          }
        </div>

        <button
          type="button"
          id="tick-indiv-send-btn"
          style="padding:9px 18px; border-radius:9px; border:none; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; font-size:12.5px; font-weight:800; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.35);"
        >
          🚀 ${
            tickState.indivSendMode === 'now'
              ? 'Enviar Mensaje Automático Ahora'
              : 'Programar Envío Individual'
          }
        </button>
      </div>
    </div>
  `;
}

async function handleIndividualSend() {
  const contactName = (tickState.indivSelectedContactName || 'Contacto').trim();
  const rawPhone = (tickState.indivSelectedPhone || '').trim();
  const phoneInfo = normalizePeruPhone(rawPhone);
  const msg = (tickState.indivMessage || '').trim();
  const attachments = Array.isArray(tickState.indivAttachments) ? tickState.indivAttachments : [];

  if (!msg && attachments.length === 0) {
    tickState.saveFeedback = 'Escribe un mensaje o adjunta al menos un archivo antes de enviar.';
    renderTickToolBody();
    return;
  }

  let scheduledMs = Date.now();
  if (tickState.indivSendMode === 'delay_10s') {
    scheduledMs = Date.now() + 10000;
  } else if (tickState.indivSendMode === 'scheduled') {
    const parsed = new Date(tickState.indivScheduledDateTime).getTime();
    if (Number.isFinite(parsed) && parsed > Date.now()) {
      scheduledMs = parsed;
    }
  }

  const attachmentsMeta = attachments.map((a) => ({
    name: a.name,
    size: a.size,
    mimeType: a.mimeType
  }));

  const outboxItem = {
    campaignId: `indiv-${Date.now()}`,
    campaignName: `Envío Individual: ${contactName}`,
    operatorId: tickState.operatorId,
    leadId: `indiv-${Date.now()}`,
    leadName: contactName,
    phone: phoneInfo.valid ? phoneInfo.normalized : rawPhone || contactName,
    phoneE164: phoneInfo.valid ? phoneInfo.cleanDigits : rawPhone.replace(/\D/g, ''),
    phoneDisplay: phoneInfo.valid ? phoneInfo.normalized : rawPhone || contactName,
    origin: 'Envío Individual Agenda',
    district: 'Lima',
    stepOrder: 0,
    renderedMessage: msg,
    messageBody: msg,
    attachmentsMeta,
    status: 'pending',
    stopOnReply: true,
    jitterDelayMs: 0,
    scheduledFor: new Date(scheduledMs).toISOString(),
    dispatchedAt: null,
    repliedAt: null,
    cancelledAt: null,
    createdAt: Date.now()
  };

  try {
    const docRef = await addDoc(collection(zentryDb, OUTBOX_COL), outboxItem);
    outboxItem.id = docRef.id;
  } catch (_) {
    outboxItem.id = `local-indiv-${Date.now()}`;
  }

  // Enviar orden directa a la extensión Chrome local (zentry-ws-dispatcher) incluyendo el ID real de Firestore y los archivos adjuntos
  window.postMessage(
    {
      type: 'ZENTRY_TICKTOOL_TEST_SEND',
      payload: {
        id: outboxItem.id,
        campaignId: outboxItem.campaignId,
        campaignName: outboxItem.campaignName,
        operatorId: tickState.operatorId,
        phone: outboxItem.phoneE164 || '',
        leadName: contactName,
        message: msg,
        attachments,
        scheduledFor: scheduledMs
      }
    },
    '*'
  );

  appendSimLog(
    `🚀 Envío individual disparado para "${contactName}" (${outboxItem.phone})${attachments.length > 0 ? ` con ${attachments.length} adjunto(s)` : ''} — Modo: ${tickState.indivSendMode}.`
  );
  tickState.saveFeedback =
    tickState.indivSendMode === 'now'
      ? `¡Enviando ahora mismo a "${contactName}"${attachments.length > 0 ? ` (${attachments.length} adjunto(s))` : ''} en tu pestaña de WhatsApp Web! (0 seg de espera)`
      : `Mensaje individual programado para "${contactName}" (${new Date(scheduledMs).toLocaleTimeString()}).`;
  renderTickToolBody();
}

async function handleSaveCampaignToFirestore() {
  const validLeads = getValidSelectedLeads();
  if (validLeads.length === 0) {
    tickState.saveFeedback = 'Selecciona al menos 1 contacto con número válido (+51).';
    renderTickToolBody();
    return;
  }

  tickState.isSaving = true;
  renderTickToolBody();

  try {
    const batchLeads = validLeads.slice(0, tickState.dailyBatchLimit);
    const campaignAttachments = Array.isArray(tickState.campaignAttachments) ? tickState.campaignAttachments : [];
    const attachmentsMeta = campaignAttachments.map((a) => ({
      name: a.name,
      size: a.size,
      mimeType: a.mimeType
    }));

    // Limpiar dataUrl pesados de followUps antes de guardar en Firestore para respetar el límite de 1MB por doc
    const sanitizedFollowUpsForFirestore = tickState.followUps.map((fu) => ({
      id: fu.id,
      stepOrder: fu.stepOrder,
      delayPreset: fu.delayPreset,
      delayMs: fu.delayMs,
      customValue: fu.customValue ?? 5,
      customUnit: fu.customUnit || 'minutes',
      customDateTime: fu.customDateTime || '',
      messageTemplate: fu.messageTemplate,
      attachmentsMeta: Array.isArray(fu.attachments)
        ? fu.attachments.map((a) => ({ name: a.name, size: a.size, mimeType: a.mimeType }))
        : []
    }));

    const campaignPayload = {
      name: tickState.campaignName,
      operatorId: tickState.operatorId,
      status: tickState.scheduleMode === 'now_jitter' ? 'active' : 'scheduled',
      audienceOrigins: tickState.selectedOrigins,
      totalContacts: batchLeads.length,
      initialMessage: tickState.initialMessage,
      attachmentsMeta,
      followUps: sanitizedFollowUpsForFirestore,
      stopOnReply: tickState.stopOnReply,
      scheduleMode: tickState.scheduleMode,
      scheduledAt:
        tickState.scheduleMode === 'scheduled'
          ? new Date(tickState.scheduledDateTime).getTime()
          : Date.now(),
      jitterMinSec: Number(tickState.jitterMinSec) || 45,
      jitterMaxSec: Number(tickState.jitterMaxSec) || 110,
      dailyBatchLimit: Number(tickState.dailyBatchLimit) || 35,
      stats: {
        pending: batchLeads.length * (1 + tickState.followUps.length),
        dispatched: 0,
        replied: 0,
        cancelled: 0
      },
      createdAt: Date.now()
    };

    // Guardar en zentryDb (y espejo en qzDb)
    const campRef = await addDoc(collection(zentryDb, CAMPAIGNS_COL), campaignPayload);
    try {
      await addDoc(collection(qzDb, CAMPAIGNS_COL), { ...campaignPayload, zentryCampaignId: campRef.id });
    } catch (_) {}

    let rollingTime = campaignPayload.scheduledAt;
    const pushedItemsForExtension = [];

    for (let idx = 0; idx < batchLeads.length; idx++) {
      const lead = batchLeads[idx];
      const phoneInfo = normalizePeruPhone(lead.phone);
      // REGLA CLAVE: El 1er contacto (idx === 0) sale de inmediato (0ms de espera) cuando es 'now_jitter'.
      // El Jitter de 45s-110s solo se aplica a partir del 2do contacto (idx >= 1) para no hacer esperar al usuario en pruebas o en el arranque.
      const jitterMs =
        idx === 0 && tickState.scheduleMode === 'now_jitter'
          ? 0
          : getRandomJitterMs(campaignPayload.jitterMinSec, campaignPayload.jitterMaxSec);
      rollingTime += jitterMs;

      const vars = {
        firstName: extractFirstName(lead.momName),
        displayName: lead.momName || 'Mamá',
        phone: phoneInfo.normalized,
        origin: lead.origin || 'Expo M (JA)',
        district: lead.district || 'Lima'
      };

      const renderedInitial = interpolateTemplate(tickState.initialMessage, vars);
      const initialOutboxItem = {
        campaignId: campRef.id,
        campaignName: tickState.campaignName,
        operatorId: tickState.operatorId,
        leadId: lead.id,
        leadName: lead.momName || 'Mamá',
        phone: phoneInfo.normalized,
        phoneE164: phoneInfo.cleanDigits,
        phoneDisplay: phoneInfo.normalized,
        origin: lead.origin || 'Expo M (JA)',
        district: lead.district || 'Lima',
        stepOrder: 0,
        renderedMessage: renderedInitial,
        messageBody: renderedInitial,
        attachmentsMeta,
        status: 'pending',
        stopOnReply: tickState.stopOnReply,
        jitterDelayMs: jitterMs,
        scheduledFor: new Date(rollingTime).toISOString(),
        dispatchedAt: null,
        repliedAt: null,
        cancelledAt: null,
        createdAt: Date.now()
      };

      const outDocRef = await addDoc(collection(zentryDb, OUTBOX_COL), initialOutboxItem);
      pushedItemsForExtension.push({
        id: outDocRef.id,
        ...initialOutboxItem,
        attachments: campaignAttachments
      });
      try {
        await addDoc(collection(qzDb, OUTBOX_COL), initialOutboxItem);
      } catch (_) {}

      // Encolar Follow-ups encadenados con precisión de minutos o fecha/hora exacta
      let prevStepBaseMs = rollingTime;
      for (let i = 0; i < tickState.followUps.length; i++) {
        const fu = tickState.followUps[i];
        const resolvedFu = resolveFollowUpTiming(fu, prevStepBaseMs);
        const fuJitterMs = resolvedFu.useJitter
          ? getRandomJitterMs(campaignPayload.jitterMinSec, campaignPayload.jitterMaxSec)
          : 0;
        const exactFollowUpTimeMs = resolvedFu.scheduledForMs + fuJitterMs;
        prevStepBaseMs = exactFollowUpTimeMs;

        const renderedFu = interpolateTemplate(fu.messageTemplate, vars);
        const fuAttachments = Array.isArray(fu.attachments) ? fu.attachments : [];
        const fuAttachmentsMeta = fuAttachments.map((a) => ({
          name: a.name,
          size: a.size,
          mimeType: a.mimeType
        }));
        const fuOutboxItem = {
          campaignId: campRef.id,
          campaignName: tickState.campaignName,
          operatorId: tickState.operatorId,
          leadId: lead.id,
          leadName: lead.momName || 'Mamá',
          phone: phoneInfo.normalized,
          phoneE164: phoneInfo.cleanDigits,
          phoneDisplay: phoneInfo.normalized,
          origin: lead.origin || 'Expo M (JA)',
          district: lead.district || 'Lima',
          stepOrder: i + 1,
          stepLabel: `Follow-up #${i + 1} (${resolvedFu.displayLabel})`,
          renderedMessage: renderedFu,
          messageBody: renderedFu,
          attachmentsMeta: fuAttachmentsMeta,
          status: 'pending',
          stopOnReply: tickState.stopOnReply,
          jitterDelayMs: fuJitterMs,
          scheduledFor: new Date(exactFollowUpTimeMs).toISOString(),
          dispatchedAt: null,
          repliedAt: null,
          cancelledAt: null,
          createdAt: Date.now()
        };
        const fuRef = await addDoc(collection(zentryDb, OUTBOX_COL), fuOutboxItem);
        pushedItemsForExtension.push({
          id: fuRef.id,
          ...fuOutboxItem,
          attachments: fuAttachments
        });
      }
    }

    // Notificar directamente a la extensión Chrome local (zentry-ws-dispatcher) de ESTA sesión.
    // NOTA: TICKTOOL_PUSH_CAMPAIGN_QUEUE ya despacha automáticamente el 1er contacto si es inmediato ('now_jitter'),
    // por lo que NO debemos disparar un segundo ZENTRY_TICKTOOL_DISPATCH_NOW redundante.
    window.postMessage(
      {
        type: 'ZENTRY_TICKTOOL_PUSH_QUEUE',
        payload: {
          operatorId: tickState.operatorId,
          campaignId: campRef.id,
          campaignName: tickState.campaignName,
          items: pushedItemsForExtension
        }
      },
      '*'
    );

    appendSimLog(`Campaña "${tickState.campaignName}" guardada y enviada a la extensión local (${batchLeads.length} leads, ${campaignAttachments.length} adjunto(s)).`);
    tickState.isSaving = false;
    tickState.saveFeedback = `Campaña "${tickState.campaignName}" encolada. ¡El 1er mensaje${campaignAttachments.length > 0 ? ` con ${campaignAttachments.length} archivo(s) adjunto(s)` : ''} se está despachando ahora mismo en tu WhatsApp Web!`;
    tickState.activeTab = 'outbox';
    renderTickToolBody();
  } catch (err) {
    console.error('[TickTool] Error al guardar campaña:', err);
    tickState.isSaving = false;
    tickState.saveFeedback = `Campaña preparada localmente (${err.message || 'Verifica conexión'}).`;
    renderTickToolBody();
  }
}

async function handleSimulateInboundReply(phone) {
  const norm = normalizePeruPhone(phone).normalized;
  appendSimLog(`📩 Inbound detectado de ${norm}: Marcando lead como 'replied' y cancelando follow-ups pendientes.`);

  try {
    const q = query(collection(zentryDb, OUTBOX_COL), where('phone', '==', norm));
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      if (data.stepOrder === 0) {
        await updateDoc(doc(zentryDb, OUTBOX_COL, d.id), {
          status: 'replied',
          repliedAt: Date.now()
        });
      } else if (data.status === 'pending') {
        await updateDoc(doc(zentryDb, OUTBOX_COL, d.id), {
          status: 'cancelled',
          cancelledAt: Date.now()
        });
      }
    }
  } catch (e) {
    console.warn('[TickTool] Error actualizando inbound reply:', e);
  }

  // Actualizar memoria local inmediata
  tickState.outbox = tickState.outbox.map((item) => {
    if (item.phone === norm) {
      if (item.stepOrder === 0) return { ...item, status: 'replied', repliedAt: Date.now() };
      if (item.status === 'pending') return { ...item, status: 'cancelled', cancelledAt: Date.now() };
    }
    return item;
  });
  renderTickToolBody();
}

export function pingExtensionConnection() {
  const hasAttr = document.documentElement.getAttribute('data-zentry-ticktool-ext') === 'active';
  if (hasAttr) {
    tickState.extInstalled = true;
  }
  window.postMessage(
    {
      type: 'ZENTRY_TICKTOOL_PING',
      operatorId: tickState.operatorId
    },
    '*'
  );
}

function bindTickToolEvents() {
  // Cambiar entre pestañas internas (Wizard, Outbox, Preview)
  document.querySelectorAll('[data-tick-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tickState.activeTab = btn.getAttribute('data-tick-tab');
      renderTickToolBody();
    });
  });

  // Botón Validar Conexión Ahora
  const verifyWsBtn = document.getElementById('tick-verify-ws-btn');
  if (verifyWsBtn) {
    verifyWsBtn.addEventListener('click', () => {
      pingExtensionConnection();
      setTimeout(() => {
        if (tickState.extInstalled && tickState.waConnected) {
          tickState.saveFeedback = `Conexión verificada: Extensión MV3 activa y WhatsApp Web conectado en tu sesión (${tickState.operatorId}).`;
        } else if (tickState.extInstalled && !tickState.waConnected) {
          tickState.saveFeedback = `Extensión MV3 detectada en tu Chrome (${tickState.operatorId}), pero no tienes ninguna pestaña de web.whatsapp.com abierta. Ábrela para despachar.`;
        } else {
          tickState.saveFeedback = `La extensión zentry-ws-dispatcher aún no está cargada en este navegador. Ve a chrome://extensions -> Cargar descomprimida -> QZ-HUB/extensions/zentry-ws-dispatcher.`;
        }
        renderTickToolBody();
      }, 350);
    });
  }

  // Botón Probar Envío Real con el contacto en vista previa
  const quickTestWsBtn = document.getElementById('tick-quick-test-ws-btn');
  if (quickTestWsBtn) {
    quickTestWsBtn.addEventListener('click', () => {
      const validLeads = getValidSelectedLeads();
      const lead = validLeads[tickState.previewLeadIndex] || validLeads[0] || tickState.leads[0];
      if (!lead) return;
      const p = normalizePeruPhone(lead.phone);
      const vars = {
        firstName: extractFirstName(lead.momName),
        displayName: lead.momName || 'Mamá',
        phone: p.normalized,
        origin: lead.origin || 'Expo M (JA)',
        district: lead.district || 'Lima'
      };
      const msg = interpolateTemplate(tickState.initialMessage, vars);

      if (tickState.extInstalled) {
        window.postMessage(
          {
            type: 'ZENTRY_TICKTOOL_TEST_SEND',
            payload: {
              operatorId: tickState.operatorId,
              phone: p.cleanDigits,
              leadName: lead.momName,
              message: msg,
              attachments: tickState.campaignAttachments || []
            }
          },
          '*'
        );
        appendSimLog(`⚡ Orden de prueba enviada a la extensión local para ${lead.momName} (${p.normalized}).`);
        tickState.saveFeedback = `Enviando prueba a ${lead.momName} (${p.normalized}) a través de tu WhatsApp Web conectado...`;
        renderTickToolBody();
      } else {
        const waUrl = `https://web.whatsapp.com/send?phone=${p.cleanDigits}&text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        appendSimLog(`↗ Abriendo WhatsApp Web directo para ${lead.momName} (${p.normalized}) sin marca de agua.`);
      }
    });
  }

  const closeFb = document.getElementById('tick-close-feedback');
  if (closeFb) {
    closeFb.addEventListener('click', () => {
      tickState.saveFeedback = null;
      renderTickToolBody();
    });
  }

  // Stepper
  document.querySelectorAll('[data-tick-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tickState.step = Number(btn.getAttribute('data-tick-step'));
      renderTickToolBody();
    });
  });

  const prevStep = document.getElementById('tick-prev-step');
  if (prevStep) {
    prevStep.addEventListener('click', () => {
      if (tickState.step > 1) {
        tickState.step -= 1;
        renderTickToolBody();
      }
    });
  }

  const nextStep = document.getElementById('tick-next-step');
  if (nextStep) {
    nextStep.addEventListener('click', () => {
      if (tickState.step < 4) {
        tickState.step += 1;
        renderTickToolBody();
      }
    });
  }

  const goPreviewBtn = document.getElementById('tick-go-preview-btn');
  if (goPreviewBtn) {
    goPreviewBtn.addEventListener('click', () => {
      tickState.activeTab = 'preview';
      renderTickToolBody();
    });
  }

  // Paso 1: Audience
  const audOriginBtn = document.getElementById('tick-aud-origin');
  if (audOriginBtn) {
    audOriginBtn.addEventListener('click', () => {
      tickState.audienceMode = 'origin';
      renderTickToolBody();
    });
  }
  const audManualBtn = document.getElementById('tick-aud-manual');
  if (audManualBtn) {
    audManualBtn.addEventListener('click', () => {
      tickState.audienceMode = 'manual';
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-origin-toggle]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const origin = chip.getAttribute('data-origin-toggle');
      if (tickState.selectedOrigins.includes(origin)) {
        tickState.selectedOrigins = tickState.selectedOrigins.filter((o) => o !== origin);
      } else {
        tickState.selectedOrigins = [...tickState.selectedOrigins, origin];
      }
      tickState.previewLeadIndex = 0;
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-lead-check]').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const id = chk.getAttribute('data-lead-check');
      tickState.audienceMode = 'manual';
      if (e.target.checked) {
        tickState.manualLeadIds.add(id);
      } else {
        tickState.manualLeadIds.delete(id);
      }
      tickState.previewLeadIndex = 0;
      renderTickToolBody();
    });
  });

  const selAll = document.getElementById('tick-sel-all');
  if (selAll) {
    selAll.addEventListener('click', () => {
      tickState.audienceMode = 'manual';
      const q = String(tickState.audienceSearch || '').trim().toLowerCase();
      tickState.leads.forEach((l) => {
        if (!q) {
          tickState.manualLeadIds.add(l.id);
          return;
        }
        const p = normalizePeruPhone(l.phone);
        if (
          String(l.momName || '').toLowerCase().includes(q) ||
          String(l.phone || '').toLowerCase().includes(q) ||
          String(p.normalized || '').toLowerCase().includes(q) ||
          String(l.origin || '').toLowerCase().includes(q) ||
          String(l.district || '').toLowerCase().includes(q)
        ) {
          tickState.manualLeadIds.add(l.id);
        }
      });
      renderTickToolBody();
    });
  }
  const selNone = document.getElementById('tick-sel-none');
  if (selNone) {
    selNone.addEventListener('click', () => {
      tickState.audienceMode = 'manual';
      tickState.manualLeadIds.clear();
      renderTickToolBody();
    });
  }

  // Buscador de leads en Paso 1
  const audSearchInput = document.getElementById('tick-aud-search-input');
  if (audSearchInput) {
    audSearchInput.addEventListener('input', (e) => {
      tickState.audienceSearch = e.target.value;
      const pos = e.target.selectionStart;
      renderTickToolBody();
      const nextInp = document.getElementById('tick-aud-search-input');
      if (nextInp) {
        nextInp.focus();
        try {
          nextInp.setSelectionRange(pos, pos);
        } catch (_) {}
      }
    });
  }
  const audSearchClear = document.getElementById('tick-aud-search-clear');
  if (audSearchClear) {
    audSearchClear.addEventListener('click', () => {
      tickState.audienceSearch = '';
      renderTickToolBody();
    });
  }

  // Botón Expandir / Compactar Vista de Leads en Paso 1
  const audExpandBtn = document.getElementById('tick-aud-expand-btn');
  if (audExpandBtn) {
    audExpandBtn.addEventListener('click', () => {
      tickState.audienceExpanded = !tickState.audienceExpanded;
      renderTickToolBody();
    });
  }

  // Deslizador (Slider) y botones Subir/Bajar para scroll controlado de la tabla de Leads en Paso 1
  const audTableWrap = document.getElementById('tick-aud-table-wrap');
  const audScrollSlider = document.getElementById('tick-aud-scroll-slider');
  const audScrollLabel = document.getElementById('tick-aud-scroll-label');
  if (audTableWrap && audScrollSlider) {
    // Restaurar posición de scroll según porcentaje guardado
    requestAnimationFrame(() => {
      const maxScroll = Math.max(0, audTableWrap.scrollHeight - audTableWrap.clientHeight);
      if (maxScroll > 0 && tickState.audienceScrollPct > 0) {
        audTableWrap.scrollTop = Math.round((tickState.audienceScrollPct / 100) * maxScroll);
      }
    });

    audScrollSlider.addEventListener('input', (e) => {
      const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
      tickState.audienceScrollPct = pct;
      if (audScrollLabel) audScrollLabel.textContent = `${pct}%`;
      const maxScroll = Math.max(0, audTableWrap.scrollHeight - audTableWrap.clientHeight);
      audTableWrap.scrollTop = Math.round((pct / 100) * maxScroll);
    });

    audTableWrap.addEventListener('scroll', () => {
      const maxScroll = Math.max(1, audTableWrap.scrollHeight - audTableWrap.clientHeight);
      const pct = Math.min(100, Math.max(0, Math.round((audTableWrap.scrollTop / maxScroll) * 100)));
      tickState.audienceScrollPct = pct;
      audScrollSlider.value = String(pct);
      if (audScrollLabel) audScrollLabel.textContent = `${pct}%`;
    });

    const upBtn = document.getElementById('tick-aud-scroll-up');
    if (upBtn) {
      upBtn.addEventListener('click', () => {
        audTableWrap.scrollBy({ top: -140, behavior: 'smooth' });
      });
    }
    const downBtn = document.getElementById('tick-aud-scroll-down');
    if (downBtn) {
      downBtn.addEventListener('click', () => {
        audTableWrap.scrollBy({ top: 140, behavior: 'smooth' });
      });
    }
  }

  // Paso 2: Message, Archivos Adjuntos & Follow-ups
  const initialMsgInput = document.getElementById('tick-initial-msg');
  if (initialMsgInput) {
    initialMsgInput.addEventListener('input', (e) => {
      tickState.initialMessage = e.target.value;
    });
    initialMsgInput.addEventListener('blur', () => renderTickToolBody());
  }

  const campFilesInput = document.getElementById('tick-campaign-files-input');
  if (campFilesInput) {
    campFilesInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const loaded = await readFilesAsAttachmentObjects(files);
      tickState.campaignAttachments = [...(tickState.campaignAttachments || []), ...loaded];
      appendSimLog(`📎 ${loaded.length} archivo(s) adjuntado(s) a la campaña: ${loaded.map((f) => f.name).join(', ')}.`);
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-remove-camp-att]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const attId = btn.getAttribute('data-remove-camp-att');
      tickState.campaignAttachments = (tickState.campaignAttachments || []).filter((a) => a.id !== attId);
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-fu-file-input]').forEach((inp) => {
    inp.addEventListener('change', async (e) => {
      const fuId = inp.getAttribute('data-fu-file-input');
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const loaded = await readFilesAsAttachmentObjects(files);
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === fuId ? { ...f, attachments: [...(f.attachments || []), ...loaded] } : f
      );
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-remove-fu-att]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fuId = btn.getAttribute('data-remove-fu-att');
      const attId = btn.getAttribute('data-att-id');
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === fuId
          ? { ...f, attachments: (f.attachments || []).filter((a) => a.id !== attId) }
          : f
      );
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-insert-var]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const token = btn.getAttribute('data-insert-var');
      tickState.initialMessage = `${tickState.initialMessage} ${token}`;
      renderTickToolBody();
    });
  });

  const stopReplyChk = document.getElementById('tick-stop-on-reply');
  if (stopReplyChk) {
    stopReplyChk.addEventListener('change', (e) => {
      tickState.stopOnReply = e.target.checked;
      renderTickToolBody();
    });
  }

  const addFuBtn = document.getElementById('tick-add-followup');
  if (addFuBtn) {
    addFuBtn.addEventListener('click', () => {
      const nextNum = tickState.followUps.length + 1;
      tickState.followUps.push({
        id: `fu-${Date.now()}`,
        stepOrder: nextNum,
        delayPreset: '5 min',
        delayMs: 5 * 60 * 1000,
        customValue: 5,
        customUnit: 'minutes',
        customDateTime: toLocalDateTimeInputValue(Date.now() + 5 * 60 * 1000),
        messageTemplate:
          'Hola {First Name}, te escribo nuevamente por si quedó alguna duda sobre la evaluación familiar de ZentryOS. ¡Quedo atento!'
      });
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-fu-delay]').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-fu-delay');
      const preset = e.target.value;
      tickState.followUps = tickState.followUps.map((f) => {
        if (f.id !== id) return f;
        const nextCustomDt = f.customDateTime || toLocalDateTimeInputValue(Date.now() + 5 * 60 * 1000);
        return {
          ...f,
          delayPreset: preset,
          delayMs: DELAY_MS[preset] || f.delayMs || 300000,
          customValue: f.customValue ?? 5,
          customUnit: f.customUnit || 'minutes',
          customDateTime: nextCustomDt
        };
      });
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-fu-quick-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-fu-quick-preset');
      const preset = btn.getAttribute('data-preset-val');
      tickState.followUps = tickState.followUps.map((f) => {
        if (f.id !== id) return f;
        return {
          ...f,
          delayPreset: preset,
          delayMs: DELAY_MS[preset] || f.delayMs || 300000,
          customDateTime: f.customDateTime || toLocalDateTimeInputValue(Date.now() + 5 * 60 * 1000)
        };
      });
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-fu-custom-val]').forEach((inp) => {
    inp.addEventListener('input', (e) => {
      const id = inp.getAttribute('data-fu-custom-val');
      const val = Math.max(1, Number(e.target.value) || 1);
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === id ? { ...f, customValue: val } : f
      );
    });
    inp.addEventListener('change', () => renderTickToolBody());
  });

  document.querySelectorAll('[data-fu-custom-unit]').forEach((sel) => {
    sel.addEventListener('change', (e) => {
      const id = sel.getAttribute('data-fu-custom-unit');
      const unit = e.target.value;
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === id ? { ...f, customUnit: unit } : f
      );
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-fu-custom-dt]').forEach((inp) => {
    inp.addEventListener('change', (e) => {
      const id = inp.getAttribute('data-fu-custom-dt');
      const dtVal = e.target.value;
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === id ? { ...f, customDateTime: dtVal } : f
      );
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-fu-msg]').forEach((ta) => {
    ta.addEventListener('input', (e) => {
      const id = ta.getAttribute('data-fu-msg');
      tickState.followUps = tickState.followUps.map((f) =>
        f.id === id ? { ...f, messageTemplate: e.target.value } : f
      );
    });
    ta.addEventListener('blur', () => renderTickToolBody());
  });

  document.querySelectorAll('[data-fu-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-fu-remove');
      tickState.followUps = tickState.followUps.filter((f) => f.id !== id);
      renderTickToolBody();
    });
  });

  // Paso 3: Timing & Jitter
  document.querySelectorAll('input[name="tick-sched-mode"]').forEach((r) => {
    r.addEventListener('change', (e) => {
      tickState.scheduleMode = e.target.value;
      renderTickToolBody();
    });
  });

  const dtInput = document.getElementById('tick-sched-datetime');
  if (dtInput) {
    dtInput.addEventListener('change', (e) => {
      tickState.scheduledDateTime = e.target.value;
    });
  }

  const jMin = document.getElementById('tick-jitter-min');
  if (jMin) {
    jMin.addEventListener('change', (e) => {
      tickState.jitterMinSec = Math.max(15, Number(e.target.value) || 45);
      renderTickToolBody();
    });
  }
  const jMax = document.getElementById('tick-jitter-max');
  if (jMax) {
    jMax.addEventListener('change', (e) => {
      tickState.jitterMaxSec = Math.max(tickState.jitterMinSec + 5, Number(e.target.value) || 110);
      renderTickToolBody();
    });
  }
  const bLim = document.getElementById('tick-batch-limit');
  if (bLim) {
    bLim.addEventListener('change', (e) => {
      tickState.dailyBatchLimit = Math.max(1, Number(e.target.value) || 35);
      renderTickToolBody();
    });
  }

  // Paso 4: Review & Save
  const campNameInput = document.getElementById('tick-campaign-name');
  if (campNameInput) {
    campNameInput.addEventListener('input', (e) => {
      tickState.campaignName = e.target.value;
    });
  }

  const saveBtn = document.getElementById('tick-save-firestore-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveCampaignToFirestore);
  }

  // Rotar lead en la vista previa de burbuja WhatsApp
  const nextPreviewBtn = document.getElementById('tick-next-preview-lead');
  if (nextPreviewBtn) {
    nextPreviewBtn.addEventListener('click', () => {
      const valid = getValidSelectedLeads();
      if (valid.length > 0) {
        tickState.previewLeadIndex = (tickState.previewLeadIndex + 1) % valid.length;
        renderTickToolBody();
      }
    });
  }

  // Outbox filters, campaign filter, search & archive actions
  const persistOutboxArchiveState = async (ids, shouldArchive) => {
    ids.forEach((id) => {
      if (shouldArchive) {
        tickState.archivedOutboxIds.add(id);
      } else {
        tickState.archivedOutboxIds.delete(id);
      }
      tickState.selectedOutboxIds.delete(id);
    });
    try {
      localStorage.setItem(
        'zentry_archived_outbox_v1',
        JSON.stringify(Array.from(tickState.archivedOutboxIds))
      );
    } catch (_) {}

    tickState.outbox = tickState.outbox.map((item) =>
      ids.includes(item.id) ? { ...item, archived: shouldArchive } : item
    );

    renderTickToolBody();

    for (const id of ids) {
      try {
        await updateDoc(doc(zentryDb, OUTBOX_COL, id), {
          archived: shouldArchive,
          archivedAt: shouldArchive ? Date.now() : null
        });
      } catch (_) {}
    }
  };

  document.querySelectorAll('[data-outbox-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tickState.outboxFilter = btn.getAttribute('data-outbox-filter');
      renderTickToolBody();
    });
  });

  const outboxCampSel = document.getElementById('tick-outbox-campaign-filter');
  if (outboxCampSel) {
    outboxCampSel.addEventListener('change', (e) => {
      tickState.outboxCampaignFilter = e.target.value;
      renderTickToolBody();
    });
  }

  const outboxSearchInp = document.getElementById('tick-outbox-search-input');
  if (outboxSearchInp) {
    outboxSearchInp.addEventListener('input', (e) => {
      tickState.outboxSearch = e.target.value;
      const pos = e.target.selectionStart;
      renderTickToolBody();
      const nextInp = document.getElementById('tick-outbox-search-input');
      if (nextInp) {
        nextInp.focus();
        try {
          nextInp.setSelectionRange(pos, pos);
        } catch (_) {}
      }
    });
  }

  const outboxSelAllChk = document.getElementById('tick-outbox-select-all');
  if (outboxSelAllChk) {
    outboxSelAllChk.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('[data-outbox-check]').forEach((chk) => {
        const id = chk.getAttribute('data-outbox-check');
        if (!id) return;
        if (checked) tickState.selectedOutboxIds.add(id);
        else tickState.selectedOutboxIds.delete(id);
      });
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-outbox-check]').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const id = chk.getAttribute('data-outbox-check');
      if (!id) return;
      if (e.target.checked) tickState.selectedOutboxIds.add(id);
      else tickState.selectedOutboxIds.delete(id);
      renderTickToolBody();
    });
  });

  const outboxArchiveSelBtn = document.getElementById('tick-outbox-archive-selected');
  if (outboxArchiveSelBtn) {
    outboxArchiveSelBtn.addEventListener('click', () => {
      const ids = Array.from(tickState.selectedOutboxIds);
      if (ids.length === 0) return;
      appendSimLog(`📦 ${ids.length} mensaje(s) archivado(s) de la cola activa.`);
      persistOutboxArchiveState(ids, true);
    });
  }

  const outboxUnarchiveSelBtn = document.getElementById('tick-outbox-unarchive-selected');
  if (outboxUnarchiveSelBtn) {
    outboxUnarchiveSelBtn.addEventListener('click', () => {
      const ids = Array.from(tickState.selectedOutboxIds);
      if (ids.length === 0) return;
      appendSimLog(`♻️ ${ids.length} mensaje(s) restaurado(s) a la cola activa.`);
      persistOutboxArchiveState(ids, false);
    });
  }

  const outboxClearSelBtn = document.getElementById('tick-outbox-clear-sel');
  if (outboxClearSelBtn) {
    outboxClearSelBtn.addEventListener('click', () => {
      tickState.selectedOutboxIds.clear();
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-outbox-archive-one]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-outbox-archive-one');
      const mode = btn.getAttribute('data-archive-mode');
      if (!id) return;
      persistOutboxArchiveState([id], mode !== 'unarchive');
    });
  });

  document.querySelectorAll('[data-simulate-reply]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const phone = btn.getAttribute('data-reply-phone');
      handleSimulateInboundReply(phone);
    });
  });

  // Preview Extensión & Simulador
  const simStartBtn = document.getElementById('tick-sim-start-btn');
  if (simStartBtn) {
    simStartBtn.addEventListener('click', () => {
      if (tickState.simRunning) return;
      tickState.simRunning = true;
      const jitterMs = getRandomJitterMs(tickState.jitterMinSec, tickState.jitterMaxSec);
      tickState.simCurrentJitterSec = Math.round(jitterMs / 1000);
      appendSimLog(`▶️ Despacho iniciado. Jitter calculado: ${tickState.simCurrentJitterSec}s (${jitterMs} ms).`);
      renderTickToolBody();

      tickState.simTimer = setInterval(() => {
        if (!tickState.simRunning) return;
        tickState.simProgress = Math.min(tickState.dailyBatchLimit, tickState.simProgress + 1);
        const nextJitterMs = getRandomJitterMs(tickState.jitterMinSec, tickState.jitterMaxSec);
        tickState.simCurrentJitterSec = Math.round(nextJitterMs / 1000);
        const valid = getValidSelectedLeads();
        const pool = valid.length > 0 ? valid : tickState.leads;
        const sampleLead = pool[tickState.simProgress % pool.length];
        appendSimLog(
          `📤 Despachado a ${sampleLead.momName} (${normalizePeruPhone(sampleLead.phone).normalized}) sin marca de agua. Próximo envío en ${tickState.simCurrentJitterSec}s.`
        );
        renderTickToolBody();
      }, 2800);
    });
  }

  const simPauseBtn = document.getElementById('tick-sim-pause-btn');
  if (simPauseBtn) {
    simPauseBtn.addEventListener('click', () => {
      tickState.simRunning = false;
      if (tickState.simTimer) {
        clearInterval(tickState.simTimer);
        tickState.simTimer = null;
      }
      appendSimLog('🛑 PAUSA DE EMERGENCIA activada por el operador. Cola congelada.');
      renderTickToolBody();
    });
  }

  const simInboundBtn = document.getElementById('tick-sim-inbound-btn');
  if (simInboundBtn) {
    simInboundBtn.addEventListener('click', () => {
      const sample = tickState.outbox[0] || tickState.leads[0];
      const phone = sample ? sample.phone : '+51987806711';
      handleSimulateInboundReply(phone);
    });
  }

  // Pestaña: Envío Individual & Agenda WS
  const scrapeContactsBtn = document.getElementById('tick-scrape-wa-contacts-btn');
  if (scrapeContactsBtn) {
    scrapeContactsBtn.addEventListener('click', () => {
      if (tickState.extInstalled) {
        window.postMessage({ type: 'ZENTRY_TICKTOOL_SCRAPE_CONTACTS' }, '*');
        tickState.saveFeedback = '🔄 Capturando lista de contactos y chats desde tu pestaña abierta de WhatsApp Web...';
        renderTickToolBody();
      } else {
        tickState.saveFeedback = '⚠️ Para capturar tus chats recientes directamente de WhatsApp Web, asegúrate de tener cargada la extensión zentry-ws-dispatcher v1.3 en chrome://extensions y recargar la página.';
        renderTickToolBody();
      }
    });
  }

  const agendaSearchInput = document.getElementById('tick-agenda-search-input');
  if (agendaSearchInput) {
    agendaSearchInput.addEventListener('input', (e) => {
      tickState.agendaSearchQuery = e.target.value;
      const pos = e.target.selectionStart;
      renderTickToolBody();
      const newInput = document.getElementById('tick-agenda-search-input');
      if (newInput) {
        newInput.focus();
        try {
          newInput.setSelectionRange(pos, pos);
        } catch (_) {}
      }
    });
  }

  document.querySelectorAll('[data-pick-agenda-name]').forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-pick-agenda-name') || '';
      const phone = item.getAttribute('data-pick-agenda-phone') || '';
      tickState.indivSelectedContactName = name;
      tickState.indivSelectedPhone = phone;
      const firstName = extractFirstName(name);
      if (!tickState.indivMessage || tickState.indivMessage.startsWith('Hola ')) {
        tickState.indivMessage = `Hola ${firstName}, te escribo de ZentryOS para confirmar nuestra conversación. ¿Cómo estás?`;
      }
      renderTickToolBody();
    });
  });

  const indivNameInput = document.getElementById('tick-indiv-name');
  if (indivNameInput) {
    indivNameInput.addEventListener('input', (e) => {
      tickState.indivSelectedContactName = e.target.value;
    });
  }

  const indivPhoneInput = document.getElementById('tick-indiv-phone');
  if (indivPhoneInput) {
    indivPhoneInput.addEventListener('input', (e) => {
      tickState.indivSelectedPhone = e.target.value;
    });
  }

  const indivMsgInput = document.getElementById('tick-indiv-msg');
  if (indivMsgInput) {
    indivMsgInput.addEventListener('input', (e) => {
      tickState.indivMessage = e.target.value;
    });
  }

  const indivFilesInput = document.getElementById('tick-indiv-files-input');
  if (indivFilesInput) {
    indivFilesInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const loaded = await readFilesAsAttachmentObjects(files);
      tickState.indivAttachments = [...(tickState.indivAttachments || []), ...loaded];
      appendSimLog(`📎 ${loaded.length} archivo(s) adjuntado(s) al envío individual.`);
      renderTickToolBody();
    });
  }

  document.querySelectorAll('[data-remove-indiv-att]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const attId = btn.getAttribute('data-remove-indiv-att');
      tickState.indivAttachments = (tickState.indivAttachments || []).filter((a) => a.id !== attId);
      renderTickToolBody();
    });
  });

  document.querySelectorAll('[data-indiv-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tickState.indivSendMode = btn.getAttribute('data-indiv-mode');
      renderTickToolBody();
    });
  });

  const indivDtInput = document.getElementById('tick-indiv-datetime');
  if (indivDtInput) {
    indivDtInput.addEventListener('change', (e) => {
      tickState.indivScheduledDateTime = e.target.value;
    });
  }

  const indivSendBtn = document.getElementById('tick-indiv-send-btn');
  if (indivSendBtn) {
    indivSendBtn.addEventListener('click', handleIndividualSend);
  }
}

export function setupTickToolEvents() {
  renderTickToolBody();
  pingExtensionConnection();

  const toggleModeBtn = document.getElementById('tick-toggle-mode-btn');
  if (toggleModeBtn) {
    toggleModeBtn.addEventListener('click', () => {
      tickState.embedMode = tickState.embedMode === 'native' ? 'iframe' : 'native';
      renderTickToolBody();
    });
  }

  // Suscripción en tiempo real a leads_expo_maternidad (zentryDb)
  // Soporta tanto el esquema real del CRM (nombreMadre, celular, sheetTab, distrito)
  // como el esquema en inglés (momName, phone, origin, district), ignorando docs parciales vacíos.
  if (tickState.unsubLeads) tickState.unsubLeads();
  try {
    tickState.unsubLeads = onSnapshot(collection(zentryDb, LEADS_COL), (snap) => {
      // Si el iframe del CRM izquierdo ya nos sincronizó la lista completa combinada, priorizarla
      if (tickState.crmSyncedFromIframe) return;
      if (!snap.empty) {
        const loaded = [];
        const seenIds = new Set();

        snap.docs.forEach((d) => {
          const data = d.data() || {};
          const base = BASE_LEADS_BY_ID.get(d.id) || {};
          const rawName =
            data.nombreMadre ||
            data.momName ||
            data.nombre ||
            base.momName ||
            '';
          const rawPhone =
            data.celular ||
            data.phone ||
            data.telefono ||
            base.phone ||
            '';
          const rawOrigin =
            data.sheetTab ||
            data.origin ||
            data.origen ||
            base.origin ||
            'Expo M (JA)';
          const rawDistrict =
            data.distrito ||
            data.district ||
            base.district ||
            'Lima';

          // Filtrar documentos parciales de Firestore que solo guardaron un cambio de pestaña pero sin teléfono ni nombre
          if (!rawName && !rawPhone) return;
          if (!normalizePeruPhone(rawPhone).valid && !base.phone) return;

          seenIds.add(d.id);
          loaded.push({
            id: d.id,
            momName: String(rawName || 'Contacto CRM').trim(),
            phone: String(rawPhone || '').trim(),
            origin: String(rawOrigin || 'Expo M (JA)').trim(),
            district: String(rawDistrict || 'Lima').trim(),
            childAge: data.edadHijos || data.childAge || base.childAge || '',
            interestNotes: data.observaciones || data.interestNotes || base.interestNotes || ''
          });
        });

        // Combinar con FALLBACK_LEADS que no estén en Firestore aún
        FALLBACK_LEADS.forEach((fb) => {
          if (!seenIds.has(fb.id)) {
            loaded.push(fb);
          }
        });

        if (loaded.length > 0) {
          tickState.leads = loaded;
          // Asegurar que al menos una pestaña con contactos válidos esté seleccionada por defecto
          const validNow = getValidSelectedLeads();
          if (validNow.length === 0) {
            const firstOrigin = loaded[0]?.origin || 'Expo M (JA)';
            tickState.selectedOrigins = [firstOrigin];
          }
          renderTickToolBody();
        }
      }
    });
  } catch (e) {
    console.warn('[TickTool] Usando FALLBACK_LEADS locales:', e);
  }

  // Suscripción en tiempo real a whatsapp_outbox
  if (tickState.unsubOutbox) tickState.unsubOutbox();
  try {
    tickState.unsubOutbox = onSnapshot(collection(zentryDb, OUTBOX_COL), (snap) => {
      const firestoreItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const mergedMap = new Map();
      // Conservar ítems locales de la extensión que aún no estén en Firestore
      (tickState.outbox || []).forEach((item) => {
        if (item && item.id) mergedMap.set(item.id, item);
      });
      firestoreItems.forEach((item) => {
        if (item && item.id) mergedMap.set(item.id, item);
      });
      tickState.outbox = Array.from(mergedMap.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );
      renderTickToolBody();
    });
  } catch (e) {
    console.warn('[TickTool] Error escuchando whatsapp_outbox:', e);
  }

  // Escuchar mensajes desde el iframe izquierdo del CRM y desde el content script de la extensión Chrome
  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;
    const { type } = event.data;

    // 1. Sincronización completa de Leads y Pestaña activa desde el CRM izquierdo (OriginalAdmin.tsx)
    if (type === 'ZENTRY_CRM_LEADS_SYNC' && Array.isArray(event.data.leads) && event.data.leads.length > 0) {
      const validCrmLeads = event.data.leads.filter(
        (l) => l && (l.phone || l.momName) && normalizePeruPhone(l.phone).valid
      );
      if (validCrmLeads.length > 0) {
        tickState.crmSyncedFromIframe = true;
        tickState.leads = validCrmLeads;
        if (event.data.activeTab && tickState.audienceMode === 'origin') {
          tickState.selectedOrigins = [event.data.activeTab];
        }
        renderTickToolBody();
      }
    }

    // 2. Selección de checkboxes o cambio de pestaña desde el CRM izquierdo (ZENTRY_CRM_SELECTION)
    if (type === 'ZENTRY_CRM_SELECTION') {
      const incomingIds = event.data.selectedLeadIds || event.data.leadIds;
      if (Array.isArray(incomingIds) && incomingIds.length > 0) {
        tickState.audienceMode = 'manual';
        tickState.manualLeadIds = new Set(incomingIds);
        tickState.previewLeadIndex = 0;
        appendSimLog(`🔗 Sincronizados ${incomingIds.length} prospectos marcados desde la tabla CRM.`);
        renderTickToolBody();
      } else if (event.data.activeTab) {
        tickState.audienceMode = 'origin';
        tickState.selectedOrigins = [event.data.activeTab];
        tickState.previewLeadIndex = 0;
        renderTickToolBody();
      }
    }

    // 3. Respuesta de la extensión Chrome MV3 (ZENTRY_TICKTOOL_PONG / STATUS_UPDATED)
    if (type === 'ZENTRY_TICKTOOL_PONG' || type === 'ZENTRY_TICKTOOL_STATUS_UPDATED') {
      tickState.extInstalled = true;
      tickState.lastPingAt = Date.now();
      if (event.data.state) {
        tickState.waConnected = Boolean(event.data.state.waConnected);
        tickState.waSessionInfo = event.data.state;
        if (Array.isArray(event.data.state.waContacts) && event.data.state.waContacts.length > 0) {
          tickState.waAgendaContacts = event.data.state.waContacts;
        }
        if (Array.isArray(event.data.state.outboxQueue) && event.data.state.outboxQueue.length > 0) {
          const existingMap = new Map(tickState.outbox.map((item) => [item.id, item]));
          event.data.state.outboxQueue.forEach((extItem) => {
            if (!extItem || !extItem.id) return;
            const prev = existingMap.get(extItem.id) || {};
            existingMap.set(extItem.id, {
              ...prev,
              id: extItem.id,
              campaignName: extItem.campaignName || prev.campaignName || 'Envío desde Extensión WhatsApp Web',
              leadName: extItem.leadName || prev.leadName || 'Contacto WhatsApp',
              phone: extItem.phone || prev.phone || '',
              origin: extItem.origin || prev.origin || 'WhatsApp Web',
              stepOrder: extItem.stepOrder ?? prev.stepOrder ?? 0,
              renderedMessage: extItem.renderedMessage || extItem.message || prev.renderedMessage || '',
              attachmentsCount: Array.isArray(extItem.attachments)
                ? extItem.attachments.length
                : prev.attachmentsCount || 0,
              status: extItem.status || prev.status || 'pending',
              scheduledAt: extItem.scheduledAt || prev.scheduledAt || Date.now(),
              createdAt: extItem.createdAt || extItem.scheduledAt || prev.createdAt || Date.now()
            });
          });
          tickState.outbox = Array.from(existingMap.values()).sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
          );
        }
      }
      renderTickToolBody();
    }

    // 4. Sincronización directa de contactos capturados desde WhatsApp Web
    if (type === 'ZENTRY_TICKTOOL_CONTACTS_SYNC' && Array.isArray(event.data.contacts)) {
      tickState.extInstalled = true;
      tickState.waAgendaContacts = event.data.contacts;
      tickState.saveFeedback = `✅ Agenda de WhatsApp Web sincronizada: ${event.data.contacts.length} contactos/chats capturados.`;
      renderTickToolBody();
    }
  });
}
