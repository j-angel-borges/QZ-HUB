// PROTOCOLO PRE-ELROW (10 SEP - 10 OCT 2026)
// Arquitectura Modular de Bloques Individuales e Interactivos

export const PROTOCOLO_STORAGE_KEY = 'qz_protocolo_pre_elrow_v2';
export const PROTOCOLO_BLOCK_CHOICES_KEY = 'qz_protocolo_pre_elrow_choices_v1';
export const START_DATE_STR = '2026-09-10';
export const END_DATE_STR = '2026-10-10';
export const TOTAL_DAYS = 30;

// Definición unificada de los bloques diarios con opciones individuales por bloque
export const PROTOCOLO_DAILY_BLOCKS = [
  {
    id: 'b1',
    time: '06:00',
    title: 'Despertar & Shot Matutino',
    icon: '⚡',
    detailKey: 'shot',
    options: null
  },
  {
    id: 'b2',
    time: '07:00',
    title: 'Entrada Colegios (Presencial)',
    icon: '🎒',
    desc: 'Contacto con padres en puerta',
    options: null
  },
  {
    id: 'b3',
    time: '08:15',
    title: 'Llamadas & WSP a Leads',
    icon: '📞',
    desc: 'Marcación activa y seguimiento',
    options: null
  },
  {
    id: 'b4',
    time: '10:15',
    title: 'Bloque Flexible 1',
    icon: '🔄',
    options: [
      { id: 'opt_gym', label: '🏋️ Calistenia + Fría', detailKey: 'gym', desc: '45m Calistenia + 3m Ducha Fría en ayunas' },
      { id: 'opt_dev', label: '💻 Dev ZentryOS', desc: 'Soporte, Kiosk Mode y mejoras rápidas' }
    ]
  },
  {
    id: 'b5',
    time: '11:30',
    title: 'Comida 1: Carga Proteica',
    icon: '🍳',
    detailKey: 'comida',
    desc: '4 huevos + corazón/hígado + arroz frío + NAC',
    options: null
  },
  {
    id: 'b6',
    time: '12:00',
    title: 'Donnie: Paseo Fijo',
    icon: '🐕',
    detailKey: 'donnie',
    desc: '20-30 min luz cenital directa (12:00 PM)',
    options: null
  },
  {
    id: 'b7',
    time: '13:00',
    title: 'Prospección de Tarde & Demos',
    icon: '🚶',
    desc: 'Salida de colegios / citas agendadas',
    options: null
  },
  {
    id: 'b8',
    time: '15:00',
    title: 'Bloque Flexible 2',
    icon: '🔄',
    options: [
      { id: 'opt_dev', label: '💻 Dev & Soporte', desc: 'Mesa de trabajo y código ZentryOS' },
      { id: 'opt_lunch', label: '🥗 Almuerzo / Descanso', desc: 'Comida secundaria o desconexión mental' }
    ]
  },
  {
    id: 'b9',
    time: '17:00',
    title: 'Seguimiento Comercial & CRM',
    icon: '📊',
    desc: 'Cierre de cotizaciones y respuestas WSP',
    options: null
  },
  {
    id: 'b10',
    time: '19:30',
    title: 'Bloque Flexible 3',
    icon: '🔄',
    options: [
      { id: 'opt_gym_night', label: '🏋️ Gym Nocturno', desc: 'Entrenamiento si no se entrenó en la mañana' },
      { id: 'opt_calls_night', label: '📞 Cierres & Preparación', desc: 'Remate telefónico y agenda del día siguiente' }
    ]
  },
  {
    id: 'b11',
    time: '21:00',
    title: 'Cierre: Gabapentina & Descanso',
    icon: '💊',
    detailKey: 'gaba',
    desc: '1 pastilla 30m antes de dormir. Cero alcohol',
    options: null
  }
];

export const PROTOCOLO_DETAILS = {
  shot: {
    title: '⚡ Shot Matutino Neuro-Dopaminérgico (06:00 AM)',
    icon: '⚡',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>💧 Agua fresca:</strong> 400 - 500 ml templada.</div>
        <div class="proto-detail-item"><strong>🧂 Sal de Maras:</strong> 1/3 cdta (~1.5g) para volumen plasmático.</div>
        <div class="proto-detail-item"><strong>🧪 Citrato de Potasio:</strong> 1/4 a 1/2 cdta para balance celular.</div>
        <div class="proto-detail-item"><strong>🍋 Limón:</strong> Jugo de 1/2 a 1 limón recién exprimido.</div>
        <div class="proto-detail-item"><strong>🧠 L-Tirosina:</strong> 500 - 1000 mg (precursor de dopamina).</div>
        <div class="proto-detail-item"><strong>🍊 Vitamina C:</strong> 1/2 cápsula (partida por la mitad).</div>
        <div class="proto-detail-alert">🚫 <strong>AJUSTES:</strong> Estevia eliminada. Citrato de Magnesio excluido.</div>
      </div>
    `
  },
  comida: {
    title: '🍳 Nutrición Densa & Arroz Frío Retrogradado',
    icon: '🍳',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>🥚 Huevos:</strong> 4 enteros en mantequilla o manteca de cerdo.</div>
        <div class="proto-detail-item"><strong>❤️ Corazón de Res:</strong> 150g diario seguro (CoQ10 y carnitina).</div>
        <div class="proto-detail-item"><strong>🥩 Hígado de Res:</strong> 100g (máximo 2 veces por semana).</div>
        <div class="proto-detail-item"><strong>🧠 Sesos de Res:</strong> 150g (máximo 2 veces por semana, DHA puro).</div>
        <div class="proto-detail-item"><strong>🍚 Arroz Frío:</strong> De refrigeradora normal (almidón resistente anti-picos).</div>
        <div class="proto-detail-item"><strong>💊 Con almuerzo:</strong> 1 NAC (600mg) + Complejo B.</div>
      </div>
    `
  },
  donnie: {
    title: '🐕 Donnie: Paseo Fijo (12:00 - 12:30 PM)',
    icon: '🐕',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>⏱️ Duración:</strong> 20 a 30 minutos innegociables.</div>
        <div class="proto-detail-item"><strong>☀️ Sol cenital:</strong> Sincronización de ritmo circadiano.</div>
        <div class="proto-detail-item"><strong>🧠 Higiene mental:</strong> Desconexión de pantallas antes de la tarde.</div>
      </div>
    `
  },
  gaba: {
    title: '💊 Gabapentina Nocturna (21:30 PM)',
    icon: '💊',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>💊 Dosis:</strong> 1 pastilla 30 min antes de dormir.</div>
        <div class="proto-detail-item"><strong>🧠 Efecto:</strong> Estabilizador GABA, previene insomnio de rebote.</div>
        <div class="proto-detail-alert">🚫 <strong>ESTRICTO:</strong> CERO alcohol. Desactiva control prefrontal.</div>
      </div>
    `
  }
};

export function getBlockChoices() {
  try {
    const raw = localStorage.getItem(PROTOCOLO_BLOCK_CHOICES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { b4: 'opt_gym', b8: 'opt_dev', b10: 'opt_gym_night' };
}

export function saveBlockChoice(blockId, optionId) {
  try {
    const current = getBlockChoices();
    current[blockId] = optionId;
    localStorage.setItem(PROTOCOLO_BLOCK_CHOICES_KEY, JSON.stringify(current));
  } catch (e) {}
}

export function getProtocoloData() {
  const defaultData = {
    startDate: START_DATE_STR,
    endDate: END_DATE_STR,
    totalDays: TOTAL_DAYS,
    activeDate: new Date().toISOString().split('T')[0],
    days: {}
  };
  try {
    const raw = localStorage.getItem(PROTOCOLO_STORAGE_KEY);
    if (raw) {
      return { ...defaultData, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return defaultData;
}

export function saveProtocoloData(data) {
  try {
    localStorage.setItem(PROTOCOLO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

export function getDayData(protoData, dateStr) {
  if (!protoData.days[dateStr]) {
    protoData.days[dateStr] = {
      blocks: {},
      notes: ''
    };
  }
  return protoData.days[dateStr];
}

// --- RENDER COMPACT PREVIEW (LOW TEXT, BLOCK-BY-BLOCK CHOICES) ---
export function renderProtocoloPreviewHTML() {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const blockChoices = getBlockChoices();

  const today = new Date(todayStr + 'T00:00:00');
  const dateFormatted = today.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  // Calcular progreso
  let totalBlocks = PROTOCOLO_DAILY_BLOCKS.length;
  let doneCount = 0;
  PROTOCOLO_DAILY_BLOCKS.forEach(b => {
    if (dayData.blocks[b.id]?.status === 'completed') doneCount++;
  });
  const progressPct = totalBlocks > 0 ? Math.round((doneCount / totalBlocks) * 100) : 0;

  // Generar HTML de bloques individuales
  const blocksHtml = PROTOCOLO_DAILY_BLOCKS.map(b => {
    const state = dayData.blocks[b.id] || {};
    const isCompleted = state.status === 'completed';
    const isSkipped = state.status === 'skipped'; // vacio / hizo otra cosa

    let activeTitle = b.title;
    let optionsHtml = '';

    if (b.options) {
      const selectedOptId = blockChoices[b.id] || b.options[0].id;
      const currentOpt = b.options.find(o => o.id === selectedOptId) || b.options[0];
      activeTitle = currentOpt.label;

      optionsHtml = `
        <div class="block-segmented-switcher">
          ${b.options.map(opt => `
            <button type="button" class="btn-opt-pill ${opt.id === selectedOptId ? 'is-active' : ''}" 
              data-block-id="${b.id}" data-opt-id="${opt.id}">
              ${opt.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="proto-compact-block-row ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <span class="block-time-pill">${b.time}</span>
        
        <div class="block-row-center">
          <span class="block-row-title">${activeTitle}</span>
          ${optionsHtml}
        </div>

        <div class="block-row-actions">
          ${b.detailKey ? `
            <button type="button" class="btn-block-action btn-block-info" data-detail-key="${b.detailKey}" title="Ver Guía">🔍</button>
          ` : ''}
          <button type="button" class="btn-block-action btn-block-skip ${isSkipped ? 'active' : ''}" data-block-id="${b.id}" title="Marcar Vacío (Hice otra cosa)">∅</button>
          <button type="button" class="btn-block-action btn-block-check ${isCompleted ? 'active' : ''}" data-block-id="${b.id}" title="Marcar Cumplido">✓</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="protocolo-compact-preview-card" id="protocolo-30d-preview-card">
      <!-- HEADER COMPACTO CON POCO TEXTO -->
      <div class="proto-preview-top-bar">
        <div class="proto-bar-left">
          <span class="proto-tag-flame">🔥 PRE-ELROW</span>
          <span class="proto-tag-day">${dateFormatted} • <strong>${progressPct}%</strong></span>
        </div>
        <div class="proto-bar-right">
          <a href="#backlog/protocolo-30dias" class="btn-proto-fullscreen" title="Abrir Calendario Completo">
            ⛶ Completo
          </a>
        </div>
      </div>

      <!-- MODAL DE DETALLES RÁPIDOS -->
      <div class="proto-detail-modal" id="proto-detail-modal" style="display: none;">
        <div class="proto-detail-modal-header">
          <h4 id="proto-detail-title">⚡ Guía Rápida</h4>
          <button type="button" class="btn-close-proto-detail" id="btn-close-proto-detail">✕</button>
        </div>
        <div class="proto-detail-modal-body" id="proto-detail-body"></div>
      </div>

      <!-- LISTADO MODULAR DE BLOQUES -->
      <div class="proto-blocks-compact-list" id="proto-blocks-container">
        ${blocksHtml}
      </div>

      <!-- FOOTER DE ACCESOS RÁPIDOS -->
      <div class="proto-preview-mini-footer">
        <button type="button" class="btn-mini-guide" data-detail-key="shot">⚡ Shot</button>
        <button type="button" class="btn-mini-guide" data-detail-key="comida">🍳 Comida</button>
        <button type="button" class="btn-mini-guide" data-detail-key="donnie">🐕 Donnie</button>
        <button type="button" class="btn-mini-guide" data-detail-key="gaba">💊 Gaba</button>
      </div>
    </div>
  `;
}

// --- RENDER FULL PAGE VIEW (#backlog/protocolo-30dias) ---
export function renderProtocolo30DiasFullPage(container) {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const blockChoices = getBlockChoices();

  const start = new Date(START_DATE_STR + 'T00:00:00');
  const daysBarHtml = Array.from({ length: TOTAL_DAYS }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    const dateIso = d.toISOString().split('T')[0];
    const isCurrent = dateIso === todayStr;
    const dayNum = idx + 1;

    return `
      <div class="timeline-day-pill ${isCurrent ? 'active' : ''}" data-date="${dateIso}">
        <span class="day-num">D${dayNum}</span>
        <span class="day-date">${d.getDate()}/${d.getMonth()+1}</span>
      </div>
    `;
  }).join('');

  const blocksListHtml = PROTOCOLO_DAILY_BLOCKS.map(b => {
    const state = dayData.blocks[b.id] || {};
    const isCompleted = state.status === 'completed';
    const isSkipped = state.status === 'skipped';
    let activeTitle = b.title;

    if (b.options) {
      const selOptId = blockChoices[b.id] || b.options[0].id;
      const curOpt = b.options.find(o => o.id === selOptId) || b.options[0];
      activeTitle = `${b.title}: <strong>${curOpt.label}</strong>`;
    }

    return `
      <div class="proto-fullpage-block-card ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <div class="fullpage-block-header">
          <div class="fullpage-block-left">
            <span class="fullpage-block-time">${b.time}</span>
            <h4 class="fullpage-block-title">${activeTitle}</h4>
          </div>
          <div class="fullpage-block-right">
            <button type="button" class="btn-block-action btn-block-skip ${isSkipped ? 'active' : ''}" data-block-id="${b.id}">Marcar Vacío</button>
            <button type="button" class="btn-block-action btn-block-check ${isCompleted ? 'active' : ''}" data-block-id="${b.id}">✓ Completado</button>
          </div>
        </div>
        ${b.desc ? `<p class="fullpage-block-desc">${b.desc}</p>` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="protocolo-fullpage-workspace">
      <!-- TOP NAV -->
      <div class="proto-fullpage-nav">
        <a href="#backlog" class="btn-proto-back" id="btn-back-to-backlog">
          ← Volver a Selección de Backlog
        </a>
        <div class="proto-fullpage-tag">PROTOCOLO PRE-ELROW (10 SEP - 10 OCT 2026)</div>
      </div>

      <!-- 30-DAY SLIDER -->
      <div class="proto-timeline-container">
        <div class="proto-timeline-header">
          <div class="timeline-title-wrap">
            <span class="timeline-icon">📅</span>
            <div>
              <h3 class="timeline-title">Línea de Tiempo: Protocolo Pre-Elrow</h3>
              <p class="timeline-subtitle">Selecciona el día a consultar o registrar:</p>
            </div>
          </div>
          <div class="timeline-target-badge">🎯 Meta: 30 de Septiembre (3 Ventas ZentryOS)</div>
        </div>
        <div class="proto-days-scroller">
          ${daysBarHtml}
        </div>
      </div>

      <!-- WORKSPACE GRID -->
      <div class="proto-workspace-grid">
        <div class="proto-grid-main">
          <h3 class="blocks-section-title">Bloques Diarios (Elección Individual por Bloque)</h3>
          <div class="proto-fullpage-blocks-list">
            ${blocksListHtml}
          </div>
        </div>
        <div class="proto-grid-sidebar">
          <div class="sidebar-guide-card">
            <h4>⚡ Micronutrientes</h4>
            <p>Sal de Maras + Citrato Potasio + Tirosina + Vitamina C en ayunas.</p>
          </div>
          <div class="sidebar-guide-card">
            <h4>🍳 Nutrición Densa</h4>
            <p>4 huevos + corazón de res + arroz frío de refrigeradora normal.</p>
          </div>
          <div class="sidebar-guide-card">
            <h4>💊 Gabapentina</h4>
            <p>1 cápsula antes de dormir. CERO alcohol estricto.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// --- SETUP PROTOCOLO EVENTS ---
export function setupProtocoloEvents(container, isFullPage = false) {
  // 1. Selector de opción individual en cada bloque
  container.querySelectorAll('.btn-opt-pill').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const blockId = btn.dataset.blockId;
      const optId = btn.dataset.optId;
      saveBlockChoice(blockId, optId);
      refreshView();
    };
  });

  // 2. Check / Complete
  container.querySelectorAll('.btn-block-check').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const blockId = btn.dataset.blockId;
      const proto = getProtocoloData();
      const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
      const dayData = getDayData(proto, todayStr);
      
      const current = dayData.blocks[blockId] || {};
      const newStatus = current.status === 'completed' ? 'pending' : 'completed';
      dayData.blocks[blockId] = { ...current, status: newStatus };
      saveProtocoloData(proto);
      refreshView();
    };
  });

  // 3. Skip / Vacío / Hice otra cosa
  container.querySelectorAll('.btn-block-skip').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const blockId = btn.dataset.blockId;
      const proto = getProtocoloData();
      const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
      const dayData = getDayData(proto, todayStr);
      
      const current = dayData.blocks[blockId] || {};
      const newStatus = current.status === 'skipped' ? 'pending' : 'skipped';
      dayData.blocks[blockId] = { ...current, status: newStatus };
      saveProtocoloData(proto);
      refreshView();
    };
  });

  // 4. Modal de Guía Rápida
  const detailModal = container.querySelector('#proto-detail-modal');
  const detailTitle = container.querySelector('#proto-detail-title');
  const detailBody = container.querySelector('#proto-detail-body');
  const btnCloseModal = container.querySelector('#btn-close-proto-detail');

  const showDetail = (key) => {
    const item = PROTOCOLO_DETAILS[key];
    if (item && detailModal && detailTitle && detailBody) {
      detailTitle.textContent = item.title;
      detailBody.innerHTML = item.content;
      detailModal.style.display = 'block';
    }
  };

  if (btnCloseModal && detailModal) {
    btnCloseModal.onclick = () => { detailModal.style.display = 'none'; };
  }

  container.querySelectorAll('.btn-mini-guide, .btn-block-info').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const key = btn.dataset.detailKey;
      if (key) showDetail(key);
    };
  });

  // 5. Timeline day selector (Fullpage)
  if (isFullPage) {
    container.querySelectorAll('.timeline-day-pill').forEach(pill => {
      pill.onclick = () => {
        const dateIso = pill.dataset.date;
        const proto = getProtocoloData();
        proto.activeDate = dateIso;
        saveProtocoloData(proto);
        renderProtocolo30DiasFullPage(container);
        setupProtocoloEvents(container, true);
      };
    });
  }

  function refreshView() {
    if (isFullPage) {
      renderProtocolo30DiasFullPage(container);
      setupProtocoloEvents(container, true);
    } else {
      const mount = container.querySelector('#protocolo-preview-mount') || container;
      mount.innerHTML = renderProtocoloPreviewHTML();
      setupProtocoloEvents(mount, false);
    }
  }
}
