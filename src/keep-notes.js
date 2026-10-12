// ==============================================================================
// QZ HUB — BANCO DE IDEAS & NOTAS (GOOGLE KEEP FIDELITY)
// ==============================================================================
// Interfaz 100% fiel a Google Keep:
// - Buscador superior en tiempo real
// - Creador "Añade una nota..." colapsable / expandible con listas de casillas
// - Separación canónica: FIJADAS y OTRAS
// - Paleta de colores pastel Google Keep
// - Casillas de verificación interactivas
// - Modal de edición completa al hacer clic en tarjeta
// - Tarjeta de entrada compacta para el tablero Backlog
// ==============================================================================

import db from './ssot-db.json';

const KEEP_STORAGE_KEY = 'qz_keep_notes';

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

export function getDefaultKeepNotes() {
  const rawIdeas = db.ideas || [];
  return rawIdeas.map((idea, index) => {
    // Asignar un color Keep armónico por defecto
    const colors = ['mint', 'sand', 'sage', 'fog', 'peach', 'dusk', 'coral'];
    const chosenColor = colors[index % colors.length];

    return {
      id: `keep-seed-${index + 1}`,
      title: idea.fullTitle || idea.title || `Nota #${index + 1}`,
      body: idea.body || '',
      color: chosenColor,
      pinned: index < 2, // Primeras 2 notas fijadas
      createdAt: new Date().toISOString(),
      tasks: (idea.tasks || []).map((tText, tIdx) => ({
        id: `task-${index}-${tIdx}`,
        text: tText,
        completed: false
      }))
    };
  });
}

export function getKeepNotes() {
  try {
    const raw = localStorage.getItem(KEEP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
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

// Estado volátil del buscador en memoria
let _searchQuery = '';
let _creatorIsExpanded = false;
let _creatorIsChecklist = false;
let _creatorPinned = false;
let _creatorColor = 'default';
let _creatorChecklistItems = [];

// ==============================================================================
// 1. TARJETA COMPACTA DE ACCESO PARA EL TABLERO BACKLOG (NO DESPLEGADA COMPLETA)
// ==============================================================================
export function renderKeepEntryCardHTML() {
  const notes = getKeepNotes();
  const totalCount = notes.length;
  const pinnedCount = notes.filter(n => n.pinned).length;

  return `
    <div class="keep-entry-card" id="keep-entry-card">
      <div class="keep-entry-left">
        <div class="keep-entry-icon-box">💡</div>
        <div class="keep-entry-info">
          <div class="keep-entry-meta-row">
            <span class="keep-entry-brand-badge">GOOGLE KEEP</span>
            <span class="keep-entry-stat-pill">${totalCount} Notas</span>
            ${pinnedCount > 0 ? `<span class="keep-entry-pinned-pill">📌 ${pinnedCount} Fijadas</span>` : ''}
          </div>
          <h3 class="keep-entry-title">Banco de Ideas & Notas Rápidas</h3>
          <p class="keep-entry-desc">Captura inmediata de conceptos, flujos de producto, notas fijadas y checklists.</p>
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
// 2. VISTA DEDICADA DE GOOGLE KEEP (BACKPAGE COMPLETA)
// ==============================================================================
export function renderKeepNotesHTML() {
  const allNotes = getKeepNotes();
  const q = _searchQuery.trim().toLowerCase();

  const filtered = allNotes.filter(n => {
    if (!q) return true;
    const matchTitle = (n.title || '').toLowerCase().includes(q);
    const matchBody = (n.body || '').toLowerCase().includes(q);
    const matchTasks = (n.tasks || []).some(t => (t.text || '').toLowerCase().includes(q));
    return matchTitle || matchBody || matchTasks;
  });

  const pinnedNotes = filtered.filter(n => n.pinned);
  const otherNotes = filtered.filter(n => !n.pinned);

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

    return `
      <div class="keep-note-card ${n.pinned ? 'is-pinned' : ''} ${isDark ? 'is-dark-card' : ''}" data-note-id="${n.id}" style="background-color: ${colorObj.bg}; border-color: ${colorObj.border}; color: ${colorObj.text};">
        <div class="keep-card-top">
          <div class="keep-card-title">${escapeHtml(n.title || 'Sin título')}</div>
          <button type="button" class="btn-keep-pin ${n.pinned ? 'active' : ''}" data-note-id="${n.id}" title="${n.pinned ? 'Desanclar nota' : 'Fijar nota'}">
            📌
          </button>
        </div>

        <div class="keep-card-content-wrap">
          ${bodyHtml}
          ${tasksHtml}
        </div>

        <div class="keep-card-actions-bar">
          <div class="keep-card-colors-mini">
            ${GOOGLE_KEEP_COLORS.slice(0, 7).map(c => `
              <button type="button" class="keep-mini-color-dot ${n.color === c.id ? 'active' : ''}" data-note-id="${n.id}" data-color="${c.id}" style="background: ${c.border};" title="${c.name}"></button>
            `).join('')}
          </div>
          <div class="keep-card-action-btns">
            <button type="button" class="btn-keep-card-tool btn-keep-copy" data-note-id="${n.id}" title="Copiar texto">📋</button>
            <button type="button" class="btn-keep-card-tool btn-keep-delete" data-note-id="${n.id}" title="Eliminar nota">🗑️</button>
          </div>
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
          <span class="keep-view-subtitle">${allNotes.length} notas sincronizadas en tiempo real con Firestore</span>
        </div>
      </div>

      <!-- BUSCADOR SUPERIOR ESTILO GOOGLE KEEP -->
      <div class="keep-search-container">
        <div class="keep-search-bar">
          <span class="keep-search-icon">🔍</span>
          <input type="text" id="keep-search-input" placeholder="Buscar en Keep..." value="${escapeHtml(_searchQuery)}" />
          ${_searchQuery ? `<button type="button" id="btn-clear-search" class="btn-clear-search" title="Limpiar búsqueda">✕</button>` : ''}
        </div>
      </div>

      <!-- CREADOR DE NOTAS ESTILO GOOGLE KEEP ("Añade una nota...") -->
      <div class="keep-creator-wrapper">
        <div class="keep-creator-card" id="keep-creator-card" style="background-color: ${GOOGLE_KEEP_COLORS.find(c => c.id === _creatorColor)?.bg || '#ffffff'}; border-color: ${GOOGLE_KEEP_COLORS.find(c => c.id === _creatorColor)?.border || '#e2e8f0'};">
          
          <!-- ESTADO COLAPSADO -->
          <div class="keep-creator-collapsed" id="keep-creator-collapsed" style="${_creatorIsExpanded ? 'display: none;' : 'display: flex;'}">
            <span class="keep-creator-placeholder">Añade una nota...</span>
            <div class="keep-creator-quick-icons">
              <button type="button" class="btn-creator-quick-icon" id="btn-quick-checklist" title="Nueva lista con casillas">☑️</button>
            </div>
          </div>

          <!-- ESTADO EXPANDIDO -->
          <div class="keep-creator-expanded" id="keep-creator-expanded" style="${_creatorIsExpanded ? 'display: flex;' : 'display: none;'}">
            <div class="keep-creator-header">
              <input type="text" id="keep-new-title" class="keep-creator-title-input" placeholder="Título" />
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
                <!-- Items agregados se listan aquí -->
              </div>
              <div class="keep-creator-add-item-row">
                <span class="keep-creator-plus">+</span>
                <input type="text" id="keep-new-checklist-item-input" class="keep-creator-item-input" placeholder="Elemento de lista (Enter para agregar)..." />
              </div>
            </div>

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

      <!-- SECCIONES DE NOTAS (FIJADAS Y OTRAS) -->
      <div class="keep-notes-sections">
        ${filtered.length === 0 ? `
          <div class="keep-empty-state">
            <span class="keep-empty-icon">💡</span>
            <p>No se encontraron notas en tu banco.</p>
          </div>
        ` : `
          ${pinnedNotes.length > 0 ? `
            <div class="keep-section-block">
              <div class="keep-section-label">FIJADAS</div>
              <div class="keep-cards-grid">
                ${pinnedNotes.map(renderCard).join('')}
              </div>
            </div>
          ` : ''}

          ${otherNotes.length > 0 ? `
            <div class="keep-section-block">
              ${pinnedNotes.length > 0 ? `<div class="keep-section-label">OTRAS</div>` : ''}
              <div class="keep-cards-grid">
                ${otherNotes.map(renderCard).join('')}
              </div>
            </div>
          ` : ''}
        `}
      </div>

      <!-- MODAL DE EDICIÓN COMPLETA (GOOGLE KEEP EDIT MODAL) -->
      <div class="keep-edit-modal-overlay" id="keep-edit-modal" style="display: none;">
        <div class="keep-edit-modal-dialog" id="keep-edit-dialog">
          <!-- Contenido inyectado dinámicamente -->
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

  // 1. Buscador en tiempo real
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

  // 2. Creador de notas: Expandir / Colapsar
  const collapsedBox = ws.querySelector('#keep-creator-collapsed');
  const expandedBox = ws.querySelector('#keep-creator-expanded');
  const quickChecklistBtn = ws.querySelector('#btn-quick-checklist');
  const saveCloseBtn = ws.querySelector('#btn-save-creator');
  const toggleChecklistBtn = ws.querySelector('#btn-toggle-checklist');
  const creatorPinBtn = ws.querySelector('#btn-creator-pin-toggle');

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

  if (toggleChecklistBtn) {
    toggleChecklistBtn.onclick = (e) => {
      e.stopPropagation();
      _creatorIsChecklist = !_creatorIsChecklist;
      refreshKeepWorkspace(container);
    };
  }

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

  // 3. Pin / Unpin directo en tarjetas
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

  // 4. Checkbox directo en tarjetas
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

  // 5. Cambio de color directo en tarjeta (mini dots)
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

  // 6. Eliminar nota
  ws.querySelectorAll('.btn-keep-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      if (confirm('¿Eliminar esta nota de Keep?')) {
        let notes = getKeepNotes();
        notes = notes.filter(x => x.id !== noteId);
        saveKeepNotes(notes);
        refreshKeepWorkspace(container);
      }
    };
  });

  // 7. Copiar nota al portapapeles
  ws.querySelectorAll('.btn-keep-copy').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const n = notes.find(x => x.id === noteId);
      if (n) {
        let text = `${n.title}\n\n${n.body || ''}`;
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

  // 8. Clic en tarjeta -> Abrir Modal de Edición Completa (Google Keep Modal)
  ws.querySelectorAll('.keep-note-card').forEach(card => {
    card.onclick = (e) => {
      // Ignorar si se hizo clic en botones de acción o checkboxes
      if (e.target.closest('button') || e.target.closest('input[type="checkbox"]')) {
        return;
      }
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

  if (!title && !body && _creatorChecklistItems.length === 0) {
    // Si está completamente vacía, solo colapsar
    _creatorIsExpanded = false;
    _creatorIsChecklist = false;
    _creatorPinned = false;
    _creatorColor = 'default';
    _creatorChecklistItems = [];
    refreshKeepWorkspace(container);
    return;
  }

  const notes = getKeepNotes();
  const newNote = {
    id: `keep-${Date.now()}`,
    title: title || 'Sin título',
    body: body || '',
    color: _creatorColor,
    pinned: _creatorPinned,
    createdAt: new Date().toISOString(),
    tasks: _creatorChecklistItems.map((item, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      text: item.text,
      completed: false
    }))
  };

  notes.unshift(newNote);
  saveKeepNotes(notes);

  // Reset creator state
  _creatorIsExpanded = false;
  _creatorIsChecklist = false;
  _creatorPinned = false;
  _creatorColor = 'default';
  _creatorChecklistItems = [];

  refreshKeepWorkspace(container);
}

// Modal de edición Google Keep
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

  const renderModalContent = () => {
    const colorObj = GOOGLE_KEEP_COLORS.find(c => c.id === modalColor) || GOOGLE_KEEP_COLORS[0];
    modalDialog.style.backgroundColor = colorObj.bg;
    modalDialog.style.borderColor = colorObj.border;
    modalDialog.style.color = colorObj.text;

    modalDialog.innerHTML = `
      <div class="keep-modal-header">
        <input type="text" id="modal-note-title" class="keep-modal-title-input" value="${escapeHtml(n.title)}" placeholder="Título" />
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
      </div>

      <div class="keep-modal-footer">
        <div class="keep-modal-footer-tools">
          <div class="keep-modal-colors">
            ${GOOGLE_KEEP_COLORS.map(c => `
              <button type="button" class="keep-modal-swatch ${modalColor === c.id ? 'active' : ''}" data-color="${c.id}" style="background-color: ${c.bg}; border-color: ${c.border};" title="${c.name}"></button>
            `).join('')}
          </div>
          <button type="button" class="btn-modal-delete" id="btn-modal-delete" title="Eliminar nota">🗑️</button>
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

    modalDialog.querySelector('#btn-modal-delete').onclick = () => {
      if (confirm('¿Eliminar esta nota?')) {
        let all = getKeepNotes();
        all = all.filter(x => x.id !== noteId);
        saveKeepNotes(all);
        modalOverlay.style.display = 'none';
        refreshKeepWorkspace(container);
      }
    };

    const saveAndClose = () => {
      const newTitle = modalDialog.querySelector('#modal-note-title')?.value.trim();
      const newBody = modalDialog.querySelector('#modal-note-body')?.value.trim();

      const all = getKeepNotes();
      const target = all.find(x => x.id === noteId);
      if (target) {
        target.title = newTitle || 'Sin título';
        target.body = newBody || '';
        target.pinned = modalPinned;
        target.color = modalColor;
        target.tasks = modalTasks.filter(t => t.text.trim().length > 0);
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
