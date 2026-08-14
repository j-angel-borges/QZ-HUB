import { manifestMarkdown, circadianoMarkdown, metricasMarkdown, dispositivosData } from './herramientas-data.js';
import './style.css';
import db from './ssot-db.json';
import {
  bootstrapFirestoreSync,
  pushToFirestoreDebounced,
  pushAllToFirestore,
  syncTasks,
  syncMIT,
  syncObjectives,
  syncTimeblock,
  syncTimeblockHistory,
  syncJournalHistory
} from './firestore-sync.js';
 
// App State
const state = {
  activeView: 'backlog', // 'backlog', 'ideas', 'metrics', 'branding', 'doc'
  activeDocPath: '',
  collapsedFolders: {
    '01-vision-y-producto': false,
    '02-arquitectura-tecnica': false,
    '03-marketing-y-ventas': false,
    '04-operaciones-y-roadmap': false,
    '05-mesa-de-trabajo': false
  },
  filters: {
    vertical: 'all',
    priority: 'all',
    status: 'all'
  },
  tasks: [],
  currentEditingTask: null,
  // Espacio Personal state
  personalDate: new Date().toISOString().split('T')[0],
  chatMessages: [],
  pendingSuggestions: null,
  calendarEvents: [],
  calendarConnected: !!localStorage.getItem('gcal_access_token') || !!localStorage.getItem('gcal_gas_url')
};

// Initialize Tasks from LocalStorage or DB
function initTasks() {
  const stored = localStorage.getItem('zentry_tasks');
  if (stored) {
    try {
      state.tasks = JSON.parse(stored);
    } catch (e) {
      state.tasks = JSON.parse(JSON.stringify(db.tasks));
    }
  } else {
    state.tasks = JSON.parse(JSON.stringify(db.tasks));
    localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks)); syncTasks(state.tasks);
  }
}

initTasks();

// --- Storage & Data Helpers for Backlog widgets ---
// ==============================================================================
// QZ HUB MULTI-DEVICE REALTIME SYNC ENGINE (GOOGLE CLOUD FIRESTORE)
// ==============================================================================

// Wrapper: replaces old pushCloudDataDebounced
function pushCloudDataDebounced() {
  pushToFirestoreDebounced(state.tasks);
}

// Bootstrap Firestore on load (pull -> merge -> push -> listen)
bootstrapFirestoreSync(state.tasks, (cloudData) => {
  // Re-hydrate state from cloud updates received from other devices
  if (cloudData && Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
    state.tasks = cloudData.tasks;
  }
  // Trigger re-render if on backlog view
  if (state.activeView === 'backlog') {
    if (typeof renderers !== 'undefined' && renderers.backlog) renderers.backlog();
  }
});



function getMITStorageKey() {
  const mode = state.backlogMode || 'quarz';
  return `zentry_mit_${mode}`;
}

function getMITData() {
  const mode = state.backlogMode || 'quarz';
  const defaultMITMap = {
    quarz: [
      { text: 'Revisar gobernanza y estructura de Holding QUARZ Group', checked: false },
      { text: 'Aprobar flujo de caja y proyección financiera de Agosto', checked: false },
      { text: 'Validar arquitectura técnica en Google Cloud Firestore', checked: false }
    ],
    zentry: [
      { text: 'Diseñar barra de tiempo superpuesta (Timer UI Overlay) en Jetpack Compose', checked: false },
      { text: 'Implementar lógica de límites de tiempo dinámicos basados en ciclo circadiano', checked: false },
      { text: 'Finalizar Demo Venta Directa ZentryOS con factor WOW', checked: false }
    ],
    personal: [
      { text: 'Cumplir bloque de ayuno y protocolo circadiano de energía', checked: false },
      { text: 'Realizar caminata activa de 45 min + calistenia', checked: false },
      { text: 'Completar 40 llamadas breves Royal Prestige', checked: false }
    ]
  };
  
  const key = getMITStorageKey();
  const stored = localStorage.getItem(key) || localStorage.getItem('zentry_mit');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return defaultMITMap[mode] || defaultMITMap.quarz; }
  }
  return defaultMITMap[mode] || defaultMITMap.quarz;
}

function saveMITData(mit) {
  const key = getMITStorageKey();
  localStorage.setItem(key, JSON.stringify(mit));
  localStorage.setItem('zentry_mit', JSON.stringify(mit));
  syncMIT(mit);
}

function getCorkboardObjectives() {
  const defaultObjs = [
    'Lanzar prototipo ZentryOS Kiosk Mode en Android.',
    'Completar guión comercial y cerrar primer cliente prospecto.',
    'Sincronizar base de conocimientos con todos los agentes de IA.'
  ];
  const stored = localStorage.getItem('zentry_objectives');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return defaultObjs; }
  }
  return defaultObjs;
}

function saveCorkboardObjectives(objs) {
  localStorage.setItem('zentry_objectives', JSON.stringify(objs));
  syncObjectives(objs);
}

// --- Timeblock Data Helpers ---
function getTimeblockData(dateStr) {
  const key = `zentry_timeblock_${dateStr}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return {}; }
  }
  return {};
}

function saveTimeblockData(dateStr, data) {
  localStorage.setItem(`zentry_timeblock_${dateStr}`, JSON.stringify(data));
  syncTimeblock(dateStr, data);
}

function updateBrickInStorage(dateStr, timeStr, updates) {
  const data = getTimeblockData(dateStr);
  if (data && data[timeStr]) {
    Object.assign(data[timeStr], updates);
    saveTimeblockData(dateStr, data);
    
    const history = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]');
    const hIndex = history.findIndex(h => h.date === dateStr);
    if (hIndex !== -1) {
      if (history[hIndex].data && history[hIndex].data[timeStr]) {
        Object.assign(history[hIndex].data[timeStr], updates);
        localStorage.setItem('zentry_timeblock_history', JSON.stringify(history));
        syncTimeblockHistory(history);
      }
    }
  }
}

function checkOAuthCallback() {
  const hash = window.location.hash;
  if (hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in') || '3600';
    if (accessToken) {
      localStorage.setItem('gcal_access_token', accessToken);
      localStorage.setItem('gcal_token_expires', String(Date.now() + parseInt(expiresIn) * 1000));
      localStorage.removeItem('gcal_gas_url');
      state.calendarConnected = true;
      window.location.hash = '#backlog/personal';
      return true;
    }
  }
  return false;
}

async function loadCalendarEvents() {
  const gasUrl = localStorage.getItem('gcal_gas_url');
  
  if (gasUrl) {
    state.calendarConnected = true;
    try {
      const res = await fetch(gasUrl);
      if (!res.ok) throw new Error('GAS error');
      const events = await res.json();
      state.calendarEvents = events.map(e => ({
        title: e.title || e.summary || '(Sin título)',
        start: e.startTime || e.start?.dateTime || e.start,
        end: e.endTime || e.end?.dateTime || e.end,
        description: e.description || ''
      }));
      applyCalendarEventsToTimeblock();
    } catch (err) {
      console.error('Error fetching calendar events via GAS:', err);
    }
  } else {
    state.calendarConnected = false;
  }
}

function applyCalendarEventsToTimeblock() {
  if (state.calendarEvents.length === 0) return;
  
  const data = getTimeblockData(state.personalDate);
  Object.keys(data).forEach(key => {
    if (data[key]?.source === 'calendar') {
      delete data[key];
    }
  });
  
  state.calendarEvents.forEach(event => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    const dateStr = state.personalDate;
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    
    if (startStr !== dateStr && endStr !== dateStr) return;
    
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    const slots = generateTimeSlots();
    slots.forEach(slot => {
      const [sh, sm] = slot.time.split(':').map(Number);
      const slotMinutes = sh * 60 + sm;
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        data[slot.time] = { text: event.title, source: 'calendar' };
      }
    });
  });
  
  saveTimeblockData(state.personalDate, data);
}

function generateTimeSlots() {
  const slots = [];
  for (let h = 4; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 4 && m < 30) continue;
      if (h === 23 && m > 30) continue;
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push({ time: `${hh}:${mm}`, isHour: m === 0 });
    }
  }
  return slots;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function shiftDate(dateStr, days) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatTime12h(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getCurrentTimePosition() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < 6 || h > 23) return null;
  
  const slotTime = `${String(h).padStart(2,'0')}:${String(Math.floor(m / 15)*15).padStart(2,'0')}`;
  const slotEl = document.querySelector(`.timeblock-slot[data-time="${slotTime}"]`);
  
  if (slotEl) {
    const slotTop = slotEl.offsetTop;
    const slotHeight = slotEl.offsetHeight;
    const minuteOffset = m % 15;
    return slotTop + (minuteOffset / 15) * slotHeight;
  }
  
  // Fallback si no está renderizado (scroll initial)
  const slotIndex = (h - 6) * 4 + Math.floor(m / 15);
  const minuteOffset = m % 15;
  return slotIndex * 38 + (minuteOffset / 15) * 38;
}

// Markdown Parser Utility
function mdToHtml(md) {
  if (!md) return '';
  let html = md.trim().replace(/\r\n/g, '\n');

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Emojis lists and checkboxes
  html = html.replace(/-\s*\[\s*\]\s*(.*$)/gim, '<li><input type="checkbox" disabled> $1</li>');
  html = html.replace(/-\s*\[x\]\s*(.*$)/gim, '<li><input type="checkbox" checked disabled> $1</li>');

  // Unordered lists
  html = html.replace(/^\s*[\*\-]\s+(.*$)/gim, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '\n');

  // Ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '\n');

  // Tables
  const tableRegex = /((?:\|[^\n]*\|(?:\r?\n|$))+)/g;
  html = html.replace(tableRegex, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    if (!lines[1].includes('-')) return match;
    
    let tableHtml = '<table><thead>';
    const headers = lines[0].split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
    tableHtml += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
    
    for (let i = 2; i < lines.length; i++) {
      const cols = lines[i].split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableHtml += '<tr>' + cols.map(c => `<td>${c}</td>`).join('') + '</tr>';
    }
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  // Bold / Italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Links (convert file scheme or relative md files to hash routes)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith('file:///') || url.includes('.md')) {
      const cleanUrl = url.replace('file:///', '');
      const parts = cleanUrl.split('/');
      const lastPart = parts[parts.length - 1];
      const folderName = parts[parts.length - 2];
      if (folderName && lastPart) {
        return `<a href="#doc/${folderName}/${lastPart}" class="doc-link">${text}</a>`;
      }
    }
    return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
  });

  // Paragraphs
  const blocks = html.split('\n\n');
  const parsedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<pre') || trimmed.startsWith('<table') || trimmed.startsWith('---')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });
  
  return parsedBlocks.join('\n');
}

// Format Date Utility
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Set global metadata in sidebar footer
document.getElementById('db-generated-date').textContent = formatDate(db.metadata.generatedAt);

// Calculate overall progress across pages
function calculateGlobalProgress() {
  let totalProgress = 0;
  let count = 0;
  db.pages.forEach(p => {
    if (p.metadata && p.metadata.progress) {
      const pVal = parseInt(p.metadata.progress);
      if (!isNaN(pVal)) {
        totalProgress += pVal;
        count++;
      }
    }
  });
  return count > 0 ? Math.round(totalProgress / count) : 25;
}

const globalProgressValue = calculateGlobalProgress();
document.getElementById('global-progress').style.width = `${globalProgressValue}%`;
document.getElementById('global-progress-text').textContent = `${globalProgressValue}%`;

// Build Document Tree in Sidebar
function buildDocTree() {
  const treeContainer = document.getElementById('ssot-tree');
  if (!treeContainer) return;
  treeContainer.innerHTML = '';

  const folders = {};
  // Group pages by directory
  db.pages.forEach(page => {
    if (!folders[page.directory]) {
      folders[page.directory] = [];
    }
    folders[page.directory].push(page);
  });

  // Order directory list alphabetically or logically
  const sortedFolders = Object.keys(folders).sort();

  sortedFolders.forEach(dir => {
    const folderNode = document.createElement('div');
    folderNode.className = `folder-node ${state.collapsedFolders[dir] ? 'collapsed' : ''}`;
    folderNode.dataset.dir = dir;

    // Friendly Folder Title
    let friendlyName = dir.replace(/^\d+-/, '').replace(/-/g, ' ');
    friendlyName = friendlyName.charAt(0).toUpperCase() + friendlyName.slice(1);
    if (dir === '05-mesa-de-trabajo') friendlyName = 'Mesa de Trabajo 🎨';

    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';
    folderHeader.innerHTML = `
      <span class="folder-toggle-icon">▼</span>
      <span class="folder-icon">📁</span>
      <span class="folder-title">${friendlyName}</span>
    `;

    // Toggle Collapse listener
    folderHeader.addEventListener('click', (e) => {
      state.collapsedFolders[dir] = !state.collapsedFolders[dir];
      folderNode.classList.toggle('collapsed');
    });

    const folderPages = document.createElement('div');
    folderPages.className = 'folder-pages';

    // Sort pages: index/readme first, then alphabetical
    const sortedPages = folders[dir].sort((a, b) => {
      if (a.filename.toLowerCase().includes('readme')) return -1;
      if (b.filename.toLowerCase().includes('readme')) return 1;
      return a.title.localeCompare(b.title);
    });

    sortedPages.forEach(page => {
      const pageNode = document.createElement('a');
      pageNode.href = `#doc/${page.path}`;
      pageNode.className = 'page-node';
      if (state.activeView === 'doc' && state.activeDocPath === page.path) {
        pageNode.classList.add('active');
      }
      
      // Page Emoji Icon
      let emoji = '📄';
      if (page.filename.includes('readme')) emoji = '📖';
      if (page.filename.includes('ludopatia') || page.filename.includes('adiccion')) emoji = '🎮';
      if (page.filename.includes('problema')) emoji = '🧠';
      if (page.filename.includes('control') || page.filename.includes('mdm')) emoji = '🔒';
      if (page.filename.includes('telemetria')) emoji = '📡';
      if (page.filename.includes('compose')) emoji = '🎨';
      if (page.filename.includes('demo')) emoji = '🎭';
      if (page.filename.includes('banco')) emoji = '💡';
      if (page.filename.includes('backlog') || page.filename.includes('tareas')) emoji = '📋';
      if (page.filename.includes('roadmap')) emoji = '📅';

      pageNode.innerHTML = `
        <span class="page-icon">${emoji}</span>
        <span class="page-title-text">${page.title}</span>
      `;
      folderPages.appendChild(pageNode);
    });

    folderNode.appendChild(folderHeader);
    folderNode.appendChild(folderPages);
    treeContainer.appendChild(folderNode);
  });
}

// Brick Wall Helpers
function renderBricksHTML(bricks) {
  if (bricks.length === 0) {
    return `<div style="text-align:center; padding: 40px; color: var(--text-dark); opacity: 0.6;">No hay ladrillos construidos aún. Empieza marcando tus bloques de tiempo completados con 🧱.</div>`;
  }
  
  // We want to create a staggered brick wall.
  // We'll wrap them in rows. Each row can hold e.g. 5 or 6 bricks.
  // Actually, flex layout with wrap and alternating margins works well.
  let html = '<div class="brick-row">';
  let count = 0;
  let rowLength = 5;
  let rowIndex = 0;
  
  bricks.forEach((brick, idx) => {
    if (count >= rowLength) {
      html += '</div><div class="brick-row ' + (rowIndex % 2 === 0 ? 'offset-row' : '') + '">';
      count = 0;
      rowIndex++;
    }
    
    // Add data attributes for the modal
    html += `
      <div class="brick" 
           data-date="${brick.date}" 
           data-time="${brick.time}" 
           data-text="${brick.text.replace(/"/g, '&quot;')}"
           data-details="${(brick.details || '').replace(/"/g, '&quot;')}"
           data-type="${brick.type || ''}">
      </div>
    `;
    count++;
  });
  html += '</div>';
  return html;
}

function setupBrickWallInteraction(baseScale) {
  const viewport = document.getElementById('wall-viewport');
  const canvas = document.getElementById('wall-canvas');
  let currentScale = baseScale;
  let isDragging = false;
  let startX, startY, translateX = 0, translateY = 0;

  // Pan / Drag functionality
  viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.brick')) return; // let click pass through to brick
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });

  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomResetBtn = document.getElementById('zoom-reset');

  function updateTransform() {
    canvas.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
  }

  function setZoom(scale) {
    currentScale = Math.max(0.1, Math.min(scale, 3.0));
    updateTransform();
  }

  if(zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(currentScale + 0.1));
  if(zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(currentScale - 0.1));
  if(zoomResetBtn) zoomResetBtn.addEventListener('click', () => {
    translateX = 0; translateY = 0; setZoom(baseScale);
  });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomAmount = e.deltaY * -0.001;
    setZoom(currentScale + zoomAmount);
  });

  const bricks = document.querySelectorAll('.brick');
  const modal = document.getElementById('brick-modal');
  const modalDate = document.getElementById('brick-modal-date');
  const modalText = document.getElementById('brick-modal-text');
  const modalType = document.getElementById('brick-modal-type');
  const modalDetailsContainer = document.getElementById('brick-modal-details-container');
  const modalDetailsText = document.getElementById('brick-modal-details');
  const closeBtn = document.getElementById('brick-modal-close');
  const editBtn = document.getElementById('brick-modal-edit');
  const deleteBtn = document.getElementById('brick-modal-delete');
  
  let currentActiveBrickData = null;

  bricks.forEach(b => {
    b.addEventListener('click', () => {
      const date = b.dataset.date;
      const time = b.dataset.time;
      const text = b.dataset.text;
      const type = b.dataset.type;
      const details = b.dataset.details;
      
      currentActiveBrickData = { date, time, text, type, details };
      
      modalText.contentEditable = 'false';
      modalDetailsText.contentEditable = 'false';
      modalText.style.border = 'none';
      modalDetailsText.style.border = 'none';
      if (editBtn) {
        editBtn.textContent = 'Editar';
        editBtn.classList.remove('btn-primary');
        editBtn.classList.add('btn-secondary');
      }
      
      modalDate.textContent = `📅 ${date} • ${time}`;
      modalText.textContent = text;
      
      if (details && details !== 'undefined' && details.trim() !== '') {
        modalDetailsText.textContent = details;
        modalDetailsContainer.style.display = 'block';
      } else {
        modalDetailsText.textContent = '';
        modalDetailsContainer.style.display = 'none';
      }

      if (type === 'importante') {
        modalType.textContent = 'IMP';
        modalType.style.color = '#4a5160';
        modalType.style.border = '1px solid #4a5160';
        modalType.style.display = 'inline-block';
      } else if (type === 'productivo') {
        modalType.textContent = 'PROD';
        modalType.style.color = '#d4af37';
        modalType.style.border = '1px solid #d4af37';
        modalType.style.display = 'inline-block';
      } else if (type === 'etc') {
        modalType.textContent = 'ETC...';
        modalType.style.color = '#f57c00';
        modalType.style.border = '1px solid #f57c00';
        modalType.style.display = 'inline-block';
      } else {
        modalType.style.display = 'none';
      }

      modal.classList.add('show');
    });
  });
  
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const isEditing = modalText.contentEditable === 'true';
      if (!isEditing) {
        modalText.contentEditable = 'true';
        modalDetailsText.contentEditable = 'true';
        modalText.style.border = '1px dashed var(--primary)';
        modalDetailsText.style.border = '1px dashed var(--primary)';
        modalDetailsContainer.style.display = 'block';
        editBtn.textContent = 'Guardar';
        editBtn.classList.remove('btn-secondary');
        editBtn.classList.add('btn-primary');
      } else {
        const newText = modalText.textContent;
        const newDetails = modalDetailsText.textContent;
        
        updateBrickInStorage(currentActiveBrickData.date, currentActiveBrickData.time, {
          text: newText,
          details: newDetails
        });
        
        modal.classList.remove('show');
        renderers.zentryos();
      }
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de eliminar este ladrillo? Volverá a ser un bloque normal.')) {
        updateBrickInStorage(currentActiveBrickData.date, currentActiveBrickData.time, { isBrick: false });
        modal.classList.remove('show');
        renderers.zentryos();
      }
    });
  }

  if(closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }
}

// Views Renderers

// Function to invoke real Google Cloud / AI Studio Gemini API with full SSOT System Instruction
async function callRealGeminiAPI(userQuery, chatHistory = []) {
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) throw new Error('MISSING_API_KEY');

  const model = localStorage.getItem('gemini_model') || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `Eres el Orquestador SSOT Maestro de José Ángel para el Plan de 63 Días (10 Agosto a 11 Octubre de 2026).
Tienes conocimiento completo del SSOT:
1. MANIFIESTO MAESTRO 63 DÍAS:
${manifestMarkdown.slice(0, 4000)}

2. METRICAS Y EMBUDOS COMERCIALES:
${metricasMarkdown.slice(0, 3000)}

3. PROTOCOLO CIRCADIANO Y HABITOS:
${circadianoMarkdown.slice(0, 3000)}

INFORMACIÓN OPERATIVA:
- Fecha de hoy: Lunes 10 de Agosto de 2026.
- Obligación financiera al 31 de agosto: S/ 4,000.00 PEN (Caja actual S/ 770.00).
- Dispositivos: Redmi Note 9 (SIM 933709385 QUARZ para llamadas), Motorola Edge 40 Neo (Servidor USB Scrcpy para WhatsApp), Tab A7 Samsung (Demo ZentryOS Launcher Device Owner), iPad 5ª Gen (Demo PWA Dashboard).
- Franja 12:00 PM - 02:00 PM: Paseo del perro + Calistenia + 40 llamadas breves Royal Prestige.
- Ayuno 48h: Jueves 13 (8pm) a Sábado 15 de Agosto (8pm).
- Camal Yerbateros: Viernes 04:30 AM.

Responde con profesionalismo, concisión, estructura Markdown impecable y máxima alineación al SSOT.`;

  const contents = [];
  
  // Format past history into Gemini role objects
  chatHistory.slice(-6).forEach(msg => {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'bot') {
      contents.push({ role: 'model', parts: [{ text: msg.text }] });
    }
  });

  // Ensure current userQuery is at the end
  if (contents.length === 0 || contents[contents.length - 1].role !== 'user' || contents[contents.length - 1].parts[0].text !== userQuery) {
    contents.push({ role: 'user', parts: [{ text: userQuery }] });
  }

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Error HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Respuesta vacía recibida de Gemini API.');
  
  return text;
}



// ─── INTERACTIVE BACKLOG CALENDAR LOGIC ───────────────────────────────────────
let calCurrentDate = new Date();
let calSelectedDateStr = new Date().toISOString().split('T')[0];

function checkTaskMatchesDate(task, dateStr) {
  if (!task || !task.deadline) return false;
  
  if (typeof task.deadline === 'string') {
    return task.deadline === dateStr;
  }
  
  if (task.deadline.type === 'single') {
    return task.deadline.singleDate === dateStr;
  }
  
  if (task.deadline.type === 'range') {
    const start = task.deadline.startDate;
    const end = task.deadline.endDate;
    if (start && end) {
      return dateStr >= start && dateStr <= end;
    }
    if (end) return end === dateStr;
    if (start) return start === dateStr;
    return false;
  }
  
  if (task.deadline.type === 'multiple' && Array.isArray(task.deadline.slots)) {
    return task.deadline.slots.some(s => s && s.date === dateStr);
  }
  
  return false;
}

function getTasksForDate(dateStr) {
  const mode = state.backlogMode || 'quarz';
  return state.tasks.filter(task => {
    // 1. Unit filtering
    const taskUnit = (task.origin || 'Quarz').toLowerCase();
    if (mode === 'quarz' && taskUnit !== 'quarz') return false;
    if (mode === 'zentry' && taskUnit !== 'zentry') return false;
    if ((mode === 'personal' || mode === 'personal-board') && taskUnit !== 'personal') return false;
    // 'global' includes all units
    
    // 2. Date matching
    return checkTaskMatchesDate(task, dateStr);
  });
}

function renderBacklogCalendar() {
  const monthLabel = document.getElementById('cal-month-label');
  const daysGrid = document.getElementById('cal-days-grid');
  const selectedDayTitle = document.getElementById('cal-selected-day-title');
  const dayTasksList = document.getElementById('cal-day-tasks-list');
  
  if (!daysGrid || !monthLabel) return;
  
  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  monthLabel.textContent = `${monthNames[month]} ${year}`;
  
  // Calculate days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  
  const todayStr = new Date().toISOString().split('T')[0];
  
  daysGrid.innerHTML = '';
  
  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const pMonth = month === 0 ? 11 : month - 1;
    const pYear = month === 0 ? year - 1 : year;
    const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell other-month';
    cell.textContent = dayNum;
    cell.dataset.date = dateStr;
    cell.addEventListener('click', () => {
      calSelectedDateStr = dateStr;
      calCurrentDate = new Date(pYear, pMonth, 1);
      renderBacklogCalendar();
    });
    daysGrid.appendChild(cell);
  }
  
  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = getTasksForDate(dateStr);
    const hasTasks = dayTasks.length > 0;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === calSelectedDateStr;
    
    const cell = document.createElement('div');
    cell.className = `cal-day-cell${isToday ? ' is-today' : ''}${isSelected ? ' is-selected' : ''}${hasTasks ? ' has-tasks' : ''}`;
    cell.dataset.date = dateStr;
    
    cell.innerHTML = `
      <span>${d}</span>
      ${hasTasks ? '<div class="cal-day-dots"><span class="cal-day-dot"></span></div>' : ''}
    `;
    
    cell.addEventListener('click', () => {
      calSelectedDateStr = dateStr;
      renderBacklogCalendar();
    });
    
    daysGrid.appendChild(cell);
  }
  
  // Next month padding days to complete grid
  const totalCells = firstDayIndex + totalDaysInMonth;
  const remainingCells = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nMonth = month === 11 ? 0 : month + 1;
    const nYear = month === 11 ? year + 1 : year;
    const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell other-month';
    cell.textContent = d;
    cell.dataset.date = dateStr;
    cell.addEventListener('click', () => {
      calSelectedDateStr = dateStr;
      calCurrentDate = new Date(nYear, nMonth, 1);
      renderBacklogCalendar();
    });
    daysGrid.appendChild(cell);
  }
  
  // Render Selected Day Tasks List
  if (selectedDayTitle) {
    selectedDayTitle.textContent = `Actividades: ${formatDateShort(calSelectedDateStr)}`;
  }
  
  if (dayTasksList) {
    dayTasksList.innerHTML = '';
    const selectedTasks = getTasksForDate(calSelectedDateStr);
    
    if (selectedTasks.length === 0) {
      dayTasksList.innerHTML = `
        <div style="font-size: 11.5px; color: var(--text-muted); padding: 10px 4px; font-style: italic; text-align: center;">
          Sin actividades programadas para este día.
        </div>
      `;
    } else {
      selectedTasks.forEach(task => {
        const item = document.createElement('div');
        item.className = 'cal-task-item';
        
        let timeInfo = '';
        if (task.deadline && task.deadline.type === 'single' && task.deadline.singleTime) {
          timeInfo = `⏰ ${task.deadline.singleTime}`;
        } else if (task.deadline && task.deadline.type === 'range') {
          timeInfo = `📆 Período`;
        } else if (task.deadline && task.deadline.type === 'multiple') {
          const matchingSlot = task.deadline.slots.find(s => s && s.date === calSelectedDateStr);
          if (matchingSlot && matchingSlot.startTime) {
            timeInfo = `⏱️ ${matchingSlot.startTime}${matchingSlot.endTime ? ' - ' + matchingSlot.endTime : ''}`;
          } else {
            timeInfo = `⏱️ Bloque`;
          }
        }
        
        item.innerHTML = `
          <div class="cal-task-item-header">
            <span class="cal-task-id">${task.id}</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <span class="cal-task-unit-tag">${task.origin || 'Quarz'}</span>
              ${timeInfo ? `<span class="cal-task-time">${timeInfo}</span>` : ''}
            </div>
          </div>
          <div class="cal-task-desc">${task.description}</div>
        `;
        
        item.addEventListener('click', () => {
          openTaskModalForEdit(task);
        });
        
        dayTasksList.appendChild(item);
      });
    }
  }
  
  // Bind calendar events
  document.getElementById('cal-prev-month')?.replaceWith(document.getElementById('cal-prev-month').cloneNode(true));
  document.getElementById('cal-next-month')?.replaceWith(document.getElementById('cal-next-month').cloneNode(true));
  document.getElementById('cal-today-btn')?.replaceWith(document.getElementById('cal-today-btn').cloneNode(true));
  document.getElementById('btn-cal-add-task')?.replaceWith(document.getElementById('btn-cal-add-task').cloneNode(true));
  
  document.getElementById('cal-prev-month')?.addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderBacklogCalendar();
  });
  
  document.getElementById('cal-next-month')?.addEventListener('click', () => {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderBacklogCalendar();
  });
  
  document.getElementById('cal-today-btn')?.addEventListener('click', () => {
    calCurrentDate = new Date();
    calSelectedDateStr = new Date().toISOString().split('T')[0];
    renderBacklogCalendar();
  });
  
  document.getElementById('btn-cal-add-task')?.addEventListener('click', () => {
    openTaskModalForCreate();
    setDeadlineMode('single');
    const sDate = document.getElementById('task-single-date');
    if (sDate) sDate.value = calSelectedDateStr;
  });
}

const renderers = {
  // 1. Kanban Backlog View
  backlog: () => {
    // Add backlog-view class to workspace
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('backlog-view');

    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #ebf1f5 0%, #c2f4e7 50%, #d6c8fa 100%)';
    document.getElementById('page-icon').textContent = '📋';
    document.getElementById('page-title').textContent = 'Tablero Backlog';

    const container = document.getElementById('workspace-content');

    if (state.backlogMode === 'selection') {
      document.getElementById('properties-block').style.display = 'none';
      container.innerHTML = `
        <div class="backlog-selector-wrapper">
          <div class="backlog-selector-container">
            <!-- Card 1: TIMEBLOCKING (Personal / Timeblocking) -->
            <a href="#backlog/personal" class="selector-card selector-card-personal">
              <div class="selector-card-icon">⏱️</div>
              <span class="selector-card-title">TIMEBLOCKING</span>
              <span class="selector-card-desc">Timeblocking diario, 3 indispensables M.I.T. y rutina circadiana.</span>
              <button class="btn-selector-enter btn-personal-enter">Entrar a Timeblocking</button>
            </a>

            <!-- Card 2: TABLERO QUARZ (Visual: Logo 3D Quarz) -->
            <a href="#backlog/quarz" class="selector-card selector-card-quarz">
              <div class="selector-card-icon">
                <img src="/assets/quarz/QUARZ_3D_Cuarzo_Vertical_QZ-removebg-preview.png" alt="QUARZ 3D" style="width: 52px; height: 52px; object-fit: contain;" />
              </div>
              <span class="selector-card-title">TABLERO QUARZ</span>
              <span class="selector-card-desc">Gobernanza estratégica, decisiones de holding y prioridades corporativas de QUARZ Group.</span>
              <button class="btn-selector-enter btn-quarz-enter">Entrar a Quarz</button>
            </a>

            <!-- Card 3: TABLERO ZENTRY (Visual: Z Icon) -->
            <a href="#backlog/zentry" class="selector-card selector-card-zentry">
              <div class="selector-card-icon">
                <span style="font-size: 42px; font-weight: 800; color: #533B87; font-family: 'Space Grotesk', sans-serif;">Z</span>
              </div>
              <span class="selector-card-title">TABLERO ZENTRY</span>
              <span class="selector-card-desc">Roadmap comercial, arquitectura técnica MVP, prospectos y ecosistema ZentryOS.</span>
              <button class="btn-selector-enter btn-zentry-enter">Entrar a Zentry</button>
            </a>
          </div>

          <!-- Bottom Button: TABLERO GLOBAL (Combinado) -->
          <div class="global-board-banner-container" style="margin-top: 32px; text-align: center;">
            <a href="#backlog/global" class="global-board-card" style="display: inline-flex; align-items: center; justify-content: space-between; width: 100%; max-width: 960px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 18px 28px; border-radius: 16px; text-decoration: none; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 32px rgba(15,23,42,0.15); transition: transform 0.2s;">
              <div style="display: flex; align-items: center; gap: 16px; text-align: left;">
                <span style="font-size: 32px;">🌐</span>
                <div>
                  <h3 style="color: #ffffff; margin: 0; font-size: 1.15rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700;">TABLERO GLOBAL (Todas las Unidades)</h3>
                  <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 0.85rem;">Vista consolidada con todas las tareas y eventos combinados de Quarz, Zentry y Personal.</p>
                </div>
              </div>
              <button style="background: #b89c50; color: #0f172a; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">Abrir Tablero Global ➔</button>
            </a>
          </div>
        </div>
      `;
      return;
    }

    // Personal mode → Espacio Personal (timeblock + AI chat)
    if (state.backlogMode === 'personal') {
      document.getElementById('properties-block').style.display = 'none';
      document.getElementById('page-banner').style.display = 'none';
      document.querySelector('.workspace-header').style.display = 'none';
      renderEspacioPersonal(container);
      
      // Load and update calendar events in background if connected
      if (state.calendarConnected) {
        loadCalendarEvents().then(() => {
          renderEspacioPersonal(container);
        });
      }
      return;
    }

    document.getElementById('properties-block').style.display = 'flex';
    container.innerHTML = `
      <div class="backlog-layout-grid">
        <!-- Left panel: 3 M.I.T. + Objetivos de la Semana (Stacked) -->
        <div class="backlog-left-col">
          <div class="mit-card glass-panel">
            <div class="mit-header">
              <span class="mit-icon">🎯</span>
              <h3 class="mit-title">3 Indispensables de Hoy</h3>
            </div>
            <div class="mit-list" id="mit-list-container">
              <!-- Loaded dynamically -->
            </div>
          </div>

          <div class="corkboard-widget glass-panel">
            <div class="corkboard-header">
              <span class="corkboard-icon">📌</span>
              <h3 class="corkboard-title">Objetivos de la Semana</h3>
            </div>
            <div class="corkboard-board" id="corkboard-objectives">
              <!-- Loaded dynamically -->
            </div>
          </div>
        </div>

        <!-- Center panel: Kanban Board -->
        <div class="backlog-center-col">
          <div class="backlog-header-controls">
            <a href="#backlog" class="btn-back-to-selector">⬅️ Volver a Selección</a>
            <span class="backlog-mode-badge">${state.backlogMode === 'zentry' ? 'Zentry' : (state.backlogMode === 'quarz' ? 'Quarz' : (state.backlogMode === 'global' ? 'Global' : 'Personal'))}</span>
          </div>

          <div class="filter-bar">
            <div class="filter-group">
              <label class="filter-label">🏷️ Vertical:</label>
              <select id="filter-vertical" class="filter-select">
                <option value="all">Todas</option>
                <option value="tec">Técnica (02-arquitectura)</option>
                <option value="prod">Producto (01-vision)</option>
                <option value="mkt">Ventas / Marketing (03-ventas)</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">⚡ Prioridad:</label>
              <select id="filter-priority" class="filter-select">
                <option value="all">Todas</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div class="filter-bar-actions">
              <button id="add-task-btn" class="btn-add-task">＋ Nueva Tarea</button>
              <button id="reset-tasks-btn" class="btn-reset-tasks" title="Restaurar tareas por defecto del SSOT">🔄 Restaurar</button>
            </div>
          </div>
          <div class="kanban-board">
            <div class="kanban-column" id="col-pendiente">
              <div class="column-header">
                <span class="column-title">⏳ Por Hacer</span>
                <span class="column-count" id="count-pendiente">0</span>
              </div>
              <div class="kanban-cards" id="cards-pendiente"></div>
            </div>
            <div class="kanban-column" id="col-progreso">
              <div class="column-header">
                <span class="column-title">⚡ En Curso</span>
                <span class="column-count" id="count-progreso">0</span>
              </div>
              <div class="kanban-cards" id="cards-progreso"></div>
            </div>
            <div class="kanban-column" id="col-completado">
              <div class="column-header">
                <span class="column-title">✅ Completado</span>
                <span class="column-count" id="count-completado">0</span>
              </div>
              <div class="kanban-cards" id="cards-completado"></div>
            </div>
          </div>
        </div>

        <!-- Right panel: Interactive Calendar View -->
        <div class="backlog-right-col">
          <div class="backlog-calendar-widget glass-panel">
            <div class="cal-widget-header">
              <div class="cal-header-left">
                <span class="cal-icon">📅</span>
                <h3 class="cal-widget-title">Calendario</h3>
              </div>
              <div class="cal-header-right">
                <span class="cal-unit-badge">${state.backlogMode === 'zentry' ? '⚡ Zentry' : (state.backlogMode === 'quarz' ? '🏢 Quarz' : (state.backlogMode === 'global' ? '🌐 Global' : '🧘 Personal'))}</span>
              </div>
            </div>

            <!-- Month Navigator -->
            <div class="cal-nav-bar">
              <button type="button" class="cal-nav-btn" id="cal-prev-month" title="Mes anterior">◀</button>
              <span class="cal-month-label" id="cal-month-label">Agosto 2026</span>
              <button type="button" class="cal-nav-btn" id="cal-next-month" title="Mes siguiente">▶</button>
              <button type="button" class="cal-today-btn" id="cal-today-btn" title="Ir a hoy">Hoy</button>
            </div>

            <!-- Calendar Grid -->
            <div class="cal-grid-container">
              <div class="cal-weekdays">
                <span>D</span><span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span>
              </div>
              <div class="cal-days-grid" id="cal-days-grid">
                <!-- Generated dynamically -->
              </div>
            </div>

            <!-- Selected Day Scheduled Tasks -->
            <div class="cal-day-tasks-section">
              <div class="cal-day-tasks-header">
                <span class="cal-day-title" id="cal-selected-day-title">Actividades del Día</span>
                <button type="button" class="btn-cal-add-task" id="btn-cal-add-task" title="Programar tarea en este día">＋ Tarea</button>
              </div>
              <div class="cal-day-tasks-list" id="cal-day-tasks-list">
                <!-- Generated dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Cards
    renderKanbanCards();

    // Bind Filter Change events
    document.getElementById('filter-vertical').value = state.filters.vertical;
    document.getElementById('filter-priority').value = state.filters.priority;

    document.getElementById('filter-vertical').addEventListener('change', (e) => {
      state.filters.vertical = e.target.value;
      renderKanbanCards();
    });
    document.getElementById('filter-priority').addEventListener('change', (e) => {
      state.filters.priority = e.target.value;
      renderKanbanCards();
    });

    // Add task click listener
    document.getElementById('add-task-btn').addEventListener('click', () => {
      openTaskModalForCreate();
    });

    // Reset tasks listener
    document.getElementById('reset-tasks-btn').addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas restaurar las tareas por defecto del SSOT? Esto borrará tus cambios locales.')) {
        localStorage.removeItem('zentry_tasks');
        initTasks();
        syncTasks(state.tasks);
        renderKanbanCards();
      }
    });

    // Render 3 M.I.T. Widget
    renderMITWidget();

    // Render Corkboard Objectives
    renderCorkboardObjectives();

    // Render Interactive Calendar View
    renderBacklogCalendar();

    // Setup Drag and Drop dropzones
    setupDragAndDrop();
  },

  // 2. Google Keep Notes View
  ideas: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '💡';
    document.getElementById('page-title').textContent = 'Banco de Ideas (Keep)';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    let html = `<div class="keep-notes-container">`;
    db.ideas.forEach(note => {
      const taskListItems = note.tasks.map(t => `<li>${t}</li>`).join('');
      html += `
        <div class="keep-card">
          <div class="keep-header">
            <h3 class="keep-title">${note.fullTitle}</h3>
            <span class="keep-category">${note.category}</span>
          </div>
          <div class="keep-body">${note.body.replace(/\n/g, '<br>')}</div>
          ${taskListItems ? `<div class="keep-tasks-title">⚙️ Pendientes Inferidos:</div><ul class="keep-tasks-list">${taskListItems}</ul>` : ''}
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  },

  // 3. Metrics and KPIs View
  metrics: () => {
    const page = db.pages.find(p => p.filename === 'progreso-y-metricas.md');
    if (page) {
      renderers.doc(page.path);
    } else {
      document.getElementById('workspace-content').innerHTML = `<p>Documento de métricas no encontrado.</p>`;
    }
  },

  // 4. Branding and Colors (Mesa de Trabajo)
  // 4. Branding View (ZentryOS Brand Guide)
  branding: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #533B87 50%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🎨';
    document.getElementById('page-title').textContent = 'Brand Guide — ZentryOS';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    // ZentryOS Product Colors
    const zentryColors = [
      { name: 'Púrpura Zentry Dominante', hex: '#533B87', desc: 'Color institucional dominante de ZentryOS. Utilizado en botones activos, superficies primarias e identidad visual.' },
      { name: 'Lavanda Zentry Interactive', hex: '#D6C8FA', desc: 'Color de acento interactivo y tipografía destacada sobre superficies oscuras.' },
      { name: 'Verde Menta Neón', hex: '#C2F4E7', desc: 'Color de progreso, estados positivos, indicadores de éxito y métricas de caja.' },
      { name: 'Blanco Glacial', hex: '#EBF1F5', desc: 'Superficie glacial clara para fondos de tarjetas y bloques de información.' },
      { name: 'Negro Abisal', hex: '#0C0D10', desc: 'Color de fondo oscuro abisal para paneles de control y launchers.' }
    ];

    let html = `
      <div class="markdown-body">
        <h2>☄️ Sistema de Marca: ZentryOS (Producto Flagship)</h2>
        <p>Paleta gráfica oficial del ecosistema de gobernanza activa, launcher Android y PWA ZentryOS. Haz clic en cualquier tarjeta para copiar su código HEX.</p>
        <div class="color-swatch-grid">
    `;

    zentryColors.forEach(c => {
      html += `
        <div class="color-card" data-hex="${c.hex}" style="border: 1px solid rgba(83, 59, 135, 0.2); border-left: 4px solid ${c.hex}; border-radius: 10px;">
          <div class="color-preview" style="background-color: ${c.hex}; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px;"></div>
          <div class="color-info">
            <span class="color-name" style="color: #533b87; font-weight: 700;">${c.name}</span>
            <span class="color-code" style="font-family: monospace;">${c.hex}</span>
            <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${c.desc}</span>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <h2 style="margin-top: 40px;">✏️ Sistema Tipográfico ZentryOS</h2>
        <p>ZentryOS implementa su propio sistema tipográfico adaptado a móviles y dashboards:</p>
        <ul>
          <li><strong>Outfit</strong>: Tipografía principal moderna para cabeceras, títulos de módulos y tarjetas de producto ZentryOS.</li>
          <li><strong>Inter</strong>: Tipografía limpia para cuerpos de texto, tablas de prospectos, llamadas y descripciones.</li>
        </ul>
      </div>
      <div class="copy-toast" id="copy-toast">Código HEX copiado!</div>
    `;

    container.innerHTML = html;

    // Clipboard Listener
    container.querySelectorAll('.color-card').forEach(card => {
      card.addEventListener('click', () => {
        const hex = card.dataset.hex;
        navigator.clipboard.writeText(hex).then(() => {
          const toast = document.getElementById('copy-toast');
          toast.classList.add('show');
          setTimeout(() => {
            toast.classList.remove('show');
          }, 2000);
        });
      });
    });
  },

  // 5. IA Context View
  iacontext: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #1c142e 0%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🤖';
    document.getElementById('page-title').textContent = 'Contextos de Inteligencia Artificial';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    const contexts = [
      {
        id: 'global',
        title: 'Manifiesto Global Completo',
        desc: 'Recopila toda la base de conocimientos unificada. Recomendado para agentes de IA de rol general (PMs o arquitectos de negocio).',
        file: 'zentryos-ssot-completo.md',
        emoji: '🌌',
        color: '#D6C8FA'
      },
      {
        id: '01',
        title: '01. Visión y Producto',
        desc: 'Contiene los pilares éticos y neurológicos, análisis de la adicción a pantallas y segmentación etaria.',
        file: 'ssot-01-vision-y-producto.md',
        emoji: '🧠',
        color: '#C2F4E7'
      },
      {
        id: '02',
        title: '02. Arquitectura Técnica MVP',
        desc: 'Detalla el Kiosk Mode en Android/iOS, bridges JS, telemetría Firestore, Gemini TTS y analítica.',
        file: 'ssot-02-arquitectura-tecnica.md',
        emoji: '💻',
        color: '#D6C8FA'
      },
      {
        id: '03',
        title: '03. Marketing y Ventas',
        desc: 'Estructura el guion de ventas, el DemoBook (slides, videos, evidencias) y Zentry Prospect (GAS/Sheets para captación de leads).',
        file: 'ssot-03-marketing-y-ventas.md',
        emoji: '🎭',
        color: '#C2F4E7'
      },
      {
        id: '04',
        title: '04. Operaciones y Roadmap',
        desc: 'Contiene hitos de las 4 fases, métricas DAU/LTV/CAC, banco de ideas de Keep y backlog de tareas.',
        file: 'ssot-04-operaciones-y-roadmap.md',
        emoji: '📅',
        color: '#D6C8FA'
      },
      {
        id: '05',
        title: '05. Mesa de Trabajo (Branding)',
        desc: 'Consolida la colorimetría HEX/HSL oficial (Púrpura, Lavanda, Menta), tipografías y recursos visuales.',
        file: 'ssot-05-mesa-de-trabajo.md',
        emoji: '🎨',
        color: '#C2F4E7'
      }
    ];

    let html = `
      <div class="markdown-body">
        <h2>🤖 Descarga de Contextos para Agentes Especializados</h2>
        <p style="margin-bottom: 24px;">Optimiza la ventana de contexto de tus chats de Gemini, Claude o ChatGPT descargando únicamente el segmento del SSOT que requiere tu agente de IA. Esto reduce el ruido cognitivo, acelera las respuestas y ahorra tokens.</p>
        
        <div class="ia-cards-grid">
    `;

    contexts.forEach(c => {
      html += `
        <div class="ia-card" style="border-left: 4px solid ${c.color}">
          <div class="ia-card-header">
            <span class="ia-card-emoji">${c.emoji}</span>
            <h3 class="ia-card-title">${c.title}</h3>
          </div>
          <p class="ia-card-desc">${c.desc}</p>
          <div class="ia-card-footer">
            <code class="ia-card-filename">${c.file}</code>
            <a href="/${c.file}" download="${c.file}" class="ia-download-btn">
              <span>📥 Descargar</span>
            </a>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        
        <div class="ia-instruction-box">
          <h3>💡 Consejo Pro de Workflow: Google Drive & Gemini Extensions</h3>
          <p>
            Gracias a la sincronización automática de Google Drive, no tienes que descargar y subir archivos manualmente en cada chat. Cada una de estas verticales se guarda y actualiza automáticamente bajo el nombre de <code>ssot-actualizado.md</code> dentro de su respectiva subcarpeta <code>registro-diario</code> en Drive.
          </p>
          <p style="margin-top: 8px;">
            Solo escribe esto en el chat de Gemini Web (usando la extensión @Google Drive):
          </p>
          <pre><code>@Google Drive lee ssot-actualizado.md en la carpeta 02-arquitectura-tecnica y explícame el funcionamiento de...</code></pre>
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  // 6. Demobook View
  demobook: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('minimal-view');

    document.getElementById('page-title').textContent = 'Demobook';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="demobook-minimal-container">
        <div class="demobook-grid">
          <a href="https://bienestar-chi.vercel.app/" target="_blank" rel="noopener noreferrer" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">📋</span>
                <span class="demobook-card-title">Preguntas-Bienestar</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
          <a href="https://recursos-venta.vercel.app/" target="_blank" rel="noopener noreferrer" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">📊</span>
                <span class="demobook-card-title">Slides - Demobook</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
        </div>
    `;
  },

  // 6.5. Prospección View
  prospeccion: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('minimal-view');

    document.getElementById('page-title').textContent = 'Prospección';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="demobook-minimal-container">
        <div class="demobook-grid">
          <a href="https://script.google.com/macros/s/AKfycbzXCowYg5XsmnN8s6HJVDtrWK-nh8sBERuP82qGtTDtM9WAm7j3RXotY6bwUsi6eLSlTA/exec" target="_blank" rel="noopener noreferrer" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">🎯</span>
                <span class="demobook-card-title">ZentryOS-Prospect</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
        </div>
      </div>
    `;
  },

  // 6. Tools View (TOOLS)
  herramientas: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) {
      workspace.classList.add('full-width-view');
    }

    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #ffffff 0%, #f7f6f0 50%, #eae8dc 100%)';
    document.getElementById('page-icon').textContent = '⚡';
    document.getElementById('page-title').textContent = 'TOOLS';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="tools-page-grid">
        
        <!-- COLUMNA 1: ASISTENTE ORQUESTADOR SSOT -->
        <div class="tools-column-card" style="background: rgba(255, 255, 255, 0.95); border: 1px solid #c2be9f; border-radius: 0px; padding: 20px; box-shadow: 0 4px 20px rgba(194, 190, 159, 0.15); display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 1.8rem;">🧠</span>
            <div>
              <h2 style="margin: 0; font-size: 1.15rem; color: #111111; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase;">Asistente Orquestador SSOT (Motor de Inteligencia Directo)</h2>
              <span style="font-size: 10.5px; color: var(--qz-text-muted); font-family: 'Space Mono', monospace;">Sin dependencias de APIs externas • Respuestas instantáneas basadas en el Plan Maestro de 63 Días</span>
            </div>
          </div>

          <!-- Clean Chat Container -->
          <div id="ai-chat-box" style="flex: 1; min-height: 380px; max-height: 520px; overflow-y: auto; background: #ffffff; border-radius: 0px; padding: 14px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #c2be9f;">
            <!-- Blank container -->
          </div>

          <!-- Chat Input Form -->
          <form id="ai-chat-form" style="display: flex; gap: 8px;">
            <input type="text" id="ai-chat-input" placeholder="Escribe tu consulta sobre el plan, rutinas, llamadas..." style="flex: 1; padding: 10px 12px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-size: 13px; outline: none;">
            <button type="submit" class="btn btn-primary" style="padding: 10px 18px; font-family: 'Space Mono', monospace; font-weight: bold; border-radius: 0px; background: #111111; color: #ffffff; border: 1px solid #c2be9f;">Enviar ⚡</button>
          </form>
        </div>


        <!-- COLUMNA 2: FUNNEL METRICS ENGINE -->
        <div class="tools-column-card" style="background: rgba(255, 255, 255, 0.95); border: 1px solid #c2be9f; border-radius: 0px; padding: 20px; box-shadow: 0 4px 20px rgba(194, 190, 159, 0.15); display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="font-size: 1.8rem;">📊</span>
            <div>
              <h2 style="margin: 0; font-size: 1.15rem; color: #111111; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase;">Funnel Metrics Engine (Avances y Conversiones)</h2>
              <span style="font-size: 10.5px; color: var(--qz-text-muted); font-family: 'Space Mono', monospace;">Simulación en tiempo real según ratios de conversión RP y QUARZ</span>
            </div>
          </div>

          <!-- Progress Bar Global -->
          <div style="margin-bottom: 20px; background: #ffffff; padding: 14px; border-radius: 0px; border: 1px solid #c2be9f;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: bold; font-size: 12px; font-family: 'Space Grotesk', sans-serif;">🎯 Meta de Caja al 31 de Agosto (21 Días Restantes)</span>
              <span id="funnel-progress-text" style="font-weight: bold; color: #111111; font-family: 'Space Mono', monospace;">S/ 770.00 / S/ 4,000.00 (19.25%)</span>
            </div>
            <div class="progress-bar-container" style="height: 14px; background: #f4f3ed; border-radius: 0px; overflow: hidden; border: 1px solid #c2be9f;">
              <div id="funnel-progress-bar" class="progress-bar" style="width: 19.25%; background: linear-gradient(90deg, #111111 0%, #c2be9f 100%); height: 100%; border-radius: 0px;"></div>
            </div>
          </div>

          <!-- Funnel Cards Stack -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Royal Prestige -->
            <div style="background: #ffffff; border: 1px solid #c2be9f; border-radius: 0px; padding: 14px;">
              <h3 style="margin-top: 0; margin-bottom: 10px; color: #111111; font-size: 1rem; display: flex; align-items: center; gap: 6px; font-family: 'Space Grotesk', sans-serif;">
                <span>🍳</span> Royal Prestige (Llamadas & Referidos)
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                <div>
                  <label style="font-size: 11px; color: var(--qz-text-muted);">Llamadas Conversadas en Frío (SIM 933709385):</label>
                  <input type="number" id="fn-rp-calls" value="40" min="0" style="width: 100%; padding: 6px 8px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-weight: bold; font-size: 13px;">
                </div>
                <div>
                  <label style="font-size: 11px; color: var(--qz-text-muted);">Demos de Referidos Realizadas:</label>
                  <input type="number" id="fn-rp-ref-demos" value="3" min="0" style="width: 100%; padding: 6px 8px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-weight: bold; font-size: 13px;">
                </div>
              </div>

              <div style="background: #fdfdfc; padding: 10px; border-radius: 0px; border: 1px solid #c2be9f; font-size: 11.5px; line-height: 1.5; font-family: 'Space Mono', monospace;">
                <div>• Demos Frías Estimadas (Ratio 20:1): <strong id="fn-rp-est-demos" style="color: #111111;">2 demos</strong></div>
                <div>• Ventas Frías (Ratio 4:1): <strong id="fn-rp-cold-sales" style="color: #111111;">0.5 ventas</strong> (S/ 505.30)</div>
                <div>• Ventas Referidos (Ratio 3:1): <strong id="fn-rp-ref-sales" style="color: #111111;">1 venta</strong> (S/ 1,347.46)</div>
                <div>• Referidos Generados (5-10 x demo): <strong id="fn-rp-new-refs" style="color: #111111;">37 referidos</strong></div>
                <hr style="border: 0; border-top: 1px solid #c2be9f; margin: 6px 0;">
                <div style="font-size: 13px;">Ganancia RP Estimada: <strong id="fn-rp-total-gain" style="color: #111111; font-size: 1.05rem;">S/ 1,852.76</strong></div>
              </div>
            </div>

            <!-- QUARZ Group ZentryOS -->
            <div style="background: #ffffff; border: 1px solid #c2be9f; border-radius: 0px; padding: 14px;">
              <h3 style="margin-top: 0; margin-bottom: 10px; color: #111111; font-size: 1rem; display: flex; align-items: center; gap: 6px; font-family: 'Space Grotesk', sans-serif;">
                <span>☄️</span> QUARZ Group (ZentryOS $1k USD)
              </h3>
              
              <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
                <div>
                  <label style="font-size: 11px; color: var(--qz-text-muted);">Prospectos Presenciales en Frío (Malls/Parques):</label>
                  <input type="number" id="fn-zentry-prospects" value="15" min="0" style="width: 100%; padding: 6px 8px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-weight: bold; font-size: 13px;">
                </div>
                <div>
                  <label style="font-size: 11px; color: var(--qz-text-muted);">Demos Realizadas (Tab A7 / iPad):</label>
                  <input type="number" id="fn-zentry-demos" value="5" min="0" style="width: 100%; padding: 6px 8px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-weight: bold; font-size: 13px;">
                </div>
              </div>

              <div style="background: #fdfdfc; padding: 10px; border-radius: 0px; border: 1px solid #c2be9f; font-size: 11.5px; line-height: 1.5; font-family: 'Space Mono', monospace;">
                <div>• Demos Concretadas (Ratio 5:1): <strong id="fn-zentry-est-demos" style="color: #111111;">3 demos</strong></div>
                <div>• Licencias Cerradas Mes 1 (Ratio 5:1): <strong id="fn-zentry-sales" style="color: #111111;">1 licencia</strong></div>
                <div>• Ganancia Neta Personal (60%): <strong id="fn-zentry-personal-gain" style="color: #111111;">S/ 1,906.78</strong></div>
                <div>• Capital Caja Empresa QUARZ (40%): <strong id="fn-zentry-company-gain" style="color: #111111;">S/ 1,271.19</strong></div>
                <hr style="border: 0; border-top: 1px solid #c2be9f; margin: 6px 0;">
                <div style="font-size: 13px;">Ganancia Personal ZentryOS: <strong id="fn-zentry-total-gain" style="color: #111111; font-size: 1.05rem;">S/ 1,906.78</strong></div>
              </div>
            </div>
          </div>
        </div>


        <!-- COLUMNA 3: DIARIO NOCTURNO DE REFLEXIÓN (JOURNALING EN HOJA EN BLANCO) -->
        <div class="tools-column-card" style="background: rgba(255, 255, 255, 0.95); border: 1px solid #c2be9f; border-radius: 0px; padding: 20px; box-shadow: 0 4px 20px rgba(194, 190, 159, 0.15); display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.8rem;">📝</span>
              <div>
                <h2 style="margin: 0; font-size: 1.15rem; color: #111111; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase;">Diario Nocturno de Reflexión (Journaling)</h2>
                <span style="font-size: 10.5px; color: var(--qz-text-muted); font-family: 'Space Mono', monospace;">Carpeta Drive: <code>17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0</code></span>
              </div>
            </div>
            <input type="date" id="journal-date" value="${todayStr}" style="padding: 6px 10px; border-radius: 0px; border: 1px solid #c2be9f; background: #ffffff; color: #111111; font-size: 12px; font-family: 'Space Mono', monospace;">
          </div>

          <div style="margin-bottom: 16px; flex-grow: 1; display: flex; flex-direction: column;">
            <label style="display: flex; align-items: center; justify-content: space-between; font-weight: 600; font-size: 12px; margin-bottom: 6px; color: #111111;">
              <span>📄 Lienzo en Blanco (Reflexiones & Ideas del Día)</span>
              <span id="journal-sync-status" style="font-size: 11px; font-weight: normal; color: #533B87;">☁️ Google Drive Sync</span>
            </label>
            <textarea id="journal-content" style="width: 100%; height: 260px; min-height: 200px; padding: 14px; border-radius: 0px; border: 1px solid #c2be9f; background: #faf9f5; color: #111111; font-size: 13.5px; line-height: 1.6; font-family: 'Inter', sans-serif; resize: vertical;" placeholder="Escribe libremente tus ideas, reflexiones, avances, aprendizajes del día o borradores de proyectos..."></textarea>
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto;">
            <button id="journal-save-btn" class="btn btn-primary" style="padding: 12px 18px; border-radius: 0px; font-family: 'Space Mono', monospace; font-weight: 600; background: #111111; color: #ffffff; border: 1px solid #c2be9f; font-size: 12.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>💾 Guardar Registro de Journal (.md en Drive)</span>
            </button>
          </div>

          <div id="journal-history-list" style="margin-top: 14px; font-size: 11px; color: var(--qz-text-muted);">
            <!-- Past entries -->
          </div>
        </div>

      </div>
    `;

    // ==========================================
    // INTERACTIVIDAD Y LÓGICA DEL MOTOR LOCAL SSOT
    // ==========================================

    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatBox = document.getElementById('ai-chat-box');

    function appendChatMessage(sender, text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${sender}`;
      if (sender === 'user') {
        msgDiv.style.cssText = 'background: rgba(255, 255, 255, 0.08); border-right: 3px solid #81c784; padding: 12px; border-radius: 8px; font-size: 13px; line-height: 1.5; align-self: flex-end; max-width: 85%;';
        msgDiv.innerHTML = `<strong>👤 Tú:</strong> ${text}`;
      } else {
        msgDiv.style.cssText = 'background: rgba(83, 59, 135, 0.25); border-left: 3px solid #d6c8fa; padding: 12px; border-radius: 8px; font-size: 13px; line-height: 1.5; max-width: 85%;';
        msgDiv.innerHTML = `<strong>⚡ Orquestador SSOT:</strong> ${text}`;
      }
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    function processLocalSsotQuery(query) {
      const q = query.toLowerCase();

      if (q.includes('meta') || q.includes('31 de agosto') || q.includes('caja') || q.includes('plata') || q.includes('dinero')) {
        return "Tu obligación financiera inmediata al **31 de Agosto (21 días restantes)** es de **S/ 4,000.00 PEN netos**. Partiendo de tus **S/ 770.00 PEN en caja**, necesitas generar **S/ 3,230.00 PEN netos**. Esto se logra cerrando **3 ventas de Royal Prestige** (comisión S/ 1,010.59 a S/ 1,347.46) o **2 licencias de ZentryOS ($1,000 USD / S/ 1,906.78 neto personal)**.";
      } 
      
      if (q.includes('12') || q.includes('perro') || q.includes('rutina') || q.includes('entren') || q.includes('ejercicio') || q.includes('llamada')) {
        return "En la ventana estratégica de **12:00 PM a 02:00 PM** ejecutas tres acciones en paralelo:\n1. Pasear al perro al aire libre.\n2. Entrenamiento de calistenia.\n3. **40 llamadas telefónicas breves de Royal Prestige** (usando tu Redmi Note 9 con la SIM `933709385`). Caminar mientras llamas eleva tu tono vocal y evita la fatiga del escritorio.";
      }

      if (q.includes('royal') || q.includes('olla') || q.includes('ratio') || q.includes('friccion') || q.includes('referido')) {
        return "Métricas exactas de Royal Prestige:\n• **Llamadas frías:** 20 llamadas conversadas agendan 1 demo. De cada 4 demos frías cierras 1 venta (S/ 1,010.59 neto).\n• **Referidos:** Cada demo genera 5 a 10 referidos calificados. Con referidos, el ratio de cierre mejora a 3 demos por 1 venta (S/ 1,347.46 neto).";
      }

      if (q.includes('zentry') || q.includes('quarz') || q.includes('prospecc') || q.includes('mall') || q.includes('limatambo') || q.includes('tablet')) {
        return "Métricas exactas de QUARZ / ZentryOS:\n• **Prospección presencial:** 5 personas prospectadas a pie en Limatambo/La Rambla/Jockey agendan 1 demo presencial en un ciclo de 2 semanas.\n• **Cierre de Licencias ($1k USD):** En el Mes 1 (iteración), 5 demos cierran 1 licencia ($1,000 USD $\rightarrow$ S/ 1,906.78 neto personal + S/ 1,271.19 caja empresa). En el Mes 2 con referidos, baja a 3 demos por 1 cierre.";
      }

      if (q.includes('ayuno') || q.includes('48') || q.includes('camal') || q.includes('yerbateros') || q.includes('carne') || q.includes('comida')) {
        return "Protocolo Biológico & Abastecimiento:\n• **Ayuno Autofágico de 48h:** Jueves 13 de Agosto (08:00 PM) al Sábado 15 de Agosto (08:00 PM).\n• **Suero Táctico:** Sodio 3-5g + Potasio 1.5-2g + Magnesio 400mg.\n• **Camal de Yerbateros:** El mejor día y hora es el **Viernes por la madrugada (04:30 AM)** para obtener vísceras (hígado, corazón, panza) y chicharrón de cerdo recién faenados con cero aglomeración.";
      }

      if (q.includes('dispositivo') || q.includes('celular') || q.includes('telefono') || q.includes('sim') || q.includes('hardware')) {
        return "Infraestructura de Hardware Activa:\n• **Redmi Note 9:** Diario para llamadas (SIM `933709385` QUARZ).\n• **Motorola Edge 40 Neo:** Servidor USB 24/7 (Scrcpy/Vysor) para WhatsApp bot (número personal `942575425`).\n• **Tab A7 Samsung (10.4 in):** Demo ZentryOS Launcher Device Owner.\n• **iPad 5ª Gen:** Demo PWA Parental Dashboard.";
      }

      return `Entendido. Como Orquestador de tu plan maestro de 63 días (10 Ago - 11 Oct 2026), mantengo indexados todos tus documentos SSOT. Puedes consultarme cualquier duda sobre tus metas financieras, embudos de conversión, rutina de 12-2pm o protocolo biológico.`;
    }

    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        
        appendChatMessage('user', text);
        chatInput.value = '';

        // Add thinking indicator
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = 'chat-thinking';
        thinkingDiv.className = 'chat-msg bot';
        thinkingDiv.style.cssText = 'background: rgba(83, 59, 135, 0.15); border-left: 3px solid #d6c8fa; padding: 12px; border-radius: 8px; font-size: 13px; line-height: 1.5; max-width: 85%; color: var(--text-muted);';
        thinkingDiv.innerHTML = `<strong>⚡ Orquestador Backend API (/api/chat):</strong> <em>Consultando backend en tiempo real...</em>`;
        chatBox.appendChild(thinkingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
          const apiKey = localStorage.getItem('zentry_backend_api_key') || '';
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, apiKey })
          });

          const data = await res.json();
          const thinkingEl = document.getElementById('chat-thinking');
          if (thinkingEl) thinkingEl.remove();

          if (data && data.reply) {
            appendChatMessage('bot', mdToHtml ? mdToHtml(data.reply) : data.reply);
          } else if (data && data.error) {
            appendChatMessage('bot', `❌ Error de Servidor Backend: ${data.error}`);
          } else {
            appendChatMessage('bot', "⚠️ No se recibió respuesta válida del endpoint /api/chat.");
          }
        } catch (err) {
          const thinkingEl = document.getElementById('chat-thinking');
          if (thinkingEl) thinkingEl.remove();

          // Fallback if backend serverless function is not active locally
          const fallbackResp = processLocalSsotQuery(text);
          appendChatMessage('bot', fallbackResp);
        }
      });
    }

    // Journaling Logic (Lienzo en Blanco + Single Button Sync a Drive)
    const journalDate = document.getElementById('journal-date');
    const journalContent = document.getElementById('journal-content');
    const journalSaveBtn = document.getElementById('journal-save-btn');
    const journalHistoryList = document.getElementById('journal-history-list');

    function loadJournalForDate(dateStr) {
      const history = JSON.parse(localStorage.getItem('zentry_journal_history') || '[]');
      const entry = history.find(h => h.date === dateStr);
      if (entry && journalContent) {
        journalContent.value = entry.content || (entry.q1 ? `${entry.q1}\n\n${entry.q2 || ''}\n\n${entry.q3 || ''}` : '');
      } else if (journalContent) {
        journalContent.value = '';
      }
    }

    function renderJournalHistory() {
      const history = JSON.parse(localStorage.getItem('zentry_journal_history') || '[]');
      if (!journalHistoryList) return;
      if (history.length === 0) {
        journalHistoryList.innerHTML = `<p style="font-style: italic;">No hay entradas guardadas en el historial local aún.</p>`;
        return;
      }
      journalHistoryList.innerHTML = '<strong>📅 Entradas de Diario Recientes:</strong>' + history.slice(0, 4).map(h => {
        const previewText = (h.content || h.q1 || '').replace(/\n/g, ' ').slice(0, 60);
        return `
          <div style="background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.08); padding: 8px 10px; border-radius: 4px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="document.getElementById('journal-date').value='${h.date}'; document.getElementById('journal-date').dispatchEvent(new Event('change'));">
            <span style="font-weight: 600; color: #533B87;">${h.date}</span>
            <span style="font-size: 10.5px; color: #4A5160; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;">${previewText}...</span>
          </div>
        `;
      }).join('');
    }

    if (journalDate) {
      journalDate.addEventListener('change', () => {
        loadJournalForDate(journalDate.value);
      });
      loadJournalForDate(journalDate.value);
    }

    renderJournalHistory();

    if (journalSaveBtn) {
      journalSaveBtn.addEventListener('click', async () => {
        const date = journalDate.value;
        const text = journalContent ? journalContent.value.trim() : '';

        if (!text) {
          alert('Por favor escribe tu reflexión o ideas en la hoja antes de guardar.');
          return;
        }

        journalSaveBtn.disabled = true;
        journalSaveBtn.innerHTML = '<span>⏳ Guardando y Sincronizando...</span>';

        // 1. Guardar en LocalStorage
        const history = JSON.parse(localStorage.getItem('zentry_journal_history') || '[]');
        const existingIdx = history.findIndex(h => h.date === date);
        const entry = { date, content: text, savedAt: new Date().toISOString() };

        if (existingIdx !== -1) {
          history[existingIdx] = entry;
        } else {
          history.unshift(entry);
        }

        localStorage.setItem('zentry_journal_history', JSON.stringify(history));

        // 2. Formatear Markdown (.md)
        const filename = `${date}-journal-bitacora.md`;
        const mdContent = `# 📝 DIARIO DE REFLEXIÓN Y REGISTRO - ${date}\n\n` +
          `> **Fecha de Registro:** ${new Date().toLocaleString()}  \n` +
          `> **Carpeta Destino Drive:** 03_JOURNAL_BITACORA (ID: 17jwao_wY0P_L3AW4amtQaOpzdJtaXQC0)  \n\n` +
          `---\n\n` +
          `${text}\n`;

        // 3. Sincronizar con Firestore (Realtime Cloud Database)
        try {
          await syncJournalHistory(history);
          console.log('\xf0\x9f\x94\xa5 Journal synced to Firestore');
        } catch (err) {
          console.error('Journal Firestore sync error:', err);
        }

        journalSaveBtn.disabled = false;
        journalSaveBtn.innerHTML = '<span>\xf0\x9f\x92\xbe Guardar Registro de Journal</span>';

        alert(`\u2705 Registro de Journal para ${date} guardado exitosamente.\n\n\u2022 Sincronizado en Cloud Firestore (Tiempo Real)\n\u2022 Disponible en todos tus dispositivos.`);
        renderJournalHistory();
      });
    }

    // Funnel Metrics Engine Interactive Simulation Logic
    const fnRpCalls = document.getElementById('fn-rp-calls');
    const fnRpRefDemos = document.getElementById('fn-rp-ref-demos');
    const fnZentryProspects = document.getElementById('fn-zentry-prospects');
    const fnZentryDemos = document.getElementById('fn-zentry-demos');

    function updateFunnelEngine() {
      const rpCalls = parseInt(fnRpCalls.value) || 0;
      const rpRefDemos = parseInt(fnRpRefDemos.value) || 0;
      const zentryProspects = parseInt(fnZentryProspects.value) || 0;
      const zentryDemos = parseInt(fnZentryDemos.value) || 0;

      // RP calculations
      const estColdDemos = (rpCalls / 20).toFixed(1);
      const coldSales = (estColdDemos / 4).toFixed(1);
      const refSales = (rpRefDemos / 3).toFixed(1);
      const newRefs = Math.round((parseFloat(estColdDemos) + rpRefDemos) * 7.5);

      const rpGain = (parseFloat(coldSales) * 1010.59) + (parseFloat(refSales) * 1347.46);

      document.getElementById('fn-rp-est-demos').textContent = `${estColdDemos} demos`;
      document.getElementById('fn-rp-cold-sales').textContent = `${coldSales} ventas`;
      document.getElementById('fn-rp-ref-sales').textContent = `${refSales} ventas`;
      document.getElementById('fn-rp-new-refs').textContent = `${newRefs} referidos`;
      document.getElementById('fn-rp-total-gain').textContent = `S/ ${rpGain.toFixed(2)}`;

      // ZentryOS calculations
      const estZentryDemos = (zentryProspects / 5).toFixed(1);
      const zentrySales = (zentryDemos / 5).toFixed(1); // Month 1 ratio 5:1
      const zentryPersonalGain = parseFloat(zentrySales) * 1906.78;
      const zentryCompanyGain = parseFloat(zentrySales) * 1271.19;

      document.getElementById('fn-zentry-est-demos').textContent = `${estZentryDemos} demos`;
      document.getElementById('fn-zentry-sales').textContent = `${zentrySales} licencias`;
      document.getElementById('fn-zentry-personal-gain').textContent = `S/ ${zentryPersonalGain.toFixed(2)}`;
      document.getElementById('fn-zentry-company-gain').textContent = `S/ ${zentryCompanyGain.toFixed(2)}`;
      document.getElementById('fn-zentry-total-gain').textContent = `S/ ${zentryPersonalGain.toFixed(2)}`;

      // Global Funnel Progress
      const initialCash = 770.00;
      const totalPersonalGain = initialCash + rpGain + zentryPersonalGain;
      const target = 4000.00;
      const pct = Math.min(100, Math.round((totalPersonalGain / target) * 100));

      const funnelProgressText = document.getElementById('funnel-progress-text');
      const funnelProgressBar = document.getElementById('funnel-progress-bar');

      if (funnelProgressText && funnelProgressBar) {
        funnelProgressText.textContent = `S/ ${totalPersonalGain.toFixed(2)} / S/ ${target.toFixed(2)} (${pct}%)`;
        funnelProgressBar.style.width = `${pct}%`;
      }
    }

    if (fnRpCalls) fnRpCalls.addEventListener('input', updateFunnelEngine);
    if (fnRpRefDemos) fnRpRefDemos.addEventListener('input', updateFunnelEngine);
    if (fnZentryProspects) fnZentryProspects.addEventListener('input', updateFunnelEngine);
    if (fnZentryDemos) fnZentryDemos.addEventListener('input', updateFunnelEngine);

    // Initial calculation
    updateFunnelEngine();
  },

  // 6.7. Plan Maestro 63 Días View
  plan63dias: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #2b5c8f 0%, #1c142e 50%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🗺️';
    document.getElementById('page-title').textContent = 'Plan Maestro 63 Días (10 Ago - 11 Oct 2026)';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="markdown-body">
        ${mdToHtml(plan63diasMarkdown)}
      </div>
    `;
  },

  // 6.8. Perfil Circadiano & Hábitos View
  circadiano: () => {
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #2e7d32 0%, #1c142e 50%, #0c0d10 100%)';
    document.getElementById('page-icon').textContent = '🧬';
    document.getElementById('page-title').textContent = 'Perfil Circadiano & Neurobiología';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="markdown-body">
        ${mdToHtml(circadianoMarkdown)}
      </div>
    `;
  },

    // 7. Construcciones View (Cards)
  construcciones: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('minimal-view');

    document.getElementById('page-title').textContent = 'Construcciones';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="demobook-minimal-container">
        <div class="demobook-grid">
          <a href="#zentryos" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon" style="font-size: 2rem;">🧱</span>
                <span class="demobook-card-title">ZentryOS</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
          <a href="javascript:void(0)" class="demobook-card-link" style="opacity: 0.5; cursor: default;">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon" style="font-size: 2rem;">🔒</span>
                <span class="demobook-card-title">Próximamente</span>
              </div>
            </div>
          </a>
          <a href="javascript:void(0)" class="demobook-card-link" style="opacity: 0.5; cursor: default;">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon" style="font-size: 2rem;">🔒</span>
                <span class="demobook-card-title">Próximamente</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    `;
  },

  // 8. Construcción ZentryOS View (Brick Wall)
  zentryos: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) {
      workspace.classList.add('minimal-view');
      workspace.classList.add('full-width-view');
    }

    document.getElementById('page-title').textContent = 'QZ-HUB: EL MURO DE CONSTRUCCIÓN';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    
    // Logic to gather bricks
    let allBricks = [];
    const history = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]');
    const todayStr = state.personalDate || new Date().toISOString().split('T')[0];
    const todayBlocks = JSON.parse(localStorage.getItem(`zentry_timeblock_${todayStr}`)) || {};
    
    // Gather from history
    history.forEach(h => {
      const hDate = h.date;
      const hData = h.data || {};
      for (const [time, block] of Object.entries(hData)) {
        if (block && block.isBrick) {
          allBricks.push({ date: hDate, time, text: block.text || 'Sin descripción', details: block.details || '', type: block.type || '' });
        }
      }
    });

    // Gather from today (if we don't already have today's blocks in history, though history usually has past dates or multiple backups)
    // To avoid duplicates, we can check if a brick at (date, time) is already in allBricks
    for (const [time, block] of Object.entries(todayBlocks)) {
      if (block && block.isBrick) {
        // Check for duplicate
        const exists = allBricks.some(b => b.date === todayStr && b.time === time);
        if (!exists) {
          allBricks.push({ date: todayStr, time, text: block.text || 'Sin descripción', details: block.details || '', type: block.type || '' });
        }
      }
    }

    // Sort chronologically
    allBricks.sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time}:00`);
      const dtB = new Date(`${b.date}T${b.time}:00`);
      return dtA - dtB;
    });

    const totalBricks = allBricks.length;
    // Zoom logic: start closer if few bricks, zoom out more if many.
    // Minimum scale 0.1, maximum 1.0. Zoom out roughly 0.01 per brick after 20.
    let baseScale = totalBricks <= 20 ? 1 : Math.max(0.1, 1 - ((totalBricks - 20) * 0.005));

    container.innerHTML = `
      <div class="brick-wall-wrapper">
        <div class="brick-wall-header">
          <a href="#construcciones" class="btn-back-to-selector">⬅️ Volver a Construcciones</a>
          <div class="brick-wall-stats">
            <span class="brick-count">🧱 ${totalBricks} Ladrillos</span>
            <div class="zoom-controls">
              <button id="zoom-out" class="zoom-btn" title="Alejar">➖</button>
              <button id="zoom-reset" class="zoom-btn" title="Restaurar Zoom">🔄</button>
              <button id="zoom-in" class="zoom-btn" title="Acercar">➕</button>
            </div>
          </div>
        </div>
        
        <div class="brick-wall-viewport" id="wall-viewport">
          <div class="brick-wall-canvas" id="wall-canvas" style="transform: scale(${baseScale});">
            ${renderBricksHTML(allBricks)}
          </div>
        </div>
      </div>
      
      <!-- Modal for Brick Details -->
      <div id="brick-modal" class="modal-overlay">
        <div class="modal-content glass-modal" style="max-width: 450px; border-top: 4px solid var(--primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
            <h3 id="brick-modal-date" style="color: var(--primary-dark); font-size: 14px; opacity: 0.8; margin: 0;"></h3>
            <span id="brick-modal-type" style="font-size: 11px; font-weight: bold; border-radius: 6px; padding: 3px 8px; text-transform: uppercase;"></span>
          </div>
          <h2 id="brick-modal-text" contenteditable="false" style="color: var(--text-main); font-size: 18px; line-height: 1.4; font-weight: 700; margin-top: 0; margin-bottom: 16px; border-radius: 6px; padding: 4px; outline: none;"></h2>
          <div id="brick-modal-details-container" style="background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 20px;">
            <p style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase;">Detalles de la Acción</p>
            <p id="brick-modal-details" contenteditable="false" style="color: var(--text-dark); font-size: 14px; line-height: 1.5; white-space: pre-wrap; margin: 0; border-radius: 6px; padding: 4px; outline: none;"></p>
          </div>
          <div style="text-align: right; display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap;">
            <button id="brick-modal-delete" class="btn-danger" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; border: none; cursor: pointer;">Eliminar Ladrillo</button>
            <button id="brick-modal-edit" class="btn-secondary" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer;">Editar</button>
            <button id="brick-modal-close" class="btn-primary" style="padding: 8px 16px; border-radius: 8px; font-size: 12px; cursor: pointer;">Cerrar</button>
          </div>
        </div>
      </div>
    `;

    setupBrickWallInteraction(baseScale);
  },

  // 5. Page Document renderer
  doc: (docPath) => {
    const page = db.pages.find(p => p.path === docPath);
    if (!page) {
      document.getElementById('workspace-content').innerHTML = `<h2>Página no encontrada</h2><p>El documento solicitado no existe en la base de datos.</p>`;
      return;
    }

    // Set custom page icon/banner
    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #C2F4E7 0%, #D6C8FA 50%, #533B87 100%)';
    
    let emoji = '📄';
    if (page.filename.includes('readme')) emoji = '📖';
    if (page.filename.includes('ludopatia') || page.filename.includes('adiccion')) emoji = '🎮';
    if (page.filename.includes('problema')) emoji = '🧠';
    if (page.filename.includes('control') || page.filename.includes('mdm')) emoji = '🔒';
    if (page.filename.includes('telemetria')) emoji = '📡';
    if (page.filename.includes('compose')) emoji = '🎨';
    if (page.filename.includes('demo')) emoji = '🎭';
    
    document.getElementById('page-icon').textContent = emoji;
    document.getElementById('page-title').textContent = page.title;
    
    // Properties Row
    const propBlock = document.getElementById('properties-block');
    propBlock.style.display = 'flex';
    
    let tagsHtml = '';
    if (page.metadata.tags) {
      const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan', 'grey'];
      page.metadata.tags.forEach((tag, idx) => {
        const c = colors[idx % colors.length];
        tagsHtml += `<span class="tag tag-${c}">${tag}</span>`;
      });
    }

    propBlock.innerHTML = `
      <div class="property-row">
        <span class="property-label">📂 Módulo</span>
        <span class="property-value" style="font-weight: 600; text-transform: uppercase;">${page.directory.replace(/^\d+-/, '')}</span>
      </div>
      <div class="property-row">
        <span class="property-label">🏷️ Etiquetas</span>
        <span class="property-value" id="page-tags">${tagsHtml || 'Ninguna'}</span>
      </div>
      <div class="property-row">
        <span class="property-label">⏳ Progreso Módulo</span>
        <div class="property-value progress-bar-container">
          <div class="progress-bar" style="width: ${page.metadata.progress || '0%'}"></div>
          <span class="progress-text">${page.metadata.progress || '0%'}</span>
        </div>
      </div>
      <div class="property-row">
        <span class="property-label">📅 Deadline Hito</span>
        <span class="property-value">${page.metadata.deadline || 'Sin fecha'}</span>
      </div>
      <div class="property-row">
        <span class="property-label">⚖️ Estado SSOT</span>
        <span class="property-value"><span class="tag tag-green">${page.metadata.status || 'aprobado'}</span></span>
      </div>
    `;

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="markdown-body">
        ${mdToHtml(page.body)}
      </div>
    `;
  }
};

// --- Widget Renderers ---

// Render 3 M.I.T. Widget
function renderMITWidget() {
  const container = document.getElementById('mit-list-container');
  if (!container) return;

  const mitData = getMITData();
  container.innerHTML = '';

  mitData.forEach((item, idx) => {
    const mitItem = document.createElement('div');
    mitItem.className = `mit-item ${item.checked ? 'checked' : ''}`;
    
    mitItem.innerHTML = `
      <input type="checkbox" class="mit-checkbox" ${item.checked ? 'checked' : ''}>
      <input type="text" class="mit-input" value="${item.text}" placeholder="Hacer indispensable ${idx + 1}...">
    `;

    const checkbox = mitItem.querySelector('.mit-checkbox');
    const input = mitItem.querySelector('.mit-input');

    checkbox.addEventListener('change', (e) => {
      mitData[idx].checked = e.target.checked;
      mitItem.classList.toggle('checked', e.target.checked);
      saveMITData(mitData);
    });

    input.addEventListener('input', (e) => {
      mitData[idx].text = e.target.value;
      saveMITData(mitData);
    });

    container.appendChild(mitItem);
  });
}

// Render Corkboard Objectives
function renderCorkboardObjectives() {
  const container = document.getElementById('corkboard-objectives');
  if (!container) return;

  const objs = getCorkboardObjectives();
  container.innerHTML = '';

  objs.forEach((text, idx) => {
    const postIt = document.createElement('div');
    postIt.className = 'sticky-note';
    
    postIt.innerHTML = `
      <span class="sticky-note-pin">📌</span>
      <textarea class="sticky-note-content" placeholder="Escribe un objetivo semanal...">${text}</textarea>
    `;

    const textarea = postIt.querySelector('.sticky-note-content');
    textarea.addEventListener('input', (e) => {
      objs[idx] = e.target.value;
      saveCorkboardObjectives(objs);
    });

    // Auto-resize textarea to fit content
    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    textarea.addEventListener('focus', resizeTextarea);
    textarea.addEventListener('input', resizeTextarea);
    
    // Initial size setting
    setTimeout(resizeTextarea, 0);
    container.appendChild(postIt);
  });
}

// ========================================
// ESPACIO PERSONAL: Timeblock + AI Chat
// ========================================

function renderEspacioPersonal(container) {
  const dateStr = state.personalDate;
  const timeblockData = getTimeblockData(dateStr);
  const slots = generateTimeSlots();
  const isToday = dateStr === new Date().toISOString().split('T')[0];

  // Build timeblock rows
  let slotsHtml = '';
  slots.forEach(slot => {
    const data = timeblockData[slot.time] || {};
    const hasCalEvent = data.source === 'calendar';
    const isAI = data.source === 'ai';
    const currentHour = isToday && slot.time === `${String(new Date().getHours()).padStart(2,'0')}:${String(Math.floor(new Date().getMinutes()/15)*15).padStart(2,'0')}`;

    let extraClass = slot.isHour ? ' is-hour' : '';
    if (currentHour) extraClass += ' is-current-hour';
    if (hasCalEvent) extraClass += ' has-calendar-event';
    if (data.completed) extraClass += ' is-completed';

    const timeLabel = slot.isHour ? formatTime12h(slot.time) : slot.time.split(':')[1];
    let badgeHtml = '';
    if (hasCalEvent || data.hasGCalEvent) badgeHtml += '<span class="timeblock-cal-badge">📅 Evento GCal</span>';
    if (data.hasReminder) badgeHtml += '<span class="timeblock-reminder-badge">🔔 Recordatorio</span>';
    const isChecked = data.completed ? 'checked' : '';
    const detailsVal = data.details || '';
    const activeType = data.type || '';
    const btnImpClass = activeType === 'importante' ? ' active' : '';
    const btnProdClass = activeType === 'productivo' ? ' active' : '';
    const btnEtcClass = activeType === 'etc' ? ' active' : '';
    const isBrick = data.isBrick ? ' active' : '';

    const typeSelectorHtml = `
      <div class="timeblock-type-selector">
        <button class="timeblock-brick-btn${isBrick}" data-time="${slot.time}" title="Convertir a Ladrillo">🧱</button>
        <button class="timeblock-type-btn type-imp${btnImpClass}" data-time="${slot.time}" data-type="importante" title="Importante">Imp</button>
        <button class="timeblock-type-btn type-prod${btnProdClass}" data-time="${slot.time}" data-type="productivo" title="Productivo">Prod</button>
        <button class="timeblock-type-btn type-etc${btnEtcClass}" data-time="${slot.time}" data-type="etc" title="Etcétera">Etc...</button>
      </div>
    `;

    slotsHtml += `
      <div class="timeblock-slot${extraClass}" data-time="${slot.time}" draggable="true">
        <div class="timeblock-drag-handle" title="Arrastrar para mover">≡</div>
        <div class="timeblock-time-label">${timeLabel}</div>
        <div class="timeblock-right">
          <div class="timeblock-content">
            <input type="checkbox" class="timeblock-checkbox" data-time="${slot.time}" ${isChecked}>
            <input type="text" class="timeblock-text" value="${data.text || ''}" placeholder="${slot.isHour ? 'Bloque disponible...' : ''}" data-time="${slot.time}" ${hasCalEvent ? 'readonly' : ''}>
            ${badgeHtml}
            ${typeSelectorHtml}
            <button class="timeblock-action-btn timeblock-reminder-btn" data-time="${slot.time}" title="🔔 Crear Recordatorio y Alarma Móvil">🔔</button>
            <button class="timeblock-action-btn timeblock-gcal-btn" data-time="${slot.time}" title="📅 Crear Evento en Google Calendar">📅</button>
            <button class="timeblock-action-btn timeblock-copy-btn" data-time="${slot.time}" title="Copiar bloque">📋</button>
            <button class="timeblock-action-btn timeblock-delete-btn" data-time="${slot.time}" title="Limpiar bloque">🗑️</button>
            <button class="timeblock-expand-btn" data-time="${slot.time}" title="Añadir detalles">⌄</button>
          </div>
          <div class="timeblock-details" id="details-${slot.time.replace(':','-')}" style="display: none;">
            <textarea class="timeblock-details-text" placeholder="Micro-tareas o detalles del bloque..." data-time="${slot.time}">${detailsVal}</textarea>
            <div class="timeblock-details-actions">
              <button class="btn-gcal-sync" data-time="${slot.time}" title="Guardar bloque en Google Calendar">📅 Guardar en Calendar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="espacio-personal-header">
      <a href="#backlog" class="btn-back-personal">⬅️ Volver a Selección</a>
      <h2 style="font-family: 'Space Grotesk', sans-serif; color: #0f172a;">⏱️ Timeblocking</h2>
      <a href="#backlog/personal-board" class="btn-open-personal-board" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">📋 Abrir Tablero Personal</a>
    </div>

    <div class="date-navigator">
      <button class="date-nav-btn" id="date-prev">◀</button>
      <span class="date-nav-today">${formatDateLabel(dateStr)}</span>
      ${!isToday ? '<button class="date-nav-today-btn" id="date-today">Hoy</button>' : ''}
      <button class="date-nav-btn" id="date-next">▶</button>
      <div style="flex: 1;"></div>
      <button class="gcal-sign-in-btn ${state.calendarConnected ? 'connected' : ''}" id="gcal-connect">
        ${state.calendarConnected ? '✅ Calendar Conectado' : '📅 Conectar Calendar'}
      </button>
      <button class="btn-backup" id="btn-backup" title="Guardar copia de seguridad del día">📥</button>
      <button class="btn-history" id="btn-history" title="Ver historial">🕰️</button>
    </div>

    <div class="espacio-personal-layout">
      <div class="timeblock-container">
        <div class="timeblock-grid" id="timeblock-grid">
          ${isToday ? '<div class="timeblock-current-time" id="current-time-line"></div>' : ''}
          ${slotsHtml}
        </div>
      </div>
    </div>
  `;

  // --- Bind Events ---

  // Date navigation
  document.getElementById('date-prev')?.addEventListener('click', () => {
    state.personalDate = shiftDate(state.personalDate, -1);
    renderEspacioPersonal(container);
  });
  document.getElementById('date-next')?.addEventListener('click', () => {
    state.personalDate = shiftDate(state.personalDate, 1);
    renderEspacioPersonal(container);
  });
  document.getElementById('date-today')?.addEventListener('click', () => {
    state.personalDate = new Date().toISOString().split('T')[0];
    renderEspacioPersonal(container);
  });

  // Backup & History
  document.getElementById('btn-backup')?.addEventListener('click', () => {
    const data = getTimeblockData(state.personalDate);
    if (Object.keys(data).length === 0) {
      alert('No hay datos en este día para respaldar.');
      return;
    }
    const history = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]');
    const existingIndex = history.findIndex(h => h.date === state.personalDate);
    
    if (existingIndex >= 0) {
      history[existingIndex].timestamp = new Date().toISOString();
      history[existingIndex].data = JSON.parse(JSON.stringify(data));
    } else {
      history.push({
        id: Date.now().toString(),
        date: state.personalDate,
        timestamp: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(data))
      });
    }
    localStorage.setItem('zentry_timeblock_history', JSON.stringify(history));
    syncTimeblockHistory(history);
    
    // Show visual feedback
    const btn = document.getElementById('btn-backup');
    const originalText = btn.innerHTML;
    btn.innerHTML = '✅';
    setTimeout(() => {
      if (btn) btn.innerHTML = originalText;
    }, 2000);
  });

  document.getElementById('btn-history')?.addEventListener('click', () => {
    renderHistoryView(container);
  });

  // Timeblock editing
  container.querySelectorAll('.timeblock-text').forEach(input => {
    input.addEventListener('blur', (e) => {
      const time = e.target.dataset.time;
      const val = e.target.value.trim();
      const data = getTimeblockData(state.personalDate);
      if (!data[time]) data[time] = {};
      
      if (val) {
        data[time].text = val;
        data[time].source = data[time].source || 'manual';
      } else if (!data[time].details) {
        // Only delete if details are also empty
        delete data[time];
      } else {
        data[time].text = '';
      }
      saveTimeblockData(state.personalDate, data);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
        // Focus next slot
        const allInputs = [...container.querySelectorAll('.timeblock-text')];
        const idx = allInputs.indexOf(e.target);
        if (idx < allInputs.length - 1) allInputs[idx + 1].focus();
      }
    });

    input.addEventListener('paste', async (e) => {
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      if (pastedText && pastedText.includes('"type":"zentry-timeblock"')) {
        try {
          const parsed = JSON.parse(pastedText);
          if (parsed.type === 'zentry-timeblock') {
            e.preventDefault();
            const time = e.target.dataset.time;
            const data = getTimeblockData(state.personalDate);
            data[time] = parsed.data;
            saveTimeblockData(state.personalDate, data);
            renderEspacioPersonal(container);
          }
        } catch(err) {}
      }
    });
  });

  // Timeblock details textarea
  container.querySelectorAll('.timeblock-details-text').forEach(textarea => {
    textarea.addEventListener('blur', (e) => {
      const time = e.target.dataset.time;
      const val = e.target.value.trim();
      const data = getTimeblockData(state.personalDate);
      if (!data[time]) data[time] = {};
      
      data[time].details = val;
      
      if (!val && !data[time].text) {
        delete data[time];
      }
      saveTimeblockData(state.personalDate, data);
    });
  });

  // Timeblock checkbox completion
  container.querySelectorAll('.timeblock-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const time = e.target.dataset.time;
      const isChecked = e.target.checked;
      const data = getTimeblockData(state.personalDate);
      if (!data[time]) data[time] = {};
      
      data[time].completed = isChecked;
      saveTimeblockData(state.personalDate, data);
      
      // Update visual state immediately
      const slotDiv = e.target.closest('.timeblock-slot');
      if (slotDiv) {
        if (isChecked) slotDiv.classList.add('is-completed');
        else slotDiv.classList.remove('is-completed');
      }
    });
  });

  // Expand buttons
  container.querySelectorAll('.timeblock-expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = e.target.dataset.time;
      const detailsId = `details-${time.replace(':', '-')}`;
      const detailsEl = document.getElementById(detailsId);
      if (detailsEl) {
        if (detailsEl.style.display === 'none') {
          detailsEl.style.display = 'block';
          e.target.style.transform = 'rotate(180deg)';
        } else {
          detailsEl.style.display = 'none';
          e.target.style.transform = 'rotate(0deg)';
        }
      }
    });
  });

  // Type buttons
  container.querySelectorAll('.timeblock-type-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = e.target.dataset.time;
      const type = e.target.dataset.type;
      const data = getTimeblockData(state.personalDate);
      if (!data[time]) data[time] = {};
      
      if (data[time].type === type) {
        delete data[time].type; // Deselect
      } else {
        data[time].type = type;
      }
      saveTimeblockData(state.personalDate, data);
      renderEspacioPersonal(container);
    });
  });

  // Brick buttons
  container.querySelectorAll('.timeblock-brick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = e.target.dataset.time;
      const data = getTimeblockData(state.personalDate);
      if (!data[time]) data[time] = {};
      
      data[time].isBrick = !data[time].isBrick;
      
      saveTimeblockData(state.personalDate, data);
      renderEspacioPersonal(container);
    });
  });

  // Action: Delete Block
  container.querySelectorAll('.timeblock-delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = e.target.closest('.timeblock-action-btn').dataset.time;
      const data = getTimeblockData(state.personalDate);
      if (data[time]) {
        delete data[time];
        saveTimeblockData(state.personalDate, data);
        renderEspacioPersonal(container);
      }
    });
  });

  // Action: Copy Block
  container.querySelectorAll('.timeblock-copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const time = e.target.closest('.timeblock-action-btn').dataset.time;
      const data = getTimeblockData(state.personalDate);
      if (data[time]) {
        const payload = JSON.stringify({ type: 'zentry-timeblock', data: data[time] });
        try {
          await navigator.clipboard.writeText(payload);
          const orig = btn.innerHTML;
          btn.innerHTML = '✅';
          setTimeout(() => btn.innerHTML = orig, 1000);
        } catch (err) {
          console.error(err);
        }
      }
    });
  });

  // Drag and Drop for Reordering Timeblocks
  let draggedTime = null;
  container.querySelectorAll('.timeblock-slot').forEach(slot => {
    slot.addEventListener('dragstart', (e) => {
      draggedTime = slot.dataset.time;
      e.dataTransfer.effectAllowed = 'move';
      slot.style.opacity = '0.5';
    });
    slot.addEventListener('dragend', (e) => {
      slot.style.opacity = '1';
      draggedTime = null;
      container.querySelectorAll('.timeblock-slot').forEach(s => {
        s.style.borderBottom = '1px solid rgba(214,200,250,0.12)';
        s.style.background = '';
      });
    });
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.style.background = 'rgba(214,200,250,0.2)';
    });
    slot.addEventListener('dragleave', (e) => {
      slot.style.background = '';
    });
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.style.background = '';
      const targetTime = slot.dataset.time;
      if (draggedTime && draggedTime !== targetTime) {
        const data = getTimeblockData(state.personalDate);
        if (data[draggedTime]) {
          const sourceData = JSON.parse(JSON.stringify(data[draggedTime]));
          const targetData = data[targetTime] ? JSON.parse(JSON.stringify(data[targetTime])) : null;
          
          data[targetTime] = sourceData;
          if (targetData) {
            data[draggedTime] = targetData;
          } else {
            delete data[draggedTime];
          }
          saveTimeblockData(state.personalDate, data);
          renderEspacioPersonal(container);
        }
      }
    });
  });
  // Google Calendar Sync Event
  container.querySelectorAll('.btn-gcal-sync').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const time = e.target.dataset.time;
      const data = getTimeblockData(state.personalDate)[time];
      
      if (!data || !data.text) {
        alert("El bloque está vacío. Escribe una tarea primero.");
        return;
      }
      
      const gasUrl = localStorage.getItem('gcal_gas_url');
      if (!gasUrl) {
        alert("No has configurado tu URL de Apps Script. Por favor presiona 'Conectar Calendar'.");
        return;
      }

      // Convert slot time to RFC3339 format considering local timezone
      const slotDate = new Date(`${state.personalDate}T${time}:00`);
      const startDateTime = slotDate.toISOString();
      const endDateTime = new Date(slotDate.getTime() + 15 * 60000).toISOString();

      const eventBody = {
        action: 'createEvent',
        summary: data.text,
        description: data.details || '',
        start: startDateTime,
        end: endDateTime
      };

      try {
        btn.textContent = "⌛ Guardando...";
        btn.disabled = true;
        // Apps Script requires POST, usually sent as text/plain or application/x-www-form-urlencoded
        await fetch(gasUrl, {
          method: 'POST',
          body: JSON.stringify(eventBody)
        });

        // We assume success if fetch resolves, since no-cors or redirect might hide true status
        btn.textContent = "✅ Guardado";
        setTimeout(() => {
          btn.textContent = "📅 Guardar en Calendar";
          btn.disabled = false;
        }, 3000);
      } catch (err) {
        console.error(err);
        alert('Error de red al guardar en Calendar vía Apps Script.');
        btn.textContent = "📅 Guardar en Calendar";
        btn.disabled = false;
      }
    });
  });

  // Current time indicator
  if (isToday) {
    updateCurrentTimeLine();
    // Update every 60 seconds
    if (window._timeblockInterval) clearInterval(window._timeblockInterval);
    window._timeblockInterval = setInterval(updateCurrentTimeLine, 60000);

    // Scroll to current time
    setTimeout(() => {
      const line = document.getElementById('current-time-line');
      if (line) {
        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback to timeblock slot of current hour
        const currentHourStr = String(new Date().getHours()).padStart(2, '0') + ':00';
        const currentSlot = document.querySelector(`.timeblock-slot[data-time="${currentHourStr}"]`);
        if (currentSlot) {
          currentSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 300);
  }



  // Google Calendar connect button
  document.getElementById('gcal-connect')?.addEventListener('click', () => {
    const gcalModal = document.getElementById('gcal-modal');
    if (!gcalModal) return;
    
    const gasUrlInput = document.getElementById('gcal-gas-url');
    if (gasUrlInput) gasUrlInput.value = localStorage.getItem('gcal_gas_url') || '';
    
    gcalModal.classList.add('show');
    
    const closeBtn = document.getElementById('gcal-modal-close');
    const cancelBtn = document.getElementById('gcal-modal-cancel');
    const saveBtn = document.getElementById('gcal-modal-save');
    
    const hideGcalModal = () => {
      gcalModal.classList.remove('show');
    };
    
    closeBtn?.addEventListener('click', hideGcalModal);
    cancelBtn?.addEventListener('click', hideGcalModal);
    gcalModal.addEventListener('click', (e) => {
      if (e.target === gcalModal) hideGcalModal();
    });
    
    saveBtn?.addEventListener('click', async () => {
      const gasUrl = gasUrlInput?.value.trim();
      if (!gasUrl) {
        alert('Por favor ingresa una URL de Apps Script válida.');
        return;
      }
      localStorage.setItem('gcal_gas_url', gasUrl);
      localStorage.removeItem('gcal_client_id');
      localStorage.removeItem('gcal_access_token');
      localStorage.removeItem('gcal_token_expires');
      
      hideGcalModal();
      await loadCalendarEvents();
      const workspaceContent = document.getElementById('workspace-content');
      if (workspaceContent) renderEspacioPersonal(workspaceContent);
    });
  });
}

function renderHistoryView(container) {
  const history = JSON.parse(localStorage.getItem('zentry_timeblock_history') || '[]');
  
  let historyHtml = '';
  if (history.length === 0) {
    historyHtml = '<div style="padding: 40px; color: var(--text-muted); text-align: center; font-size: 16px;">No hay historial de backups guardados.</div>';
  } else {
    // Sort descending by timestamp
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    historyHtml = history.map((h, i) => {
      const ts = new Date(h.timestamp).toLocaleString();
      const numBlocks = Object.keys(h.data || {}).length;
      
      let detailsHtml = '';
      if (numBlocks > 0) {
        const sortedTimes = Object.keys(h.data).sort();
        detailsHtml = sortedTimes.map(time => {
          const b = h.data[time];
          
          let typeLabel = '';
          let typeColor = 'transparent';
          if (b.type === 'importante') {
            typeLabel = 'IMP';
            typeColor = '#4a5160'; // Gris oscuro
          } else if (b.type === 'productivo') {
            typeLabel = 'PROD';
            typeColor = '#d4af37'; // Dorado
          } else if (b.type === 'etc') {
            typeLabel = 'ETC...';
            typeColor = '#f57c00'; // Naranja
          }
          
          const boxHtml = b.completed 
            ? `<div style="width: 36px; height: 36px; border-radius: 0px; border: 2px solid #111111; display: flex; align-items: center; justify-content: center; background: #c2be9f;"><span style="color:#111111; font-size: 18px; font-weight:bold;">✓</span></div>`
            : `<div style="width: 36px; height: 36px; border-radius: 0px; border: 1px solid #c2be9f; display: flex; align-items: center; justify-content: center; background: #ffffff;"></div>`;

          return `
            <div style="display: flex; gap: 12px; margin-bottom: 8px; padding: 12px; background: #ffffff; border-radius: 0px; box-shadow: 0 2px 6px rgba(194,190,159,0.1); border: 1px solid #c2be9f;">
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 4px;">
                ${boxHtml}
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 13px; font-weight: 700; color: #111111; font-family: 'Space Mono', monospace;">${time}</div>
                  ${typeLabel ? `<div style="font-size: 11px; font-weight: bold; color: ${typeColor}; border: 1px solid ${typeColor}; padding: 2px 8px; border-radius: 0px; letter-spacing: 0.5px; font-family: 'Space Mono', monospace;">${typeLabel}</div>` : ''}
                </div>
                <div style="font-size: 14px; margin-top: 4px; color: #111111;">${b.text || 'Sin título'}</div>
                ${b.details ? `<div style="font-size: 13px; color: var(--qz-text-muted); margin-top: 6px; white-space: pre-wrap; background: #fdfdfc; padding: 8px; border-radius: 0px; border: 1px solid #c2be9f; font-family: 'Space Mono', monospace;">${b.details}</div>` : ''}
              </div>
            </div>
          `;
        }).join('');
      } else {
        detailsHtml = '<div style="font-size: 13px; color: var(--qz-text-muted);">Día sin bloques registrados.</div>';
      }

      return `
        <div class="history-card" style="background: rgba(255,255,255,0.95); padding: 20px; border-radius: 0px; margin-bottom: 15px; border: 1px solid #c2be9f; box-shadow: 0 4px 15px rgba(194,190,159,0.12);">
          <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="document.getElementById('history-details-${i}').style.display = document.getElementById('history-details-${i}').style.display === 'none' ? 'block' : 'none'">
            <div>
              <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px; font-family: 'Space Grotesk', sans-serif;">📅 ${h.date}</div>
              <div style="font-size: 12px; color: var(--qz-text-muted); font-family: 'Space Mono', monospace;">Backup guardado el: ${ts}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="background: #111111; color: #ffffff; padding: 6px 12px; border-radius: 0px; font-size: 12px; font-weight: 700; font-family: 'Space Mono', monospace; border: 1px solid #c2be9f;">${numBlocks} bloques registrados</span>
              <button style="background: none; border: none; font-size: 18px; cursor: pointer; color: #111111;">⌄</button>
            </div>
          </div>
          <div id="history-details-${i}" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid #c2be9f;">
            <div style="margin-bottom: 15px; text-align: right;">
              <button class="btn-edit-history" data-date="${h.date}" style="background: #111111; color: #ffffff; border: 1px solid #c2be9f; padding: 6px 14px; border-radius: 0px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'Space Mono', monospace;">✏️ Editar este día</button>
            </div>
            ${detailsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  container.innerHTML = `
    <div class="espacio-personal-header">
      <button id="btn-back-to-espacio" style="background:none; border:none; color:var(--text-main); font-weight:500; cursor:pointer; display:flex; align-items:center; gap:5px;">⬅️ Volver a Espacio Personal</button>
      <h2>🕰️ Historial de Backups</h2>
      <div style="width: 220px;"></div>
    </div>
    <div class="history-container" style="max-width: 800px; margin: 30px auto; padding: 0 20px;">
      ${historyHtml}
    </div>
  `;

  document.getElementById('btn-back-to-espacio')?.addEventListener('click', () => {
    renderEspacioPersonal(container);
  });
  
  container.querySelectorAll('.btn-edit-history').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.personalDate = e.target.dataset.date;
      renderEspacioPersonal(container);
    });
  });
}

function updateCurrentTimeLine() {
  const line = document.getElementById('current-time-line');
  if (!line) return;
  const pos = getCurrentTimePosition();
  if (pos !== null) {
    line.style.top = pos + 'px';
    line.style.display = 'block';
  } else {
    line.style.display = 'none';
  }
}





// ─── TASK DEADLINE / SCHEDULE HELPER FUNCTIONS ──────────────────────────────
const MONTH_NAMES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const monthName = MONTH_NAMES_ES[monthIdx] || parts[1];
  return `${day} ${monthName}`;
}

function formatTaskDeadlineText(deadline) {
  if (!deadline) return null;
  
  if (typeof deadline === 'string') {
    return `📅 ${formatDateShort(deadline)}`;
  }
  
  if (deadline.type === 'single') {
    if (!deadline.singleDate) return null;
    const formattedDate = formatDateShort(deadline.singleDate);
    if (deadline.singleTime) {
      return `⏰ ${formattedDate} · ${deadline.singleTime}`;
    }
    return `📅 ${formattedDate}`;
  }
  
  if (deadline.type === 'range') {
    const start = formatDateShort(deadline.startDate);
    const end = formatDateShort(deadline.endDate);
    if (start && end) {
      const timeStart = deadline.startTime ? ` ${deadline.startTime}` : '';
      const timeEnd = deadline.endTime ? ` ${deadline.endTime}` : '';
      return `📆 ${start}${timeStart} ➔ ${end}${timeEnd}`;
    } else if (end) {
      return `📅 Hasta ${end}`;
    } else if (start) {
      return `📅 Desde ${start}`;
    }
    return null;
  }
  
  if (deadline.type === 'multiple') {
    const slots = Array.isArray(deadline.slots) ? deadline.slots.filter(s => s && s.date) : [];
    if (slots.length === 0) return null;
    if (slots.length === 1) {
      const s = slots[0];
      const timeInfo = (s.startTime && s.endTime) ? ` ${s.startTime}-${s.endTime}` : (s.startTime ? ` ${s.startTime}` : '');
      return `⏱️ ${formatDateShort(s.date)}${timeInfo}`;
    }
    const datesSummary = slots.map(s => formatDateShort(s.date).split(' ')[0]).join(', ');
    return `⏱️ ${slots.length} bloques (${datesSummary})`;
  }
  
  return null;
}

function getDeadlineBadgeInfo(deadline) {
  if (!deadline) return null;
  const text = formatTaskDeadlineText(deadline);
  if (!text) return null;
  
  const todayStr = new Date().toISOString().split('T')[0];
  let targetDate = null;
  
  if (typeof deadline === 'string') {
    targetDate = deadline;
  } else if (deadline.type === 'single') {
    targetDate = deadline.singleDate;
  } else if (deadline.type === 'range') {
    targetDate = deadline.endDate || deadline.startDate;
  } else if (deadline.type === 'multiple' && Array.isArray(deadline.slots) && deadline.slots.length > 0) {
    targetDate = deadline.slots[deadline.slots.length - 1].date;
  }
  
  let statusClass = 'is-future';
  if (targetDate) {
    if (targetDate < todayStr) {
      statusClass = 'is-overdue';
    } else if (targetDate === todayStr) {
      statusClass = 'is-today';
    }
  }
  
  return {
    text,
    statusClass,
    fullTitle: text
  };
}

// Render Kanban board lists based on active filters
function renderKanbanCards() {
  const cardsPendiente = document.getElementById('cards-pendiente');
  const cardsProgreso = document.getElementById('cards-progreso');
  const cardsCompletado = document.getElementById('cards-completado');

  cardsPendiente.innerHTML = '';
  cardsProgreso.innerHTML = '';
  cardsCompletado.innerHTML = '';

  let cPendiente = 0;
  let cProgreso = 0;
  let cCompletado = 0;

  // Filter Tasks
  state.tasks.forEach(task => {
    // 0. Backlog mode unit filter (Quarz | Zentry | Personal | Global)
    const taskUnit = (task.origin || 'Quarz').toLowerCase();
    if (state.backlogMode === 'quarz') {
      if (taskUnit !== 'quarz') return;
    } else if (state.backlogMode === 'zentry') {
      if (taskUnit !== 'zentry') return;
    } else if (state.backlogMode === 'personal' || state.backlogMode === 'personal-board') {
      if (taskUnit !== 'personal') return;
    }
    // 'global' mode shows ALL tasks from all units

    // 1. Vertical filter
    if (state.filters.vertical !== 'all') {
      const v = state.filters.vertical; // 'tec', 'prod', 'mkt'
      if (v === 'tec' && !task.id.startsWith('TEC')) return;
      if (v === 'prod' && !task.id.startsWith('PROD')) return;
      if (v === 'mkt' && !task.id.startsWith('MKT')) return;
    }

    // 2. Priority filter
    if (state.filters.priority !== 'all') {
      if (task.priority.toLowerCase() !== state.filters.priority.toLowerCase()) return;
    }

    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    
    // Drag and Drop card event listeners
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
    
    let pClass = 'priority-media';
    if (task.priority.toLowerCase() === 'alta') pClass = 'priority-high';
    if (task.priority.toLowerCase() === 'baja') pClass = 'priority-baja';

    // Assignee initials
    let initials = 'UA';
    if (task.assignedTo) {
      initials = task.assignedTo.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    let deadlineBadgeHtml = '';
    if (task.deadline) {
      const badgeInfo = getDeadlineBadgeInfo(task.deadline);
      if (badgeInfo && badgeInfo.text) {
        deadlineBadgeHtml = `<div class="card-deadline-badge ${badgeInfo.statusClass}" title="${badgeInfo.fullTitle}">${badgeInfo.text}</div>`;
      }
    }

    card.innerHTML = `
      <div class="card-header">
        <span class="card-id">${task.id}</span>
        <span class="card-priority ${pClass}">${task.priority}</span>
      </div>
      <div class="card-body">${task.description}</div>
      ${deadlineBadgeHtml}
      <div class="card-footer">
        <span class="card-origin">Unidad: ${task.origin || 'Quarz'}</span>
        <span class="card-assignee">
          <div class="assignee-avatar">${initials}</div>
          <span>${task.assignedTo || 'Unassigned'}</span>
        </span>
      </div>
    `;

    // Click on Card opens the edit modal
    card.addEventListener('click', () => {
      openTaskModalForEdit(task);
    });

    const cleanStatus = task.status.toLowerCase().replace(/\s+/g, '');
    if (cleanStatus.includes('pendiente') || cleanStatus.includes('hacer') || cleanStatus.includes('todo')) {
      cardsPendiente.appendChild(card);
      cPendiente++;
    } else if (cleanStatus.includes('progreso') || cleanStatus.includes('curso') || cleanStatus.includes('proceso')) {
      cardsProgreso.appendChild(card);
      cProgreso++;
    } else {
      cardsCompletado.appendChild(card);
      cCompletado++;
    }
  });

  document.getElementById('count-pendiente').textContent = cPendiente;
  document.getElementById('count-progreso').textContent = cProgreso;
  document.getElementById('count-completado').textContent = cCompletado;
  renderBacklogCalendar();
}

// Router Logic
function handleRouting() {
  const hash = window.location.hash || '#backlog';
  
  // Set data-module on body to preserve Zentry colorimetry when accessing Zentry views
  const isZentryView = hash.includes('demobook') || hash.includes('prospeccion') || hash.includes('branding') || hash.includes('iacontext') || hash === '#backlog/zentry';
  if (isZentryView) {
    document.body.setAttribute('data-module', 'zentry');
  } else {
    document.body.setAttribute('data-module', 'hub');
  }

  // Reset minimal-view by default
  const workspace = document.querySelector('.workspace');
  if (workspace) {
    workspace.classList.remove('minimal-view');
    workspace.classList.remove('backlog-view'); // Reset backlog view full width
    workspace.classList.remove('full-width-view');
  }

  // Restore elements that might be hidden by Espacio Personal
  const pageBanner = document.getElementById('page-banner');
  const wsHeader = document.querySelector('.workspace-header');
  if (pageBanner) pageBanner.style.display = '';
  if (wsHeader) wsHeader.style.display = '';

  // Highlight active Nav Link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  if (hash.startsWith('#doc/')) {
    state.activeView = 'doc';
    state.activeDocPath = hash.replace('#doc/', '');
    buildDocTree(); // Rebuild tree to show active state
    renderers.doc(state.activeDocPath);
  } else if (hash.startsWith('#backlog')) {
    state.activeView = 'backlog';
    if (hash === '#backlog/zentry') {
      state.backlogMode = 'zentry';
      document.body.setAttribute('data-module', 'zentry');
    } else if (hash === '#backlog/quarz') {
      state.backlogMode = 'quarz';
      document.body.setAttribute('data-module', 'quarz');
    } else if (hash === '#backlog/personal-board') {
      state.backlogMode = 'personal-board';
      document.body.setAttribute('data-module', 'quarz');
    } else if (hash === '#backlog/personal') {
      state.backlogMode = 'personal';
      document.body.setAttribute('data-module', 'quarz');
    } else if (hash === '#backlog/global') {
      state.backlogMode = 'global';
      document.body.setAttribute('data-module', 'quarz');
    } else {
      state.backlogMode = 'selection';
      document.body.setAttribute('data-module', 'quarz');
    }
    const navLink = document.querySelector(`.nav-link[data-view="backlog"]`);
    if (navLink) navLink.classList.add('active');
    
    buildDocTree(); // Clear tree highlights
    renderers.backlog();
  } else {
    state.activeView = hash.replace('#', '');
    const navLink = document.querySelector(`.nav-link[data-view="${state.activeView}"]`);
    if (navLink) navLink.classList.add('active');
    
    buildDocTree(); // Clear tree highlights

    if (renderers[state.activeView]) {
      renderers[state.activeView]();
    } else {
      renderers.backlog();
    }
  }
}

// Listen to Hash Changes
window.addEventListener('hashchange', handleRouting);

// PWA Service Worker & Install Handler
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('QZ-Hub ServiceWorker registrado con éxito:', reg);
    }).catch((err) => {
      console.warn('QZ-Hub ServiceWorker no registrado:', err);
    });
  });
}

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const pwaBtn = document.getElementById('pwa-install-btn');
  if (pwaBtn) {
    pwaBtn.style.display = 'inline-flex';
  }
});

document.addEventListener('click', (e) => {
  if (e.target && (e.target.id === 'pwa-install-btn' || e.target.closest('#pwa-install-btn'))) {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó instalar QZ-Hub PWA');
        }
        deferredPrompt = null;
        const pwaBtn = document.getElementById('pwa-install-btn');
        if (pwaBtn) pwaBtn.style.display = 'none';
      });
    } else {
      alert('📱 Cómo instalar QZ-Hub en tu Celular:\n\n• En Android (Chrome / Edge): Toca los 3 puntos (⋮) arriba a la derecha ➔ Toca "Añadir a la pantalla de inicio" o "Instalar aplicación".\n• En iPhone (Safari): Toca el botón Compartir (⎋) abajo al centro ➔ Toca "Añadir a la pantalla de inicio".');
    }
  }
});

// Sidebar Toggle Event Handlers (Desktop & Mobile)
function toggleSidebarMobile() {
  const app = document.getElementById('app');
  app.classList.toggle('sidebar-mobile-open');
}

function closeSidebarMobile() {
  const app = document.getElementById('app');
  app.classList.remove('sidebar-mobile-open');
}

document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
  const app = document.getElementById('app');
  if (window.innerWidth <= 768) {
    toggleSidebarMobile();
  } else {
    app.classList.toggle('sidebar-collapsed');
    const isCollapsed = app.classList.contains('sidebar-collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');
  }
});

document.getElementById('sidebar-toggle-mobile')?.addEventListener('click', toggleSidebarMobile);

// Sidebar Backdrop Click Event Handler
document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
  closeSidebarMobile();
  const app = document.getElementById('app');
  app.classList.add('sidebar-collapsed');
  localStorage.setItem('sidebar_collapsed', 'true');
});

// Auto-close sidebar on mobile when navigating links
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      closeSidebarMobile();
    }
  });
});

// Load Sidebar Collapsed State Preference for Desktop
if (window.innerWidth > 768) {
  const sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (sidebarCollapsed) {
    document.getElementById('app').classList.add('sidebar-collapsed');
  }
}

// Drag-and-drop vertical position calculation helper
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.kanban-card:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Drag & Drop Setup
function setupDragAndDrop() {
  const columns = [
    { el: document.getElementById('cards-pendiente'), status: 'Pendiente' },
    { el: document.getElementById('cards-progreso'), status: 'En curso' },
    { el: document.getElementById('cards-completado'), status: 'Completado' }
  ];

  columns.forEach(col => {
    if (!col.el) return;
    
    col.el.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.el.classList.add('drag-over');
      
      const afterElement = getDragAfterElement(col.el, e.clientY);
      const draggingCard = document.querySelector('.kanban-card.dragging');
      if (draggingCard) {
        if (afterElement == null) {
          col.el.appendChild(draggingCard);
        } else {
          col.el.insertBefore(draggingCard, afterElement);
        }
      }
    });

    col.el.addEventListener('dragleave', () => {
      col.el.classList.remove('drag-over');
    });

    col.el.addEventListener('drop', (e) => {
      e.preventDefault();
      col.el.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain');
      const taskIndex = state.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
      
      const task = state.tasks[taskIndex];
      // Update status
      task.status = col.status;
      
      // Determine the position of the dropped card relative to other cards in the column
      const children = [...col.el.querySelectorAll('.kanban-card')];
      const newIndexInColumn = children.findIndex(child => child.querySelector('.card-id').textContent === taskId);
      
      // Remove from array
      state.tasks.splice(taskIndex, 1);
      
      if (newIndexInColumn === children.length - 1) {
        // Drop at the end
        if (children.length > 1) {
          const prevCardId = children[newIndexInColumn - 1].querySelector('.card-id').textContent;
          const prevTaskIndex = state.tasks.findIndex(t => t.id === prevCardId);
          state.tasks.splice(prevTaskIndex + 1, 0, task);
        } else {
          state.tasks.push(task);
        }
      } else {
        // Drop before a visible sibling card
        const nextCardId = children[newIndexInColumn + 1].querySelector('.card-id').textContent;
        const nextTaskIndex = state.tasks.findIndex(t => t.id === nextCardId);
        state.tasks.splice(nextTaskIndex, 0, task);
      }
      
      localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks)); syncTasks(state.tasks);
      renderKanbanCards();
    });
  });
}

// Modal View Elements
const modal = document.getElementById('task-modal');
const modalTaskId = document.getElementById('modal-task-id');
const modalClose = document.getElementById('modal-close');
const taskForm = document.getElementById('task-form');
const taskDesc = document.getElementById('task-desc');
const taskPriority = document.getElementById('task-priority');
const taskStatus = document.getElementById('task-status');
const taskAssignee = document.getElementById('task-assignee');
const taskActionType = document.getElementById('task-action-type');
const taskActionCustom = document.getElementById('task-action-custom');
const taskDeleteBtn = document.getElementById('task-delete-btn');
const taskGoRef = document.getElementById('task-go-ref');

// Toggle Custom Input based on Action Type selection
taskActionType.addEventListener('change', (e) => {
  if (e.target.value === 'Otro') {
    taskActionCustom.style.display = 'block';
    taskActionCustom.required = true;
  } else {
    taskActionCustom.style.display = 'none';
    taskActionCustom.required = false;
    taskActionCustom.value = '';
  }
});


// Modal Deadline State
let currentDeadlineMode = 'none';
let multipleSlotsState = [];

function setDeadlineMode(mode) {
  currentDeadlineMode = mode;
  document.querySelectorAll('.deadline-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  const pSingle = document.getElementById('deadline-panel-single');
  const pRange = document.getElementById('deadline-panel-range');
  const pMultiple = document.getElementById('deadline-panel-multiple');
  
  if (pSingle) pSingle.style.display = mode === 'single' ? 'block' : 'none';
  if (pRange) pRange.style.display = mode === 'range' ? 'block' : 'none';
  if (pMultiple) pMultiple.style.display = mode === 'multiple' ? 'block' : 'none';
}

function renderMultipleSlotsList() {
  const container = document.getElementById('multiple-slots-list');
  if (!container) return;
  container.innerHTML = '';
  
  if (multipleSlotsState.length === 0) {
    container.innerHTML = '<div style="font-size: 11.5px; color: var(--text-muted); font-style: italic; padding: 4px;">No hay bloques asignados. Haz clic en "Agregar Día / Horario".</div>';
    return;
  }
  
  multipleSlotsState.forEach((slot, idx) => {
    const row = document.createElement('div');
    row.className = 'slot-item-row';
    row.innerHTML = `
      <input type="date" class="form-input-date slot-date" value="${slot.date || ''}" title="Fecha del bloque" />
      <input type="time" class="form-input-time slot-start-time" value="${slot.startTime || ''}" placeholder="Inicio" title="Hora inicio" />
      <input type="time" class="form-input-time slot-end-time" value="${slot.endTime || ''}" placeholder="Fin" title="Hora fin" />
      <button type="button" class="btn-remove-slot" data-index="${idx}" title="Eliminar este bloque">🗑️</button>
    `;
    
    row.querySelector('.slot-date').addEventListener('change', (e) => {
      multipleSlotsState[idx].date = e.target.value;
    });
    row.querySelector('.slot-start-time').addEventListener('change', (e) => {
      multipleSlotsState[idx].startTime = e.target.value;
    });
    row.querySelector('.slot-end-time').addEventListener('change', (e) => {
      multipleSlotsState[idx].endTime = e.target.value;
    });
    row.querySelector('.btn-remove-slot').addEventListener('click', () => {
      multipleSlotsState.splice(idx, 1);
      renderMultipleSlotsList();
    });
    
    container.appendChild(row);
  });
}

// Bind Deadline Mode Switchers
document.querySelectorAll('.deadline-mode-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const mode = e.currentTarget.dataset.mode;
    setDeadlineMode(mode);
    if (mode === 'multiple' && multipleSlotsState.length === 0) {
      multipleSlotsState.push({ date: state.personalDate || new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00' });
      renderMultipleSlotsList();
    }
  });
});

document.getElementById('btn-clear-deadline')?.addEventListener('click', () => {
  setDeadlineMode('none');
  const sDate = document.getElementById('task-single-date');
  const sTime = document.getElementById('task-single-time');
  const rStartDate = document.getElementById('task-range-start-date');
  const rStartTime = document.getElementById('task-range-start-time');
  const rEndDate = document.getElementById('task-range-end-date');
  const rEndTime = document.getElementById('task-range-end-time');
  if (sDate) sDate.value = '';
  if (sTime) sTime.value = '';
  if (rStartDate) rStartDate.value = '';
  if (rStartTime) rStartTime.value = '';
  if (rEndDate) rEndDate.value = '';
  if (rEndTime) rEndTime.value = '';
  multipleSlotsState = [];
  renderMultipleSlotsList();
});

document.getElementById('btn-add-multiple-slot')?.addEventListener('click', () => {
  multipleSlotsState.push({ date: state.personalDate || new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00' });
  renderMultipleSlotsList();
});

// Open Modal for Editing
function openTaskModalForEdit(task) {
  state.currentEditingTask = task;
  
  modalTaskId.textContent = task.id;
  taskDesc.value = task.description || '';
  taskPriority.value = task.priority || 'Media';
  
  // Map internal status string to select value
  const cleanStatus = task.status.toLowerCase().replace(/\s+/g, '');
  if (cleanStatus.includes('pendiente') || cleanStatus.includes('hacer') || cleanStatus.includes('todo')) {
    taskStatus.value = 'Pendiente';
  } else if (cleanStatus.includes('progreso') || cleanStatus.includes('curso') || cleanStatus.includes('proceso')) {
    taskStatus.value = 'En curso';
  } else {
    taskStatus.value = 'Completado';
  }
  
  taskAssignee.value = task.assignedTo === 'Agente' ? 'Agente' : 'Jose Angel';
  
  const currentUnit = (task.origin || 'Quarz').trim();
  if (currentUnit.toLowerCase() === 'zentry') {
    taskActionType.value = 'Zentry';
  } else if (currentUnit.toLowerCase() === 'personal') {
    taskActionType.value = 'Personal';
  } else {
    taskActionType.value = 'Quarz';
  }
  taskActionCustom.style.display = 'none';
  
  // Populate deadline
  const sDate = document.getElementById('task-single-date');
  const sTime = document.getElementById('task-single-time');
  const rStartDate = document.getElementById('task-range-start-date');
  const rStartTime = document.getElementById('task-range-start-time');
  const rEndDate = document.getElementById('task-range-end-date');
  const rEndTime = document.getElementById('task-range-end-time');
  
  if (sDate) sDate.value = '';
  if (sTime) sTime.value = '';
  if (rStartDate) rStartDate.value = '';
  if (rStartTime) rStartTime.value = '';
  if (rEndDate) rEndDate.value = '';
  if (rEndTime) rEndTime.value = '';
  multipleSlotsState = [];
  
  if (task.deadline) {
    if (typeof task.deadline === 'string') {
      setDeadlineMode('single');
      if (sDate) sDate.value = task.deadline;
    } else if (task.deadline.type === 'single') {
      setDeadlineMode('single');
      if (sDate) sDate.value = task.deadline.singleDate || '';
      if (sTime) sTime.value = task.deadline.singleTime || '';
    } else if (task.deadline.type === 'range') {
      setDeadlineMode('range');
      if (rStartDate) rStartDate.value = task.deadline.startDate || '';
      if (rStartTime) rStartTime.value = task.deadline.startTime || '';
      if (rEndDate) rEndDate.value = task.deadline.endDate || '';
      if (rEndTime) rEndTime.value = task.deadline.endTime || '';
    } else if (task.deadline.type === 'multiple') {
      setDeadlineMode('multiple');
      multipleSlotsState = Array.isArray(task.deadline.slots) ? JSON.parse(JSON.stringify(task.deadline.slots)) : [];
      renderMultipleSlotsList();
    } else {
      setDeadlineMode('none');
    }
  } else {
    setDeadlineMode('none');
  }

  // Show Delete and Ref buttons
  taskDeleteBtn.style.display = 'block';
  if (task.origin || task.id) {
    taskGoRef.style.display = 'block';
  } else {
    taskGoRef.style.display = 'none';
  }
  
  // Open modal animation
  modal.classList.add('show');
}

// Open Modal for Creating
function openTaskModalForCreate() {
  state.currentEditingTask = null;
  
  // Auto-generate task ID based on active filters
  let prefix = 'TASK';
  if (state.filters.vertical === 'tec') prefix = 'TEC';
  else if (state.filters.vertical === 'prod') prefix = 'PROD';
  else if (state.filters.vertical === 'mkt') prefix = 'MKT';
  
  const matches = state.tasks.filter(t => t.id.startsWith(prefix));
  let nextNum = 1;
  if (matches.length > 0) {
    const ids = matches.map(t => {
      const parts = t.id.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return isNaN(num) ? 0 : num;
    });
    nextNum = Math.max(...ids) + 1;
  }
  
  const paddedNum = String(nextNum).padStart(2, '0');
  modalTaskId.textContent = `Crear Nueva Tarea (${prefix}-${paddedNum})`;
  
  // Clear fields
  taskDesc.value = '';
  taskPriority.value = 'Media';
  taskStatus.value = 'Pendiente';
  taskAssignee.value = 'Jose Angel';
  
  if (state.backlogMode === 'personal' || state.backlogMode === 'personal-board') {
    taskActionType.value = 'Personal';
  } else if (state.backlogMode === 'zentry') {
    taskActionType.value = 'Zentry';
  } else {
    taskActionType.value = 'Quarz';
  }
  taskActionCustom.style.display = 'none';
  taskActionCustom.value = '';

  // Reset deadline inputs
  setDeadlineMode('none');
  const sDate = document.getElementById('task-single-date');
  const sTime = document.getElementById('task-single-time');
  const rStartDate = document.getElementById('task-range-start-date');
  const rStartTime = document.getElementById('task-range-start-time');
  const rEndDate = document.getElementById('task-range-end-date');
  const rEndTime = document.getElementById('task-range-end-time');
  if (sDate) sDate.value = '';
  if (sTime) sTime.value = '';
  if (rStartDate) rStartDate.value = '';
  if (rStartTime) rStartTime.value = '';
  if (rEndDate) rEndDate.value = '';
  if (rEndTime) rEndTime.value = '';
  multipleSlotsState = [];
  renderMultipleSlotsList();
  
  // Hide Delete and Ref buttons for new task
  taskDeleteBtn.style.display = 'none';
  taskGoRef.style.display = 'none';
  
  modal.classList.add('show');
}

// Close Modal
function closeModal() {
  modal.classList.remove('show');
}

// Bind Modal Close listeners
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// Delete Task Handler
taskDeleteBtn.addEventListener('click', () => {
  if (state.currentEditingTask && confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    state.tasks = state.tasks.filter(t => t.id !== state.currentEditingTask.id);
    localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks)); syncTasks(state.tasks);
    closeModal();
    renderKanbanCards();
  }
});

// Go to Reference Document Handler
taskGoRef.addEventListener('click', () => {
  if (!state.currentEditingTask) return;
  const task = state.currentEditingTask;
  closeModal();
  
  if (task.origin && task.origin.includes('Keep')) {
    window.location.hash = '#ideas';
  } else {
    // Navigate based on prefix
    if (task.id.startsWith('TEC')) {
      window.location.hash = '#doc/02-arquitectura-tecnica/README.md';
    } else if (task.id.startsWith('MKT')) {
      window.location.hash = '#doc/03-marketing-y-ventas/README.md';
    } else {
      window.location.hash = '#doc/01-vision-y-producto/README.md';
    }
  }
});

// Form Submit Handler
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const desc = taskDesc.value.trim();
  const priority = taskPriority.value;
  const status = taskStatus.value; // 'Pendiente', 'En curso', 'Completado'
  const assignee = taskAssignee.value;
  
  let origin = taskActionType.value || 'Quarz';
  if (taskActionType.value === 'Otro') {
    origin = taskActionCustom.value.trim() || 'Otro';
  }
  
  // Serialize deadline based on selected mode
  let deadline = null;
  if (currentDeadlineMode === 'single') {
    const singleDate = document.getElementById('task-single-date')?.value || '';
    const singleTime = document.getElementById('task-single-time')?.value || '';
    if (singleDate) {
      deadline = { type: 'single', singleDate, singleTime };
    }
  } else if (currentDeadlineMode === 'range') {
    const startDate = document.getElementById('task-range-start-date')?.value || '';
    const startTime = document.getElementById('task-range-start-time')?.value || '';
    const endDate = document.getElementById('task-range-end-date')?.value || '';
    const endTime = document.getElementById('task-range-end-time')?.value || '';
    if (startDate || endDate) {
      deadline = { type: 'range', startDate, startTime, endDate, endTime };
    }
  } else if (currentDeadlineMode === 'multiple') {
    const validSlots = multipleSlotsState.filter(s => s && s.date);
    if (validSlots.length > 0) {
      deadline = { type: 'multiple', slots: validSlots };
    }
  }

  if (state.currentEditingTask) {
    // Edit Mode
    const task = state.tasks.find(t => t.id === state.currentEditingTask.id);
    if (task) {
      task.description = desc;
      task.priority = priority;
      task.status = status;
      task.assignedTo = assignee;
      task.origin = origin;
      task.deadline = deadline;
    }
  } else {
    // Create Mode
    // Calculate final ID
    let prefix = 'TASK';
    if (state.filters.vertical === 'tec') prefix = 'TEC';
    else if (state.filters.vertical === 'prod') prefix = 'PROD';
    else if (state.filters.vertical === 'mkt') prefix = 'MKT';
    
    const matches = state.tasks.filter(t => t.id.startsWith(prefix));
    let nextNum = 1;
    if (matches.length > 0) {
      const ids = matches.map(t => {
        const parts = t.id.split('-');
        const num = parseInt(parts[parts.length - 1]);
        return isNaN(num) ? 0 : num;
      });
      nextNum = Math.max(...ids) + 1;
    }
    const paddedNum = String(nextNum).padStart(2, '0');
    const finalId = `${prefix}-${paddedNum}`;
    
    state.tasks.push({
      id: finalId,
      description: desc,
      priority: priority,
      status: status,
      assignedTo: assignee,
      origin: origin,
      deadline: deadline
    });
  }
  
  localStorage.setItem('zentry_tasks', JSON.stringify(state.tasks)); syncTasks(state.tasks);
  closeModal();
  renderKanbanCards();
});

// Initial Load
checkOAuthCallback();
buildDocTree();
handleRouting();
