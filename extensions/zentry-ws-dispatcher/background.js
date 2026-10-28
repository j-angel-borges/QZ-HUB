/**
 * Zentry Tick Tool — WhatsApp Web Campaign Dispatcher (Manifest V3)
 * Service Worker (background.js) — v1.2.0
 *
 * Responsabilidades:
 * 1. Sincronizar la cola `whatsapp_outbox` y `whatsapp_campaigns` desde Firestore (zentryos / quarz-group)
 *    o recibir órdenes directas desde QZ-Hub (`qz-hub-app.web.app`, `quarz-group.web.app`, `hub.quarz.online`) y Zentry CRM.
 * 2. Despachar el PRIMER mensaje de una campaña nueva o envío individual de inmediato (2 seg),
 *    y aplicar el Jitter Anti-Baneo (45s a 110s) a partir del 2do contacto en adelante.
 * 3. Sincronizar la Agenda de Contactos / Chats de WhatsApp Web (`waContacts`) extraída por `content.js`
 *    para que QZ-Hub permita buscar cualquier contacto del WhatsApp y hacer envíos individuales.
 * 4. Garantizar CERO marcas de agua en cada mensaje despachado.
 * 5. Detectar respuestas entrantes (Inbound) desde `content.js`, marcar el prospecto como `replied`
 *    en Firestore y abortar (`cancelled`) cualquier follow-up pendiente para ese número.
 */

const FIRESTORE_PROJECTS = ['zentryos', 'quarz-group', 'studio-4949838222-b0ffc'];
const DEFAULT_DAILY_LIMIT = 100;
const ALARM_POLL_OUTBOX = 'zentry_ticktool_poll_outbox';
const ALARM_NEXT_DISPATCH = 'zentry_ticktool_next_dispatch';

// ─── PARADA DE EMERGENCIA Y PURGA INMEDIATA DE COLA LOCAL ──────────────────
// Garantiza que ningún mensaje pendiente quede latente en chrome.storage.local
try {
  chrome.storage.local.get(['outboxQueue', 'isPaused'], (data) => {
    try {
      const queue = Array.isArray(data?.outboxQueue) ? data.outboxQueue : [];
      const purged = queue.map(item => {
        if (item && item.status === 'pending') {
          return {
            ...item,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancelReason: 'Campaña pausada o anulada por el usuario'
          };
        }
        return item;
      });
      chrome.storage.local.set({
        isPaused: true,
        nextDispatchAt: null,
        outboxQueue: purged
      });
      chrome.alarms.clear(ALARM_NEXT_DISPATCH);
    } catch (_) {}
  });
} catch (_) {}

// Identifica si un ítem es un envío directo/manual o prueba 1-a-1 (no penalizado por límite masivo)
function isDirectOrManualItem(item) {
  if (!item) return false;
  const tab = String(item.sheetTab || item.origin || '').toLowerCase();
  const cName = String(item.campaignName || '').toLowerCase();
  const cId = String(item.campaignId || '').toLowerCase();
  return (
    tab.includes('directo') ||
    tab.includes('manual') ||
    tab.includes('overlay') ||
    cId.startsWith('inchat_') ||
    cId.startsWith('indiv-') ||
    cName.includes('individual') ||
    cName.includes('directo') ||
    cName.includes('prueba')
  );
}

// ─── Función Crítica de Jitter Obligatorio (45s a 110s) ──────────────────────
function computeMandatoryJitterDelay(minSec = 45, maxSec = 110) {
  const jitterDelay = Math.floor(Math.random() * (110000 - 45000 + 1)) + 45000; // Entre 45s y 110s
  if (minSec === 45 && maxSec === 110) {
    return jitterDelay;
  }
  const customMin = Math.max(10000, minSec * 1000);
  const customMax = Math.max(customMin + 5000, maxSec * 1000);
  return Math.floor(Math.random() * (customMax - customMin + 1)) + customMin;
}

// Sanitizador estricto anti-marca de agua
function stripAnyWatermark(text) {
  if (!text) return '';
  return String(text)
    .replace(/Powered by blueticks\.co/gi, '')
    .replace(/Sent via Blueticks/gi, '')
    .trim();
}

function getTodayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

// Normaliza cualquier fecha (`number` ms o `string` ISO) a milisegundos epoch
function parseScheduledTimeMs(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const asNum = Number(val);
  if (!Number.isNaN(asNum) && asNum > 1000000000000) return asNum;
  const parsed = Date.parse(String(val));
  return Number.isNaN(parsed) ? 0 : parsed;
}

// ─── Estado Inicial en chrome.storage.local ──────────────────────────────────
async function getDispatcherState() {
  const data = await chrome.storage.local.get([
    'isPaused',
    'waConnected',
    'activeCampaignName',
    'activeCampaignId',
    'dailyDispatchedCount',
    'dailyDateKey',
    'dailyLimit',
    'outboxQueue',
    'waContacts',
    'lastJitterMs',
    'nextDispatchAt',
    'lastDispatchedPhone',
    'lastDispatchedAt',
    'firestoreProject'
  ]);

  const today = getTodayDateKey();
  let dailyDispatchedCount = data.dailyDispatchedCount || 0;
  if (data.dailyDateKey !== today) {
    dailyDispatchedCount = 0;
    await chrome.storage.local.set({
      dailyDispatchedCount: 0,
      dailyDateKey: today
    });
  }

  return {
    isPaused: data.isPaused !== undefined ? Boolean(data.isPaused) : true,
    waConnected: Boolean(data.waConnected),
    activeCampaignName: data.activeCampaignName || 'Campaña Expo Maternidad / QZ-Hub',
    activeCampaignId: data.activeCampaignId || '',
    dailyDispatchedCount,
    dailyDateKey: today,
    dailyLimit: Number(data.dailyLimit) || DEFAULT_DAILY_LIMIT,
    outboxQueue: Array.isArray(data.outboxQueue) ? data.outboxQueue : [],
    waContacts: Array.isArray(data.waContacts) ? data.waContacts : [],
    lastJitterMs: Number(data.lastJitterMs) || 0,
    nextDispatchAt: data.nextDispatchAt || null,
    lastDispatchedPhone: data.lastDispatchedPhone || null,
    lastDispatchedAt: data.lastDispatchedAt || null,
    firestoreProject: data.firestoreProject || 'zentryos'
  };
}

// ─── Helpers de Firestore REST API ───────────────────────────────────────────
function parseFirestoreValue(fieldVal) {
  if (!fieldVal || typeof fieldVal !== 'object') return null;
  if ('stringValue' in fieldVal) return fieldVal.stringValue;
  if ('integerValue' in fieldVal) return Number(fieldVal.integerValue);
  if ('doubleValue' in fieldVal) return Number(fieldVal.doubleValue);
  if ('booleanValue' in fieldVal) return Boolean(fieldVal.booleanValue);
  if ('nullValue' in fieldVal) return null;
  if ('arrayValue' in fieldVal) {
    return (fieldVal.arrayValue.values || []).map(parseFirestoreValue);
  }
  if ('mapValue' in fieldVal) {
    const out = {};
    const fields = fieldVal.mapValue.fields || {};
    for (const k of Object.keys(fields)) {
      out[k] = parseFirestoreValue(fields[k]);
    }
    return out;
  }
  return null;
}

function parseFirestoreDoc(docObj) {
  if (!docObj || !docObj.fields) return null;
  const parsed = {};
  for (const [k, v] of Object.entries(docObj.fields)) {
    parsed[k] = parseFirestoreValue(v);
  }
  if (!parsed.id && docObj.name) {
    const parts = docObj.name.split('/');
    parsed.id = parts[parts.length - 1];
  }
  return parsed;
}

async function fetchPendingOutboxFromFirestore() {
  const allItems = [];

  for (const projectId of FIRESTORE_PROJECTS) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/whatsapp_outbox?pageSize=200`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      if (!json.documents) continue;

      for (const docObj of json.documents) {
        const item = parseFirestoreDoc(docObj);
        if (item && item.id) {
          item._projectId = projectId;
          allItems.push(item);
        }
      }
    } catch (err) {
      console.warn(`[TickTool SW] No se pudo consultar Firestore (${projectId}):`, err);
    }
  }

  // Ordenar por scheduledFor ascendente (numérico o ISO)
  allItems.sort((a, b) => parseScheduledTimeMs(a.scheduledFor) - parseScheduledTimeMs(b.scheduledFor));

  const state = await getDispatcherState();
  // Preservar estado local ('dispatched' / 'cancelled' / 'replied') y attachments en base64
  // para que un poll de Firestore jamás revierta un mensaje recién enviado a 'pending'
  const localMap = new Map((state.outboxQueue || []).map(i => [i.id, i]));
  const mergedItems = allItems.map(cloudItem => {
    const local = localMap.get(cloudItem.id);
    if (!local) return cloudItem;
    const finalStatus =
      local.status === 'dispatched' || local.status === 'cancelled' || local.status === 'replied'
        ? local.status
        : cloudItem.status;
    return {
      ...cloudItem,
      status: finalStatus,
      dispatchedAt: local.dispatchedAt || cloudItem.dispatchedAt || null,
      attachments:
        Array.isArray(local.attachments) && local.attachments.length > 0
          ? local.attachments
          : cloudItem.attachments || []
    };
  });

  // Conservar también ítems puramente locales que aún no estén en Firestore
  for (const [id, localItem] of localMap.entries()) {
    if (!mergedItems.some(m => m.id === id)) {
      mergedItems.push(localItem);
    }
  }

  const pendingCount = mergedItems.filter(i => i.status === 'pending').length;

  await chrome.storage.local.set({
    outboxQueue: mergedItems,
    activeCampaignName:
      mergedItems.find(i => i.status === 'pending')?.campaignName || state.activeCampaignName
  });

  if (pendingCount > 0 && !state.isPaused) {
    await scheduleNextDispatchIfIdle();
  }

  return mergedItems;
}

// ─── Bóveda en Memoria para Adjuntos Pesados (Videos/PDFs) ───────────────────
// Evita guardar strings base64 de 30MB+ dentro de `outboxQueue` en cada `chrome.storage.local.set`
// o enviarlos de vuelta en cada PONG/STATUS_UPDATED a las pestañas web.
const attachmentVaultMemory = new Map();

function stripHeavyAttachmentsForQueue(attachments = [], itemId = '') {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  const fullWithData = attachments.filter(a => a && a.dataUrl);
  if (fullWithData.length > 0 && itemId) {
    attachmentVaultMemory.set(itemId, attachments);
  }
  return attachments.map(a => ({
    id: a.id || `att-${Date.now()}`,
    name: a.name || 'archivo',
    type: a.type || a.mimeType || 'application/octet-stream',
    mimeType: a.mimeType || a.type || 'application/octet-stream',
    size: Number(a.size) || 0,
    // Solo conservar dataUrl inline en storage si es liviano (< 2 MB); los videos pesados viven en attachmentVaultMemory
    dataUrl: a.dataUrl && String(a.dataUrl).length < 2 * 1024 * 1024 ? a.dataUrl : undefined
  }));
}

function getFullAttachmentsForItem(item) {
  if (!item) return [];
  const fromVault = attachmentVaultMemory.get(item.id);
  if (Array.isArray(fromVault) && fromVault.length > 0) return fromVault;
  return Array.isArray(item.attachments) ? item.attachments : [];
}

async function createFirestoreOutboxDoc(item, projectId = 'zentryos') {
  if (!item || !item.id) return;
  const projectsToTry = projectId
    ? [projectId, ...FIRESTORE_PROJECTS.filter(p => p !== projectId)]
    : FIRESTORE_PROJECTS;

  const cleanPhone = String(item.phoneE164 || item.phoneDisplay || item.phone || '').replace(/\D/g, '');
  const displayPhone = cleanPhone
    ? cleanPhone.startsWith('+')
      ? cleanPhone
      : `+${cleanPhone}`
    : item.leadName || 'Chat WhatsApp';

  const fieldsPayload = {
    id: { stringValue: String(item.id) },
    campaignId: { stringValue: String(item.campaignId || 'inchat_overlay') },
    campaignName: { stringValue: String(item.campaignName || 'Envío Individual WhatsApp Web') },
    leadId: { stringValue: String(item.leadId || item.id) },
    leadName: { stringValue: String(item.leadName || 'Contacto WhatsApp') },
    displayName: { stringValue: String(item.leadName || 'Contacto WhatsApp') },
    firstName: { stringValue: String((item.leadName || 'Contacto').split(' ')[0]) },
    phone: { stringValue: displayPhone },
    phoneDisplay: { stringValue: displayPhone },
    phoneE164: { stringValue: cleanPhone },
    normalizedPhone: { stringValue: cleanPhone || String(item.leadName || 'Chat') },
    origin: { stringValue: String(item.origin || 'WhatsApp Web Overlay') },
    district: { stringValue: String(item.district || 'Lima') },
    stepNumber: { integerValue: String(Number(item.stepOrder || 0)) },
    stepOrder: { integerValue: String(Number(item.stepOrder || 0)) },
    stepLabel: { stringValue: String(item.stepLabel || 'Inicial (Paso 0)') },
    renderedMessage: { stringValue: String(item.renderedMessage || item.messageBody || '') },
    messageBody: { stringValue: String(item.messageBody || item.renderedMessage || '') },
    status: { stringValue: String(item.status || 'pending') },
    jitterSec: { integerValue: '0' },
    jitterDelayMs: { integerValue: '0' },
    scheduledAt: { stringValue: new Date(parseScheduledTimeMs(item.scheduledFor) || Date.now()).toISOString() },
    scheduledFor: { stringValue: new Date(parseScheduledTimeMs(item.scheduledFor) || Date.now()).toISOString() },
    stopOnReply: { booleanValue: true },
    watermarkFree: { booleanValue: true },
    createdAt: { integerValue: String(Date.now()) },
    createdAtIso: { stringValue: new Date().toISOString() }
  };

  if (item.dispatchedAt) {
    fieldsPayload.dispatchedAt = { stringValue: String(item.dispatchedAt) };
  }

  for (const proj of projectsToTry) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/whatsapp_outbox/${encodeURIComponent(item.id)}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsPayload })
      });
    } catch (err) {
      console.warn(`[TickTool SW] Error creando doc Firestore (${proj}) para ${item.id}:`, err);
    }
  }
}

async function patchFirestoreOutboxStatus(itemId, status, extraFields = {}, projectId = 'zentryos') {
  const projectsToTry = projectId ? [projectId, ...FIRESTORE_PROJECTS.filter(p => p !== projectId)] : FIRESTORE_PROJECTS;

  const fieldsPayload = {
    status: { stringValue: status }
  };

  for (const [k, v] of Object.entries(extraFields)) {
    if (typeof v === 'boolean') {
      fieldsPayload[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      fieldsPayload[k] = { integerValue: String(v) };
    } else if (v !== null && v !== undefined) {
      fieldsPayload[k] = { stringValue: String(v) };
    }
  }

  const updateMaskParams = Object.keys(fieldsPayload)
    .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');

  for (const proj of projectsToTry) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/whatsapp_outbox/${encodeURIComponent(itemId)}?${updateMaskParams}`;
      await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsPayload })
      });
    } catch (err) {
      console.warn(`[TickTool SW] Error actualizando Firestore (${proj}) para ${itemId}:`, err);
    }
  }
}

// ─── Verificación de Pestañas Abiertas de WhatsApp Web ───────────────────────
async function checkWhatsAppWebConnection() {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' });
    const connected = tabs && tabs.length > 0;
    await chrome.storage.local.set({ waConnected: connected });
    return { connected, tab: connected ? tabs[0] : null };
  } catch (e) {
    return { connected: false, tab: null };
  }
}

// ─── Programador con Jitter Aleatorio (o Inmediato para el 1er mensaje) ──────
async function scheduleNextDispatchIfIdle(forceImmediate = false) {
  const state = await getDispatcherState();
  if (state.isPaused) {
    await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
    await chrome.storage.local.set({ nextDispatchAt: null });
    return;
  }

  const nowMs = Date.now();
  const pendingItems = state.outboxQueue
    .filter(item => item.status === 'pending' && !dispatchedOutboxIdsMemory.has(item.id))
    .sort((a, b) => parseScheduledTimeMs(a.scheduledFor) - parseScheduledTimeMs(b.scheduledFor));

  if (pendingItems.length === 0) {
    await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
    await chrome.storage.local.set({ nextDispatchAt: null });
    return;
  }

  // Si se alcanzó el límite diario, verificar si hay envíos directos o manuales prioritarios
  if (state.dailyDispatchedCount >= state.dailyLimit && !forceImmediate) {
    const nextIsDirect = isDirectOrManualItem(pendingItems[0]);
    if (!nextIsDirect) {
      console.log(`[TickTool SW] Límite de lote diario alcanzado (${state.dailyDispatchedCount}/${state.dailyLimit}). Cola masiva en espera.`);
      await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
      return;
    }
  }

  const nextItem = pendingItems[0];
  const itemSchedMs = parseScheduledTimeMs(nextItem.scheduledFor);

  // Si es forzado inmediato o su hora programada ya llegó (o está a menos de 3s), despachar en 400ms
  let delayMs;
  if (forceImmediate && itemSchedMs <= nowMs + 5000) {
    delayMs = 400;
  } else if (itemSchedMs > nowMs + 1500) {
    delayMs = itemSchedMs - nowMs;
  } else {
    // Si ya está vencido, despachar con espaciado humano y seguro (4.5 a 7.5s) para que WhatsApp Web asiente el chat
    delayMs = 4500 + Math.floor(Math.random() * 3000);
  }

  const nextRunTime = nowMs + delayMs;

  await chrome.storage.local.set({
    lastJitterMs: delayMs,
    nextDispatchAt: new Date(nextRunTime).toISOString(),
    activeCampaignName: nextItem.campaignName || state.activeCampaignName,
    activeCampaignId: nextItem.campaignId || state.activeCampaignId
  });

  await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
  await chrome.alarms.create(ALARM_NEXT_DISPATCH, {
    when: nextRunTime
  });

  // Respaldo de precisión sub-minuto para esperas cortas (ej. 1 min o 5 min) mientras el SW esté activo
  if (preciseFollowUpTimerId) {
    clearTimeout(preciseFollowUpTimerId);
    preciseFollowUpTimerId = null;
  }
  if (delayMs <= 6 * 60 * 1000) {
    preciseFollowUpTimerId = setTimeout(() => {
      preciseFollowUpTimerId = null;
      processNextOutboxItem(false);
    }, Math.max(400, delayMs));
  }
}

let preciseFollowUpTimerId = null;

// ─── Candado Anti-Duplicados en Memoria del Service Worker ───────────────────
let isProcessingDispatchLock = false;
const dispatchedOutboxIdsMemory = new Set();

// ─── Ejecución Silenciosa de Envío en WhatsApp Web ───────────────────────────
async function processNextOutboxItem(forceAnyPending = false) {
  if (isProcessingDispatchLock) {
    return { ok: false, reason: 'ALREADY_PROCESSING' };
  }
  isProcessingDispatchLock = true;

  try {
    const state = await getDispatcherState();
    // Candado absoluto: si el despachador está pausado, abortar inmediatamente sin excepción
    if (state.isPaused) {
      await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
      return { ok: false, reason: 'PAUSED' };
    }

    const nowMs = Date.now();

    // Candado de seguridad: si hay un mensaje en vuelo activo en la pestaña (y no han pasado más de 32s),
    // no enviar otro en paralelo; esperar a que el actual culmine y re-programar.
    const { inFlightDispatch } = await chrome.storage.local.get(['inFlightDispatch']);
    if (inFlightDispatch && inFlightDispatch.startedAt && nowMs - new Date(inFlightDispatch.startedAt).getTime() < 32000) {
      await scheduleNextDispatchIfIdle(false);
      return { ok: false, reason: 'IN_FLIGHT_BUSY' };
    }
    const pendingSorted = state.outboxQueue
      .filter(item => {
        if (!item || item.status !== 'pending') return false;
        if (dispatchedOutboxIdsMemory.has(item.id)) return false;
        const cStatus = String(item.campaignStatus || '').toLowerCase();
        if (cStatus === 'paused' || cStatus === 'cancelled') return false;
        return true;
      })
      .sort((a, b) => parseScheduledTimeMs(a.scheduledFor) - parseScheduledTimeMs(b.scheduledFor));

    // NUNCA enviar por adelantado un Follow-up (stepOrder/stepIndex > 0) ni un mensaje programado a futuro (> 5s)
    // aunque forceAnyPending sea true: solo el paso 0 listo para salir ahora debe despacharse de inmediato.
    const readyItems = pendingSorted.filter(item => {
      const schedMs = parseScheduledTimeMs(item.scheduledFor);
      const stepNum = Number(item.stepOrder ?? item.stepIndex ?? 0);
      if (stepNum > 0 && schedMs > nowMs + 3000) return false;
      return schedMs <= nowMs + 5000;
    });

    const nextItem =
      readyItems[0] ||
      (forceAnyPending
        ? pendingSorted.find(i => Number(i.stepOrder ?? i.stepIndex ?? 0) === 0 && parseScheduledTimeMs(i.scheduledFor) <= nowMs + 15000)
        : null);

    if (!nextItem) {
      await scheduleNextDispatchIfIdle(false);
      return { ok: false, reason: 'NO_READY_ITEMS' };
    }

    // Si alcanzó límite diario, solo permitir si es forzado o si es ítem directo/manual
    const isDirect = isDirectOrManualItem(nextItem);
    if (state.dailyDispatchedCount >= state.dailyLimit && !forceAnyPending && !isDirect) {
      return { ok: false, reason: 'DAILY_LIMIT_REACHED' };
    }

    // Marcar el ID como en proceso y como 'dispatched' ANTES de enviar el mensaje a la pestaña
    // para que ningún otro evento concurrente pueda volver a tomar este mismo ítem.
    dispatchedOutboxIdsMemory.add(nextItem.id);
    const dispatchedAt = new Date().toISOString();
    await markLocalAndCloudStatus(
      nextItem.id,
      'dispatched',
      { dispatchedAt, watermarkFree: true },
      nextItem._projectId
    );

    // Asegurar texto 100% libre de marca de agua
    const cleanMessage = stripAnyWatermark(nextItem.messageBody || nextItem.renderedMessage);
    const cleanPhone = String(nextItem.phoneE164 || nextItem.phoneDisplay || nextItem.phone || '').replace(/\D/g, '');
    const contactName = nextItem.leadName || nextItem.contactName || '';
    const attachments = getFullAttachmentsForItem(nextItem);

    if ((!cleanPhone && !contactName) || (!cleanMessage && attachments.length === 0)) {
      await markLocalAndCloudStatus(nextItem.id, 'cancelled', {
        cancelReason: 'Teléfono/contacto o mensaje inválido'
      });
      return { ok: false, reason: 'INVALID_ITEM' };
    }

    const { connected, tab } = await checkWhatsAppWebConnection();
    let targetTab = tab;

    const inFlightPayload = {
      outboxId: nextItem.id,
      phone: cleanPhone,
      leadName: contactName,
      message: cleanMessage,
      attachments,
      mode: nextItem.mode || (cleanPhone ? 'PHONE_URL' : 'SEARCH_CONTACT_NAME'),
      projectId: nextItem._projectId || 'zentryos',
      startedAt: dispatchedAt
    };

    // Guardar solo versión ligera en storage para no saturar si hay video pesado
    await chrome.storage.local.set({
      inFlightDispatch: {
        ...inFlightPayload,
        attachments: stripHeavyAttachmentsForQueue(attachments, nextItem.id)
      }
    });

    const sendUrl = cleanPhone
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(cleanMessage)}`
      : `https://web.whatsapp.com/`;

    if (!connected || !targetTab) {
      targetTab = await chrome.tabs.create({ url: sendUrl, active: true });
    } else {
      try {
        const response = await chrome.tabs.sendMessage(targetTab.id, {
          type: 'TICKTOOL_DISPATCH_MESSAGE',
          payload: inFlightPayload
        });

        if (!response || !response.accepted) {
          await chrome.tabs.update(targetTab.id, { url: sendUrl, active: true });
        }
      } catch (err) {
        await chrome.tabs.update(targetTab.id, { url: sendUrl, active: true });
      }
    }

    const newDailyCount = state.dailyDispatchedCount + 1;
    await chrome.storage.local.set({
      dailyDispatchedCount: newDailyCount,
      lastDispatchedPhone: cleanPhone ? `+${cleanPhone}` : contactName,
      lastDispatchedAt: dispatchedAt,
      nextDispatchAt: null
    });

    // Programar el siguiente mensaje en cola
    await scheduleNextDispatchIfIdle(false);

    return { ok: true, dispatchedItem: nextItem };
  } finally {
    isProcessingDispatchLock = false;
  }
}

async function markLocalAndCloudStatus(itemId, newStatus, extraFields = {}, projectId = 'zentryos') {
  const state = await getDispatcherState();
  const updatedQueue = state.outboxQueue.map(item =>
    item.id === itemId ? { ...item, status: newStatus, ...extraFields } : item
  );
  await chrome.storage.local.set({ outboxQueue: updatedQueue });
  await patchFirestoreOutboxStatus(itemId, newStatus, extraFields, projectId);
}

// ─── Detector de Interrupción (Trigger de Parada por Respuesta Entrante) ─────
async function handleInboundReplyDetected(rawPhone, leadName = '') {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits && !leadName) return { cancelledFollowUps: 0 };

  const normalizedPhone = digits.length === 9 && digits.startsWith('9') ? `51${digits}` : digits;
  const state = await getDispatcherState();
  const nowIso = new Date().toISOString();
  let cancelledCount = 0;

  const updatedQueue = [];
  for (const item of state.outboxQueue) {
    const itemPhone = String(item.phoneE164 || item.phoneDisplay || item.phone || '').replace(/\D/g, '');
    const matchByPhone =
      normalizedPhone &&
      (itemPhone === normalizedPhone || itemPhone.endsWith(normalizedPhone.slice(-9)));
    const matchByName =
      !normalizedPhone &&
      leadName &&
      item.leadName &&
      item.leadName.toLowerCase().includes(leadName.toLowerCase());

    if (matchByPhone || matchByName) {
      if (item.status === 'pending' && Number(item.stepOrder) > 0 && item.stopOnReply !== false) {
        cancelledCount += 1;
        const updatedItem = {
          ...item,
          status: 'cancelled',
          repliedAt: nowIso,
          cancelReason: 'Detenido automáticamente: el prospecto respondió por WhatsApp'
        };
        updatedQueue.push(updatedItem);
        patchFirestoreOutboxStatus(
          item.id,
          'cancelled',
          {
            repliedAt: nowIso,
            cancelReason: 'Detenido automáticamente: el prospecto respondió por WhatsApp'
          },
          item._projectId
        );
        continue;
      }

      if (item.status === 'dispatched' || Number(item.stepOrder) === 0) {
        const updatedItem = {
          ...item,
          status: 'replied',
          repliedAt: nowIso
        };
        updatedQueue.push(updatedItem);
        patchFirestoreOutboxStatus(item.id, 'replied', { repliedAt: nowIso }, item._projectId);
        continue;
      }
    }

    updatedQueue.push(item);
  }

  await chrome.storage.local.set({ outboxQueue: updatedQueue });
  return { cancelledFollowUps: cancelledCount };
}

// Reinyecta automáticamente content.js en todas las pestañas abiertas de WhatsApp Web, QZ-Hub y Zentry CRM
// cuando el usuario recarga la extensión en chrome://extensions, sin obligarlo a pulsar F5.
async function reinjectContentScriptIntoOpenTabs() {
  try {
    const tabs = await chrome.tabs.query({
      url: [
        'https://web.whatsapp.com/*',
        'https://hub.quarz.online/*',
        'https://qz-hub-app.web.app/*',
        'https://qz-hub-app.firebaseapp.com/*',
        'https://quarz-group.web.app/*',
        'https://quarz-group.firebaseapp.com/*',
        'https://zentry-prospecc.web.app/*',
        'https://zentry-prospecc.firebaseapp.com/*',
        'https://zentry-prospect.web.app/*',
        'https://zentry-prospect.firebaseapp.com/*',
        'https://zentryos.web.app/*',
        'https://zentryos.firebaseapp.com/*',
        'http://localhost:*/*'
      ]
    });
    for (const tab of tabs) {
      if (tab.id) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } catch (_) {}
      }
    }
  } catch (_) {}
}

// ─── Listeners de Eventos y Alarmas ──────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  await reinjectContentScriptIntoOpenTabs();
  await getDispatcherState();
  await checkWhatsAppWebConnection();
  await fetchPendingOutboxFromFirestore();
  await chrome.alarms.create(ALARM_POLL_OUTBOX, { periodInMinutes: 0.5 });
});

chrome.runtime.onStartup.addListener(async () => {
  await reinjectContentScriptIntoOpenTabs();
  await checkWhatsAppWebConnection();
  await fetchPendingOutboxFromFirestore();
  await chrome.alarms.create(ALARM_POLL_OUTBOX, { periodInMinutes: 0.5 });
});

// Respaldo de Alarma Top-Level: Garantiza que la alarma periódica esté siempre activa en MV3
try {
  chrome.alarms.get(ALARM_POLL_OUTBOX, alarm => {
    if (!alarm) {
      chrome.alarms.create(ALARM_POLL_OUTBOX, { periodInMinutes: 0.5 });
    }
  });
} catch (_) {}

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === ALARM_POLL_OUTBOX) {
    await checkWhatsAppWebConnection();
    await fetchPendingOutboxFromFirestore();
  } else if (alarm.name === ALARM_NEXT_DISPATCH) {
    await processNextOutboxItem(false);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.url && tab.url.startsWith('https://web.whatsapp.com')) {
    await chrome.storage.local.set({ waConnected: true });
  }
});

chrome.tabs.onRemoved.addListener(async () => {
  await checkWhatsAppWebConnection();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message?.type) {
        case 'TICKTOOL_GET_STATUS':
        case 'TICKTOOL_SCRAPE_CONTACTS_NOW': {
          const { connected, tab } = await checkWhatsAppWebConnection();
          let freshContacts = [];
          if (connected && tab?.id) {
            try {
              const res = await chrome.tabs.sendMessage(tab.id, { type: 'TICKTOOL_COLLECT_WA_CONTACTS' });
              if (res && Array.isArray(res.contacts) && res.contacts.length > 0) {
                freshContacts = res.contacts;
                await chrome.storage.local.set({ waContacts: res.contacts });
              }
            } catch (_) {}
          }
          const state = await getDispatcherState();
          sendResponse({
            ok: true,
            contacts: freshContacts.length > 0 ? freshContacts : state.waContacts,
            state
          });
          break;
        }

        case 'TICKTOOL_SYNC_NOW': {
          const items = await fetchPendingOutboxFromFirestore();
          const state = await getDispatcherState();
          sendResponse({ ok: true, count: items.length, state });
          break;
        }

        case 'TICKTOOL_TOGGLE_PAUSE': {
          const current = await getDispatcherState();
          const nextPaused = typeof message.isPaused === 'boolean' ? message.isPaused : !current.isPaused;
          await chrome.storage.local.set({ isPaused: nextPaused });
          if (nextPaused) {
            await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
            await chrome.storage.local.set({ nextDispatchAt: null });
            if (preciseFollowUpTimerId) {
              clearTimeout(preciseFollowUpTimerId);
              preciseFollowUpTimerId = null;
            }
          } else {
            await scheduleNextDispatchIfIdle(true);
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, state: updatedState });
          break;
        }

        case 'TICKTOOL_CANCEL_ALL_CAMPAIGNS': {
          const current = await getDispatcherState();
          const queue = Array.isArray(current.outboxQueue) ? current.outboxQueue : [];
          const nowIso = new Date().toISOString();
          const purged = queue.map(item => {
            if (item && item.status === 'pending') {
              return {
                ...item,
                status: 'cancelled',
                cancelledAt: nowIso,
                cancelReason: 'Todas las campañas anuladas por el usuario'
              };
            }
            return item;
          });
          await chrome.storage.local.set({
            isPaused: true,
            nextDispatchAt: null,
            outboxQueue: purged
          });
          await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
          if (preciseFollowUpTimerId) {
            clearTimeout(preciseFollowUpTimerId);
            preciseFollowUpTimerId = null;
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, state: updatedState, cancelledCount: queue.length - purged.filter(i => i.status === 'pending').length });
          break;
        }

        case 'TICKTOOL_CANCEL_CAMPAIGN': {
          const targetCampaignId = String(message.campaignId || '');
          const current = await getDispatcherState();
          const queue = Array.isArray(current.outboxQueue) ? current.outboxQueue : [];
          const nowIso = new Date().toISOString();
          const purged = queue.map(item => {
            if (item && item.status === 'pending' && (!targetCampaignId || item.campaignId === targetCampaignId)) {
              return {
                ...item,
                status: 'cancelled',
                cancelledAt: nowIso,
                cancelReason: `Campaña ${targetCampaignId} anulada por el usuario`
              };
            }
            return item;
          });
          await chrome.storage.local.set({
            outboxQueue: purged
          });
          const remainingPending = purged.filter(i => i.status === 'pending').length;
          if (remainingPending === 0) {
            await chrome.alarms.clear(ALARM_NEXT_DISPATCH);
            await chrome.storage.local.set({ nextDispatchAt: null });
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, state: updatedState });
          break;
        }

        case 'TICKTOOL_DISPATCH_NEXT_NOW': {
          const result = await processNextOutboxItem(true);
          const state = await getDispatcherState();
          sendResponse({ ...result, state });
          break;
        }

        case 'TICKTOOL_RESET_DAILY_COUNT': {
          await chrome.storage.local.set({ dailyDispatchedCount: 0 });
          await scheduleNextDispatchIfIdle(true);
          const state = await getDispatcherState();
          sendResponse({ ok: true, state });
          break;
        }

        case 'TICKTOOL_SET_DAILY_LIMIT': {
          const newLimit = Math.max(1, Number(message.limit) || 100);
          await chrome.storage.local.set({ dailyLimit: newLimit });
          await scheduleNextDispatchIfIdle(true);
          const state = await getDispatcherState();
          sendResponse({ ok: true, state });
          break;
        }

        case 'TICKTOOL_PUSH_CAMPAIGN_QUEUE': {
          // Recibe cola directamente desde QZ-Hub o Zentry CRM (incluyendo attachments en base64)
          const incomingItems = Array.isArray(message.items) ? message.items : [];
          const current = await getDispatcherState();
          const mapById = new Map(current.outboxQueue.map(i => [i.id, i]));
          for (const item of incomingItems) {
            if (item && item.id) {
              const existing = mapById.get(item.id) || {};
              const rawAtts =
                Array.isArray(item.attachments) && item.attachments.length > 0
                  ? item.attachments
                  : existing.attachments || [];
              const lightAtts = stripHeavyAttachmentsForQueue(rawAtts, item.id);
              mapById.set(item.id, {
                ...existing,
                ...item,
                attachments: lightAtts,
                messageBody: stripAnyWatermark(item.messageBody || item.renderedMessage)
              });
            }
          }
          const merged = Array.from(mapById.values());
          const targetPaused = typeof message.isPaused === 'boolean' ? message.isPaused : current.isPaused;
          await chrome.storage.local.set({
            outboxQueue: merged,
            isPaused: targetPaused,
            activeCampaignName: message.campaignName || current.activeCampaignName,
            activeCampaignId: message.campaignId || current.activeCampaignId
          });

          // Solo si NO está pausado y el primer mensaje está para ahora, despachar
          if (!targetPaused) {
            const nowMs = Date.now();
            const hasImmediate = incomingItems.some(
              i => i.status === 'pending' && parseScheduledTimeMs(i.scheduledFor) <= nowMs + 5000
            );
            if (hasImmediate) {
              await processNextOutboxItem(true);
            } else {
              await scheduleNextDispatchIfIdle(false);
            }
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, state: updatedState });
          break;
        }

        case 'TICKTOOL_INBOUND_REPLY': {
          const res = await handleInboundReplyDetected(message.phone, message.leadName);
          const state = await getDispatcherState();
          sendResponse({ ok: true, ...res, state });
          break;
        }

        case 'TICKTOOL_WA_HEARTBEAT': {
          const incomingContacts = Array.isArray(message.contacts) ? message.contacts : null;
          const updates = { waConnected: true };
          if (incomingContacts && incomingContacts.length > 0) {
            updates.waContacts = incomingContacts;
          }
          await chrome.storage.local.set(updates);
          const { inFlightDispatch } = await chrome.storage.local.get(['inFlightDispatch']);
          sendResponse({ ok: true, inFlightDispatch: inFlightDispatch || null });
          break;
        }

        case 'TICKTOOL_INFLIGHT_COMPLETED': {
          const completedId = message.outboxId;
          await chrome.storage.local.remove(['inFlightDispatch']);
          if (completedId) {
            const nowIso = new Date().toISOString();
            await markLocalAndCloudStatus(completedId, 'dispatched', {
              dispatchedAt: nowIso,
              watermarkFree: true
            });
          }
          const state = await getDispatcherState();
          sendResponse({ ok: true, state });
          break;
        }

        case 'TICKTOOL_DISPATCH_FAILED': {
          const failedId = message.outboxId;
          await chrome.storage.local.remove(['inFlightDispatch']);
          if (failedId) {
            const nowIso = new Date().toISOString();
            await markLocalAndCloudStatus(failedId, 'failed', {
              failedAt: nowIso,
              failureReason: message.reason || 'DISPATCH_ABORTED'
            });
          }
          const state = await getDispatcherState();
          sendResponse({ ok: true, state });
          break;
        }

        case 'TICKTOOL_TEST_SEND_NOW': {
          const cleanPhone = String(message.phone || '').replace(/\D/g, '');
          const contactName = String(message.leadName || message.contactName || 'Prueba Tick Tool').trim();
          const cleanMessage = stripAnyWatermark(
            message.message || 'Hola 👋, prueba de conexión automática desde Zentry Tick Tool (Sin marca de agua).'
          );
          const itemId = message.id || `direct_${Date.now()}`;
          const rawAttachments = Array.isArray(message.attachments) ? message.attachments : [];
          const lightAttachments = stripHeavyAttachmentsForQueue(rawAttachments, itemId);
          const testItem = {
            id: itemId,
            campaignId: message.campaignId || 'direct_individual',
            campaignName: message.campaignName || 'Envío Individual Directo',
            leadName: contactName,
            phoneDisplay: cleanPhone || contactName,
            phoneE164: cleanPhone.length === 9 && cleanPhone.startsWith('9') ? `51${cleanPhone}` : cleanPhone,
            mode: message.mode || (cleanPhone ? 'PHONE_URL' : 'SEARCH_CONTACT_NAME'),
            stepOrder: 0,
            stepLabel: 'Envío Individual',
            messageBody: cleanMessage,
            renderedMessage: cleanMessage,
            attachments: lightAttachments,
            scheduledFor: message.scheduledFor || new Date().toISOString(),
            status: 'pending',
            stopOnReply: true,
            watermarkFree: true,
            operatorId: message.operatorId || ''
          };
          const current = await getDispatcherState();
          // Evitar duplicar si el mismo ID ya existe en la cola
          const filteredQueue = current.outboxQueue.filter(i => i.id !== testItem.id);
          await chrome.storage.local.set({
            outboxQueue: [testItem, ...filteredQueue],
            isPaused: false
          });
          // Registrar también en Firestore whatsapp_outbox para que aparezca en todas las vistas de Cola Outbox
          createFirestoreOutboxDoc(testItem).catch(() => {});

          const schedMs = parseScheduledTimeMs(testItem.scheduledFor);
          let result = { ok: true, scheduled: true };
          if (schedMs <= Date.now() + 3000) {
            result = await processNextOutboxItem(true);
          } else {
            await scheduleNextDispatchIfIdle(false);
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, ...result, state: updatedState });
          break;
        }

        case 'TICKTOOL_SCHEDULE_INCHAT_MESSAGE': {
          const cleanPhone = String(message.phone || '').replace(/\D/g, '');
          const cleanMessage = stripAnyWatermark(message.message || '');
          const itemId = message.id || `inchat_${Date.now()}`;
          const rawAttachments = Array.isArray(message.attachments) ? message.attachments : [];
          const lightAttachments = stripHeavyAttachmentsForQueue(rawAttachments, itemId);
          const isImmediateInChat = Boolean(message.dispatchedDirectly);
          const nowIso = new Date().toISOString();
          const schedItem = {
            id: itemId,
            campaignId: 'inchat_overlay',
            campaignName: 'Envío desde WhatsApp Web Overlay',
            leadName: message.leadName || 'Chat Activo',
            phoneDisplay: cleanPhone || message.leadName || 'Chat Activo',
            phoneE164: cleanPhone.length === 9 && cleanPhone.startsWith('9') ? `51${cleanPhone}` : cleanPhone,
            mode: message.mode || (cleanPhone ? 'PHONE_URL' : 'SEARCH_CONTACT_NAME'),
            stepOrder: 0,
            stepLabel: 'Overlay WS Web',
            messageBody: cleanMessage,
            renderedMessage: cleanMessage,
            attachments: lightAttachments,
            scheduledFor: message.scheduledFor
              ? new Date(parseScheduledTimeMs(message.scheduledFor)).toISOString()
              : nowIso,
            status: isImmediateInChat ? 'dispatched' : 'pending',
            dispatchedAt: isImmediateInChat ? nowIso : null,
            stopOnReply: true,
            watermarkFree: true
          };
          if (isImmediateInChat) {
            dispatchedOutboxIdsMemory.add(itemId);
          }
          const current = await getDispatcherState();
          const filteredQueue = current.outboxQueue.filter(i => i.id !== schedItem.id);
          await chrome.storage.local.set({
            outboxQueue: [schedItem, ...filteredQueue],
            isPaused: false,
            dailyDispatchedCount: isImmediateInChat
              ? current.dailyDispatchedCount + 1
              : current.dailyDispatchedCount,
            lastDispatchedPhone: isImmediateInChat
              ? cleanPhone ? `+${cleanPhone}` : schedItem.leadName
              : current.lastDispatchedPhone,
            lastDispatchedAt: isImmediateInChat ? nowIso : current.lastDispatchedAt
          });
          // Registrar inmediatamente en Firestore whatsapp_outbox para que aparezca en la Cola Outbox de QZ-Hub y Zentry CRM
          await createFirestoreOutboxDoc(schedItem);

          if (!isImmediateInChat) {
            await scheduleNextDispatchIfIdle(false);
          }
          const updatedState = await getDispatcherState();
          sendResponse({ ok: true, id: itemId, state: updatedState });
          break;
        }

        default:
          sendResponse({ ok: false, error: 'Unknown message type' });
      }
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
  })();
  return true; // Respuesta asíncrona
});
