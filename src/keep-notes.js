// ==============================================================================
// QZ HUB — BANCO DE IDEAS & WORKFLOWS (GOOGLE KEEP STYLE)
// ==============================================================================
// Componente de toma y gestión de notas rápidas, etiquetas (spot, workflows,
// pre-cierres, upgrade), colores, checklists y búsqueda en tiempo real.
// ==============================================================================

import db from './ssot-db.json';

const KEEP_STORAGE_KEY = 'qz_keep_notes';

export const KEEP_COLOR_PALETTE = [
  { id: 'grafito', name: 'Grafito Dark', hex: '#0f172a', border: '#334155' },
  { id: 'lavanda', name: 'Lavanda Zentry', hex: '#2e1065', border: '#6b21a8' },
  { id: 'menta', name: 'Menta Quarz', hex: '#064e3b', border: '#059669' },
  { id: 'ambar', name: 'Ámbar Cierre', hex: '#78350f', border: '#d97706' },
  { id: 'slate', name: 'Slate Neutro', hex: '#1e293b', border: '#475569' },
  { id: 'rosa', name: 'Rosa Vibe', hex: '#701a75', border: '#c026d3' }
];

export function getDefaultKeepNotes() {
  // Precarga con las ideas del SSOT mapeadas con tags de Google Keep
  const rawIdeas = db.ideas || [];
  return rawIdeas.map((idea, index) => {
    let tag = 'spot';
    let color = 'lavanda';
    const lowerTitle = (idea.title || '').toLowerCase();
    const lowerCategory = (idea.category || '').toLowerCase();

    if (lowerTitle.includes('precierre') || lowerCategory.includes('precierre')) {
      tag = 'pre-cierres';
      color = 'ambar';
    } else if (lowerTitle.includes('creativo') || lowerCategory.includes('integraciones') || lowerCategory.includes('gcp')) {
      tag = 'workflows';
      color = 'menta';
    } else if (lowerTitle.includes('upgrade') || lowerCategory.includes('pádel') || lowerCategory.includes('padel')) {
      tag = 'upgrade';
      color = 'rosa';
    }

    return {
      id: `keep-seed-${index + 1}`,
      title: idea.fullTitle || idea.title || `Nota #${index + 1}`,
      body: idea.body || '',
      tag: tag,
      color: color,
      pinned: index < 2,
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

// Filtro activo en memoria de sesión
let _activeTagFilter = 'todas';
let _activeSearchQuery = '';

export function renderKeepNotesHTML() {
  const allNotes = getKeepNotes();

  // Obtener lista única de tags
  const tagsSet = new Set(['spot', 'pre-cierres', 'workflows', 'upgrade']);
  allNotes.forEach(n => {
    if (n.tag) tagsSet.add(n.tag.trim().toLowerCase());
  });
  const tagsList = Array.from(tagsSet);

  // Filtrado
  const filteredNotes = allNotes.filter(n => {
    const matchesTag = _activeTagFilter === 'todas' || (n.tag && n.tag.toLowerCase() === _activeTagFilter.toLowerCase());
    const query = _activeSearchQuery.toLowerCase();
    const matchesSearch = !query ||
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.body && n.body.toLowerCase().includes(query)) ||
      (n.tasks && n.tasks.some(t => t.text.toLowerCase().includes(query)));
    return matchesTag && matchesSearch;
  });

  // Ordenar: pinned primero
  filteredNotes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const filterChipsHtml = `
    <button type="button" class="keep-filter-pill ${_activeTagFilter === 'todas' ? 'active' : ''}" data-tag="todas">
      Todas (${allNotes.length})
    </button>
    ${tagsList.map(t => {
      const count = allNotes.filter(n => (n.tag || '').toLowerCase() === t.toLowerCase()).length;
      return `
        <button type="button" class="keep-filter-pill ${_activeTagFilter === t.toLowerCase() ? 'active' : ''}" data-tag="${t}">
          🏷️ ${t} (${count})
        </button>
      `;
    }).join('')}
  `;

  const cardsHtml = filteredNotes.length === 0
    ? `<div class="keep-empty-msg">No se encontraron ideas con el filtro seleccionado.</div>`
    : filteredNotes.map(n => {
      const colorObj = KEEP_COLOR_PALETTE.find(c => c.id === n.color) || KEEP_COLOR_PALETTE[0];
      const tasksHtml = (n.tasks && n.tasks.length > 0)
        ? `
          <div class="keep-card-tasks">
            <span class="keep-card-tasks-label">⚙️ Acciones / Checklist:</span>
            <ul class="keep-checklist">
              ${n.tasks.map((t, tIdx) => `
                <li class="keep-checklist-item ${t.completed ? 'is-done' : ''}">
                  <input type="checkbox" class="keep-task-checkbox" data-note-id="${n.id}" data-task-idx="${tIdx}" ${t.completed ? 'checked' : ''} />
                  <span>${t.text}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `
        : '';

      return `
        <div class="keep-note-card ${n.pinned ? 'is-pinned' : ''}" data-note-id="${n.id}" style="background: ${colorObj.hex}; border-color: ${colorObj.border};">
          <div class="keep-card-header">
            <h4 class="keep-card-title">${n.title}</h4>
            <div class="keep-card-badges">
              <span class="keep-card-tag-badge">🏷️ ${n.tag || 'general'}</span>
              <button type="button" class="btn-keep-pin ${n.pinned ? 'active' : ''}" data-note-id="${n.id}" title="${n.pinned ? 'Desanclar nota' : 'Fijar nota arriba'}">📌</button>
            </div>
          </div>
          <div class="keep-card-body">
            ${(n.body || '').replace(/\n/g, '<br/>')}
          </div>
          ${tasksHtml}
          <div class="keep-card-footer">
            <div class="keep-color-dots">
              ${KEEP_COLOR_PALETTE.map(cp => `
                <button type="button" class="keep-color-dot ${n.color === cp.id ? 'active' : ''}" data-note-id="${n.id}" data-color-id="${cp.id}" style="background: ${cp.border};" title="${cp.name}"></button>
              `).join('')}
            </div>
            <div class="keep-card-actions">
              <button type="button" class="btn-keep-delete" data-note-id="${n.id}" title="Eliminar nota">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  return `
    <div class="keep-tool-container" id="keep-notes-tool">
      <div class="keep-tool-header">
        <div class="keep-header-title-box">
          <span class="keep-header-icon">💡</span>
          <div>
            <h3 class="keep-tool-title">BANCO DE IDEAS & WORKFLOWS (KEEP STYLE)</h3>
            <span class="keep-tool-subtitle">Captura libre de ideas, tags (spot, pre-cierres, upgrade), checklists y colores</span>
          </div>
        </div>
        <div class="keep-search-box">
          <input type="text" id="keep-search-input" placeholder="🔍 Buscar ideas o checklists..." value="${_activeSearchQuery}" />
        </div>
      </div>

      <!-- BARRA DE CREACIÓN DE NOTA RÁPIDA -->
      <div class="keep-create-card" id="keep-create-card">
        <div class="keep-create-collapsed" id="keep-create-collapsed">
          <span class="keep-create-placeholder">💡 Tomar una nueva nota / idea de producto o flujo...</span>
        </div>
        <div class="keep-create-expanded" id="keep-create-expanded" style="display: none;">
          <input type="text" id="new-note-title" class="keep-input-title" placeholder="Título de la idea..." />
          <textarea id="new-note-body" class="keep-input-body" placeholder="Escribe tu idea, flujo o nota estratégica..." rows="3"></textarea>
          
          <div class="keep-create-extra-row">
            <div class="keep-tag-select-wrap">
              <label>Etiqueta:</label>
              <select id="new-note-tag" class="keep-select-tag">
                <option value="spot">🏷️ spot (Producto & UI)</option>
                <option value="pre-cierres">🏷️ pre-cierres (Guiones)</option>
                <option value="workflows">🏷️ workflows (Agentes)</option>
                <option value="upgrade">🏷️ upgrade (Pádel / Satélites)</option>
                <option value="quarz">🏷️ quarz (Holding)</option>
              </select>
            </div>
            <div class="keep-color-select-wrap">
              <label>Color:</label>
              <div class="keep-create-colors">
                ${KEEP_COLOR_PALETTE.map((cp, idx) => `
                  <button type="button" class="keep-color-choice ${idx === 0 ? 'active' : ''}" data-color-id="${cp.id}" style="background: ${cp.hex}; border-color: ${cp.border};" title="${cp.name}"></button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="keep-tasks-input-wrap">
            <input type="text" id="new-note-task-input" class="keep-input-task" placeholder="+ Añadir micro-tarea o checklist (Enter)..." />
            <div id="new-note-tasks-list" class="new-tasks-chip-list"></div>
          </div>

          <div class="keep-create-actions">
            <button type="button" id="btn-cancel-new-note" class="btn-keep-secondary">Cancelar</button>
            <button type="button" id="btn-save-new-note" class="btn-keep-primary">💾 Guardar Idea</button>
          </div>
        </div>
      </div>

      <!-- CHIPS DE FILTRO DE ETIQUETAS -->
      <div class="keep-filter-bar" id="keep-filter-bar">
        ${filterChipsHtml}
      </div>

      <!-- GRID DE TARJETAS ESTILO GOOGLE KEEP -->
      <div class="keep-notes-grid" id="keep-notes-grid">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export function setupKeepNotesEvents(container) {
  const tool = container.querySelector('#keep-notes-tool');
  if (!tool) return;

  let tempNewTasks = [];

  // Expandir / colapsar creador de notas
  const collapsed = tool.querySelector('#keep-create-collapsed');
  const expanded = tool.querySelector('#keep-create-expanded');
  const cancelBtn = tool.querySelector('#btn-cancel-new-note');
  const saveBtn = tool.querySelector('#btn-save-new-note');

  if (collapsed && expanded) {
    collapsed.onclick = () => {
      collapsed.style.display = 'none';
      expanded.style.display = 'block';
      tool.querySelector('#new-note-title')?.focus();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      expanded.style.display = 'none';
      collapsed.style.display = 'block';
      tempNewTasks = [];
    };
  }

  // Selector de color en creador
  let selectedColor = KEEP_COLOR_PALETTE[0].id;
  tool.querySelectorAll('.keep-color-choice').forEach(btn => {
    btn.onclick = () => {
      tool.querySelectorAll('.keep-color-choice').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.colorId;
    };
  });

  // Añadir checklist task temporal
  const taskInput = tool.querySelector('#new-note-task-input');
  const tasksChipContainer = tool.querySelector('#new-note-tasks-list');
  if (taskInput) {
    taskInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = taskInput.value.trim();
        if (val) {
          tempNewTasks.push(val);
          taskInput.value = '';
          renderTempTasksChips();
        }
      }
    };
  }

  function renderTempTasksChips() {
    if (!tasksChipContainer) return;
    tasksChipContainer.innerHTML = tempNewTasks.map((t, idx) => `
      <span class="temp-task-chip">
        ✓ ${t}
        <button type="button" class="btn-remove-temp-task" data-idx="${idx}">✕</button>
      </span>
    `).join('');

    tasksChipContainer.querySelectorAll('.btn-remove-temp-task').forEach(b => {
      b.onclick = () => {
        const i = parseInt(b.dataset.idx, 10);
        tempNewTasks.splice(i, 1);
        renderTempTasksChips();
      };
    });
  }

  // Guardar nueva nota
  if (saveBtn) {
    saveBtn.onclick = () => {
      const title = tool.querySelector('#new-note-title')?.value.trim();
      const body = tool.querySelector('#new-note-body')?.value.trim();
      const tag = tool.querySelector('#new-note-tag')?.value || 'spot';

      if (!title && !body && tempNewTasks.length === 0) {
        alert('Por favor escribe un título o texto para la idea.');
        return;
      }

      const notes = getKeepNotes();
      const newNote = {
        id: `keep-${Date.now()}`,
        title: title || 'Idea sin título',
        body: body || '',
        tag: tag,
        color: selectedColor,
        pinned: false,
        createdAt: new Date().toISOString(),
        tasks: tempNewTasks.map((tText, idx) => ({
          id: `task-${Date.now()}-${idx}`,
          text: tText,
          completed: false
        }))
      };

      notes.unshift(newNote);
      saveKeepNotes(notes);

      // Re-render
      refreshKeepView(container);
    };
  }

  // Búsqueda en tiempo real
  const searchInput = tool.querySelector('#keep-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      _activeSearchQuery = e.target.value;
      refreshKeepView(container);
    };
  }

  // Filtro por etiquetas
  tool.querySelectorAll('.keep-filter-pill').forEach(btn => {
    btn.onclick = () => {
      _activeTagFilter = btn.dataset.tag;
      refreshKeepView(container);
    };
  });

  // Pin / Unpin
  tool.querySelectorAll('.btn-keep-pin').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      const notes = getKeepNotes();
      const target = notes.find(n => n.id === noteId);
      if (target) {
        target.pinned = !target.pinned;
        saveKeepNotes(notes);
        refreshKeepView(container);
      }
    };
  });

  // Checkbox de tarea interactivo
  tool.querySelectorAll('.keep-task-checkbox').forEach(chk => {
    chk.onchange = (e) => {
      e.stopPropagation();
      const noteId = chk.dataset.noteId;
      const taskIdx = parseInt(chk.dataset.taskIdx, 10);
      const notes = getKeepNotes();
      const target = notes.find(n => n.id === noteId);
      if (target && target.tasks && target.tasks[taskIdx]) {
        target.tasks[taskIdx].completed = chk.checked;
        saveKeepNotes(notes);
        const itemLi = chk.closest('.keep-checklist-item');
        if (itemLi) {
          if (chk.checked) itemLi.classList.add('is-done');
          else itemLi.classList.remove('is-done');
        }
      }
    };
  });

  // Cambiar color directamente desde la tarjeta
  tool.querySelectorAll('.keep-color-dot').forEach(dot => {
    dot.onclick = (e) => {
      e.stopPropagation();
      const noteId = dot.dataset.noteId;
      const colorId = dot.dataset.colorId;
      const notes = getKeepNotes();
      const target = notes.find(n => n.id === noteId);
      if (target) {
        target.color = colorId;
        saveKeepNotes(notes);
        refreshKeepView(container);
      }
    };
  });

  // Borrar nota
  tool.querySelectorAll('.btn-keep-delete').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const noteId = btn.dataset.noteId;
      if (confirm('¿Eliminar esta idea del banco?')) {
        let notes = getKeepNotes();
        notes = notes.filter(n => n.id !== noteId);
        saveKeepNotes(notes);
        refreshKeepView(container);
      }
    };
  });

  function refreshKeepView(parent) {
    const parentSection = parent.querySelector('#keep-notes-tool') || parent;
    if (parentSection) {
      parentSection.outerHTML = renderKeepNotesHTML();
      setupKeepNotesEvents(parent);
    }
  }
}
