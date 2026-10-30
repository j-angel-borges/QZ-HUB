/**
 * ZENTRY PROSPECC CRM SERVICE
 * Conexión en tiempo real con el proyecto Firestore de Zentry Prospecc (zentryos)
 * Sincroniza nombres de fichas como hojas (sheetTabs) y guarda prospectos recomendados.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

const ZENTRY_PROSPECC_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD36pVBqXzjlxSXmQD0LhVvJpQtvEp1xmk",
  authDomain: "zentryos.firebaseapp.com",
  projectId: "zentryos",
  storageBucket: "zentryos.firebasestorage.app",
  messagingSenderId: "730964985085",
  appId: "1:730964985085:web:56ebd3ff12561d14566a94"
};

let zentryDb = null;

try {
  const existingApp = getApps().find(a => a.name === 'zentry-prospecc');
  const zentryApp = existingApp || initializeApp(ZENTRY_PROSPECC_FIREBASE_CONFIG, 'zentry-prospecc');
  zentryDb = getFirestore(zentryApp);
} catch (err) {
  console.warn('Advertencia inicializando Firestore para Zentry Prospecc (usando modo offline):', err);
}

export const LEADS_COLLECTION = 'leads_expo_maternidad';
export const SETTINGS_COLLECTION = 'crm_settings';
export const SETTINGS_CONFIG_DOC = 'config';

const LS_FICHA_KEY = 'qz_sorteo_active_ficha';
const LS_RECS_PREFIX = 'qz_sorteo_recs_';

/**
 * Obtiene o inicializa la ficha activa
 */
export function getActiveFicha() {
  try {
    return localStorage.getItem(LS_FICHA_KEY) || 'Familia Presentación';
  } catch (e) {
    return 'Familia Presentación';
  }
}

/**
 * Guarda el nombre de la ficha activa
 */
export function setActiveFicha(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(LS_FICHA_KEY, trimmed);
  } catch (e) {}
}

/**
 * Carga las 30 recomendaciones de la ficha (de localStorage con respaldo)
 */
export function loadFichaRecommendations(fichaName) {
  const key = LS_RECS_PREFIX + (fichaName || getActiveFicha());
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length === 30) {
        return parsed;
      }
    }
  } catch (e) {}

  // Estructura limpia de 30 filas
  const initial = [];
  for (let i = 1; i <= 30; i++) {
    initial.push({
      index: i,
      id: `rec_${fichaName || 'gen'}_${i}`,
      nombreCompleto: '',
      celular: '',
      distrito: '',
      observaciones: '',
      completed: false,
      savedAt: null
    });
  }
  return initial;
}

/**
 * Guarda las 30 recomendaciones en localStorage
 */
export function saveFichaRecommendationsLocal(fichaName, rows) {
  const key = LS_RECS_PREFIX + (fichaName || getActiveFicha());
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (e) {}
}

/**
 * Sincroniza la ficha como una hoja nueva (sheetTab) en Zentry Prospecc CRM
 */
export async function syncFichaToCrmTabs(fichaName) {
  const trimmed = (fichaName || '').trim();
  if (!trimmed) return false;

  if (!zentryDb) {
    console.warn('Firestore Zentry Prospecc no disponible en este entorno.');
    return false;
  }

  try {
    const configRef = doc(zentryDb, SETTINGS_COLLECTION, SETTINGS_CONFIG_DOC);
    let currentTabs = [];

    const snap = await getDoc(configRef);
    if (snap.exists() && Array.isArray(snap.data()?.sheetTabs)) {
      currentTabs = snap.data().sheetTabs;
    }

    if (!currentTabs.includes(trimmed)) {
      const updatedTabs = [...currentTabs, trimmed];
      await setDoc(
        configRef,
        {
          sheetTabs: updatedTabs,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      console.log(`[CRM Prospecc] Pestaña/Hoja "${trimmed}" añadida al CRM exitosamente.`);
    }
    return true;
  } catch (err) {
    console.warn(`[CRM Prospecc] No se pudo sincronizar la pestaña en Firestore:`, err);
    return false;
  }
}

/**
 * Guarda o actualiza un lead en Zentry Prospecc CRM
 */
export async function saveLeadToCrmProspecc(fichaName, rowData) {
  const trimmedFicha = (fichaName || '').trim() || 'Familia Presentación';
  const leadId = rowData.leadDocId || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Guardar primero en Firestore si está conectado
  if (zentryDb) {
    try {
      // Garantizar que la pestaña exista
      syncFichaToCrmTabs(trimmedFicha).catch(() => {});

      const leadRef = doc(zentryDb, LEADS_COLLECTION, leadId);
      await setDoc(
        leadRef,
        {
          id: leadId,
          name: rowData.nombreCompleto || 'Sin nombre',
          phone: rowData.celular || '',
          distrito: rowData.distrito || '',
          obserCalls: rowData.observaciones || '',
          sheetTab: trimmedFicha,
          source: 'Programa de Recomendaciones Zentry (Sorteo 15 Dic)',
          estadoCrm: 'nuevo',
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        },
        { merge: true }
      );
      console.log(`[CRM Prospecc] Lead ${leadId} guardado en Firestore.`);
    } catch (err) {
      console.warn(`[CRM Prospecc] Error al guardar en Firestore (continuando con local):`, err);
    }
  }

  return leadId;
}
