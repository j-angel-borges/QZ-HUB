// ==============================================================================
// QZ HUB — BANCO DE IDEAS & NOTAS (GOOGLE KEEP FIDELITY + RIGHT SIDEBAR)
// ==============================================================================
// Interfaz 100% fiel a Google Keep:
// - Títulos repetidos permitidos libremente sin sufijos (1), (2), etc.
// - Pestaña de Recordatorios conectada en tiempo real con Tablero Personal y Calendario.
// - Gestión total de Etiquetas (Crear, renombrar, eliminar con modal nativo de Google Keep).
// - Barra lateral en el costado derecho (Notas, Recordatorios, Archivo, Papelera, Etiquetas)
//   con los colores exactos de Google Keep (#feefc3 píldora activa ámbar).
// - Workflow Matutino Agéntico integrado como ANOTACIÓN/NOTA interna en Keep.
// - Buscador superior en tiempo real.
// - Creador "Añade una nota..." colapsable / expandible con listas de casillas y recordatorios.
// - Separación canónica: FIJADAS y OTRAS.
// - Paleta de colores pastel Google Keep.
// - Sincronización en tiempo real con Cloud Firestore.
// ==============================================================================

import db from './ssot-db.json';

const KEEP_STORAGE_KEY = 'qz_keep_notes';
const KEEP_LABELS_KEY = 'qz_keep_labels';

export const GOOGLE_KEEP_COLORS = [
  { id: 'default', name: 'Por defecto', bg: '#ffffff', border: '#e2e8f0', text: '#1e293b' },
  { id: 'coral',   name: 'Coral',       bg: '#fee2e2', border: '#fca5a5', text: '#7f1d1d' },
  { id: 'peach',   name: 'Melocotón',   bg: '#ffedd5', border: '#fdba74', text: '#7c2d12' },
  { id: 'sand',    name: 'Arena',       bg: '#fef9c3', border: '#fde047', text: '#713f12' },
  { id: 'mint',    name: 'Menta',       bg: '#dcfce7', border: '#86efac', text: '#14532d' },
  { id: 'sage',    name: 'Salvia',      bg: '#ccfbf1', border: '#5eead4', text: '#134e4a' },
  { id: 'fog',     name: 'Niebla',      bg: '#e0f2fe', border: '#7dd3fc', text: '#0c4a6e' },
  { id: 'storm',   name: 'Tormenta',    bg: '#dbeafe', border: '#93c5fd', text: '#1e3a8a' },
  { id: 'dusk',    name: 'Púrpura',     bg: '#f3e8ff', border: '#d8b4fe', text: '#581c87' },
  { id: 'blossom', name: 'Rosa',        bg: '#fce7f3', border: '#f472b6', text: '#831843' },
  { id: 'clay',    name: 'Arcilla',     bg: '#f5f5f4', border: '#d6d3d1', text: '#292524' },
  { id: 'grafito', name: 'Grafito',     bg: '#0f172a', border: '#334155', text: '#f8fafc', isDark: true }
];

// Helper para limpiar sufijos (1), (2) cuando se importan o renderizan notas
export function cleanKeepTitle(title) {
  if (!title) return '';
  return String(title).replace(/\s*\(\d+\)$/, '').trim();
}

// ------------------------------------------------------------------------------
// GESTIÓN DE ETIQUETAS (LABELS) — AUTÉNTICO GOOGLE KEEP
// ------------------------------------------------------------------------------
export function getKeepLabels() {
  try {
    const raw = localStorage.getItem(KEEP_LABELS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading keep labels:', e);
  }
  const defaultLabels = ['Zentry', 'Quarz', 'Bio & Personal'];
  saveKeepLabels(defaultLabels);
  return defaultLabels;
}

export function saveKeepLabels(labels) {
  try {
    localStorage.setItem(KEEP_LABELS_KEY, JSON.stringify(labels));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving keep labels:', e);
  }
}

export function addKeepLabel(labelName) {
  const trimmed = (labelName || '').trim();
  if (!trimmed) return false;
  const labels = getKeepLabels();
  if (labels.some(l => l.toLowerCase() === trimmed.toLowerCase())) return false;
  labels.push(trimmed);
  saveKeepLabels(labels);
  return true;
}

export function renameKeepLabel(oldName, newName) {
  const trimmedNew = (newName || '').trim();
  if (!trimmedNew || oldName === trimmedNew) return false;
  const labels = getKeepLabels();
  const idx = labels.indexOf(oldName);
  if (idx < 0) return false;
  labels[idx] = trimmedNew;
  saveKeepLabels(labels);

  // Renombrar en todas las notas existentes
  const notes = getKeepNotes();
  let updated = false;
  notes.forEach(n => {
    if (Array.isArray(n.labels)) {
      const lIdx = n.labels.indexOf(oldName);
      if (lIdx >= 0) {
        n.labels[lIdx] = trimmedNew;
        updated = true;
      }
    }
  });
  if (updated) saveKeepNotes(notes);
  return true;
}

export function deleteKeepLabel(labelName) {
  let labels = getKeepLabels();
  labels = labels.filter(l => l !== labelName);
  saveKeepLabels(labels);

  // Eliminar de todas las notas existentes
  const notes = getKeepNotes();
  let updated = false;
  notes.forEach(n => {
    if (Array.isArray(n.labels)) {
      const origLen = n.labels.length;
      n.labels = n.labels.filter(l => l !== labelName);
      if (n.labels.length !== origLen) updated = true;
    }
  });
  if (updated) saveKeepNotes(notes);
  return true;
}

// ------------------------------------------------------------------------------
// NOTA DEL WORKFLOW MATUTINO AGÉNTICO INTEGRADA EN KEEP
// ------------------------------------------------------------------------------
export const WORKFLOW_MATUTINO_NOTE = {
  id: 'keep-workflow-matutino',
  title: '🤖 Workflow Matutino Agéntico (Prompt & Ritual)',
  body: 'Iniciando sesión matutina. He completado mis deberes domésticos y desayuno. Lee D:\\1_jose_angel\\HOJA_DE_RUTA_REINICIO_OPTIMIZACION.md donde he colocado mis nuevas reflexiones bajo el emoji 🪢. Audita mi avance, actualiza mis timeblocks y calibra mis prioridades de hoy.',
  color: 'sand',
  labels: ['Bio & Personal', 'Quarz'],
  pinned: true,
  archived: false,
  trashed: false,
  createdAt: new Date().toISOString(),
  tasks: [
    { id: 'wm-task-1', text: '1. Orden & Bio: Casa limpia, desayuno keto y electrolitos.', completed: false },
    { id: 'wm-task-2', text: '2. Terminal: Antigravity CLI con contexto QZ-Hub activo.', completed: false },
    { id: 'wm-task-3', text: '3. Hoja Viva (🪢): Nuevas reflexiones con 🪢 en el markdown.', completed: false },
    { id: 'wm-task-4', text: '4. Calibración: Auditoría y ejecución de bloques timeblocking.', completed: false }
  ]
};

export function getDefaultKeepNotes() {
  const rawIdeas = db.ideas || [];
  const baseNotes = rawIdeas.map((idea, index) => {
    const colors = ['mint', 'sand', 'sage', 'fog', 'peach', 'dusk', 'coral'];
    const chosenColor = colors[index % colors.length];

    // Asignar etiquetas contextuales
    const labels = [];
    const textContext = ((idea.title || '') + ' ' + (idea.category || '')).toLowerCase();
    if (textContext.includes('zentry')) labels.push('Zentry');
    if (textContext.includes('quarz') || textContext.includes('holding')) labels.push('Quarz');

    return {
      id: `keep-seed-${index + 1}`,
      title: cleanKeepTitle(idea.title || idea.fullTitle || `Nota #${index + 1}`),
      body: idea.body || '',
      color: chosenColor,
      labels: labels,
      pinned: index === 0,
      archived: false,
      trashed: false,
      createdAt: new Date().toISOString(),
      tasks: (idea.tasks || []).map((tText, tIdx) => ({
        id: `task-${index}-${tIdx}`,
        text: tText,
        completed: false
      }))
    };
  });

  return [WORKFLOW_MATUTINO_NOTE, ...baseNotes];
}

export function getKeepNotes() {
  try {
    const raw = localStorage.getItem(KEEP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Limpiar sufijos numéricos (1), (2) y asegurar array de etiquetas
        let changed = false;
        parsed.forEach(n => {
          if (n.title) {
            const cleaned = cleanKeepTitle(n.title);
            if (cleaned !== n.title) {
              n.title = cleaned;
              changed = true;
            }
          }
          if (!Array.isArray(n.labels)) {
            n.labels = [];
          }
        });

        // Garantizar que la anotación de Workflow Matutino esté dentro de Keep
        const hasWM = parsed.some(n => n.id === 'keep-workflow-matutino' || (n.title && n.title.includes('Workflow Matutino')));
        if (!hasWM) {
          parsed.unshift(WORKFLOW_MATUTINO_NOTE);
          changed = true;
        }

        if (changed) {
          saveKeepNotes(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading keep notes from storage:', e);
  }
  const defaultNotes = getDefaultKeepNotes();
  saveKeepNotes(defaultNotes);
  return defaultNotes;
}

export function saveKeepNotes(notes) {
  try {
    localStorage.setItem(KEEP_STORAGE_KEY, JSON.stringify(notes));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving keep notes:', e);
  }
}

// Helper para formatear visualmente recordatorios
export function formatReminderDisplay(reminder) {
  if (!reminder || !reminder.date) return '';
  try {
    const [y, m, d] = reminder.date.split('-');
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const monthStr = monthNames[parseInt(m, 10) - 1] || m;
    const timeStr = reminder.time ? ` ${reminder.time}` : '';
    return `${parseInt(d, 10)} ${monthStr}${timeStr}`;
  } catch (e) {
    return `${reminder.date} ${reminder.time || ''}`.trim();
  }
}

// Estados volátiles de sesión
let _searchQuery = '';
let _currentKeepSection = 'notas'; // 'notas' | 'recordatorios' | 'archivo' | 'papelera' | 'label:<nombre>'
let _creatorIsExpanded = false;
let _creatorIsChecklist = false;
let _creatorPinned = false;
let _creatorColor = 'default';
let _creatorChecklistItems = [];
let _creatorReminderDate = '';
let _creatorReminderTime = '09:00';
let _creatorShowReminderBar = false;
let _creatorSelectedLabels = [];
let _creatorShowLabelsPicker = false;

// ==============================================================================
// 1. TARJETA COMPACTA DE ACCESO PARA EL TABLERO BACKLOG
// ==============================================================================
export function renderKeepEntryCardHTML() {
  const notes = getKeepNotes();
  const activeNotes = notes.filter(n => !n.trashed && !n.archived);
  const totalCount = activeNotes.length;
  const pinnedCount = activeNotes.filter(n => n.pinned).length;
  const reminderCount = activeNotes.filter(n => n.reminder && n.reminder.date).length;

  return `
    <div class="keep-entry-card" id="keep-entry-card">
      <div class="keep-entry-left">
        <div class="keep-entry-icon-box">💡</div>
        <div class="keep-entry-info">
          <div class="keep-entry-meta-row">
            <span class="keep-entry-brand-badge">GOOGLE KEEP</span>
            <span class="keep-entry-stat-pill">${totalCount} Notas</span>
            ${pinnedCount > 0 ? `<span class="keep-entry-pinned-pill">📌 ${pinnedCount} Fijadas</span>` : ''}
            ${reminderCount > 0 ? `<span class="keep-entry-reminder-pill">🔔 ${reminderCount} Recordatorios</span>` : ''}
          </div>
          <h3 class="keep-entry-title">Banco de Ideas & Notas Rápidas</h3>
          <p class="keep-entry-desc">Captura inmediata de conceptos, recordatorios integrados al calendario y etiquetas personalizables.</p>
        </div>
      </div>
      <div class="keep-entry-right">
        <a href="#ideas" class="btn-open-keep-backpage">
          Abrir Banco de Ideas ➔
        </a>
      </div>
    </div>
  `;
}

// ==============================================================================
// 2. VISTA DEDICADA DE GOOGLE KEEP (BACKPAGE COMPLETA CON BARRA LATERAL DERECHA)
// ==============================================================================
export function renderKeepNotesHTML() {
  const allNotes = getKeepNotes();
  const labelsList = getKeepLabels();
  const q = _searchQuery.trim().toLowerCase();
  const todayStr = new Date().toISOString().split('T')[0];

  // Si estamos en la pestaña de recordatorios, preparar fecha por defecto
  if (_currentKeepSection === 'recordatorios' && !_creatorReminderDate) {
    _creatorReminderDate = todayStr;
    _creatorShowReminderBar = true;
  }

  // Filtrado según sección activa y búsqueda
  const filtered = allNotes.filter(n => {
    if (_currentKeepSection === 'papelera') {
      if (!n.trashed) return false;
    } else if (_currentKeepSection === 'archivo') {
      if (!n.archived || n.trashed) return false;
    } else {
      if (n.trashed || n.archived) return false;

      if (_currentKeepSection === 'recordatorios') {
        if (!n.reminder || !n.reminder.date) return false;
      } else if (_currentKeepSection.startsWith('label:')) {
        const targetLabel = _currentKeepSection.slice(6).toLowerCase();
        const hasInArray = Array.isArray(n.labels) && n.labels.some(l => l.toLowerCase() === targetLabel);
        const hasInText = ((n.title || '') + ' ' + (n.body || '')).toLowerCase().includes(targetLabel);
        if (!hasInArray && !hasInText) return false;
      } else if (_currentKeepSection === 'zentry') {
        const inLabels = Array.isArray(n.labels) && n.labels.some(l => l.toLowerCase().includes('zentry'));
        const inText = ((n.title || '') + ' ' + (n.body || '')).toLowerCase().includes('zentry');
        if (!inLabels && !inText) return false;
      } else if (_currentKeepSection === 'quarz') {
        const inLabels = Array.isArray(n.labels) && n.labels.some(l => l.toLowerCase().includes('quarz'));
        const full = ((n.title || '') + ' ' + (n.body || '')).toLowerCase();
        if (!inLabels && !full.includes('quarz') && !full.includes('holding')) return false;
      } else if (_currentKeepSection === 'bio') {
        const inLabels = Array.isArray(n.labels) && n.labels.some(l => l.toLowerCase().includes('bio'));
        const full = ((n.title || '') + ' ' + (n.body || '')).toLowerCase();
        if (!inLabels && !full.includes('bio') && !full.includes('calistenia') && !full.includes('keto') && !full.includes('matutino')) return false;
      }
    }

    if (!q) return true;
    const matchTitle = (n.title || '').toLowerCase().includes(q);
    const matchBody = (n.body || '').toLowerCase().includes(q);
    const matchTasks = (n.tasks || []).some(t => (t.text || '').toLowerCase().includes(q));
    const matchLabels = (n.labels || []).some(l => l.toLowerCase().includes(q));
    return matchTitle || matchBody || matchTasks || matchLabels;
  });

  const pinnedNotes = filtered.filter(n => n.pinned);
  const otherNotes = filtered.filter(n => !n.pinned);
  const activeRemindersCount = allNotes.filter(n => !n.trashed && !n.archived && n.reminder && n.reminder.date).length;

  const renderCard = (n) => {
    const colorObj = GOOGLE_KEEP_COLORS.find(c => c.id === n.color) || GOOGLE_KEEP_COLORS[0];
    const isDark = colorObj.isDark;

    const tasksHtml = (n.tasks && n.tasks.length > 0)
      ? `
        <div class="keep-card-tasks-block">
          ${n.tasks.map((t, idx) => `
            <div class="keep-card-task-row ${t.completed ? 'is-done' : ''}">
              <input type="checkbox" class="keep-task-checkbox" data-note-id="${n.id}" data-task-idx="${idx}" ${t.completed ? 'checked' : ''} />
              <span class="keep-task-text">${escapeHtml(t.text)}</span>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const bodyHtml = n.body
      ? `<div class="keep-card-body-text">${escapeHtml(n.body).replace(/\n/g, '<br/>')}</div>`
      : '';

    // Recordatorio Pill en tarjeta
    const reminderHtml = (n.reminder && n.reminder.date)
      ? `
        <div class="keep-card-reminder-pill" title="Sincronizado con Tablero Personal y Calendario">
          <span class="keep-reminder-pill-icon">🔔</span>
          <span class="keep-reminder-pill-text">${escapeHtml(formatReminderDisplay(n.reminder))}</span>
          <button type="button" class="btn-card-remove-reminder" data-note-id="${n.id}" title="Eliminar recordatorio">✕</button>
        </div>
      `
      : '';

    // Etiquetas Chips en tarjeta
    const labelsHtml = (Array.isArray(n.labels) && n.labels.length > 0)
      ? `
        <div class="keep-card-labels-row">
          ${n.labels.map(lbl => `
            <span class="keep-card-label-chip" data-label="${escapeHtml(lbl)}">🏷️ ${escapeHtml(lbl)}</span>
          `).join('')}
        </div>
      `
      : '';

    // Acciones especiales para papelera o archivo
    const actionsHtml = _currentKeepSection === 'papelera'
      ? `
        <div class="keep-card-trash-actions">
          <button type="button" class="btn-keep-card-tool btn-restore-note" data-note-id="${n.id}" title="Restaurar nota">♻️ Restaurar</button>
          <button type="button" class="btn-keep-card-tool btn-delete-permanent" data-note-id="${n.id}" title="Eliminar para siempre">❌ Eliminar</button>
        </div>
      `
      : `
        <div class="keep-card-colors-mini">
          ${GOOGLE_KEEP_COLORS.slice(0, 7).map(c => `
            <button type="button" class="keep-mini-color-dot ${n.color === c.id ? 'active' : ''}" data-note-id="${n.id}" data-color="${c.id}" style="background: ${c.border};" title="${c.name}"></button>
          `).join('')}
        </div>
        <div class="keep-card-action-btns">
          <button type="button" class="btn-keep-card-tool btn-keep-reminder-quick" data-note-id="${n.id}" title="${n.reminder?.date ? 'Modificar recordatorio' : 'Añadir recordatorio (Calendario)'}">🔔</button>
          <button type="button" class="btn-keep-card-tool btn-keep-archive" data-note-id="${n.id}" title="${n.archived ? 'Desarchivar' : 'Archivar nota'}">${n.archived ? '📤' : '📥'}</button>
          <button type="button" class="btn-keep-card-tool btn-keep-copy" data-note-id="${n.id}" title="Copiar texto">📋</button>
          <button type="button" class="btn-keep-card-tool btn-keep-delete" data-note-id="${n.id}" title="Enviar a papelera">🗑️</button>
        </div>
      `;

    return `
      <div class="keep-note-card ${n.pinned ? 'is-pinned' : ''} ${isDark ? 'is-dark-card' : ''}" data-note-id="${n.id}" style="background-color: ${colorObj.bg}; border-color: ${colorObj.border}; color: ${colorObj.text};">
        <div class="keep-card-top">
          <div class="keep-card-title">${escapeHtml(n.title || 'Sin título')}</div>
          ${_currentKeepSection !== 'papelera' ? `
            <button type="button" class="btn-keep-pin ${n.pinned ? 'active' : ''}" data-note-id="${n.id}" title="${n.pinned ? 'Desanclar nota' : 'Fijar nota'}">
              📌
            </button>
          ` : ''}
        </div>

        <div class="keep-card-content-wrap">
          ${bodyHtml}
          ${tasksHtml}
          ${reminderHtml}
          ${labelsHtml}
        </div>

        <div class="keep-card-actions-bar">
          ${actionsHtml}
        </div>
      </div>
    `;
  };

  return `
    <div class="keep-workspace" id="keep-workspace">
      
      <!-- BARRA DE NAVEGACIÓN SUPERIOR / BREADCRUMB -->
      <div class="keep-nav-header">
        <a href="#backlog" class="btn-back-to-backlog">
          ⬅️ Volver a Backlog
        </a>
        <div class="keep-header-title-box">
          <h2 class="keep-view-title">💡 Banco de Ideas (Google Keep)</h2>
          <span class="keep-view-subtitle">${allNotes.filter(n => !n.trashed).length} notas · Recordatorios y Etiquetas dinámicas</span>
        </div>
      </div>

      <!-- LAYOUT PRINCIPAL: CONTENIDO (IZQUIERDA/CENTRO) + BARRA LATERAL GOOGLE KEEP (DERECHA) -->
      <div class="keep-workspace-layout">
        
        <!-- CONTENIDO PRINCIPAL: BUSCADOR + CREADOR + GRID DE NOTAS -->
        <main class="keep-main-content">
          
          <!-- BUSCADOR SUPERIOR ESTILO GOOGLE KEEP -->
          <div class="keep-search-container">
            <div class="keep-search-bar">
              <span class="keep-search-icon">🔍</span>
              <input type="text" id="keep-search-input" placeholder="Buscar en Keep..." value="${escapeHtml(_searchQuery)}" />
              ${_searchQuery ? `<button type="button" id="btn-clear-search" class="btn-clear-search" title="Limpiar búsqueda">✕</button>` : ''}
            </div>
          </div>

          <!-- CREADOR DE NOTAS ("Añade una nota...") (SOLO SI NO ESTÁ EN PAPELERA O ARCHIVO) -->
          ${_currentKeepSection !== 'papelera' && _currentKeepSection !== 'archivo' ? `
            <div class="keep-creator-wrapper">
              <div class="keep-creator-card" id="keep-creator-card" style="background-color: ${GOOGLE_KEEP_COLORS.find(c => c.id === _creatorColor)?.bg || '#ffffff'}; border-color: ${GOOGLE_KEEP_COLORS.find(c => c.id === _creatorColor)?.border || '#e2e8f0'};">
                
                <!-- ESTADO COLAPSADO -->
                <div class="keep-creator-collapsed" id="keep-creator-collapsed" style="${_creatorIsExpanded ? 'display: none;' : 'display: flex;'}">
                  <span class="keep-creator-placeholder">${_currentKeepSection === 'recordatorios' ? 'Añade una nota con recordatorio...' : 'Añade una nota...'}</span>
                  <div class="keep-creator-quick-icons">
                    <button type="button" class="btn-creator-quick-icon" id="btn-quick-checklist" title="Nueva lista con casillas">☑️</button>
                    <button type="button" class="btn-creator-quick-icon" id="btn-quick-reminder" title="Añadir nota con recordatorio">🔔</button>
                  </div>
                </div>

                <!-- ESTADO EXPANDIDO -->
                <div class="keep-creator-expanded" id="keep-creator-expanded" style="${_creatorIsExpanded ? 'display: flex;' : 'display: none;'}">
                  <div class="keep-creator-header">
                    <input type="text" id="keep-new-title" class="keep-creator-title-input" placeholder="Título (permite nombres repetidos)" />
                    <button type="button" class="btn-creator-pin ${_creatorPinned ? 'active' : ''}" id="btn-creator-pin-toggle" title="${_creatorPinned ? 'Desanclar nota' : 'Fijar nota'}">
                      📌
                    </button>
                  </div>

                  <!-- CONTENIDO: TEXTO O CHECKLIST -->
                  <div class="keep-creator-body-wrap" id="keep-creator-text-mode" style="${_creatorIsChecklist ? 'display: none;' : 'display: block;'}">
                    <textarea id="keep-new-body" class="keep-creator-textarea" placeholder="Añade una nota..." rows="3"></textarea>
                  </div>

                  <div class="keep-creator-checklist-wrap" id="keep-creator-checklist-mode" style="${_creatorIsChecklist ? 'display: block;' : 'display: none;'}">
                    <div class="keep-creator-checklist-items" id="keep-creator-checklist-items">
                      <!-- Items dinámicos -->
                    </div>
                    <div class="keep-creator-add-item-row">
                      <span class="keep-creator-plus">+</span>
                      <input type="text" id="keep-new-checklist-item-input" class="keep-creator-item-input" placeholder="Elemento de lista (Enter para agregar)..." />
                    </div>
                  </div>

                  <!-- BARRA DE RECORDATORIO DEL CREADOR (CONECTADA AL CALENDARIO) -->
                  <div class="keep-creator-reminder-bar" id="keep-creator-reminder-bar" style="${(_creatorShowReminderBar || _currentKeepSection === 'recordatorios') ? 'display: flex;' : 'display: none;'}">
                    <span class="keep-reminder-bar-icon">🔔</span>
                    <span class="keep-reminder-bar-label">Recordatorio:</span>
                    <input type="date" id="keep-new-reminder-date" class="keep-reminder-input-date" value="${_creatorReminderDate || todayStr}" />
                    <input type="time" id="keep-new-reminder-time" class="keep-reminder-input-time" value="${_creatorReminderTime || '09:00'}" />
                    <button type="button" class="btn-clear-creator-rem" id="btn-clear-creator-rem" title="Quitar recordatorio">✕</button>
                  </div>

                  <!-- ETIQUETAS SELECCIONADAS EN EL CREADOR -->
                  ${_creatorSelectedLabels.length > 0 ? `
                    <div class="keep-creator-labels-pills-bar" id="keep-creator-labels-pills-bar">
                      ${_creatorSelectedLabels.map((lbl, idx) => `
                        <span class="keep-creator-label-pill">
                          🏷️ ${escapeHtml(lbl)}
                          <button type="button" class="btn-remove-creator-pill" data-idx="${idx}">✕</button>
                        </span>
                      `).join('')}
                    </div>
                  ` : ''}

                  <!-- BARRA DE ACCIONES INFERIOR -->
                  <div class="keep-creator-footer">
                    <div class="keep-creator-tools">
                      <div class="keep-color-picker-dropdown">
                        <button type="button" class="btn-creator-tool-icon" id="btn-creator-palette" title="Opciones de fondo">🎨</button>
                        <div class="keep-palette-popover" id="keep-palette-popover">
                          ${GOOGLE_KEEP_COLORS.map(c => `
                            <button type="button" class="keep-palette-swatch ${_creatorColor === c.id ? 'active' : ''}" data-color="${c.id}" style="background-color: ${c.bg}; border-color: ${c.border};" title="${c.name}"></button>
                          `).join('')}
                        </div>
                      </div>

                      <button type="button" class="btn-creator-tool-icon ${(_creatorShowReminderBar || _currentKeepSection === 'recordatorios') ? 'active' : ''}" id="btn-toggle-reminder-bar" title="Añadir recordatorio (se sincroniza con Tablero Personal y Calendario)">
                        🔔
                      </button>

                      <div class="keep-labels-picker-dropdown">
                        <button type="button" class="btn-creator-tool-icon ${_creatorSelectedLabels.length > 0 ? 'active' : ''}" id="btn-creator-labels-toggle" title="Añadir etiquetas">
                          🏷️
                        </button>
                        <div class="keep-labels-popover" id="keep-creator-labels-popover" style="display: none;">
                          <div class="keep-labels-popover-title">Etiquetas:</div>
                          ${labelsList.map(l => `
                            <label class="keep-label-popover-row">
                              <input type="checkbox" class="creator-label-checkbox" value="${escapeHtml(l)}" ${_creatorSelectedLabels.includes(l) ? 'checked' : ''} />
                              <span>${escapeHtml(l)}</span>
                            </label>
                          `).join('')}
                        </div>
                      </div>

                      <button type="button" class="btn-creator-tool-icon ${_creatorIsChecklist ? 'active' : ''}" id="btn-toggle-checklist" title="${_creatorIsChecklist ? 'Cambiar a nota de texto' : 'Mostrar casillas de verificación'}">
                        ☑️
                      </button>
                    </div>

                    <button type="button" class="btn-keep-close" id="btn-save-creator">
                      Cerrar
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ` : ''}

          <!-- CABECERA DE SECCIÓN ESPECIAL (PAPELERA / ARCHIVO / RECORDATORIOS) -->
          ${_currentKeepSection === 'papelera' ? `
            <div class="keep-special-banner">
              <span>🗑️ Las notas en la Papelera se conservan aquí hasta que las restaures o vacíes.</span>
              <button type="button" class="btn-empty-trash" id="btn-empty-trash">Vaciar Papelera</button>
            </div>
          ` : ''}

          ${_currentKeepSection === 'archivo' ? `
            <div class="keep-special-banner">
              <span>📥 Notas archivadas para referencia futura.</span>
            </div>
          ` : ''}

          ${_currentKeepSection === 'recordatorios' ? `
            <div class="keep-special-banner" style="background: #fffbeb; border-color: #fde68a; color: #92400e;">
              <span>🔔 <strong>Recordatorios activos:</strong> Se sincronizan en vivo con tu <strong>Tablero Personal</strong> y el <strong>Calendario</strong>.</span>
            </div>
          ` : ''}

          <!-- SECCIONES DE NOTAS (FIJADAS Y OTRAS) -->
          <div class="keep-notes-sections">
            ${filtered.length === 0 ? `
              <div class="keep-empty-state">
                <span class="keep-empty-icon">${_currentKeepSection === 'papelera' ? '🗑️' : (_currentKeepSection === 'archivo' ? '📥' : (_currentKeepSection === 'recordatorios' ? '🔔' : '💡'))}</span>
                <p>${_currentKeepSection === 'papelera' ? 'La papelera está vacía.' : (_currentKeepSection === 'archivo' ? 'No hay notas archivadas.' : (_currentKeepSection === 'recordatorios' ? 'No tienes recordatorios activos.' : 'No se encontraron notas en tu banco.'))}</p>
              </div>
            ` : `
              ${pinnedNotes.length > 0 && _currentKeepSection !== 'papelera' ? `
                <div class="keep-section-block">
                  <div class="keep-section-label">FIJADAS</div>
                  <div class="keep-cards-grid">
                    ${pinnedNotes.map(renderCard).join('')}
                  </div>
                </div>
              ` : ''}

              ${otherNotes.length > 0 ? `
                <div class="keep-section-block">
                  ${pinnedNotes.length > 0 && _currentKeepSection !== 'papelera' ? `<div class="keep-section-label">OTRAS</div>` : ''}
                  <div class="keep-cards-grid">
                    ${otherNotes.map(renderCard).join('')}
                  </div>
                </div>
              ` : ''}

              ${_currentKeepSection === 'papelera' && pinnedNotes.length > 0 ? `
                <div class="keep-cards-grid">
                  ${pinnedNotes.map(renderCard).join('')}
                </div>
              ` : ''}
            `}
          </div>

        </main>

        <!-- BARRA LATERAL DERECHA (ESTILO GOOGLE KEEP: COLORES #feefc3 PÍLDORA ACTIVA) -->
        <aside class="keep-right-sidebar" id="keep-right-sidebar">
          <div class="keep-sidebar-nav">
            <button type="button" class="keep-sidebar-item ${_currentKeepSection === 'notas' ? 'active' : ''}" data-section="notas">
              <span class="keep-sidebar-item-icon">💡</span>
              <span class="keep-sidebar-item-text">Notas</span>
            </button>
            <button type="button" class="keep-sidebar-item ${_currentKeepSection === 'recordatorios' ? 'active' : ''}" data-section="recordatorios">
              <span class="keep-sidebar-item-icon">🔔</span>
              <span class="keep-sidebar-item-text">Recordatorios</span>
              ${activeRemindersCount > 0 ? `<span class="keep-sidebar-count-badge">${activeRemindersCount}</span>` : ''}
            </button>
            <button type="button" class="keep-sidebar-item ${_currentKeepSection === 'archivo' ? 'active' : ''}" data-section="archivo">
              <span class="keep-sidebar-item-icon">📥</span>
              <span class="keep-sidebar-item-text">Archivo</span>
            </button>
            <button type="button" class="keep-sidebar-item ${_currentKeepSection === 'papelera' ? 'active' : ''}" data-section="papelera">
              <span class="keep-sidebar-item-icon">🗑️</span>
              <span class="keep-sidebar-item-text">Papelera</span>
            </button>
          </div>

          <div class="keep-sidebar-divider"></div>

          <!-- GRUPO DE ETIQUETAS DINÁMICAS (CREACIÓN Y MODIFICACIÓN LIBRE) -->
          <div class="keep-sidebar-labels-group">
            <div class="keep-sidebar-group-title">ETIQUETAS</div>
            
            ${labelsList.map(lbl => {
              const secKey = `label:${lbl}`;
              const isActive = _currentKeepSection === secKey ||
                (_currentKeepSection === 'zentry' && lbl.toLowerCase() === 'zentry') ||
                (_currentKeepSection === 'quarz' && lbl.toLowerCase() === 'quarz') ||
                (_currentKeepSection === 'bio' && lbl.toLowerCase().includes('bio'));

              return `
                <button type="button" class="keep-sidebar-item ${isActive ? 'active' : ''}" data-section="${secKey}">
                  <span class="keep-sidebar-item-icon">🏷️</span>
                  <span class="keep-sidebar-item-text">${escapeHtml(lbl)}</span>
                </button>
              `;
            }).join('')}

            <!-- BOTÓN PARA EDITAR / CREAR ETIQUETAS ESTILO GOOGLE KEEP -->
            <button type="button" class="keep-sidebar-item btn-open-labels-modal" id="btn-open-labels-modal">
              <span class="keep-sidebar-item-icon">✏️</span>
              <span class="keep-sidebar-item-text">Editar etiquetas</span>
            </button>
          </div>
        </aside>

      </div>

      <!-- MODAL DE EDICIÓN COMPLETA (GOOGLE KEEP EDIT MODAL) -->
      <div class="keep-edit-modal-overlay" id="keep-edit-modal" style="display: none;">
        <div class="keep-edit-modal-dialog" id="keep-edit-dialog">
          <!-- Contenido inyectado dinámicamente -->
        </div>
      </div>

      <!-- MODAL AUTÉNTICO "EDITAR ETIQUETAS" DE GOOGLE KEEP -->
      <div class="keep-labels-modal-overlay" id="keep-labels-modal" style="display: none;">
        <div class="keep-labels-dialog">
          <div class="keep-labels-header">
            <h3>Editar etiquetas</h3>
          </div>
          
          <div class="keep-labels-create-row">
            <span class="keep-labels-icon-btn">➕</span>
            <input type="text" id="keep-create-label-input" class="keep-create-label-input" placeholder="Crear etiqueta nueva" />
            <button type="button" class="btn-label-check-submit" id="btn-submit-create-label" title="Crear etiqueta">✓</button>
          </div>

          <div class="keep-labels-list" id="keep-labels-list">
            <!-- Renderizado dinámico -->
          </div>

          <div class="keep-labels-footer">
            <button type="button" class="btn-keep-labels-done" id="btn-close-labels-modal">Listo</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ==============================================================================
// 3. EVENT LISTENERS & MECÁNICAS INTERACTIVAS (AUTÉNTICO GOOGLE KEEP)
// ==============================================================================
export function setupKeepNotesEvents(container) {
  const ws = container.querySelector('#keep-workspace');
  if (!ws) return;

  // 1. Navegación en la barra lateral derecha
  ws.querySelectorAll('.keep-sidebar-item[data-section]').forEach(btn => {
    btn.onclick = () => {
      _currentKeepSection = btn.dataset.section || 'notas';
      refreshKeepWorkspace(container);
    };
  });

  // Abrir Modal de Editar Etiquetas
  const openLabelsModalBtn = ws.querySelector('#btn-open-labels-modal');
  if (openLabelsModalBtn) {
    openLabelsModalBtn.onclick = () => {
      openKeepLabelsModal(container);
    };
  }

  // Vaciar papelera
  const emptyTrashBtn = ws.querySelector('#btn-empty-trash');
  if (emptyTrashBtn) {
    emptyTrashBtn.onclick = () => {
      if (confirm('¿Vaciar toda la papelera definitivamente?')) {
        let notes = getKeepNotes();
        notes = notes.filter(n => !n.trashed);
        saveKeepNotes(notes);
        refreshKeepWorkspace(container);
      }
    };
  }

  // 2. Buscador en tiempo real
  const searchInput = ws.querySelector('#keep-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      _searchQuery = e.target.value;
      refreshKeepWorkspace(container);
    };
  }

  const clearSearchBtn = ws.querySelector('#btn-clear-search');
  if (clearSearchBtn) {
    clearSearchBtn.onclick = () => {
      _searchQuery = '';
      refreshKeepWorkspace(container);
    };
  }

  // 3. Creador de notas: Expandir / Colapsar
  const collapsedBox = ws.querySelector('#keep-creator-collapsed');
  const quickChecklistBtn = ws.querySelector('#btn-quick-checklist');
  const quickReminderBtn = ws.querySelector('#btn-quick-reminder');
  const saveCloseBtn = ws.querySelector('#btn-save-creator');
  const toggleChecklistBtn = ws.querySelector('#btn-toggle-checklist');
  const creatorPinBtn = ws.querySelector('#btn-creator-pin-toggle');
  const toggleReminderBarBtn = ws.querySelector('#btn-toggle-reminder-bar');
  const clearCreatorRemBtn = ws.querySelector('#btn-clear-creator-rem');
  const creatorLabelsBtn = ws.querySelector('#btn-creator-labels-toggle');

  if (collapsedBox) {
    collapsedBox.onclick = () => {
      _creatorIsExpanded = true;
      _creatorIsChecklist = false;
      refreshKeepWorkspace(container);
      setTimeout(() => ws.querySelector('#keep-new-title')?.focus(), 50);
    };
  }

  if (quickChecklistBtn) {
    quickChecklistBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorIsExpanded = true;
      _creatorIsChecklist = true;
      refreshKeepWorkspace(container);
      setTimeout(() => ws.querySelector('#keep-new-title')?.focus(), 50);
    };
  }

  if (quickReminderBtn) {
    quickReminderBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorIsExpanded = true;
      _creatorShowReminderBar = true;
      if (!_creatorReminderDate) {
        _creatorReminderDate = new Date().toISOString().split('T')[0];
      }
      refreshKeepWorkspace(container);
      setTimeout(() => ws.querySelector('#keep-new-title')?.focus(), 50);
    };
  }

  if (toggleChecklistBtn) {
    toggleChecklistBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorIsChecklist = !_creatorIsChecklist;
      refreshKeepWorkspace(container);
    };
  }

  if (toggleReminderBarBtn) {
    toggleReminderBarBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorShowReminderBar = !_creatorShowReminderBar;
      if (_creatorShowReminderBar && !_creatorReminderDate) {
        _creatorReminderDate = new Date().toISOString().split('T')[0];
      }
      const bar = ws.querySelector('#keep-creator-reminder-bar');
      if (bar) bar.style.display = _creatorShowReminderBar ? 'flex' : 'none';
      toggleReminderBarBtn.classList.toggle('active', _creatorShowReminderBar);
    };
  }

  if (clearCreatorRemBtn) {
    clearCreatorRemBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorShowReminderBar = false;
      _creatorReminderDate = '';
      const bar = ws.querySelector('#keep-creator-reminder-bar');
      if (bar) bar.style.display = 'none';
      if (toggleReminderBarBtn) toggleReminderBarBtn.classList.remove('active');
    };
  }

  // Selector de etiquetas en creador
  if (creatorLabelsBtn) {
    creatorLabelsBtn.onclick = (e) => {
      e.stopPropagation();
      const popover = ws.querySelector('#keep-creator-labels-popover');
      if (popover) {
        const isShown = popover.style.display === 'block';
        popover.style.display = isShown ? 'none' : 'block';
      }
    };
  }

  ws.querySelectorAll('.creator-label-checkbox').forEach(chk => {
    chk.onchange = () => {
      const val = chk.value;
      if (chk.checked) {
        if (!_creatorSelectedLabels.includes(val)) _creatorSelectedLabels.push(val);
      } else {
        _creatorSelectedLabels = _creatorSelectedLabels.filter(l => l !== val);
      }
      refreshKeepWorkspace(container);
    };
  });

  // Remover etiqueta de creator pills
  ws.querySelectorAll('.btn-remove-creator-pill').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      _creatorSelectedLabels.splice(idx, 1);
      refreshKeepWorkspace(container);
    };
  });

  if (creatorPinBtn) {
    creatorPinBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorPinned = !_creatorPinned;
      creatorPinBtn.classList.toggle('active', _creatorPinned);
    };
  }

  // Selector de paleta de colores en creador
  ws.querySelectorAll('.keep-palette-swatch').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      _creatorColor = btn.dataset.color;
      const creatorCard = ws.querySelector('#keep-creator-card');
      const colorObj = GOOGLE_KEEP_COLORS.find(c => c.id === _creatorColor);
      if (creatorCard && colorObj) {
        creatorCard.style.backgroundColor = colorObj.bg;
        creatorCard.style.borderColor = colorObj.border;
      }
      ws.querySelectorAll('.keep-palette-swatch').forEach(b => b.classList.toggle('active', b.dataset.color === _creatorColor));
    };
  });

  // Agregar elemento al checklist del creador
  const checklistInput = ws.querySelector('#keep-new-checklist-item-input');
  if (checklistInput) {
    checklistInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = checklistInput.value.trim();
        if (val) {
          _creatorChecklistItems.push({ text: val, completed: false });
          checklistInput.value = '';
          renderCreatorChecklistItems(ws);
        }
      }
    };
  }

  // Guardar y cerrar creador
  if (saveCloseBtn) {
    saveCloseBtn.onclick = (e) => {
      e.stopPropagation();
      saveNewNoteFromCreator(ws, container);
    };
  }

  // 4. Pin / Unpin directo en tarjetas
  ws.querySelectorAll('.btn-keep-pin').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.pinned = !n.pinned;
        saveKeepNotes(notes);
        refreshKeepWorkspace(container);
      }
    };
  });

  // 5. Archivar / Desarchivar
  ws.querySelectorAll('.btn-keep-archive').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.archived = !n.archived;
        saveKeepNotes(notes);
        refreshKeepWorkspace(container);
      }
    };
  });

  // 6. Checkbox directo en tarjetas
  ws.querySelectorAll('.keep-task-checkbox').forEach(chk => {
    chk.onchange = (e) => {
      e.stopPropagation();
      const noteId = chk.dataset.noteId;
      const idx = parseInt(chk.dataset.taskIdx, 10);
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n && n.tasks && n.tasks[idx]) {
        n.tasks[idx].completed = chk.checked;
        saveKeepNotes(notes);
        const row = chk.closest('.keep-card-task-row');
        if (row) row.classList.toggle('is-done', chk.checked);
      }
    };
  });

  // 7. Cambio de color directo en tarjeta (mini dots)
  ws.querySelectorAll('.keep-mini-color-dot').forEach(dot => {
    dot.onclick = (e) => {
      e.stopPropagation();
      const noteId = dot.dataset.noteId;
      const colorId = dot.dataset.color;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.color = colorId;
        saveKeepNotes(notes);
        refreshKeepWorkspace(container);
      }
    };
  });

  // 8. Botón rápido de Recordatorio en tarjeta
  ws.querySelectorAll('.btn-keep-reminder-quick').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (!n) return;

      const currentDate = n.reminder?.date || new Date().toISOString().split('T')[0];
      const currentTime = n.reminder?.time || '09:00';
      const promptRes = prompt(`Programar Recordatorio para "${n.title}":\nIngresa fecha y hora (AAAA-MM-DD HH:MM)`, `${currentDate} ${currentTime}`);
      if (promptRes !== null) {
        const parts = promptRes.trim().split(/\s+/);
        const datePart = parts[0];
        const timePart = parts[1] || '09:00';
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          n.reminder = { date: datePart, time: timePart };
          saveKeepNotes(notes);
          if (window.syncKeepReminderToPersonal) {
            window.syncKeepReminderToPersonal(n);
          }
          refreshKeepWorkspace(container);
        } else if (promptRes.trim() === '') {
          delete n.reminder;
          saveKeepNotes(notes);
          if (window.removeKeepReminderFromPersonal) {
            window.removeKeepReminderFromPersonal(noteId);
          }
          refreshKeepWorkspace(container);
        } else {
          alert('Formato de fecha inválido. Usa AAAA-MM-DD (ej: 2026-10-14).');
        }
      }
    };
  });

  // 9. Eliminar recordatorio desde la píldora de la tarjeta
  ws.querySelectorAll('.btn-card-remove-reminder').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        delete n.reminder;
        saveKeepNotes(notes);
        if (window.removeKeepReminderFromPersonal) {
          window.removeKeepReminderFromPersonal(noteId);
        }
        refreshKeepWorkspace(container);
      }
    };
  });

  // 10. Filtrar al hacer clic en un chip de etiqueta
  ws.querySelectorAll('.keep-card-label-chip').forEach(chip => {
    chip.onclick = (e) => {
      e.stopPropagation();
      const lbl = chip.dataset.label;
      if (lbl) {
        _currentKeepSection = `label:${lbl}`;
        refreshKeepWorkspace(container);
      }
    };
  });

  // 11. Enviar nota a la papelera (soft delete estilo Keep)
  ws.querySelectorAll('.btn-keep-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.trashed = true;
        saveKeepNotes(notes);
        if (n.reminder && window.removeKeepReminderFromPersonal) {
          window.removeKeepReminderFromPersonal(noteId);
        }
        refreshKeepWorkspace(container);
      }
    };
  });

  // 12. Restaurar desde papelera
  ws.querySelectorAll('.btn-restore-note').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        n.trashed = false;
        saveKeepNotes(notes);
        if (n.reminder && window.syncKeepReminderToPersonal) {
          window.syncKeepReminderToPersonal(n);
        }
        refreshKeepWorkspace(container);
      }
    };
  });

  // 13. Eliminar permanentemente
  ws.querySelectorAll('.btn-delete-permanent').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      if (confirm('¿Eliminar esta nota para siempre?')) {
        let notes = getKeepNotes();
        notes = notes.filter(x => x.id !== noteId);
        saveKeepNotes(notes);
        if (window.removeKeepReminderFromPersonal) {
          window.removeKeepReminderFromPersonal(noteId);
        }
        refreshKeepWorkspace(container);
      }
    };
  });

  // 14. Copiar nota al portapapeles
  ws.querySelectorAll('.btn-keep-copy').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        let text = `${n.title}\n\n${n.body || ''}`;
        if (n.reminder && n.reminder.date) {
          text += `\n🔔 Recordatorio: ${n.reminder.date} ${n.reminder.time || ''}`;
        }
        if (n.labels && n.labels.length > 0) {
          text += `\n🏷️ Etiquetas: ${n.labels.join(', ')}`;
        }
        if (n.tasks && n.tasks.length > 0) {
          text += '\n\n' + n.tasks.map(t => `${t.completed ? '[x]' : '[ ]'} ${t.text}`).join('\n');
        }
        try {
          await navigator.clipboard.writeText(text);
          btn.textContent = '✓';
          setTimeout(() => { btn.textContent = '📋'; }, 1500);
        } catch (err) {
          alert(text);
        }
      }
    };
  });

  // 15. Clic en tarjeta -> Abrir Modal de Edición Completa (Google Keep Modal)
  ws.querySelectorAll('.keep-note-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
        return;
      }
      if (_currentKeepSection === 'papelera') return; // En papelera no se edita directamente
      const noteId = card.dataset.noteId;
      openKeepEditModal(noteId, container);
    };
  });
}

function renderCreatorChecklistItems(ws) {
  const container = ws.querySelector('#keep-creator-checklist-items');
  if (!container) return;
  container.innerHTML = _creatorChecklistItems.map((item, idx) => `
    <div class="keep-creator-item-pill">
      <span>☑️ ${escapeHtml(item.text)}</span>
      <button type="button" class="btn-remove-creator-item" data-idx="${idx}">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.btn-remove-creator-item').forEach(b => {
    b.onclick = () => {
      const i = parseInt(b.dataset.idx, 10);
      _creatorChecklistItems.splice(i, 1);
      renderCreatorChecklistItems(ws);
    };
  });
}

function saveNewNoteFromCreator(ws, container) {
  const title = ws.querySelector('#keep-new-title')?.value.trim();
  const body = ws.querySelector('#keep-new-body')?.value.trim();
  const remDate = ws.querySelector('#keep-new-reminder-date')?.value;
  const remTime = ws.querySelector('#keep-new-reminder-time')?.value;

  const hasReminder = (_creatorShowReminderBar || _currentKeepSection === 'recordatorios') && !!remDate;

  if (!title && !body && _creatorChecklistItems.length === 0 && !hasReminder) {
    _creatorIsExpanded = false;
    _creatorIsChecklist = false;
    _creatorPinned = false;
    _creatorColor = 'default';
    _creatorChecklistItems = [];
    _creatorShowReminderBar = false;
    _creatorSelectedLabels = [];
    refreshKeepWorkspace(container);
    return;
  }

  // Títulos idénticos permitidos libremente (sin sufijos forzados)
  const finalTitle = title || 'Sin título';

  // Si estamos navegando por una etiqueta, agregarla automáticamente si no está
  const finalLabels = [..._creatorSelectedLabels];
  if (_currentKeepSection.startsWith('label:')) {
    const activeLabel = _currentKeepSection.slice(6);
    if (!finalLabels.includes(activeLabel)) {
      finalLabels.push(activeLabel);
    }
  }

  const notes = getKeepNotes();
  const newNote = {
    id: `keep-${Date.now()}`,
    title: finalTitle,
    body: body || '',
    color: _creatorColor,
    labels: finalLabels,
    pinned: _creatorPinned,
    archived: false,
    trashed: false,
    createdAt: new Date().toISOString(),
    tasks: _creatorChecklistItems.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      text: item.text,
      completed: false
    }))
  };

  // Asignar recordatorio si fue configurado y sincronizar con Tablero Personal & Calendario
  if (hasReminder) {
    newNote.reminder = {
      date: remDate,
      time: remTime || '09:00'
    };
  }

  notes.unshift(newNote);
  saveKeepNotes(notes);

  if (newNote.reminder && window.syncKeepReminderToPersonal) {
    window.syncKeepReminderToPersonal(newNote);
  }

  _creatorIsExpanded = false;
  _creatorIsChecklist = false;
  _creatorPinned = false;
  _creatorColor = 'default';
  _creatorChecklistItems = [];
  _creatorShowReminderBar = false;
  _creatorReminderDate = '';
  _creatorSelectedLabels = [];

  refreshKeepWorkspace(container);
}

// ------------------------------------------------------------------------------
// MODAL AUTÉNTICO "EDITAR ETIQUETAS" DE GOOGLE KEEP
// ------------------------------------------------------------------------------
function openKeepLabelsModal(container) {
  const modalOverlay = container.querySelector('#keep-labels-modal');
  const labelsListEl = container.querySelector('#keep-labels-list');
  const createInput = container.querySelector('#keep-create-label-input');
  const submitCreateBtn = container.querySelector('#btn-submit-create-label');
  const closeBtn = container.querySelector('#btn-close-labels-modal');
  if (!modalOverlay || !labelsListEl) return;

  const renderLabelsRows = () => {
    const currentLabels = getKeepLabels();
    labelsListEl.innerHTML = currentLabels.map((lbl, idx) => `
      <div class="keep-label-item-row" data-label="${escapeHtml(lbl)}">
        <button type="button" class="btn-label-row-trash" data-label="${escapeHtml(lbl)}" title="Eliminar etiqueta">🗑️</button>
        <input type="text" class="keep-label-row-input" value="${escapeHtml(lbl)}" data-orig="${escapeHtml(lbl)}" />
        <button type="button" class="btn-label-row-save" data-label="${escapeHtml(lbl)}" title="Guardar cambio">✓</button>
      </div>
    `).join('');

    // Eventos de renombrar
    labelsListEl.querySelectorAll('.keep-label-row-input').forEach(inp => {
      const orig = inp.dataset.orig;
      const doRename = () => {
        const val = inp.value.trim();
        if (val && val !== orig) {
          renameKeepLabel(orig, val);
          renderLabelsRows();
        }
      };

      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          doRename();
        }
      };
      inp.onblur = doRename;
    });

    // Guardar botón check
    labelsListEl.querySelectorAll('.btn-label-row-save').forEach(btn => {
      btn.onclick = () => {
        const row = btn.closest('.keep-label-item-row');
        const inp = row?.querySelector('.keep-label-row-input');
        if (inp) {
          const val = inp.value.trim();
          const orig = inp.dataset.orig;
          if (val && val !== orig) {
            renameKeepLabel(orig, val);
            renderLabelsRows();
          }
        }
      };
    });

    // Eliminar botón papelera
    labelsListEl.querySelectorAll('.btn-label-row-trash').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.label;
        if (confirm(`¿Eliminar la etiqueta "${target}"? Las notas no se eliminarán, solo la etiqueta.`)) {
          deleteKeepLabel(target);
          renderLabelsRows();
        }
      };
    });
  };

  const handleCreateNew = () => {
    const val = createInput?.value.trim();
    if (val) {
      const added = addKeepLabel(val);
      if (added) {
        createInput.value = '';
        renderLabelsRows();
      } else {
        alert('Esa etiqueta ya existe.');
      }
    }
  };

  if (submitCreateBtn) submitCreateBtn.onclick = handleCreateNew;
  if (createInput) {
    createInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateNew();
      }
    };
  }

  const closeModal = () => {
    modalOverlay.style.display = 'none';
    refreshKeepWorkspace(container);
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  modalOverlay.onclick = (e) => {
    if (e.target === modalOverlay) closeModal();
  };

  renderLabelsRows();
  modalOverlay.style.display = 'flex';
  setTimeout(() => createInput?.focus(), 50);
}

// ------------------------------------------------------------------------------
// MODAL DE EDICIÓN DE NOTAS (GOOGLE KEEP MODAL)
// ------------------------------------------------------------------------------
function openKeepEditModal(noteId, container) {
  const notes = getKeepNotes();
  const n = notes.find(x => x.id === noteId);
  if (!n) return;

  const modalOverlay = container.querySelector('#keep-edit-modal');
  const modalDialog = container.querySelector('#keep-edit-dialog');
  if (!modalOverlay || !modalDialog) return;

  let modalTasks = Array.isArray(n.tasks) ? JSON.parse(JSON.stringify(n.tasks)) : [];
  let modalColor = n.color || 'default';
  let modalPinned = !!n.pinned;
  let modalLabels = Array.isArray(n.labels) ? [...n.labels] : [];
  let modalReminder = n.reminder ? { ...n.reminder } : null;

  const allSystemLabels = getKeepLabels();

  const renderModalContent = () => {
    const colorObj = GOOGLE_KEEP_COLORS.find(c => c.id === modalColor) || GOOGLE_KEEP_COLORS[0];
    modalDialog.style.backgroundColor = colorObj.bg;
    modalDialog.style.borderColor = colorObj.border;
    modalDialog.style.color = colorObj.text;

    modalDialog.innerHTML = `
      <div class="keep-modal-header">
        <input type="text" id="modal-note-title" class="keep-modal-title-input" value="${escapeHtml(n.title)}" placeholder="Título (permite nombres repetidos)" />
        <button type="button" class="btn-modal-pin ${modalPinned ? 'active' : ''}" id="btn-modal-pin" title="${modalPinned ? 'Desanclar' : 'Fijar'}">📌</button>
      </div>

      <div class="keep-modal-body-area">
        <textarea id="modal-note-body" class="keep-modal-textarea" placeholder="Nota..." rows="4">${escapeHtml(n.body || '')}</textarea>
        
        <div class="keep-modal-tasks-section">
          <div class="keep-modal-tasks-list" id="modal-tasks-list">
            ${modalTasks.map((t, idx) => `
              <div class="keep-modal-task-row ${t.completed ? 'is-done' : ''}">
                <input type="checkbox" class="modal-task-chk" data-idx="${idx}" ${t.completed ? 'checked' : ''} />
                <input type="text" class="modal-task-edit-input" data-idx="${idx}" value="${escapeHtml(t.text)}" />
                <button type="button" class="btn-remove-modal-task" data-idx="${idx}">✕</button>
              </div>
            `).join('')}
          </div>
          <div class="keep-modal-add-task-row">
            <span class="keep-modal-plus">+</span>
            <input type="text" id="modal-new-task-input" class="modal-add-task-input" placeholder="Añadir elemento de lista..." />
          </div>
        </div>

        <!-- SECCIÓN DE RECORDATORIO (CONECTADA AL CALENDARIO) -->
        <div class="keep-modal-reminder-box">
          <div class="keep-modal-meta-title">🔔 Recordatorio (Tablero Personal & Calendario)</div>
          <div class="keep-modal-reminder-row">
            <input type="date" id="modal-reminder-date" class="keep-modal-input-date" value="${modalReminder?.date || ''}" />
            <input type="time" id="modal-reminder-time" class="keep-modal-input-time" value="${modalReminder?.time || '09:00'}" />
            ${modalReminder?.date ? `
              <button type="button" class="btn-clear-modal-rem" id="btn-clear-modal-rem" title="Quitar recordatorio">✕ Quitar</button>
            ` : ''}
          </div>
        </div>

        <!-- SECCIÓN DE ETIQUETAS -->
        <div class="keep-modal-labels-box">
          <div class="keep-modal-meta-title">🏷️ Etiquetas</div>
          <div class="keep-modal-labels-list">
            ${allSystemLabels.map(lbl => `
              <label class="keep-modal-label-item">
                <input type="checkbox" class="modal-label-chk" value="${escapeHtml(lbl)}" ${modalLabels.includes(lbl) ? 'checked' : ''} />
                <span>${escapeHtml(lbl)}</span>
              </label>
            `).join('')}
          </div>
        </div>

      </div>

      <div class="keep-modal-footer">
        <div class="keep-modal-footer-tools">
          <div class="keep-modal-colors">
            ${GOOGLE_KEEP_COLORS.map(c => `
              <button type="button" class="keep-modal-swatch ${modalColor === c.id ? 'active' : ''}" data-color="${c.id}" style="background-color: ${c.bg}; border-color: ${c.border};" title="${c.name}"></button>
            `).join('')}
          </div>
          <button type="button" class="btn-modal-delete" id="btn-modal-delete" title="Enviar a papelera">🗑️</button>
        </div>
        <button type="button" class="btn-modal-close" id="btn-modal-close">Cerrar</button>
      </div>
    `;

    // Modal Events
    modalDialog.querySelector('#btn-modal-pin').onclick = () => {
      modalPinned = !modalPinned;
      modalDialog.querySelector('#btn-modal-pin').classList.toggle('active', modalPinned);
    };

    modalDialog.querySelectorAll('.keep-modal-swatch').forEach(sw => {
      sw.onclick = () => {
        modalColor = sw.dataset.color;
        renderModalContent();
      };
    });

    modalDialog.querySelectorAll('.modal-task-chk').forEach(chk => {
      chk.onchange = () => {
        const i = parseInt(chk.dataset.idx, 10);
        if (modalTasks[i]) modalTasks[i].completed = chk.checked;
      };
    });

    modalDialog.querySelectorAll('.modal-task-edit-input').forEach(inp => {
      inp.oninput = () => {
        const i = parseInt(inp.dataset.idx, 10);
        if (modalTasks[i]) modalTasks[i].text = inp.value;
      };
    });

    modalDialog.querySelectorAll('.btn-remove-modal-task').forEach(btn => {
      btn.onclick = () => {
        const i = parseInt(btn.dataset.idx, 10);
        modalTasks.splice(i, 1);
        renderModalContent();
      };
    });

    const modalTaskInput = modalDialog.querySelector('#modal-new-task-input');
    if (modalTaskInput) {
      modalTaskInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = modalTaskInput.value.trim();
          if (val) {
            modalTasks.push({ text: val, completed: false });
            modalTaskInput.value = '';
            renderModalContent();
          }
        }
      };
    }

    // Limpiar recordatorio en modal
    const clearRemBtn = modalDialog.querySelector('#btn-clear-modal-rem');
    if (clearRemBtn) {
      clearRemBtn.onclick = () => {
        modalReminder = null;
        renderModalContent();
      };
    }

    // Checkboxes de etiquetas en modal
    modalDialog.querySelectorAll('.modal-label-chk').forEach(chk => {
      chk.onchange = () => {
        const val = chk.value;
        if (chk.checked) {
          if (!modalLabels.includes(val)) modalLabels.push(val);
        } else {
          modalLabels = modalLabels.filter(l => l !== val);
        }
      };
    });

    modalDialog.querySelector('#btn-modal-delete').onclick = () => {
      let all = getKeepNotes();
      const target = all.find(x => x.id === noteId);
      if (target) {
        target.trashed = true;
        saveKeepNotes(all);
        if (target.reminder && window.removeKeepReminderFromPersonal) {
          window.removeKeepReminderFromPersonal(target.id);
        }
      }
      modalOverlay.style.display = 'none';
      refreshKeepWorkspace(container);
    };

    const saveAndClose = () => {
      const newTitle = modalDialog.querySelector('#modal-note-title')?.value.trim();
      const newBody = modalDialog.querySelector('#modal-note-body')?.value.trim();
      const remDate = modalDialog.querySelector('#modal-reminder-date')?.value;
      const remTime = modalDialog.querySelector('#modal-reminder-time')?.value;

      const all = getKeepNotes();
      const target = all.find(x => x.id === noteId);
      if (target) {
        target.title = newTitle || 'Sin título';
        target.body = newBody || '';
        target.pinned = modalPinned;
        target.color = modalColor;
        target.labels = modalLabels;
        target.tasks = modalTasks.filter(t => t.text.trim().length > 0);

        if (remDate) {
          target.reminder = { date: remDate, time: remTime || '09:00' };
          if (window.syncKeepReminderToPersonal) {
            window.syncKeepReminderToPersonal(target);
          }
        } else {
          delete target.reminder;
          if (window.removeKeepReminderFromPersonal) {
            window.removeKeepReminderFromPersonal(target.id);
          }
        }

        saveKeepNotes(all);
      }
      modalOverlay.style.display = 'none';
      refreshKeepWorkspace(container);
    };

    modalDialog.querySelector('#btn-modal-close').onclick = saveAndClose;
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) {
        saveAndClose();
      }
    };
  };

  renderModalContent();
  modalOverlay.style.display = 'flex';
}

function refreshKeepWorkspace(parent) {
  const currentWs = parent.querySelector('#keep-workspace');
  if (currentWs) {
    currentWs.outerHTML = renderKeepNotesHTML();
    setupKeepNotesEvents(parent);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
