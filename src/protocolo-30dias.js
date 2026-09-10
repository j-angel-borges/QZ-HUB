// PROTOCOLO PRE-ELROW (10 SEP - 10 OCT 2026)
// Arquitectura Modular de Bloques Individuales e Interactivos

export const PROTOCOLO_STORAGE_KEY = 'qz_protocolo_pre_elrow_v3';
export const PROTOCOLO_BLOCK_CHOICES_KEY = 'qz_protocolo_pre_elrow_choices_v2';
export const START_DATE_STR = '2026-09-10';
export const END_DATE_STR = '2026-10-10';
export const TOTAL_DAYS = 30;

// Definición de bloques con rango de horas exacto
export const PROTOCOLO_DAILY_BLOCKS = [
  {
    id: 'b1',
    time: '06:00 - 06:30',
    title: 'Despertar & Shot Matutino',
    icon: '⚡',
    detailKey: 'shot',
    options: null
  },
  {
    id: 'b2',
    time: '06:30 - 08:00',
    title: 'Entrada Colegios (Presencial)',
    icon: '🎒',
    desc: 'Contacto con padres en puerta',
    options: null
  },
  {
    id: 'b3',
    time: '08:15 - 10:00',
    title: 'Llamadas & WSP a Leads',
    icon: '📞',
    desc: 'Marcación activa y seguimiento',
    options: null
  },
  {
    id: 'b4',
    time: '10:15 - 11:15',
    title: 'Bloque Flexible 1',
    icon: '🔄',
    options: [
      { id: 'opt_gym', label: '🏋️ Calistenia + Fría', desc: '45m Calistenia + 3m Ducha Fría en ayunas' },
      { id: 'opt_dev', label: '💻 Dev ZentryOS', desc: 'Soporte, Kiosk Mode y mejoras rápidas' }
    ]
  },
  {
    id: 'b5',
    time: '11:30 - 12:00',
    title: 'Comida 1: Carga Proteica',
    icon: '🍳',
    detailKey: 'comida',
    desc: '4 huevos + corazón/hígado + arroz frío + NAC',
    options: null
  },
  {
    id: 'b6',
    time: '12:00 - 12:30',
    title: 'Donnie: Paseo Fijo',
    icon: '🐕',
    detailKey: 'donnie',
    desc: '20-30 min luz cenital directa (12:00 PM)',
    options: null
  },
  {
    id: 'b7',
    time: '13:00 - 15:00',
    title: 'Prospección Tarde & Demos',
    icon: '🚶',
    desc: 'Salida de colegios / citas agendadas',
    options: null
  },
  {
    id: 'b8',
    time: '15:00 - 17:00',
    title: 'Bloque Flexible 2',
    icon: '🔄',
    options: [
      { id: 'opt_dev', label: '💻 Dev & Soporte', desc: 'Mesa de trabajo y código ZentryOS' },
      { id: 'opt_lunch', label: '🥗 Almuerzo / Break', desc: 'Comida secundaria o descanso mental' }
    ]
  },
  {
    id: 'b9',
    time: '17:00 - 19:30',
    title: 'Seguimiento Comercial & CRM',
    icon: '📊',
    desc: 'Cierre de cotizaciones y respuestas WSP',
    options: null
  },
  {
    id: 'b10',
    time: '19:30 - 21:00',
    title: 'Bloque Flexible 3',
    icon: '🔄',
    options: [
      { id: 'opt_gym_night', label: '🏋️ Gym Nocturno', desc: 'Entrenamiento si no se entrenó en la mañana' },
      { id: 'opt_calls_night', label: '📞 Cierres & Preparación', desc: 'Remate telefónico y agenda del día siguiente' }
    ]
  },
  {
    id: 'b11',
    time: '21:00 - 22:00',
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

// --- RENDER COMPACT PREVIEW (SIN BOTONES DE FOOTER, HORAS EN BLOQUES, ELECCIÓN INDIVIDUAL) ---
export function renderProtocoloPreviewHTML() {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const blockChoices = getBlockChoices();

  const today = new Date(todayStr + 'T00:00:00');
  const dateFormatted = today.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

  // Progreso diario
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
    const isSkipped = state.status === 'skipped';

    let centerHtml = '';
    if (b.options) {
      const selectedOptId = blockChoices[b.id] || b.options[0].id;
      centerHtml = `
        <div class="block-segmented-switcher">
          ${b.options.map(opt => `
            <button type="button" class="btn-opt-pill ${opt.id === selectedOptId ? 'is-active' : ''}" 
              data-block-id="${b.id}" data-opt-id="${opt.id}">
              ${opt.label}
            </button>
          `).join('')}
        </div>
      `;
    } else {
      centerHtml = `<span class="block-row-title">${b.title}</span>`;
    }

    return `
      <div class="proto-compact-block-row ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <span class="block-time-pill">${b.time}</span>
        
        <div class="block-row-center">
          ${centerHtml}
        </div>

        <div class="block-row-actions">
          <button type="button" class="btn-block-action btn-block-skip ${isSkipped ? 'active' : ''}" data-block-id="${b.id}" title="Marcar Vacío (Hice otra cosa)">∅</button>
          <button type="button" class="btn-block-action btn-block-check ${isCompleted ? 'active' : ''}" data-block-id="${b.id}" title="Marcar Cumplido">✓</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="protocolo-compact-preview-card" id="protocolo-30d-preview-card">
      <!-- CABECERA ULTRA COMPACTA -->
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

      <!-- LISTADO MODULAR DE BLOQUES -->
      <div class="proto-blocks-compact-list" id="proto-blocks-container">
        ${blocksHtml}
      </div>
    </div>
  `;
}

// --- RENDER FULL PAGE VIEW (#backlog/protocolo-30dias) SIN LÍNEA DE TIEMPO Y CON BOTONES LIMPIOS ---
export function renderProtocolo30DiasFullPage(container) {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const blockChoices = getBlockChoices();

  const blocksListHtml = PROTOCOLO_DAILY_BLOCKS.map(b => {
    const state = dayData.blocks[b.id] || {};
    const isCompleted = state.status === 'completed';
    const isSkipped = state.status === 'skipped';
    
    let titleHtml = b.title;
    let optionsHtml = '';

    if (b.options) {
      const selOptId = blockChoices[b.id] || b.options[0].id;
      const curOpt = b.options.find(o => o.id === selOptId) || b.options[0];
      titleHtml = `${b.title}: <strong>${curOpt.label}</strong>`;
      optionsHtml = `
        <div class="block-segmented-switcher" style="margin-top: 6px;">
          ${b.options.map(opt => `
            <button type="button" class="btn-opt-pill ${opt.id === selOptId ? 'is-active' : ''}" 
              data-block-id="${b.id}" data-opt-id="${opt.id}">
              ${opt.label}
            </button>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="proto-fullpage-block-card ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <div class="fullpage-block-header">
          <div class="fullpage-block-left">
            <span class="fullpage-block-time">${b.time}</span>
            <div class="fullpage-block-title-wrap">
              <h4 class="fullpage-block-title">${titleHtml}</h4>
              ${optionsHtml}
            </div>
          </div>
          <div class="fullpage-block-right">
            <button type="button" class="btn-fullpage-action btn-fullpage-skip ${isSkipped ? 'active' : ''}" data-block-id="${b.id}">
              ${isSkipped ? '✓ Vacío' : '∅ Marcar Vacío'}
            </button>
            <button type="button" class="btn-fullpage-action btn-fullpage-check ${isCompleted ? 'active' : ''}" data-block-id="${b.id}">
              ${isCompleted ? '✓ Cumplido' : 'Marcar Cumplido'}
            </button>
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

      <!-- WORKSPACE GRID (SIN LÍNEA DE TIEMPO) -->
      <div class="proto-workspace-grid" style="margin-top: 18px;">
        <div class="proto-grid-main">
          <h3 class="blocks-section-title">Bloques Diarios (Elección Individual por Bloque)</h3>
          <div class="proto-fullpage-blocks-list">
            ${blocksListHtml}
          </div>
        </div>
        <div class="proto-grid-sidebar">
          <div class="sidebar-guide-card">
            <h4>⚡ Micronutrientes (Shot)</h4>
            <p>Sal de Maras (~1.5g) + Citrato Potasio + Tirosina (500-1000mg) + Vitamina C en ayunas. Sin estevia.</p>
          </div>
          <div class="sidebar-guide-card">
            <h4>🍳 Nutrición Densa</h4>
            <p>4 huevos + corazón de res (150g diario) + arroz frío de refrigeradora normal (NO congelador) + NAC con comida.</p>
          </div>
          <div class="sidebar-guide-card">
            <h4>🐕 Donnie (12:00 PM)</h4>
            <p>Paseo fijo de 20 a 30 min innegociable con luz cenital directa.</p>
          </div>
          <div class="sidebar-guide-card">
            <h4>💊 Gabapentina (21:30 PM)</h4>
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
  container.querySelectorAll('.btn-block-check, .btn-fullpage-check').forEach(btn => {
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
  container.querySelectorAll('.btn-block-skip, .btn-fullpage-skip').forEach(btn => {
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

  function refreshView() {
    if (isFullPage) {
      renderProtocolo30DiasFullPage(container);
      setupProtocoloEvents(container, true);
    } else {
      // Usar estrictamente el ID del mount sin tocar el resto del backlog
      const mount = document.getElementById('protocolo-preview-mount');
      if (mount) {
        mount.innerHTML = renderProtocoloPreviewHTML();
        setupProtocoloEvents(mount, false);
      }
    }
  }
}
