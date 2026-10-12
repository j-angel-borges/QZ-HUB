// ==============================================================================
// QZ HUB — SPRINTER (HERRAMIENTA DE 3 DÍAS CON INTERCONEXIÓN DETERMINISTA)
// ==============================================================================
// Interconexión bidireccional entre:
// 1. SPRINTER (Micro-bloques de 3 días con actividades asignadas y anotaciones)
// 2. TIMEBLOCKING (Escribe automáticamente en cada slot de 15 min:
//    "Llamadas Realizadas" o "Prospección realizada" + resultados (X call · Y cit))
// 3. BIO-TRACKER (Actualiza cifras de PROD: LL, DEMOS, PCC, WIN y
//    métricas detalladas de marcación: NC [no contestó], Col [colgó], Ll [rellamar], cit [citas])
// ==============================================================================

const SPRINTER_STORAGE_KEY = 'qz_sprinter_data';

// Helper de zona horaria local (Perú/LatAm)
function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultSprinterData() {
  return {
    sprintNumber: 1,
    title: 'Sprint 1: Aterrizaje Biológico & Foco Comercial',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    goal: 'Marcación activa fuera de casa, prospección y cero escapes dopaminérgicos.',
    activeDayIndex: 0,
    days: [
      {
        id: 'day-1',
        date: '2026-10-12',
        dayLabel: 'D1 • Lun 12 Oct',
        isToday: true,
        blocks: [
          {
            id: 'd1-b1',
            time: '08:30 - 10:00',
            startTime: '08:30',
            endTime: '10:00',
            activity: 'llamadas',
            title: 'Llamadas Fuera de Casa (Royal & Leads)',
            icon: '📞',
            desc: 'Marcación activa en parque o barras antes de desayunar',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd1-b2',
            time: '12:00 - 13:00',
            startTime: '12:00',
            endTime: '13:00',
            activity: 'prospeccion',
            title: 'Prospección Presencial / Colegios',
            icon: '🎯',
            desc: 'Contacto con directores y evaluación de colegios',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd1-b3',
            time: '18:00 - 19:30',
            startTime: '18:00',
            endTime: '19:30',
            activity: 'llamadas',
            title: 'Llamadas Nocturnas & Seguimiento',
            icon: '📞',
            desc: 'Seguimiento a contactos calientes (Starbucks o plaza)',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      },
      {
        id: 'day-2',
        date: '2026-10-13',
        dayLabel: 'D2 • Mar 13 Oct',
        isToday: false,
        blocks: [
          {
            id: 'd2-b1',
            time: '08:30 - 10:00',
            startTime: '08:30',
            endTime: '10:00',
            activity: 'llamadas',
            title: 'Llamadas Fuera de Casa (Directores)',
            icon: '📞',
            desc: 'Foco comercial matutino sin adaptadores',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd2-b2',
            time: '12:00 - 13:00',
            startTime: '12:00',
            endTime: '13:00',
            activity: 'prospeccion',
            title: 'Prospección Presencial / Directores',
            icon: '🎯',
            desc: 'Entrega de material y agendamiento demo',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd2-b3',
            time: '18:00 - 19:30',
            startTime: '18:00',
            endTime: '19:30',
            activity: 'llamadas',
            title: 'Llamadas Zentry & Agendamiento',
            icon: '📞',
            desc: 'Consolidación de agenda y demos para el miércoles',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      },
      {
        id: 'day-3',
        date: '2026-10-14',
        dayLabel: 'D3 • Mié 14 Oct',
        isToday: false,
        blocks: [
          {
            id: 'd3-b1',
            time: '08:30 - 10:00',
            startTime: '08:30',
            endTime: '10:00',
            activity: 'llamadas',
            title: 'Llamadas de Cierre & Confirmación',
            icon: '📞',
            desc: 'Cierres de demos para fin de semana',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd3-b2',
            time: '12:00 - 13:00',
            startTime: '12:00',
            endTime: '13:00',
            activity: 'prospeccion',
            title: 'Prospección & Validación Final',
            icon: '🎯',
            desc: 'Cierre de ciclo de prospección semanal',
            completed: false,
            notes: '',
            syncSummary: null
          },
          {
            id: 'd3-b3',
            time: '18:00 - 19:30',
            startTime: '18:00',
            endTime: '19:30',
            activity: 'llamadas',
            title: 'Llamadas de Cierre de Sprint',
            icon: '📞',
            desc: 'Balance de llamadas y preparación compras Gamarra',
            completed: false,
            notes: '',
            syncSummary: null
          }
        ]
      }
    ]
  };
}

export function getSprinterData() {
  try {
    const raw = localStorage.getItem(SPRINTER_STORAGE_KEY) || localStorage.getItem('qz_sprint_3dias');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length === 3) {
        // Verificar si los días tienen la estructura de bloques moderna
        if (parsed.days[0].blocks && Array.isArray(parsed.days[0].blocks)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading sprinter data:', e);
  }
  const defaultData = getDefaultSprinterData();
  saveSprinterData(defaultData);
  return defaultData;
}

export function saveSprinterData(data) {
  try {
    localStorage.setItem(SPRINTER_STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem('qz_sprint_3dias', JSON.stringify(data));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving sprinter data:', e);
  }
}

// ==============================================================================
// PARSER DETERMINISTA DE ANOTACIONES
// ==============================================================================
// Nomenclatura determinista tolerante a plurales, mayúsculas y variaciones:
// - calls / call -> capturado como llamadas
// - cit / cita / citas -> capturado como citas
// - nc -> no contestó
// - col -> colgó
// - ll -> volver a llamar
// - pcc / prospec -> prospecciones
// - win / vta -> ventas
// ==============================================================================
export function parseSprinterNotes(notes) {
  if (!notes || typeof notes !== 'string') {
    return { calls: 0, cits: 0, pcc: 0, nc: 0, col: 0, ll: 0, win: 0, raw: '' };
  }
  const s = notes.trim();

  function extractMetric(keywords) {
    const kwPattern = keywords.join('|');
    // Patrón 1: número seguido de palabra (ej: 15 call, 15 calls, 2 cit, 5 nc)
    const p1 = new RegExp('(?:^|[^\\w])(\\d+)\\s*(?:' + kwPattern + ')(?:[^\\w]|$)', 'i');
    const m1 = s.match(p1);
    if (m1) return parseInt(m1[1], 10);

    // Patrón 2: palabra seguida de : o espacio y número (ej: call: 15, calls 15, cit: 2)
    const p2 = new RegExp('(?:^|[^\\w])(?:' + kwPattern + ')\\s*[:=]?\\s*(\\d+)(?:[^\\w]|$)', 'i');
    const m2 = s.match(p2);
    if (m2) return parseInt(m2[1], 10);

    return 0;
  }

  return {
    calls: extractMetric(['calls?', 'llamadas?']),
    cits: extractMetric(['cits?', 'citas?', 'demos?']),
    pcc: extractMetric(['pcc', 'prospecs?', 'prospecci[oó]n(?:es)?']),
    nc: extractMetric(['nc', 'no\\s*contest[oó]']),
    col: extractMetric(['col', 'colg[oó]']),
    ll: extractMetric(['ll', 'rellamar', 'volver\\s*a\\s*llamar']),
    win: extractMetric(['win', 'vtas?', 'ventas?', 'cierres?']),
    raw: s
  };
}

// Generador de slots de 15 minutos en un rango dado (ej: "08:30" a "10:00")
export function get15MinSlotsInRange(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  const slots = [];
  for (let m = startMins; m < endMins; m += 15) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${hh}:${mm}`);
  }
  return slots;
}

// ==============================================================================
// EJECUCIÓN DEL PUENTE DETERMINISTA: SPRINTER ➔ TIMEBLOCKING & BIOTRACKER
// ==============================================================================
export function executeSprinterBlockSync(dayIdx, blockId, userNotes) {
  const data = getSprinterData();
  const day = data.days[dayIdx];
  if (!day) return null;
  const block = day.blocks.find(b => b.id === blockId);
  if (!block) return null;

  block.notes = userNotes;
  const parsed = parseSprinterNotes(userNotes);

  // 1. GENERAR NOMENCLATURA EXACTA PARA TIMEBLOCKING
  // "Llamadas Realizadas" o "Prospección realizada" + (X call · Y cit)
  let metricsSummary = [];
  if (parsed.calls > 0) metricsSummary.push(`${parsed.calls} call`);
  if (parsed.cits > 0) metricsSummary.push(`${parsed.cits} cit`);
  const metricsStr = metricsSummary.length > 0 ? ` (${metricsSummary.join(' · ')})` : '';

  let timeblockTitle = '';
  if (block.activity === 'prospeccion' || block.title.toLowerCase().includes('prospec')) {
    timeblockTitle = `Prospección realizada${metricsStr}`;
  } else {
    timeblockTitle = `Llamadas Realizadas${metricsStr}`;
  }

  // 2. ESCRIBIR EN CADA BLOQUE DE 15 MIN DE TIMEBLOCKING
  const slots = get15MinSlotsInRange(block.startTime, block.endTime);
  const targetDate = day.date || getTodayDateStr();

  try {
    const tbKey = `zentry_timeblock_${targetDate}`;
    let tbData = {};
    const rawTb = localStorage.getItem(tbKey);
    if (rawTb) {
      try { tbData = JSON.parse(rawTb); } catch(e) {}
    }

    slots.forEach(slotTime => {
      tbData[slotTime] = {
        text: timeblockTitle,
        details: parsed.raw || '',
        type: 'productivo',
        source: 'sprinter',
        completed: true,
        isBrick: true
      };
    });

    localStorage.setItem(tbKey, JSON.stringify(tbData));
    if (window.syncTimeblock) {
      window.syncTimeblock(targetDate, tbData);
    }
  } catch (err) {
    console.error('Error writing to Timeblocking:', err);
  }

  // 3. JALAR MÉTRICAS DETALLADAS AL BIO-TRACKER
  // NC (no contestó), Col (colgó), Ll (volver a llamar), cit (cita agendada) y PROD Comercial
  try {
    const rawTracker = localStorage.getItem('qz_bio_tracker');
    let trackerData = null;
    if (rawTracker) {
      try { trackerData = JSON.parse(rawTracker); } catch(e) {}
    }
    if (!trackerData) trackerData = {};

    const todayStr = getTodayDateStr();
    if (!trackerData.prod) {
      trackerData.prod = {
        todayDate: todayStr,
        today: { pcc: 0, ll: 0, demos: 0, win: 0, callDetails: { nc: 0, col: 0, ll: 0, cit: 0 } },
        history: {},
        totals: { pcc: 0, ll: 0, demos: 0, win: 0 }
      };
    }

    const prod = trackerData.prod;
    if (!prod.today) prod.today = { pcc: 0, ll: 0, demos: 0, win: 0 };
    if (!prod.today.callDetails) prod.today.callDetails = { nc: 0, col: 0, ll: 0, cit: 0 };
    if (!prod.totals) prod.totals = { pcc: 0, ll: 0, demos: 0, win: 0 };

    // Sumar llamadas
    if (parsed.calls > 0) {
      prod.today.ll = (prod.today.ll || 0) + parsed.calls;
      prod.totals.ll = (prod.totals.ll || 0) + parsed.calls;
    }

    // Sumar citas / demos
    if (parsed.cits > 0) {
      prod.today.demos = (prod.today.demos || 0) + parsed.cits;
      prod.totals.demos = (prod.totals.demos || 0) + parsed.cits;
      prod.today.callDetails.cit = (prod.today.callDetails.cit || 0) + parsed.cits;
    }

    // Sumar prospección
    if (parsed.pcc > 0) {
      prod.today.pcc = (prod.today.pcc || 0) + parsed.pcc;
      prod.totals.pcc = (prod.totals.pcc || 0) + parsed.pcc;
    }

    // Sumar ventas / win
    if (parsed.win > 0) {
      prod.today.win = (prod.today.win || 0) + parsed.win;
      prod.totals.win = (prod.totals.win || 0) + parsed.win;
    }

    // Sumar marcación detallada
    if (parsed.nc > 0) prod.today.callDetails.nc = (prod.today.callDetails.nc || 0) + parsed.nc;
    if (parsed.col > 0) prod.today.callDetails.col = (prod.today.callDetails.col || 0) + parsed.col;
    if (parsed.ll > 0) prod.today.callDetails.ll = (prod.today.callDetails.ll || 0) + parsed.ll;

    localStorage.setItem('qz_bio_tracker', JSON.stringify(trackerData));
    if (window.syncHabitTracker) {
      window.syncHabitTracker(trackerData);
    }

    // Notificar al widget visual del Bio-Tracker si está en pantalla
    if (window.refreshHabitTrackerUI) {
      window.refreshHabitTrackerUI();
    }
  } catch (err) {
    console.error('Error updating Bio-Tracker:', err);
  }

  // 4. ACTUALIZAR ESTADO DEL BLOQUE EN SPRINTER
  block.completed = true;
  block.syncSummary = {
    timeblockText: timeblockTitle,
    slotsCount: slots.length,
    parsed: parsed,
    syncedAt: new Date().toLocaleTimeString()
  };

  saveSprinterData(data);
  return block.syncSummary;
}

// ==============================================================================
// RENDERIZADO VISUAL COMPACTO DE LA TARJETA SPRINTER (EN COLUMNA DERECHA)
// ==============================================================================
export function renderSprinterCardHTML() {
  const data = getSprinterData();
  const currentDayIdx = data.activeDayIndex || 0;
  const currentDay = data.days[currentDayIdx] || data.days[0];

  const totalBlocks = data.days.reduce((acc, d) => acc + d.blocks.length, 0);
  const completedBlocks = data.days.reduce((acc, d) => acc + d.blocks.filter(b => b.completed).length, 0);
  const progressPct = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const dayTabsHtml = data.days.map((d, idx) => {
    const dayDone = d.blocks.filter(b => b.completed).length;
    const isSelected = idx === currentDayIdx;
    return `
      <button type="button" class="btn-sprinter-day-tab ${isSelected ? 'active' : ''}" data-day-idx="${idx}">
        <span>${d.dayLabel}</span>
        <span class="day-tab-count">${dayDone}/${d.blocks.length}</span>
      </button>
    `;
  }).join('');

  const blocksHtml = currentDay.blocks.map(b => {
    const isDone = !!b.completed;
    return `
      <div class="sprinter-block-item ${isDone ? 'is-completed' : ''}" data-block-id="${b.id}">
        <div class="sprinter-block-header">
          <div class="sprinter-block-title-box">
            <span class="sprinter-block-time">⏱️ ${b.time}</span>
            <span class="sprinter-block-act-badge ${b.activity}">${b.activity === 'prospeccion' ? '🎯 Prospección' : '📞 Llamadas'}</span>
          </div>
          <button type="button" class="btn-sprinter-done ${isDone ? 'done-active' : ''}" data-block-id="${b.id}" data-day-idx="${currentDayIdx}">
            ${isDone ? '✓ Hecho' : '○ Marcar Hecho'}
          </button>
        </div>
        <div class="sprinter-block-desc">${b.title}</div>
        
        <div class="sprinter-block-notes-wrap">
          <input type="text" class="sprinter-block-input" 
                 placeholder="Anotación (ej: 15 call, 2 cit, 5 nc, 3 col, 2 ll)" 
                 value="${b.notes || ''}" 
                 data-block-id="${b.id}" 
                 data-day-idx="${currentDayIdx}" />
        </div>

        ${isDone && b.syncSummary ? `
          <div class="sprinter-sync-pill">
            <span class="sync-pill-tag">⚡ Timeblocking:</span>
            <span class="sync-pill-val">${b.syncSummary.timeblockText} (${b.syncSummary.slotsCount} bloques 15m)</span>
            <span class="sync-pill-tag" style="margin-left: 6px;">📊 Bio:</span>
            <span class="sync-pill-val">+${b.syncSummary.parsed.calls} LL, +${b.syncSummary.parsed.cits} CIT</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="sprinter-card" id="sprinter-widget">
      <!-- HEADER COMPACTO -->
      <div class="sprinter-card-top">
        <div class="sprinter-brand-wrap">
          <div class="sprinter-icon-glow">⚡</div>
          <div>
            <div class="sprinter-title-row">
              <h3 class="sprinter-card-title">SPRINTER (3 DÍAS)</h3>
              <span class="sprinter-phase-badge">Sprint ${data.sprintNumber}</span>
            </div>
            <p class="sprinter-card-subtitle">Micro-bloques deterministas conectados a Timeblocking & Bio-Tracker</p>
          </div>
        </div>
        <div class="sprinter-progress-box">
          <div class="sprinter-progress-bar-bg">
            <div class="sprinter-progress-bar-fill" style="width: ${progressPct}%;"></div>
          </div>
          <span class="sprinter-progress-num">${completedBlocks}/${totalBlocks} Bloques (${progressPct}%)</span>
        </div>
      </div>

      <!-- SELECTOR DE DÍAS -->
      <div class="sprinter-day-tabs">
        ${dayTabsHtml}
      </div>

      <!-- LISTA DE BLOQUES DEL DÍA ACTIVO -->
      <div class="sprinter-blocks-list">
        ${blocksHtml}
      </div>

      <!-- FOOTER CON INSTRUCCIÓN RÁPIDA -->
      <div class="sprinter-card-footer">
        <span class="sprinter-hint-text">💡 <strong>Nomenclatura:</strong> Escribe <code>15 call</code>, <code>2 cit</code>, <code>5 nc</code>, <code>3 col</code>, <code>2 ll</code> y clic en <em>"Hecho"</em>.</span>
      </div>
    </div>
  `;
}

// ==============================================================================
// GESTOR DE EVENTOS INTERACTIVOS DE SPRINTER
// ==============================================================================
export function setupSprinterEvents(container) {
  const widget = container.querySelector('#sprinter-widget');
  if (!widget) return;

  // 1. Cambio de pestaña de día
  widget.querySelectorAll('.btn-sprinter-day-tab').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      const data = getSprinterData();
      data.activeDayIndex = dayIdx;
      saveSprinterData(data);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });

  // 2. Guardar notas mientras escribe
  widget.querySelectorAll('.sprinter-block-input').forEach(input => {
    input.oninput = (e) => {
      const dayIdx = parseInt(input.dataset.dayIdx, 10);
      const blockId = input.dataset.blockId;
      const data = getSprinterData();
      if (data.days[dayIdx]) {
        const blk = data.days[dayIdx].blocks.find(b => b.id === blockId);
        if (blk) {
          blk.notes = input.value;
          saveSprinterData(data);
        }
      }
    };

    // Al presionar Enter, marcar como hecho
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const blockId = input.dataset.blockId;
        const dayIdx = parseInt(input.dataset.dayIdx, 10);
        executeSprinterBlockSync(dayIdx, blockId, input.value);
        widget.outerHTML = renderSprinterCardHTML();
        setupSprinterEvents(container);
      }
    };
  });

  // 3. Botón "✓ Hecho"
  widget.querySelectorAll('.btn-sprinter-done').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const blockId = btn.dataset.blockId;
      const dayIdx = parseInt(btn.dataset.dayIdx, 10);
      const row = btn.closest('.sprinter-block-item');
      const input = row?.querySelector('.sprinter-block-input');
      const userNotes = input?.value || '';

      executeSprinterBlockSync(dayIdx, blockId, userNotes);
      widget.outerHTML = renderSprinterCardHTML();
      setupSprinterEvents(container);
    };
  });
}
