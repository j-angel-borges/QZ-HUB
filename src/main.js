
function processLocalSsotQuery(query) {
  const q = (query || '').toLowerCase().trim();
  
  if (q.includes('hola') || q.includes('buenos') || q.includes('saludos') || q === 'hi') {
    return `¡Hola Jose Angel! 👋 Estoy listo para asistirte en la orquestación operativa de **QZ-Hub**.\n\nPuedes consultarme sobre:\n- 🎯 **Metas y Brecha de Caja al 31 de Agosto**\n- 📊 **Ratios y llamadas de Royal Prestige**\n- ☄️ **Licencias y ganancias de QUARZ / ZentryOS**\n- 📸 **Capturas de pantalla o comandos en tu PC**\n\n*(Para activar respuestas avanzadas con Gemini 2.5 y tus créditos de GCP, asegúrate de ingresar tu API Key en **⚙️ Config GCP**)*.`;
  }
  
  if (q.includes('meta') || q.includes('financier') || q.includes('caja') || q.includes('agosto')) {
    return `### 🎯 Estado de Metas Financieras (Al 31 de Agosto)\n- **Meta Total de Facturación:** S/ 4,000.00 PEN\n- **Caja Actual en Cuenta:** S/ 770.00 PEN\n- **Brecha Restante a Generar:** **S/ 3,230.00 PEN**\n- **Estrategia Combinada:**\n  - Royal Prestige (3 ventas estimadas = S/ 3,031.77)\n  - Quarz / ZentryOS (1 despliegue de licencia = S/ 1,906.78 ganancia neta personal).`;
  }

  if (q.includes('royal') || q.includes('llamada') || q.includes('demo') || q.includes('embudo')) {
    return `### 📊 Embudo Operativo Royal Prestige (SIM: 933709385)\n- **Franja Horaria:** 12:00 PM a 02:00 PM (Ininterrumpida)\n- **Volumen Objetivo:** 40 llamadas frías diarias\n- **Ratio de Conversión:** 20 llamadas conversadas = 1 Demo agendada\n- **Ratio de Cierre:** 4 Demos realizadas = 1 Venta cerrada\n- **Comisión Promedio por Venta:** S/ 1,010.59 PEN.`;
  }

  if (q.includes('quarz') || q.includes('zentry') || q.includes('licencia')) {
    return `### ☄️ Modelo de Negocio QUARZ Group / ZentryOS\n- **Precio por Despliegue de Licencia:** $1,000 USD (S/ 3,177.97 aprox.)\n- **Distribución de Ganancia:**\n  - **60% Personal (Jose Angel):** S/ 1,906.78 PEN\n  - **40% Caja Empresa (QUARZ):** S/ 1,271.19 PEN.`;
  }

  if (q.includes('rutina') || q.includes('biohack') || q.includes('ayuno') || q.includes('yerbatero')) {
    return `### 🥩 Protocolo Biológico y Rutina Diaria\n- **05:00 AM - 08:30 AM:** Levantamiento, luz solar, hidratación y foco profundo\n- **12:00 PM - 02:00 PM:** Bloque sagrado de prospección y llamadas comerciales\n- **Ayuno Autofágico:** Ciclo semanal de 48h con reabastecimiento carnívoro denso\n- **Abastecimiento Yerbateros:** Viernes 04:30 AM (Hígado, corazón, grasa y cortes limpios).`;
  }

  return `Entendido. He registrado tu consulta en esta sesión: **"${query}"**.\n\n*Nota:* Para que pueda generar análisis profundos, redactar documentos complejos y procesar prompts con **Google Cloud Vertex AI (Gemini 2.5)**, haz clic en el botón **⚙️ Config GCP** abajo y pega tu **Google Cloud API Key**.`;
}

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
  syncJournalHistory,
  sendRemoteTask,
  listenToRemoteTask,
  listenToRemoteTelemetry,
  listenToLatestScreenshot,
  listenToTerminalStream,
  sendRemoteStdin,
  killRemoteProcess,
  callVertexGemini,
  listenToActiveSession,
  listenToSessionList,
  switchRemoteSession,
  readRemoteArtifact
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

// Function to invoke real Google Cloud Vertex AI / Gemini API with full SSOT System Instruction
async function callRealGeminiAPI(userQuery, chatHistory = []) {
  const model = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';

  const systemInstruction = `Eres el Orquestador SSOT Maestro de José Ángel para el Plan de 63 Días (10 Agosto a 11 Octubre de 2026) y QUARZ Group.
Tienes conocimiento completo del SSOT:
1. MANIFIESTO MAESTRO 63 DÍAS:
${manifestMarkdown.slice(0, 4000)}

2. METRICAS Y EMBUDOS COMERCIALES:
${metricasMarkdown.slice(0, 3000)}

3. PROTOCOLO CIRCADIANO Y HABITOS:
${circadianoMarkdown.slice(0, 3000)}

INFORMACIÓN OPERATIVA:
- Obligación financiera al 31 de agosto: S/ 4,000.00 PEN (Caja actual S/ 770.00).
- Dispositivos: Redmi Note 9 (SIM 933709385 QUARZ para llamadas), Motorola Edge 40 Neo (Servidor USB Scrcpy para WhatsApp), Tab A7 Samsung (Demo ZentryOS Launcher Device Owner), iPad 5ª Gen (Demo PWA Dashboard).
- Franja 12:00 PM - 02:00 PM: Paseo del perro + Calistenia + 40 llamadas breves Royal Prestige.
- Ayuno 48h: Jueves 13 (8pm) a Sábado 15 de Agosto (8pm).
- Camal Yerbateros: Viernes 04:30 AM.

Responde con profesionalismo, concisión, estructura Markdown impecable y máxima alineación al SSOT.`;

  // Format past history into prompt
  let fullPrompt = '';
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    fullPrompt = chatHistory.slice(-6).map(m => `${m.sender === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`).join('\n\n') + `\n\nUsuario: ${userQuery}`;
  } else {
    fullPrompt = userQuery;
  }

  return await callVertexGemini(fullPrompt, systemInstruction, model);
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

// ==============================================================================
// BIO-TRACKER & PROTOCOLO CUÁNTICO GAMIFICADO (9 MÉTRICAS DE DISCIPLINA)
// ==============================================================================

function getDefaultHabitTrackerData() {
  return {
    ay: { daysSince: 51, h24: 1, h48: 0, h72: 0 },
    lec: { daysSince: 7, daysRead: 7, daysMissed: 0, lastPages: 25 },
    am: { slot5to6: 1, slot6to7: 3, missed: 2 },
    z: { daysClean: 0, daysConsumed: 1 },
    fri: { coldDays: 15, missedDays: 31 },
    ik: { doneDays: 11, missedDays: 15 },
    a: { cleanDays: 77, targetDays: 90, missedDays: 0 },
    e: { retentionDays: 8, ejaculations: 0, pornFreeDays: 36 },
    s: { days: 12 }
  };
}

function getHabitTrackerData() {
  const stored = localStorage.getItem('qz_bio_tracker');
  if (stored) {
    try {
      return { ...getDefaultHabitTrackerData(), ...JSON.parse(stored) };
    } catch (e) {
      return getDefaultHabitTrackerData();
    }
  }
  return getDefaultHabitTrackerData();
}

function saveHabitTrackerData(data) {
  localStorage.setItem('qz_bio_tracker', JSON.stringify(data));
}

function resetHabitTrackerDefaults() {
  const defaults = getDefaultHabitTrackerData();
  saveHabitTrackerData(defaults);
  return defaults;
}

function renderHabitTrackerHTML(tData) {
  const friTotal = tData.fri.coldDays + tData.fri.missedDays;
  const friPercent = friTotal > 0 ? Math.round((tData.fri.coldDays / friTotal) * 100) : 0;
  
  const ikTotal = tData.ik.doneDays + tData.ik.missedDays;
  const ikPercent = ikTotal > 0 ? Math.round((tData.ik.doneDays / ikTotal) * 100) : 0;
  
  const aPercent = tData.a.targetDays > 0 ? Math.min(100, Math.round((tData.a.cleanDays / tData.a.targetDays) * 100)) : 100;
  const aRemaining = Math.max(0, tData.a.targetDays - tData.a.cleanDays);

  return `
    <div class="backlog-tracker-card" id="backlog-tracker-widget">
      <div class="tracker-card-header">
        <div class="tracker-title-group">
          <span class="tracker-icon">🧬</span>
          <div>
            <h4 class="tracker-card-title">BIO-TRACKER GAMIFICADO</h4>
            <span class="tracker-card-subtitle">Protocolo de Disciplina y Rendimiento</span>
          </div>
        </div>
        <button type="button" class="btn-tracker-config" id="btn-open-tracker-config" title="Configurar métricas y cifras">⚙️</button>
      </div>

      <div class="tracker-metrics-grid">
        <!-- 1. AY (Ayuno) -->
        <div class="metric-chip chip-ay" data-metric="ay" title="Ayuno: ${tData.ay.daysSince}d tracking | 24h: ${tData.ay.h24}, 48h: ${tData.ay.h48}, 72h: ${tData.ay.h72}">
          <div class="metric-chip-header">
            <span class="metric-code">AY</span>
            <span class="metric-total">${tData.ay.daysSince}d</span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-badge ${tData.ay.h24 > 0 ? 'active' : ''}">24h: <strong>${tData.ay.h24}</strong></span>
            <span class="metric-badge ${tData.ay.h48 > 0 ? 'active' : ''}">48h: <strong>${tData.ay.h48}</strong></span>
            <span class="metric-badge ${tData.ay.h72 > 0 ? 'active' : ''}">72h: <strong>${tData.ay.h72}</strong></span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-ay-24" title="+1 Ayuno 24h">＋24</button>
            <button type="button" class="btn-chip-inc" data-action="inc-ay-48" title="+1 Ayuno 48h">＋48</button>
          </div>
        </div>

        <!-- 2. LEC (Lectura) -->
        <div class="metric-chip chip-lec" data-metric="lec" title="Lectura: +${tData.lec.daysRead} leídos, -${tData.lec.daysMissed} omitidos | ${tData.lec.lastPages} páginas">
          <div class="metric-chip-header">
            <span class="metric-code">LEC</span>
            <span class="metric-streak success">+${tData.lec.daysRead}</span>
            <span class="metric-missed danger">-${tData.lec.daysMissed}</span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-subval">📖 <strong>${tData.lec.lastPages}</strong> pág.</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-lec-read" title="+1 Día de Lectura">＋Día</button>
            <button type="button" class="btn-chip-inc" data-action="inc-lec-pages" title="Modificar Páginas">＋Pág</button>
          </div>
        </div>

        <!-- 3. AM (Madrugar) -->
        <div class="metric-chip chip-am" data-metric="am" title="Madrugar: 5-6am (${tData.am.slot5to6}), 6-7am (${tData.am.slot6to7}), Tarde (-${tData.am.missed})">
          <div class="metric-chip-header">
            <span class="metric-code">AM</span>
            <span class="metric-missed danger">-${tData.am.missed}</span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-tag gold">5a: <strong>${tData.am.slot5to6}</strong></span>
            <span class="metric-tag">6a: <strong>${tData.am.slot6to7}</strong></span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-am-5" title="+1 Madrugón 5 AM">＋5a</button>
            <button type="button" class="btn-chip-inc" data-action="inc-am-6" title="+1 Madrugón 6 AM">＋6a</button>
          </div>
        </div>

        <!-- 4. Z (Azúcar) -->
        <div class="metric-chip chip-z" data-metric="z" title="Zero Azúcar: ${tData.z.daysClean}d limpio, ${tData.z.daysConsumed} consumos">
          <div class="metric-chip-header">
            <span class="metric-code">Z</span>
            <span class="metric-exp-display"><span class="exp-base">+${tData.z.daysClean}</span><sup class="exp-sup">-${tData.z.daysConsumed}</sup></span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-subval">${tData.z.daysClean === 0 ? '⚠️ Reset reciente' : '🔥 Racha activa'}</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-z-clean" title="+1 Día Sin Azúcar">＋Día</button>
            <button type="button" class="btn-chip-inc danger" data-action="inc-z-consumed" title="Registrar Consumo / Reset">⚠️ Consumo</button>
          </div>
        </div>

        <!-- 5. FRI (Agua Fría) -->
        <div class="metric-chip chip-fri" data-metric="fri" title="Ducha Fría: ${tData.fri.coldDays} frío / ${tData.fri.missedDays} omitidos (${friPercent}%)">
          <div class="metric-chip-header">
            <span class="metric-code">FRI</span>
            <span class="metric-ratio">${tData.fri.coldDays}/${friTotal}</span>
          </div>
          <div class="metric-chip-body">
            <div class="mini-progress-track">
              <div class="mini-progress-fill cyan" style="width: ${friPercent}%;"></div>
            </div>
            <span class="metric-ratio-text">${friPercent}% (1 de ${friTotal > 0 && tData.fri.coldDays > 0 ? (friTotal / tData.fri.coldDays).toFixed(1) : '-'})</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-fri-cold" title="+1 Ducha Fría">＋🧊</button>
            <button type="button" class="btn-chip-inc" data-action="inc-fri-missed" title="+1 Omitido">＋🔥</button>
          </div>
        </div>

        <!-- 6. IK (Isha Kriya) -->
        <div class="metric-chip chip-ik" data-metric="ik" title="Isha Kriya: ${tData.ik.doneDays} hechos / ${tData.ik.missedDays} omitidos (${ikPercent}%)">
          <div class="metric-chip-header">
            <span class="metric-code">IK</span>
            <span class="metric-ratio">${tData.ik.doneDays}/${ikTotal}</span>
          </div>
          <div class="metric-chip-body">
            <div class="mini-progress-track">
              <div class="mini-progress-fill purple" style="width: ${ikPercent}%;"></div>
            </div>
            <span class="metric-ratio-text">${ikPercent}% consistencia</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-ik-done" title="+1 Meditación">＋🧘</button>
            <button type="button" class="btn-chip-inc" data-action="inc-ik-missed" title="+1 Omitido">＋⭕</button>
          </div>
        </div>

        <!-- 7. A (Alcohol) -->
        <div class="metric-chip chip-a" data-metric="a" title="Alcohol: ${tData.a.cleanDays} de ${tData.a.targetDays} días sobrio (${aPercent}%)">
          <div class="metric-chip-header">
            <span class="metric-code">A</span>
            <span class="metric-streak gold">${tData.a.cleanDays}/${tData.a.targetDays}d</span>
          </div>
          <div class="metric-chip-body">
            <div class="mini-progress-track">
              <div class="mini-progress-fill gold" style="width: ${aPercent}%;"></div>
            </div>
            <span class="metric-ratio-text">${aPercent}% (${aRemaining}d faltan)</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-a-clean" title="+1 Día Sobrio">＋1d</button>
          </div>
        </div>

        <!-- 8. E (Energía Sexual) -->
        <div class="metric-chip chip-e" data-metric="e" title="Energía Sexual: ${tData.e.retentionDays}d Retención | ${tData.e.pornFreeDays}d Sin Pornografía | ${tData.e.ejaculations} Eyaculaciones">
          <div class="metric-chip-header">
            <span class="metric-code">E</span>
            <span class="metric-tag-dual">
              <span class="ret-badge" title="Retención">⚡ ${tData.e.retentionDays}d</span>
              <span class="pmo-badge" title="No-Porn">🚫 ${tData.e.pornFreeDays}d</span>
            </span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-subval">Eyaculaciones: <strong>-${tData.e.ejaculations}</strong></span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-e-ret" title="+1 Día Retención">＋⚡</button>
            <button type="button" class="btn-chip-inc" data-action="inc-e-noporn" title="+1 Día No-Porn">＋🚫</button>
          </div>
        </div>

        <!-- 9. S (Suplementos) -->
        <div class="metric-chip chip-s" data-metric="s" title="Suplementos: ${tData.s.days} días consistentes">
          <div class="metric-chip-header">
            <span class="metric-code">S</span>
            <span class="metric-streak success">💊 +${tData.s.days}d</span>
          </div>
          <div class="metric-chip-body">
            <span class="metric-subval">Adherencia activa</span>
          </div>
          <div class="metric-chip-actions">
            <button type="button" class="btn-chip-inc" data-action="inc-s-day" title="+1 Día Suplementado">＋💊</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupHabitTrackerEvents(container) {
  const trackerWidget = container.querySelector('#backlog-tracker-widget');
  if (!trackerWidget) return;

  const updateWidgetUI = () => {
    const currentData = getHabitTrackerData();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = renderHabitTrackerHTML(currentData);
    const newWidget = tempDiv.firstElementChild;
    trackerWidget.replaceWith(newWidget);
    setupHabitTrackerEvents(container);
  };

  // 1. Action buttons on chips
  trackerWidget.querySelectorAll('.btn-chip-inc').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const action = btn.getAttribute('data-action');
      const data = getHabitTrackerData();

      if (action === 'inc-ay-24') {
        data.ay.h24 += 1;
      } else if (action === 'inc-ay-48') {
        data.ay.h48 += 1;
      } else if (action === 'inc-lec-read') {
        data.lec.daysRead += 1;
      } else if (action === 'inc-lec-pages') {
        const p = prompt('¿Cuántas páginas leíste en tu última sesión?', data.lec.lastPages || '25');
        if (p !== null && !isNaN(parseInt(p))) {
          data.lec.lastPages = parseInt(p);
        }
      } else if (action === 'inc-am-5') {
        data.am.slot5to6 += 1;
      } else if (action === 'inc-am-6') {
        data.am.slot6to7 += 1;
      } else if (action === 'inc-z-clean') {
        data.z.daysClean += 1;
      } else if (action === 'inc-z-consumed') {
        data.z.daysClean = 0;
        data.z.daysConsumed += 1;
      } else if (action === 'inc-fri-cold') {
        data.fri.coldDays += 1;
      } else if (action === 'inc-fri-missed') {
        data.fri.missedDays += 1;
      } else if (action === 'inc-ik-done') {
        data.ik.doneDays += 1;
      } else if (action === 'inc-ik-missed') {
        data.ik.missedDays += 1;
      } else if (action === 'inc-a-clean') {
        data.a.cleanDays += 1;
      } else if (action === 'inc-e-ret') {
        data.e.retentionDays += 1;
      } else if (action === 'inc-e-noporn') {
        data.e.pornFreeDays += 1;
      } else if (action === 'inc-s-day') {
        data.s.days += 1;
      }

      saveHabitTrackerData(data);
      updateWidgetUI();
    });
  });

  // 2. Open Config Modal
  const configBtn = trackerWidget.querySelector('#btn-open-tracker-config');
  if (configBtn) {
    configBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openHabitTrackerConfigModal(updateWidgetUI);
    });
  }
}

function openHabitTrackerConfigModal(onSaveCallback) {
  const modal = document.getElementById('tracker-modal');
  if (!modal) return;

  const data = getHabitTrackerData();

  // Populate inputs
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val ?? 0;
  };

  setVal('cfg-ay-days', data.ay.daysSince);
  setVal('cfg-ay-24', data.ay.h24);
  setVal('cfg-ay-48', data.ay.h48);
  setVal('cfg-ay-72', data.ay.h72);

  setVal('cfg-lec-read', data.lec.daysRead);
  setVal('cfg-lec-missed', data.lec.daysMissed);
  setVal('cfg-lec-pages', data.lec.lastPages);
  setVal('cfg-lec-days', data.lec.daysSince);

  setVal('cfg-am-5', data.am.slot5to6);
  setVal('cfg-am-6', data.am.slot6to7);
  setVal('cfg-am-late', data.am.missed);

  setVal('cfg-z-clean', data.z.daysClean);
  setVal('cfg-z-consumed', data.z.daysConsumed);

  setVal('cfg-fri-cold', data.fri.coldDays);
  setVal('cfg-fri-missed', data.fri.missedDays);

  setVal('cfg-ik-done', data.ik.doneDays);
  setVal('cfg-ik-missed', data.ik.missedDays);

  setVal('cfg-a-clean', data.a.cleanDays);
  setVal('cfg-a-target', data.a.targetDays);

  setVal('cfg-e-ret', data.e.retentionDays);
  setVal('cfg-e-noporn', data.e.pornFreeDays);
  setVal('cfg-e-ejac', data.e.ejaculations);

  setVal('cfg-s-days', data.s.days);

  modal.classList.add('show');

  const closeModal = () => {
    modal.classList.remove('show');
  };

  document.getElementById('tracker-modal-close')?.addEventListener('click', closeModal, { once: true });
  document.getElementById('tracker-modal-cancel')?.addEventListener('click', closeModal, { once: true });

  // Reset defaults button
  const resetBtn = document.getElementById('btn-reset-tracker-defaults');
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (confirm('¿Restaurar todas las cifras a los valores iniciales de tu pizarra?')) {
        resetHabitTrackerDefaults();
        closeModal();
        if (onSaveCallback) onSaveCallback();
      }
    };
  }

  // Form submit
  const form = document.getElementById('tracker-config-form');
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const getNum = (id) => parseInt(document.getElementById(id)?.value) || 0;

      const updated = {
        ay: {
          daysSince: getNum('cfg-ay-days'),
          h24: getNum('cfg-ay-24'),
          h48: getNum('cfg-ay-48'),
          h72: getNum('cfg-ay-72')
        },
        lec: {
          daysSince: getNum('cfg-lec-days'),
          daysRead: getNum('cfg-lec-read'),
          daysMissed: getNum('cfg-lec-missed'),
          lastPages: getNum('cfg-lec-pages')
        },
        am: {
          slot5to6: getNum('cfg-am-5'),
          slot6to7: getNum('cfg-am-6'),
          missed: getNum('cfg-am-late')
        },
        z: {
          daysClean: getNum('cfg-z-clean'),
          daysConsumed: getNum('cfg-z-consumed')
        },
        fri: {
          coldDays: getNum('cfg-fri-cold'),
          missedDays: getNum('cfg-fri-missed')
        },
        ik: {
          doneDays: getNum('cfg-ik-done'),
          missedDays: getNum('cfg-ik-missed')
        },
        a: {
          cleanDays: getNum('cfg-a-clean'),
          targetDays: getNum('cfg-a-target') || 90,
          missedDays: 0
        },
        e: {
          retentionDays: getNum('cfg-e-ret'),
          pornFreeDays: getNum('cfg-e-noporn'),
          ejaculations: getNum('cfg-e-ejac')
        },
        s: {
          days: getNum('cfg-s-days')
        }
      };

      saveHabitTrackerData(updated);
      closeModal();
      if (onSaveCallback) onSaveCallback();
    };
  }
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
      const trackerData = getHabitTrackerData();

      container.innerHTML = `
        <div class="backlog-selection-layout">
          
          <!-- COLUMNA IZQUIERDA: HERO TIMEBLOCKING + BIO-TRACKER GAMIFICADO -->
          <div class="backlog-selection-left">
            
            <!-- RECUADRO 1: TIMEBLOCKING HERO -->
            <a href="#backlog/personal" class="backlog-hero-card">
              <div class="hero-card-header-compact">
                <div class="hero-card-icon-box">
                  <span class="hero-icon-clock">⏱️</span>
                </div>
                <div class="hero-card-content">
                  <h3 class="hero-card-title">TIMEBLOCKING</h3>
                  <p class="hero-card-desc">Timeblocking diario, 3 indispensables M.I.T. y rutina circadiana.</p>
                </div>
              </div>
              <button type="button" class="btn-hero-enter">Entrar a Timeblocking</button>
            </a>

            <!-- RECUADRO 2: BIO-TRACKER GAMIFICADO (9 MÉTRICAS) -->
            ${renderHabitTrackerHTML(trackerData)}

          </div>

          <!-- COLUMNA DERECHA: 2x2 GRID DE TABLEROS EQUITATIVOS -->
          <div class="backlog-selection-right">
            
            <!-- 1. TABLERO QUARZ -->
            <a href="#backlog/quarz" class="selection-unit-card">
              <div class="unit-card-icon-box">
                <img src="/assets/quarz/QUARZ_3D_Cuarzo_Vertical_QZ-removebg-preview.png" alt="QUARZ" class="unit-quarz-logo" />
              </div>
              <div class="unit-card-text">
                <h4 class="unit-card-title">TABLERO QUARZ</h4>
                <p class="unit-card-desc">Gobernanza estratégica, decisiones de holding y prioridades corporativas de QUARZ Group.</p>
              </div>
              <button type="button" class="btn-unit-enter">Entrar a Quarz</button>
            </a>

            <!-- 2. TABLERO ZENTRY -->
            <a href="#backlog/zentry" class="selection-unit-card">
              <div class="unit-card-icon-box">
                <span class="unit-zentry-z">Z</span>
              </div>
              <div class="unit-card-text">
                <h4 class="unit-card-title">TABLERO ZENTRY</h4>
                <p class="unit-card-desc">Roadmap comercial, arquitectura técnica MVP, prospectos y ecosistema ZentryOS.</p>
              </div>
              <button type="button" class="btn-unit-enter">Entrar a Zentry</button>
            </a>

            <!-- 3. DIARIO NOCTURNO (FULL TAB JOURNAL) -->
            <a href="#backlog/journal" class="selection-unit-card">
              <div class="unit-card-icon-box">
                <span class="unit-journal-icon" style="font-size: 26px;">📖</span>
              </div>
              <div class="unit-card-text">
                <h4 class="unit-card-title">DIARIO NOCTURNO</h4>
                <p class="unit-card-desc">Bitácora de pensamiento estratégico, avances diarios y reflexión nocturna integral.</p>
              </div>
              <button type="button" class="btn-unit-enter">Entrar a Journal</button>
            </a>

            <!-- 4. TABLERO PERSONAL -->
            <a href="#backlog/personal-board" class="selection-unit-card">
              <div class="unit-card-icon-box">
                <span class="unit-personal-icon">👤</span>
              </div>
              <div class="unit-card-text">
                <h4 class="unit-card-title">TABLERO PERSONAL</h4>
                <p class="unit-card-desc">Tus tareas individuales, notas y objetivos personales.</p>
              </div>
              <button type="button" class="btn-unit-enter">Entrar a Personal</button>
            </a>

          </div>

        </div>
      `;

      setupHabitTrackerEvents(container);
      return;
    }

    // Journal Full Page mode → Dedicated Full-tab Journal Workspace
    if (state.backlogMode === 'journal') {
      renderJournalFullPage(container);
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
          <a href="#precierres" class="demobook-card-link">
            <div class="demobook-card-minimal">
              <div class="demobook-card-content">
                <span class="demobook-card-icon">📑</span>
                <span class="demobook-card-title">Manual de Pre-Cierres</span>
              </div>
              <span class="demobook-card-arrow">➔</span>
            </div>
          </a>
        </div>
      </div>
    `;
  },

  // 6.2. Manual de Pre-Cierres View
  precierres: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('minimal-view');

    document.getElementById('page-title').textContent = 'Manual de Pre-Cierres';
    document.getElementById('page-icon').textContent = '🏷️';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    container.innerHTML = `
      <div class="precierres-container">
        <div class="precierres-header-bar">
          <div>
            <h2 class="precierres-title">Arsenal Dialéctico de Pre-Cierres Comerciales</h2>
            <p class="precierres-subtitle">Estructuras psicológicas y guiones de alto impacto para demolición de objeciones durante la presentación de ZentryOS.</p>
          </div>
          <a href="#demobook" class="btn btn-secondary" style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
            <span>← Volver al Demobook</span>
          </a>
        </div>

        <div class="precierres-catalog-grid">
          
          <!-- PRE-CIERRE 01: REMATE DE HORAS -->
          <div class="precierre-main-card glass-panel">
            <div class="precierre-card-top">
              <div class="precierre-badge-wrap">
                <span class="precierre-id-badge">PRE-CIERRE #01</span>
                <span class="precierre-status-badge hot">🔥 ALTA CONVERSIÓN</span>
              </div>
              <span class="precierre-target-tag">Objeción: "¿Por qué cuesta?" / "¿Por qué no dejarlo en TikTok/YouTube gratis?"</span>
            </div>

            <div class="precierre-hero-grid">
              <div class="precierre-hero-img-box">
                <img src="/assets/remate-horas.jpg" alt="Remate de Horas" class="precierre-img" />
                <div class="precierre-img-caption">⏳ La Paradoja del Tiempo vs. El Negocio de META</div>
              </div>
              <div class="precierre-hero-stats">
                <div class="precierre-stat-pill">
                  <span class="stat-icon">💰</span>
                  <div>
                    <strong class="stat-number">+S/ 412 Millones</strong>
                    <span class="stat-desc">Facturación de META en Perú ($110M USD/año)</span>
                  </div>
                </div>
                <div class="precierre-stat-pill">
                  <span class="stat-icon">👥</span>
                  <div>
                    <strong class="stat-number">31 Millones</strong>
                    <span class="stat-desc">Usuarios peruanos activos drenados diariamente</span>
                  </div>
                </div>
                <div class="precierre-stat-pill danger">
                  <span class="stat-icon">⏱️</span>
                  <div>
                    <strong class="stat-number">1 Céntimo / Hora</strong>
                    <span class="stat-desc">Lo que META gana de ti (S/ 14.00 al año)</span>
                  </div>
                </div>
                <div class="precierre-stat-pill gold">
                  <span class="stat-icon">💎</span>
                  <div>
                    <strong class="stat-number">S/ 14,690 PEN</strong>
                    <span class="stat-desc">Valor productivo real de las horas que regalas</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Guion Dialéctico Completo -->
            <div class="precierre-script-section">
              <div class="script-header">
                <h3 style="font-size: 14.5px; color: #0f172a; margin: 0;">📜 Guion Dialéctico Paso a Paso (Para el Asesor)</h3>
                <button type="button" class="btn-copy-script" onclick="navigator.clipboard.writeText(document.getElementById('script-remate-text').innerText); alert('✅ Guion copiado al portapapeles');">📋 Copiar Guion</button>
              </div>

              <div id="script-remate-text" class="precierre-script-content">
                <div class="script-block question">
                  <span class="script-role">🗣️ Asesor:</span>
                  <p><em>"¿Alguien sabe por qué las redes sociales son gratis?"</em></p>
                  <span class="script-expected">➔ Esperar respuesta del padre (Sí/No).</span>
                </div>

                <div class="script-block narrative">
                  <span class="script-role">🗣️ Asesor:</span>
                  <p><em>"Es por los anuncios. META no te cobra con dinero, <strong>te cobra con la atención de tus hijos</strong>. Se los pongo así:"</em></p>
                </div>

                <div class="script-block paradox">
                  <span class="script-role">💡 La Paradoja del Millón de Dólares:</span>
                  <p><strong>"Si yo te pagara un millón de dólares con la única condición de que mañana morirás, ¿los aceptarías?"</strong></p>
                  <span class="script-expected">➔ Respuesta unánime del padre: <strong>NO</strong>.</span>
                </div>

                <div class="script-block punchline">
                  <span class="script-role">🎯 Anclaje de Valor:</span>
                  <p><em>"Eso quiere decir que para ti el resto de tus días y el futuro de tus hijos valen mucho más que un millón, ¿verdad?"</em></p>
                  <span class="script-expected">➔ Respuesta: <strong>SÍ</strong>.</span>
                </div>

                <div class="script-block breakdown">
                  <span class="script-role">📊 Demolición Numérica (La Ecuación del Drenaje):</span>
                  <p><em>"Pero ¿sabías que META y las plataformas de consumo hacen que esos días valgan menos? Te lo explico:<br><br>
                  Meta factura a nivel global más de 200,000 millones de dólares. En el Perú nada más, se estima que facturan unos <strong>110 millones de dólares al año (más de 412 millones de soles)</strong>, generados por aproximadamente 31 millones de usuarios activos. Eso quiere decir que, por persona, Meta gana unos <strong>14 soles al año</strong>.<br><br>
                  Si Meta gana apenas <strong>1 céntimo de sol por cada hora</strong> que pasas en su pantalla, significa que está drenando el verdadero valor productivo de tu familia. Si el ingreso promedio urbano es de unos 2,000 soles al mes, en el acumulado del tiempo que les regalas, <strong>META te está comprando 14,690 soles del valor real de tus horas a cambio de solo 14 soles</strong>."</em></p>
                </div>

                <div class="script-block closing">
                  <span class="script-role">🔥 Conclusión Inapelable:</span>
                  <p><strong>"Básicamente, estás rematando el activo más valioso de tus hijos —que es su tiempo y desarrollo neuronal— para hacer millonario a otro. ZentryOS devuelve el control absoluto a las manos del padre."</strong></p>
                </div>
              </div>

              <div class="precierre-actions-bar" style="margin-top: 14px;">
                <a href="https://recursos-venta.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 12px; display: inline-flex; align-items: center; gap: 6px; text-decoration: none;">
                  <span>🚀 Probar en Diapositivas Interactivas (Slide 4)</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Próximos Pre-Cierres Placeholder -->
          <div class="precierre-placeholder-grid">
            <div class="precierre-mini-card">
              <div class="mini-card-header">
                <span class="mini-id">PRE-CIERRE #02</span>
                <span class="mini-status">En Desarrollo</span>
              </div>
              <h4>La Analogía del Excel y la Personalización</h4>
              <p>Cómo justificar el valor de una licencia de software frente al costo de contratar tutores privados.</p>
            </div>

            <div class="precierre-mini-card">
              <div class="mini-card-header">
                <span class="mini-id">PRE-CIERRE #03</span>
                <span class="mini-status">En Desarrollo</span>
              </div>
              <h4>El Costo Invisible del Déficit de Atención</h4>
              <p>La ecuación del rendimiento escolar y el costo futuro de no intervenir a tiempo.</p>
            </div>
          </div>

        </div>
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

  // 6. Tools View (QZ CLOUD REMOTE SESSION COMPANION & AGENT COCKPIT)
  herramientas: () => {
    const workspace = document.querySelector('.workspace');
    if (workspace) {
      workspace.classList.add('full-width-view');
    }

    document.getElementById('page-banner').style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)';
    document.getElementById('page-icon').textContent = '🤖';
    document.getElementById('page-title').textContent = 'QZ AGENT COCKPIT';
    document.getElementById('properties-block').style.display = 'none';

    const container = document.getElementById('workspace-content');
    const todayStr = new Date().toISOString().split('T')[0];

    container.innerHTML = `
      <div class="cockpit-layout-grid">
        
        <!-- ============================================================== -->
        <!-- COLUMNA PRINCIPAL (70%): CHATBOT DE SESIONES Y CONTROL REMOTO -->
        <!-- ============================================================== -->
        <div class="session-cockpit-container glass-panel">
          
          <!-- Top Telemetry Bar -->
          <div class="session-top-header">
            <div class="session-title-block">
              <div class="session-icon">🤖</div>
              <div>
                <div class="session-main-title">
                  <span id="current-session-title-display">Sesión Principal</span>
                  <span id="current-session-id-pill" class="session-id-tag">#live</span>
                </div>
                <div class="session-subtitle">
                  <span id="cockpit-bridge-badge" class="bridge-status-mini standby">
                    <span class="status-dot"></span> Bridge PC: <strong id="bridge-status-text">Detectando...</strong>
                  </span>
                </div>
              </div>
            </div>

            <div class="session-header-actions">
              <select id="cockpit-model-select" class="cockpit-model-select" title="Motor de Inteligencia (Créditos GCP)">
                <option value="gemini-2.5-flash">⚡ Gemini 2.5 Flash (GCP)</option>
                <option value="gemini-2.5-pro">🧠 Gemini 2.5 Pro (GCP)</option>
                <option value="ssot-local">📖 Motor SSOT Local</option>
              </select>
              <button type="button" id="btn-toggle-sessions-list" class="btn-cockpit-icon" title="Ver Historial de Sesiones">📋 Sesiones</button>
              <button type="button" id="btn-new-session" class="btn-cockpit-primary">＋ Nueva Sesión</button>
            </div>
          </div>

          <!-- Main Split View: Sessions Sidebar (Collapsible) + Chat + Session Inspector -->
          <div class="session-body-grid">
            
            <!-- 1. Sessions Drawer / List -->
            <div id="sessions-drawer" class="sessions-drawer">
              <div class="sessions-drawer-header">
                <span style="font-weight: 700; font-size: 12px; color: #0f172a;">Historial de Sesiones</span>
                <button type="button" id="btn-close-sessions-drawer" class="btn-drawer-close">&times;</button>
              </div>
              <div id="sessions-list-container" class="sessions-list-container">
                <!-- Session items rendered dynamically -->
              </div>
            </div>

            <!-- 2. Chat Stream & Conversation Feed -->
            <div class="session-chat-section">
              
              <!-- Messages Feed -->
              <div id="session-chat-feed" class="session-chat-feed">
                <!-- Messages rendered dynamically -->
              </div>

              <!-- Chat Input Box & Action Controls -->
              <div class="session-input-wrapper">
                <form id="session-chat-form" class="session-chat-form">
                  <div class="session-input-controls">
                    <button type="button" id="btn-input-screenshot" class="btn-input-tool" title="Tomar Captura de PC y adjuntar a la sesión">📸 Captura PC</button>
                    <button type="button" id="btn-input-terminal-cmd" class="btn-input-tool" title="Ejecutar comando en la terminal de tu PC">💻 Ejecutar Comando</button>
                    <button type="button" id="btn-open-gcp-settings" class="btn-input-tool" title="Configuración de API Key GCP">⚙️ Config GCP</button>
                  </div>
                  <div class="session-input-row">
                    <textarea id="session-chat-input" rows="1" placeholder="Escribe tu consulta, instrucción o comando para el agente..." autocomplete="off"></textarea>
                    <button type="submit" id="btn-send-message" class="btn-send-message" title="Enviar mensaje">Enviar ⚡</button>
                  </div>
                </form>
              </div>

            </div>

            <!-- 3. Session Inspector (Right Tabs: Artefactos, Media, To-Do) -->
            <div class="session-inspector-panel">
              <div class="inspector-tabs">
                <button type="button" class="inspector-tab-btn active" data-tab="artifacts">📑 Artefactos (<span id="inspector-count-artifacts">0</span>)</button>
                <button type="button" class="inspector-tab-btn" data-tab="media">📸 Media (<span id="inspector-count-media">0</span>)</button>
                <button type="button" class="inspector-tab-btn" data-tab="todos">✅ To-Do (<span id="inspector-count-todos">0</span>)</button>
              </div>

              <div class="inspector-content">
                <!-- Tab: Artefactos & Markdowns vinculados a esta sesión -->
                <div id="inspector-panel-artifacts" class="inspector-tab-pane active">
                  <div id="session-artifacts-list" class="inspector-items-list">
                    <!-- Loaded dynamically -->
                  </div>
                </div>

                <!-- Tab: Capturas & Visual Media vinculadas a esta sesión -->
                <div id="inspector-panel-media" class="inspector-tab-pane">
                  <div id="session-media-list" class="inspector-media-grid">
                    <!-- Loaded dynamically -->
                  </div>
                </div>

                <!-- Tab: Tareas y To-Dos vinculados a esta sesión -->
                <div id="inspector-panel-todos" class="inspector-tab-pane">
                  <div id="session-todos-list" class="inspector-todos-list">
                    <!-- Loaded dynamically -->
                  </div>
                  <button type="button" id="btn-add-session-todo" class="btn-add-todo">＋ Agregar Tarea</button>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- Markdown Viewer Modal for Artifacts -->
      <div id="artifact-viewer-modal" class="modal-overlay">
        <div class="modal-content glass-modal" style="max-width: 720px; max-height: 85vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h2 id="artifact-modal-title" class="modal-task-id" style="font-size: 16px;">📑 Vista de Artefacto</h2>
            <button id="artifact-modal-close" class="modal-close-btn">&times;</button>
          </div>
          <div id="artifact-modal-body" class="modal-body" style="overflow-y: auto; flex: 1; padding: 16px; font-size: 13px; line-height: 1.6;">
            <!-- Rendered Markdown -->
          </div>
          <div class="modal-actions" style="margin-top: 10px; padding-top: 10px;">
            <button type="button" id="btn-copy-artifact-content" class="btn btn-secondary" style="font-size: 12px;">Copiar Contenido</button>
            <button type="button" id="btn-close-artifact-modal" class="btn btn-primary" style="font-size: 12px;">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- GCP Settings Modal (QUARZ Group Vertex AI) -->
      <div id="gcp-settings-modal" class="modal-overlay">
        <div class="modal-content glass-modal" style="max-width: 500px;">
          <div class="modal-header">
            <h2 class="modal-task-id" style="font-size: 16px;">⚙️ Configuración GCP (quarz-group)</h2>
            <button id="gcp-modal-close" class="modal-close-btn">&times;</button>
          </div>
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px; font-size: 12px; color: #334155;">
              <strong style="color: #0f172a;">🏢 Facturación Empresarial QUARZ Group</strong>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b; line-height: 1.45;">
                Conectado directamente a la infraestructura de <strong>Google Cloud Platform</strong> del proyecto <code>quarz-group</code> (Vertex AI nativo). Los modelos recomendados son <strong>Gemini 2.5 Flash</strong> y <strong>Gemini 2.5 Pro</strong>.
              </p>
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">GCP Project ID:</label>
              <input type="text" id="modal-gcp-project-id" value="quarz-group" style="width: 100%; padding: 8px 10px; font-family: monospace; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; display: block; margin-bottom: 4px;">Google Cloud API Key (o Token Vertex AI):</label>
              <input type="password" id="modal-gcp-api-key" placeholder="Pega tu clave AIzaSy..." style="width: 100%; padding: 8px 10px; font-family: monospace; font-size: 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box;">
            </div>
            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" id="btn-test-gcp-connection" class="btn btn-secondary" style="flex: 1; padding: 9px; font-size: 11.5px; border-radius: 6px; border: 1px solid #cbd5e1; background: #f1f5f9; color: #0f172a; cursor: pointer; font-weight: 600;">⚡ Probar Conexión</button>
              <button type="button" id="btn-save-modal-gcp-settings" class="btn btn-primary" style="flex: 1; padding: 9px; font-size: 11.5px; border-radius: 6px; background: #0f172a; color: white; cursor: pointer; font-weight: 600;">Guardar y Conectar</button>
            </div>
            <div id="gcp-connection-status" style="font-size: 11.5px; display: none; padding: 8px 10px; border-radius: 6px; margin-top: 2px;"></div>
          </div>
        </div>
      </div>
    `;

    // ==============================================================================
    // SESSION MANAGER & CHATBOT ENGINE LOGIC
    // ==============================================================================

    const SESSIONS_STORAGE_KEY = 'qz_agent_sessions_v1';
    let sessionsState = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY) || '[]');
    let currentSessionId = localStorage.getItem('qz_active_session_id') || '';

    // Initialize default session if none exists
    if (!sessionsState || sessionsState.length === 0) {
      const initSession = {
        id: 'ses_' + Date.now().toString(36),
        title: 'Sesión Principal (Laptop & Mobile)',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg_welcome',
            sender: 'agent',
            text: 'Hola Jose Angel. He inicializado tu sesión de orquestación en **QZ-Hub**.\n\nTodo lo que generes en esta sesión (archivos `.md`, capturas de pantalla, herramientas ejecutadas y tareas) quedará vinculado a este ID de sesión para que lo revises desde tu celular o laptop.',
            timestamp: new Date().toISOString()
          }
        ],
        artifacts: [
          {
            id: 'art_canon',
            name: 'CANON.md',
            title: 'CANON — Single Source of Truth',
            content: `# 📜 CANON.md — Single Source of Truth\n\n### 🎯 Meta Financiera 31 de Agosto\n- **Meta Total:** S/ 4,000.00 PEN\n- **Caja Actual:** S/ 770.00 PEN\n- **Brecha a Generar:** S/ 3,230.00 PEN\n\n### 📊 Embudo Royal Prestige\n- **Llamadas Frías (12-2pm):** 40 diarias (SIM 933709385).\n- **Ratio:** 20 llamadas conversadas = 1 demo.\n- **Ratio de Cierre:** 4 demos = 1 venta (Comisión S/ 1,010.59).\n\n### ☄️ QUARZ Group / ZentryOS\n- **Licencias:** $1,000 USD por despliegue.\n- **Ganancia Personal (60%):** S/ 1,906.78.`
          }
        ],
        media: [],
        todos: []
      };
      sessionsState = [initSession];
      currentSessionId = initSession.id;
      saveSessions();
    }

    if (!currentSessionId || !sessionsState.find(s => s.id === currentSessionId)) {
      currentSessionId = sessionsState[0].id;
      localStorage.setItem('qz_active_session_id', currentSessionId);
    }

    function getActiveSession() {
      return sessionsState.find(s => s.id === currentSessionId) || sessionsState[0];
    }

    function saveSessions() {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessionsState));
      localStorage.setItem('qz_active_session_id', currentSessionId);
    }

    // UI Elements
    const chatFeed = document.getElementById('session-chat-feed');
    const chatForm = document.getElementById('session-chat-form');
    const chatInput = document.getElementById('session-chat-input');
    const modelSelect = document.getElementById('cockpit-model-select');
    const titleDisplay = document.getElementById('current-session-title-display');
    const idTag = document.getElementById('current-session-id-pill');
    const sessionsList = document.getElementById('sessions-list-container');
    const sessionsDrawer = document.getElementById('sessions-drawer');

    function renderSessionsDrawer() {
      if (!sessionsList) return;
      sessionsList.innerHTML = '';

      sessionsState.forEach(ses => {
        const item = document.createElement('div');
        const isActive = ses.id === currentSessionId;
        item.className = `session-drawer-item${isActive ? ' active' : ''}`;
        
        const lastMsg = ses.messages && ses.messages.length > 0 ? ses.messages[ses.messages.length - 1].text : 'Nueva sesión';
        const snippet = (lastMsg || '').replace(/\n/g, ' ').slice(0, 40);

        item.innerHTML = `
          <div class="session-item-header">
            <span class="session-item-title">${ses.title || 'Sesión'}</span>
            <span class="session-item-date">${ses.createdAt ? new Date(ses.createdAt).toLocaleDateString([], {month: 'short', day: 'numeric'}) : ''}</span>
          </div>
          <div class="session-item-snippet">${snippet}...</div>
        `;

        item.addEventListener('click', () => {
          currentSessionId = ses.id;
          saveSessions();
          sessionsDrawer.classList.remove('open');
          renderCurrentSession();
        });

        sessionsList.appendChild(item);
      });
    }

    function renderCurrentSession() {
      const session = getActiveSession();
      if (!session) return;

      if (titleDisplay) titleDisplay.textContent = session.title || 'Sesión';
      if (idTag) idTag.textContent = `#${session.id.slice(0, 8)}`;

      // Render Messages
      if (chatFeed) {
        chatFeed.innerHTML = '';
        (session.messages || []).forEach(msg => {
          appendMessageToDOM(msg);
        });
        chatFeed.scrollTop = chatFeed.scrollHeight;
      }

      // Render Inspector (Artifacts, Media, Todos)
      renderSessionInspector(session);
      renderSessionsDrawer();
    }

    function appendMessageToDOM(msg) {
      if (!chatFeed) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message-row ${msg.sender}`;

      const isUser = msg.sender === 'user';
      const formattedContent = isUser 
        ? msg.text.replace(/\n/g, '<br>')
        : (typeof mdToHtml === 'function' ? mdToHtml(msg.text) : msg.text.replace(/\n/g, '<br>'));

      // Build inline tools execution badges if any
      let toolsHtml = '';
      if (msg.tools && Array.isArray(msg.tools) && msg.tools.length > 0) {
        toolsHtml = `<div class="msg-tools-used">` + msg.tools.map(t => `
          <span class="tool-tag">⚡ ${t.name}: <em>${t.summary || ''}</em></span>
        `).join('') + `</div>`;
      }

      // Build inline artifact badge if any
      let artifactHtml = '';
      if (msg.artifact) {
        artifactHtml = `
          <div class="msg-inline-artifact" data-art-id="${msg.artifact.id || ''}">
            <span>📑 Artefacto Generado: <strong>${msg.artifact.name || 'documento.md'}</strong></span>
            <button type="button" class="btn-view-art-inline">Ver Artefacto ➔</button>
          </div>
        `;
      }

      msgDiv.innerHTML = `
        <div class="chat-bubble ${isUser ? 'bubble-user' : 'bubble-agent'}">
          <div class="bubble-sender">${isUser ? '👤 Tú' : '🤖 QZ Agent'}</div>
          <div class="bubble-text">${formattedContent}</div>
          ${toolsHtml}
          ${artifactHtml}
          <div class="bubble-time">${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : ''}</div>
        </div>
      `;

      msgDiv.querySelector('.btn-view-art-inline')?.addEventListener('click', () => {
        openArtifactModal(msg.artifact);
      });

      chatFeed.appendChild(msgDiv);
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function renderSessionInspector(session) {
      const artCount = document.getElementById('inspector-count-artifacts');
      const medCount = document.getElementById('inspector-count-media');
      const todoCount = document.getElementById('inspector-count-todos');

      const artList = document.getElementById('session-artifacts-list');
      const medList = document.getElementById('session-media-list');
      const todoList = document.getElementById('session-todos-list');

      const artifacts = session.artifacts || [];
      const media = session.media || [];
      const todos = session.todos || [];

      if (artCount) artCount.textContent = artifacts.length;
      if (medCount) medCount.textContent = media.length;
      if (todoCount) todoCount.textContent = todos.length;

      // 1. Artifacts List
      if (artList) {
        if (artifacts.length === 0) {
          artList.innerHTML = '<div class="inspector-empty-state">No hay artefactos en esta sesión aún.</div>';
        } else {
          artList.innerHTML = artifacts.map((art, idx) => `
            <div class="artifact-card-item" data-index="${idx}">
              <div class="art-card-left">
                <span class="art-icon">📑</span>
                <div>
                  <div class="art-name">${art.name || 'documento.md'}</div>
                  <div class="art-desc">${art.title || 'Documento Markdown'}</div>
                </div>
              </div>
              <button type="button" class="btn-art-open">Ver ➔</button>
            </div>
          `).join('');

          artList.querySelectorAll('.artifact-card-item').forEach(el => {
            el.addEventListener('click', () => {
              const idx = parseInt(el.dataset.index);
              openArtifactModal(artifacts[idx]);
            });
          });
        }
      }

      // 2. Media List
      if (medList) {
        if (media.length === 0) {
          medList.innerHTML = '<div class="inspector-empty-state">Sin capturas de pantalla en esta sesión.</div>';
        } else {
          medList.innerHTML = media.map(m => `
            <div class="media-thumb-card" onclick="window.open('${m.url}', '_blank')">
              <img src="${m.url}" alt="Screenshot" />
              <div class="media-thumb-label">${m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : 'Captura'}</div>
            </div>
          `).join('');
        }
      }

      // 3. Todos List
      if (todoList) {
        if (todos.length === 0) {
          todoList.innerHTML = '<div class="inspector-empty-state">Sin tareas pendientes en esta sesión.</div>';
        } else {
          todoList.innerHTML = todos.map((t, idx) => `
            <div class="session-todo-item">
              <input type="checkbox" ${t.done ? 'checked' : ''} data-index="${idx}" class="todo-check" />
              <span style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.text}</span>
            </div>
          `).join('');

          todoList.querySelectorAll('.todo-check').forEach(chk => {
            chk.addEventListener('change', (e) => {
              const idx = parseInt(e.target.dataset.index);
              session.todos[idx].done = e.target.checked;
              saveSessions();
              renderSessionInspector(session);
            });
          });
        }
      }
    }

    // Modal Artifact Viewer
    let currentViewingArtifact = null;
    function openArtifactModal(artifact) {
      if (!artifact) return;
      currentViewingArtifact = artifact;
      const modal = document.getElementById('artifact-viewer-modal');
      const title = document.getElementById('artifact-modal-title');
      const body = document.getElementById('artifact-modal-body');

      if (title) title.textContent = `📑 ${artifact.name || 'Artefacto'}`;
      if (body) {
        const content = artifact.content || '';
        body.innerHTML = (typeof mdToHtml === 'function') ? mdToHtml(content) : content.replace(/\n/g, '<br>');
      }
      if (modal) modal.classList.add('show');
    }

    document.getElementById('artifact-modal-close')?.addEventListener('click', () => {
      document.getElementById('artifact-viewer-modal')?.classList.remove('show');
    });
    document.getElementById('btn-close-artifact-modal')?.addEventListener('click', () => {
      document.getElementById('artifact-viewer-modal')?.classList.remove('show');
    });
    document.getElementById('btn-copy-artifact-content')?.addEventListener('click', () => {
      if (currentViewingArtifact && currentViewingArtifact.content) {
        navigator.clipboard.writeText(currentViewingArtifact.content);
        alert('Contenido copiado al portapapeles.');
      }
    });

    // Inspector Tabs Switching
    document.querySelectorAll('.inspector-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.inspector-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.inspector-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`inspector-panel-${tab}`)?.classList.add('active');
      });
    });

    // Sessions Drawer Toggle
    document.getElementById('btn-toggle-sessions-list')?.addEventListener('click', () => {
      sessionsDrawer?.classList.toggle('open');
    });
    document.getElementById('btn-close-sessions-drawer')?.addEventListener('click', () => {
      sessionsDrawer?.classList.remove('open');
    });

    // New Session Creation
    document.getElementById('btn-new-session')?.addEventListener('click', () => {
      const sessionTitle = prompt('Nombre o tema de la nueva sesión:', `Sesión ${sessionsState.length + 1}`);
      if (!sessionTitle) return;

      const newSes = {
        id: 'ses_' + Date.now().toString(36),
        title: sessionTitle.trim(),
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg_welcome_' + Date.now(),
            sender: 'agent',
            text: `Sesión **"${sessionTitle.trim()}"** iniciada. ¿En qué podemos avanzar hoy?`,
            timestamp: new Date().toISOString()
          }
        ],
        artifacts: [],
        media: [],
        todos: []
      };

      sessionsState.unshift(newSes);
      currentSessionId = newSes.id;
      saveSessions();
      sessionsDrawer?.classList.remove('open');
      renderCurrentSession();
    });

    // Add Session Todo Button
    document.getElementById('btn-add-session-todo')?.addEventListener('click', () => {
      const todoText = prompt('Nueva tarea o to-do para esta sesión:');
      if (!todoText) return;
      const session = getActiveSession();
      if (!session.todos) session.todos = [];
      session.todos.push({ id: 'todo_' + Date.now(), text: todoText.trim(), done: false });
      saveSessions();
      renderSessionInspector(session);
    });

    // GCP Settings Modal
    const gcpModal = document.getElementById('gcp-settings-modal');
    const modalApiKey = document.getElementById('modal-gcp-api-key');
    const modalProjectId = document.getElementById('modal-gcp-project-id');

    document.getElementById('btn-open-gcp-settings')?.addEventListener('click', () => {
      if (modalApiKey) modalApiKey.value = localStorage.getItem('gemini_api_key') || '';
      if (modalProjectId) modalProjectId.value = localStorage.getItem('gemini_project_id') || 'quarz-group';
      const statusDiv = document.getElementById('gcp-connection-status');
      if (statusDiv) statusDiv.style.display = 'none';
      if (gcpModal) gcpModal.classList.add('show');
    });

    document.getElementById('gcp-modal-close')?.addEventListener('click', () => {
      gcpModal?.classList.remove('show');
    });

    document.getElementById('btn-test-gcp-connection')?.addEventListener('click', async () => {
      const statusDiv = document.getElementById('gcp-connection-status');
      const testKey = (modalApiKey ? modalApiKey.value : '').trim();
      const testProj = (modalProjectId ? modalProjectId.value : '').trim() || 'quarz-group';
      
      if (statusDiv) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#fef3c7';
        statusDiv.style.color = '#92400e';
        statusDiv.style.border = '1px solid #fde68a';
        statusDiv.textContent = `⏳ Probando conexión con Vertex AI en proyecto GCP '${testProj}'...`;
      }

      try {
        const reply = await callVertexGemini('Responde únicamente: "Conexión exitosa con Vertex AI en QUARZ Group."', '', 'gemini-2.5-flash', testKey);
        if (statusDiv) {
          statusDiv.style.background = '#d1fae5';
          statusDiv.style.color = '#065f46';
          statusDiv.style.border = '1px solid #a7f3d0';
          statusDiv.textContent = `✅ ${reply}`;
        }
      } catch (err) {
        if (statusDiv) {
          statusDiv.style.background = '#fee2e2';
          statusDiv.style.color = '#991b1b';
          statusDiv.style.border = '1px solid #fecaca';
          statusDiv.textContent = `⚠️ ${err.message}`;
        }
      }
    });

    document.getElementById('btn-save-modal-gcp-settings')?.addEventListener('click', () => {
      const key = (modalApiKey ? modalApiKey.value : '').trim();
      const proj = (modalProjectId ? modalProjectId.value : '').trim() || 'quarz-group';
      localStorage.setItem('gemini_api_key', key);
      localStorage.setItem('gemini_project_id', proj);
      gcpModal?.classList.remove('show');
      alert(`✅ Configuración de Google Cloud guardada para el proyecto '${proj}'.`);
    });

    // Tool: Remote Screenshot Button (Attaches to Active Session)
    document.getElementById('btn-input-screenshot')?.addEventListener('click', async () => {
      const session = getActiveSession();
      const btn = document.getElementById('btn-input-screenshot');
      if (btn) btn.disabled = true;

      const userMsg = {
        id: 'msg_' + Date.now(),
        sender: 'user',
        text: '📸 Solicitar captura de pantalla en tiempo real a mi PC.',
        timestamp: new Date().toISOString()
      };
      session.messages.push(userMsg);
      appendMessageToDOM(userMsg);
      saveSessions();

      try {
        await sendRemoteTask('take_screenshot', {});
        const unsub = listenToLatestScreenshot((mediaDoc) => {
          if (mediaDoc && mediaDoc.data) {
            const mediaItem = {
              id: 'med_' + Date.now(),
              type: 'screenshot',
              url: mediaDoc.data,
              timestamp: mediaDoc.timestamp || new Date().toISOString()
            };
            if (!session.media) session.media = [];
            session.media.unshift(mediaItem);

            const agentMsg = {
              id: 'msg_' + Date.now() + '_res',
              sender: 'agent',
              text: '📸 **Captura de pantalla recibida de tu PC exitosamente.** Se ha guardado en la pestaña **Media** de esta sesión.',
              timestamp: new Date().toISOString(),
              tools: [{ name: 'take_screenshot', summary: 'Pantalla capturada en PC' }]
            };
            session.messages.push(agentMsg);
            appendMessageToDOM(agentMsg);
            saveSessions();
            renderSessionInspector(session);
            unsub();
          }
        });
      } catch (err) {
        alert('Error solicitando captura: ' + err.message);
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    // Tool: Remote Terminal Command Runner
    document.getElementById('btn-input-terminal-cmd')?.addEventListener('click', async () => {
      const cmd = prompt('Comando para ejecutar en tu PC remota (ej: git status, dir, python -V):');
      if (!cmd) return;
      const session = getActiveSession();

      const userMsg = {
        id: 'msg_' + Date.now(),
        sender: 'user',
        text: `💻 \`$ ${cmd.trim()}\``,
        timestamp: new Date().toISOString()
      };
      session.messages.push(userMsg);
      appendMessageToDOM(userMsg);
      saveSessions();

      try {
        await sendRemoteTask('exec_command', { command: cmd.trim() });
        const unsub = listenToRemoteTask((taskDoc) => {
          if (taskDoc && taskDoc.status === 'completed' && taskDoc.action === 'exec_command') {
            const out = (taskDoc.result?.stdout || '') + (taskDoc.result?.stderr || '');
            const agentMsg = {
              id: 'msg_' + Date.now() + '_res',
              sender: 'agent',
              text: `\`\`\`\n${out || 'Comando ejecutado sin salida.'}\n\`\`\``,
              timestamp: new Date().toISOString(),
              tools: [{ name: 'exec_command', summary: `Exit Code ${taskDoc.result?.exitCode || 0}` }]
            };
            session.messages.push(agentMsg);
            appendMessageToDOM(agentMsg);
            saveSessions();
            unsub();
          }
        });
      } catch (err) {
        alert('Error ejecutando comando: ' + err.message);
      }
    });

    // Chat Message Submission (Google Cloud Vertex AI with Session History)
    if (chatForm) {
      chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = '';

        const session = getActiveSession();
        const userMsg = {
          id: 'msg_' + Date.now(),
          sender: 'user',
          text: text,
          timestamp: new Date().toISOString()
        };
        session.messages.push(userMsg);
        appendMessageToDOM(userMsg);
        saveSessions();

        // Thinking placeholder
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = 'session-thinking-indicator';
        thinkingDiv.className = 'chat-message-row agent';
        thinkingDiv.innerHTML = `
          <div class="chat-bubble bubble-agent" style="opacity: 0.7;">
            <div class="bubble-sender">🤖 QZ Agent</div>
            <div class="bubble-text"><em>Pensando y procesando...</em></div>
          </div>
        `;
        chatFeed.appendChild(thinkingDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;

        const selectedModel = modelSelect ? modelSelect.value : 'gemini-2.5-flash';

        if (selectedModel === 'ssot-local') {
          setTimeout(() => {
            document.getElementById('session-thinking-indicator')?.remove();
            const reply = processLocalSsotQuery(text);
            const agentMsg = {
              id: 'msg_' + Date.now(),
              sender: 'agent',
              text: reply,
              timestamp: new Date().toISOString()
            };
            session.messages.push(agentMsg);
            appendMessageToDOM(agentMsg);
            saveSessions();
          }, 300);
        } else {
          try {
            // Build conversation history prompt
            const historyPrompt = (session.messages || []).slice(-6).map(m => `${m.sender === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`).join('\n\n');
            const systemPrompt = `Eres el Agente Orquestador Central de QZ-HUB y QUARZ Group (SSOT).
Estás interactuando en la sesión: "${session.title}".
Tienes acceso a todo el SSOT:
- Metas de Caja al 31 de Agosto: S/ 4,000.00 PEN (partiendo de S/ 770.00).
- Royal Prestige: 40 llamadas frías diarias de 12-2pm (SIM 933709385), ratio 20:1 a demo, 4:1 a venta (comisión S/ 1,010.59).
- Quarz ZentryOS: $1,000 USD por licencia (S/ 1,906.78 ganancia personal + S/ 1,271.19 caja empresa).
- Biohacking: Rutina 12-2pm, ayuno autofágico 48h, abastecimiento Yerbateros viernes 4:30am.

Responde de forma concisa, ejecutiva y formateada en Markdown limpio.`;

            const reply = await callVertexGemini(historyPrompt, systemPrompt, selectedModel);
            document.getElementById('session-thinking-indicator')?.remove();

            const agentMsg = {
              id: 'msg_' + Date.now(),
              sender: 'agent',
              text: reply,
              timestamp: new Date().toISOString()
            };

            // Detect if the agent generated an artifact / deliverable in markdown
            if (reply.includes('# ') && reply.length > 300) {
              const artName = `entregable_${Date.now().toString(36)}.md`;
              const newArt = {
                id: 'art_' + Date.now(),
                name: artName,
                title: 'Entregable de la Sesión',
                content: reply
              };
              if (!session.artifacts) session.artifacts = [];
              session.artifacts.unshift(newArt);
              agentMsg.artifact = newArt;
              renderSessionInspector(session);
            }

            session.messages.push(agentMsg);
            appendMessageToDOM(agentMsg);
            saveSessions();
          } catch (err) {
            document.getElementById('session-thinking-indicator')?.remove();
            console.warn('Vertex AI error:', err);
            const fallbackReply = processLocalSsotQuery(text);
            const agentMsg = {
              id: 'msg_' + Date.now(),
              sender: 'agent',
              text: `⚠️ *[Aviso GCP: ${err.message}]*\n\n${fallbackReply}`,
              timestamp: new Date().toISOString()
            };
            session.messages.push(agentMsg);
            appendMessageToDOM(agentMsg);
            saveSessions();
          }
        }
      });
    }

    // Telemetry Listener for Bridge Status
    try {
      listenToRemoteTelemetry((telemetry) => {
        const bridgeBadge = document.getElementById('cockpit-bridge-badge');
        const bridgeText = document.getElementById('bridge-status-text');

        if (!bridgeBadge || !bridgeText) return;

        if (telemetry && telemetry.status === 'online') {
          const now = Date.now();
          const lastSeenTime = telemetry.lastSeen ? new Date(telemetry.lastSeen).getTime() : now;
          const diffSec = Math.round((now - lastSeenTime) / 1000);

          if (diffSec < 35) {
            bridgeBadge.className = 'bridge-status-mini online';
            bridgeText.textContent = `En Línea (${telemetry.deviceName || 'PC'})`;
          } else {
            bridgeBadge.className = 'bridge-status-mini standby';
            bridgeText.textContent = 'Standby';
          }
        } else {
          bridgeBadge.className = 'bridge-status-mini offline';
          bridgeText.textContent = 'Desconectado';
        }
      });
    } catch(e) {}

    // Auto-resize chat textarea as user types
    chatInput?.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(100, chatInput.scrollHeight) + 'px';
    });

    // Initial render of active session
    renderCurrentSession();

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

// ==============================================================================
// MODULAR JOURNAL & DIARIO NOCTURNO SYSTEM (FIREBASE & LOCAL SYNC)
// ==============================================================================

function getJournalHistory() {
  const stored = localStorage.getItem('zentry_journal_history');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) { return []; }
  }
  return [];
}

function openJournalModal(initialDateStr) {
  const modal = document.getElementById('journal-modal');
  if (!modal) return;

  const dateInput = document.getElementById('modal-journal-date');
  const searchInput = document.getElementById('journal-search-input');
  const contentTextarea = document.getElementById('modal-journal-content');
  const activeDateLabel = document.getElementById('journal-active-date-label');
  const totalCountBadge = document.getElementById('journal-total-count');
  const historyListContainer = document.getElementById('modal-journal-history-list');
  const deleteBtn = document.getElementById('modal-journal-delete-btn');
  const saveBtn = document.getElementById('modal-journal-save-btn');
  const wordCountSpan = document.getElementById('journal-word-count');
  const charCountSpan = document.getElementById('journal-char-count');
  const closeBtn = document.getElementById('journal-modal-close');

  let currentDate = initialDateStr || state.personalDate || new Date().toISOString().split('T')[0];

  const updateStats = () => {
    const text = contentTextarea ? contentTextarea.value.trim() : '';
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    if (wordCountSpan) wordCountSpan.textContent = `${words} palabra${words === 1 ? '' : 's'}`;
    if (charCountSpan) charCountSpan.textContent = `${chars} carácter${chars === 1 ? '' : 'es'}`;
  };

  const loadEntryForDate = (dateStr) => {
    currentDate = dateStr;
    if (dateInput) dateInput.value = dateStr;
    if (activeDateLabel) activeDateLabel.textContent = formatDateLabel(dateStr);

    const history = getJournalHistory();
    const entry = history.find(h => h.date === dateStr);

    if (entry && contentTextarea) {
      contentTextarea.value = entry.content || '';
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    } else if (contentTextarea) {
      contentTextarea.value = '';
      if (deleteBtn) deleteBtn.style.display = 'none';
    }
    updateStats();
    renderHistoryList(searchInput ? searchInput.value.trim() : '');
  };

  const renderHistoryList = (filterQuery = '') => {
    if (!historyListContainer) return;
    const history = getJournalHistory();
    if (totalCountBadge) totalCountBadge.textContent = history.length;

    const filtered = filterQuery 
      ? history.filter(h => h.date.includes(filterQuery) || (h.content || '').toLowerCase().includes(filterQuery.toLowerCase()))
      : history;

    if (filtered.length === 0) {
      historyListContainer.innerHTML = `
        <div style="padding: 16px 8px; text-align: center; color: #94a3b8; font-size: 11px; font-style: italic;">
          ${filterQuery ? 'No se encontraron entradas para esa búsqueda.' : 'No hay entradas en tu diario aún. ¡Escribe tu primera reflexión!'}
        </div>
      `;
      return;
    }

    historyListContainer.innerHTML = filtered.map(h => {
      const isActive = h.date === currentDate ? ' active' : '';
      const text = (h.content || '').replace(/\n/g, ' ');
      const preview = text.length > 65 ? text.slice(0, 65) + '...' : (text || '(Entrada vacía)');
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

      return `
        <div class="journal-entry-item${isActive}" data-date="${h.date}">
          <div class="journal-entry-date">
            <span>📅 ${h.date}</span>
            <span class="journal-entry-words">${words} palabras</span>
          </div>
          <div class="journal-entry-snippet">${preview}</div>
        </div>
      `;
    }).join('');

    // Bind item click
    historyListContainer.querySelectorAll('.journal-entry-item').forEach(item => {
      item.addEventListener('click', () => {
        const d = item.getAttribute('data-date');
        if (d) loadEntryForDate(d);
      });
    });
  };

  // Date input change
  if (dateInput) {
    dateInput.onchange = () => {
      if (dateInput.value) loadEntryForDate(dateInput.value);
    };
  }

  // Search input
  if (searchInput) {
    searchInput.oninput = () => {
      renderHistoryList(searchInput.value.trim());
    };
  }

  // Textarea input for stats
  if (contentTextarea) {
    contentTextarea.oninput = updateStats;
  }

  // Prompt pills click
  modal.querySelectorAll('.btn-prompt-pill').forEach(pill => {
    pill.onclick = () => {
      const promptText = pill.getAttribute('data-prompt');
      if (contentTextarea && promptText) {
        if (contentTextarea.value.length > 0 && !contentTextarea.value.endsWith('\n\n')) {
          contentTextarea.value += '\n\n';
        }
        contentTextarea.value += promptText;
        contentTextarea.focus();
        updateStats();
      }
    };
  });

  // Save button
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const text = contentTextarea ? contentTextarea.value.trim() : '';
      if (!text) {
        alert('Por favor escribe tu reflexión o notas antes de guardar.');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>⏳ Guardando...</span>';

      const history = getJournalHistory();
      const existingIdx = history.findIndex(h => h.date === currentDate);
      const entry = { date: currentDate, content: text, savedAt: new Date().toISOString() };

      if (existingIdx !== -1) {
        history[existingIdx] = entry;
      } else {
        history.unshift(entry);
      }

      // Sort by date descending
      history.sort((a, b) => b.date.localeCompare(a.date));

      localStorage.setItem('zentry_journal_history', JSON.stringify(history));

      try {
        await syncJournalHistory(history);
      } catch (e) {
        console.warn('Firestore sync failed or offline:', e);
      }

      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>✅ ¡Guardado!</span>';
      setTimeout(() => {
        if (saveBtn) saveBtn.innerHTML = '<span>💾 Guardar Registro</span>';
      }, 1800);

      loadEntryForDate(currentDate);
    };
  }

  // Delete button
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (confirm(`¿Estás seguro de eliminar el registro de journal del día ${currentDate}?`)) {
        let history = getJournalHistory();
        history = history.filter(h => h.date !== currentDate);
        localStorage.setItem('zentry_journal_history', JSON.stringify(history));

        try {
          await syncJournalHistory(history);
        } catch (e) {}

        loadEntryForDate(currentDate);
      }
    };
  }

  // Close handlers
  const closeModal = () => {
    modal.classList.remove('show');
  };

  if (closeBtn) closeBtn.onclick = closeModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  // Open modal and load initial date
  loadEntryForDate(currentDate);
  modal.classList.add('show');
}

// ==============================================================================
// FULL-PAGE JOURNAL VIEW (FULL TAB WORKSPACE)
// ==============================================================================

function renderJournalFullPage(container) {
  document.getElementById('properties-block').style.display = 'none';
  document.getElementById('page-banner').style.display = 'none';
  const wsHeader = document.querySelector('.workspace-header');
  if (wsHeader) wsHeader.style.display = 'none';

  let currentDate = state.personalDate || new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div class="journal-fullpage-container">
      
      <!-- Top Navigation Bar -->
      <div class="espacio-personal-header journal-fullpage-header">
        <a href="#backlog" class="btn-back-personal">⬅️ Volver a Selección</a>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">📖</span>
          <h2 style="font-family: 'Space Grotesk', sans-serif; color: #0f172a; margin: 0; font-size: 1.3rem;">DIARIO & REFLEXIÓN NOCTURNA</h2>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <a href="#backlog/personal" class="btn-open-personal-board" style="background: #ffffff; color: #0f172a; border: 1px solid rgba(15,23,42,0.15); text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">⏱️ Ir a Timeblocking</a>
          <a href="#backlog/personal-board" class="btn-open-personal-board" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">📋 Tablero Personal</a>
        </div>
      </div>

      <!-- Main Full Workspace Grid: Sidebar (300px) + Main Editor (1fr) -->
      <div class="journal-fullpage-layout glass-panel">
        
        <!-- Sidebar: Fechas, Búsqueda e Historial -->
        <aside class="journal-sidebar journal-fullpage-sidebar">
          <div class="journal-sidebar-top">
            <div class="journal-date-selector-box">
              <label for="fp-journal-date" class="journal-input-label">📅 Seleccionar Fecha:</label>
              <input type="date" id="fp-journal-date" class="journal-date-input" value="${currentDate}" />
            </div>
            <div class="journal-search-box">
              <input type="text" id="fp-journal-search-input" placeholder="🔍 Buscar en el historial..." class="journal-search-input" />
            </div>
          </div>

          <div class="journal-entries-heading">
            <span>📚 Entradas Guardadas</span>
            <span id="fp-journal-total-count" class="journal-count-badge">0</span>
          </div>

          <div id="fp-journal-history-list" class="journal-history-scroll">
            <!-- Loaded dynamically -->
          </div>
        </aside>

        <!-- Main Editor Column -->
        <main class="journal-editor-main journal-fullpage-main">
          <div class="journal-editor-header">
            <div class="journal-current-date-info">
              <div>
                <span id="fp-journal-active-date-label" class="journal-active-date">${formatDateLabel(currentDate)}</span>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Reflexión Diaria, Decisiones y Pensamiento Estratégico</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span id="fp-journal-sync-status" class="journal-sync-status">⚡ Sincronizado en la nube</span>
              </div>
            </div>
            
            <!-- Quick prompt chips -->
            <div class="journal-prompt-pills">
              <span style="font-size: 11px; font-weight: 600; color: #64748b; margin-right: 4px;">Insertar sección:</span>
              <button type="button" class="btn-prompt-pill" data-prompt="🎯 Logros del día:&#10;- ">🎯 Logros</button>
              <button type="button" class="btn-prompt-pill" data-prompt="🧠 Aprendizajes:&#10;- ">🧠 Aprendizajes</button>
              <button type="button" class="btn-prompt-pill" data-prompt="⚠️ Obstáculos & Soluciones:&#10;- ">⚠️ Obstáculos</button>
              <button type="button" class="btn-prompt-pill" data-prompt="⚡ Prioridades de mañana:&#10;1. &#10;2. &#10;3. ">⚡ Plan Mañana</button>
              <button type="button" class="btn-prompt-pill" data-prompt="💡 Ideas & Epifanías:&#10;- ">💡 Ideas</button>
            </div>
          </div>

          <div class="journal-textarea-container">
            <textarea id="fp-journal-content" class="journal-textarea" placeholder="Escribe libremente tus reflexiones, decisiones estratégicas, aprendizajes o avances del día..."></textarea>
          </div>

          <div class="journal-editor-footer">
            <div class="journal-stats-info">
              <span id="fp-journal-word-count">0 palabras</span> • <span id="fp-journal-char-count">0 caracteres</span>
            </div>
            <div class="journal-actions-group">
              <button type="button" id="fp-journal-delete-btn" class="btn btn-danger" style="display: none; font-size: 11.5px; padding: 7px 14px;">🗑️ Borrar Día</button>
              <button type="button" id="fp-journal-save-btn" class="btn btn-primary" style="background: #0f172a; color: white; padding: 8px 22px; font-weight: 600; font-size: 12.5px; border-radius: 6px; display: flex; align-items: center; gap: 6px;">
                <span>💾 Guardar Registro</span>
              </button>
            </div>
          </div>
        </main>

      </div>
    </div>
  `;

  // Bind Events for Full Page Journal
  const dateInput = document.getElementById('fp-journal-date');
  const searchInput = document.getElementById('fp-journal-search-input');
  const contentTextarea = document.getElementById('fp-journal-content');
  const activeDateLabel = document.getElementById('fp-journal-active-date-label');
  const totalCountBadge = document.getElementById('fp-journal-total-count');
  const historyListContainer = document.getElementById('fp-journal-history-list');
  const deleteBtn = document.getElementById('fp-journal-delete-btn');
  const saveBtn = document.getElementById('fp-journal-save-btn');
  const wordCountSpan = document.getElementById('fp-journal-word-count');
  const charCountSpan = document.getElementById('fp-journal-char-count');

  const updateStats = () => {
    const text = contentTextarea ? contentTextarea.value.trim() : '';
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    if (wordCountSpan) wordCountSpan.textContent = `${words} palabra${words === 1 ? '' : 's'}`;
    if (charCountSpan) charCountSpan.textContent = `${chars} carácter${chars === 1 ? '' : 'es'}`;
  };

  const loadEntryForDate = (dateStr) => {
    currentDate = dateStr;
    state.personalDate = dateStr;
    if (dateInput) dateInput.value = dateStr;
    if (activeDateLabel) activeDateLabel.textContent = formatDateLabel(dateStr);

    const history = getJournalHistory();
    const entry = history.find(h => h.date === dateStr);

    if (entry && contentTextarea) {
      contentTextarea.value = entry.content || '';
      if (deleteBtn) deleteBtn.style.display = 'inline-flex';
    } else if (contentTextarea) {
      contentTextarea.value = '';
      if (deleteBtn) deleteBtn.style.display = 'none';
    }
    updateStats();
    renderHistoryList(searchInput ? searchInput.value.trim() : '');
  };

  const renderHistoryList = (filterQuery = '') => {
    if (!historyListContainer) return;
    const history = getJournalHistory();
    if (totalCountBadge) totalCountBadge.textContent = history.length;

    const filtered = filterQuery 
      ? history.filter(h => h.date.includes(filterQuery) || (h.content || '').toLowerCase().includes(filterQuery.toLowerCase()))
      : history;

    if (filtered.length === 0) {
      historyListContainer.innerHTML = `
        <div style="padding: 20px 10px; text-align: center; color: #94a3b8; font-size: 12px; font-style: italic;">
          ${filterQuery ? 'No se encontraron entradas para esa búsqueda.' : 'No hay entradas aún. ¡Escribe la primera reflexión de hoy!'}
        </div>
      `;
      return;
    }

    historyListContainer.innerHTML = filtered.map(h => {
      const isActive = h.date === currentDate ? ' active' : '';
      const text = (h.content || '').replace(/\n/g, ' ');
      const preview = text.length > 70 ? text.slice(0, 70) + '...' : (text || '(Entrada vacía)');
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

      return `
        <div class="journal-entry-item${isActive}" data-date="${h.date}">
          <div class="journal-entry-date">
            <span>📅 ${h.date}</span>
            <span class="journal-entry-words">${words} palabras</span>
          </div>
          <div class="journal-entry-snippet">${preview}</div>
        </div>
      `;
    }).join('');

    historyListContainer.querySelectorAll('.journal-entry-item').forEach(item => {
      item.addEventListener('click', () => {
        const d = item.getAttribute('data-date');
        if (d) loadEntryForDate(d);
      });
    });
  };

  if (dateInput) {
    dateInput.onchange = () => {
      if (dateInput.value) loadEntryForDate(dateInput.value);
    };
  }

  if (searchInput) {
    searchInput.oninput = () => {
      renderHistoryList(searchInput.value.trim());
    };
  }

  if (contentTextarea) {
    contentTextarea.oninput = updateStats;
  }

  container.querySelectorAll('.btn-prompt-pill').forEach(pill => {
    pill.onclick = () => {
      const promptText = pill.getAttribute('data-prompt');
      if (contentTextarea && promptText) {
        if (contentTextarea.value.length > 0 && !contentTextarea.value.endsWith('\n\n')) {
          contentTextarea.value += '\n\n';
        }
        contentTextarea.value += promptText;
        contentTextarea.focus();
        updateStats();
      }
    };
  });

  if (saveBtn) {
    saveBtn.onclick = async () => {
      const text = contentTextarea ? contentTextarea.value.trim() : '';
      if (!text) {
        alert('Por favor escribe tu reflexión o notas antes de guardar.');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>⏳ Guardando...</span>';

      const history = getJournalHistory();
      const existingIdx = history.findIndex(h => h.date === currentDate);
      const entry = { date: currentDate, content: text, savedAt: new Date().toISOString() };

      if (existingIdx !== -1) {
        history[existingIdx] = entry;
      } else {
        history.unshift(entry);
      }

      history.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem('zentry_journal_history', JSON.stringify(history));

      try {
        await syncJournalHistory(history);
      } catch (e) {
        console.warn('Firestore sync failed or offline:', e);
      }

      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>✅ ¡Guardado!</span>';
      setTimeout(() => {
        if (saveBtn) saveBtn.innerHTML = '<span>💾 Guardar Registro</span>';
      }, 1800);

      loadEntryForDate(currentDate);
    };
  }

  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (confirm(`¿Estás seguro de eliminar el registro de journal del día ${currentDate}?`)) {
        let history = getJournalHistory();
        history = history.filter(h => h.date !== currentDate);
        localStorage.setItem('zentry_journal_history', JSON.stringify(history));

        try {
          await syncJournalHistory(history);
        } catch (e) {}

        loadEntryForDate(currentDate);
      }
    };
  }

  loadEntryForDate(currentDate);
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
      <div class="personal-header-actions" style="display: flex; gap: 8px; align-items: center;">
        <a href="#backlog/journal" class="btn-open-journal" style="background: #ffffff; color: #0f172a; text-decoration: none; border: 1px solid rgba(15, 23, 42, 0.15); padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <span>📖</span> Abrir Journal
        </a>
        <a href="#backlog/personal-board" class="btn-open-personal-board" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 6px 14px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
          <span>📋</span> Abrir Tablero Personal
        </a>
      </div>
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

  // Abrir Journal
  document.getElementById('btn-open-journal-modal')?.addEventListener('click', () => {
    openJournalModal(state.personalDate);
  });

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
  const isZentryView = hash.includes('demobook') || hash.includes('precierres') || hash.includes('prospeccion') || hash.includes('branding') || hash.includes('iacontext') || hash === '#backlog/zentry';
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
    } else if (hash === '#backlog/journal' || hash === '#backlog/global') {
      state.backlogMode = 'journal';
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

// Load Sidebar Collapsed State (Default collapsed on mobile)
if (window.innerWidth <= 768) {
  document.getElementById('app')?.classList.add('sidebar-collapsed');
} else {
  const sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
  if (sidebarCollapsed) {
    document.getElementById('app')?.classList.add('sidebar-collapsed');
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
