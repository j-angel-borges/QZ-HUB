// ==============================================================================
// PROTOCOLO PRE-ELROW (10 SEP - 10 OCT 2026)
// Biología, Cronobiología, Hábitos y Rutas Comerciales de Alto Impacto
// ==============================================================================

const PROTOCOLO_STORAGE_KEY = 'qz_protocolo_30dias';
const START_DATE_STR = '2026-09-10';
const END_DATE_STR = '2026-10-10';
const TOTAL_DAYS = 30;

export const PROTOCOLO_VIAS = {
  1: {
    id: 1,
    name: 'Vía 1: El Atleta Matutino',
    tagline: 'Almuerzo 11:30 • Donnie 12:00 • Salida Colegios 13:00 • Dev 15:00 • Llamadas 18:30',
    badge: '🏋️ Foco Físico Matutino',
    accentColor: '#10b981',
    blocks: [
      { id: 'b1', time: '06:00 - 06:30', title: 'Shot Matutino Neuro-Dopaminérgico', desc: 'Sal de Maras + Citrato Potasio + Limón + Tirosina + Vit C partida (Sin estevia, sin magnesio)', detailKey: 'shot', icon: '⚡' },
      { id: 'b2', time: '07:00 - 08:00', title: 'Entrada de Colegios (Prospección Presencial)', desc: 'Contacto directo con padres que dejan a sus hijos en puerta', icon: '🎒' },
      { id: 'b3', time: '08:15 - 10:00', title: 'Bloque 1 de Llamadas & WSP a Leads', desc: 'Marcación activa y seguimiento telefónico matutino', icon: '📞' },
      { id: 'b4', time: '10:15 - 11:15', title: 'Calistenia Intensa (45m) + Ducha Fría (3m)', desc: 'Reset dopaminérgico somático en ayunas antes de comer', icon: '🏋️' },
      { id: 'b5', time: '11:30 - 12:00', title: 'Comida 1: Carga Proteica & Arroz Frío', desc: '4 huevos + corazón/hígado + arroz retrogradado de refrigeradora + NAC & B-Complex', detailKey: 'comida', icon: '🍳' },
      { id: 'b6', time: '12:00 - 12:30', title: 'Donnie: Paseo Fijo de Mediodía (20-30 min)', desc: 'Paseo innegociable a Donnie + sol directo de mediodía', detailKey: 'donnie', icon: '🐕' },
      { id: 'b7', time: '13:00 - 14:30', title: 'Salida de Colegios (Demos Presenciales)', desc: 'Padres esperando en la puerta. Demos en vivo con Tab A7 / iPad', icon: '🎒' },
      { id: 'b8', time: '15:00 - 17:30', title: 'Soporte & Desarrollo Técnico PWA', desc: 'Deep work controlado en casa sin desbordar tiempo', icon: '💻' },
      { id: 'b9', time: '17:30 - 18:15', title: 'Comida 2: Cena Proteica Limpia', desc: 'Proteína limpia (pollo/corazón) + ensalada o tubérculo', detailKey: 'comida', icon: '🍳' },
      { id: 'b10', time: '18:30 - 20:30', title: 'Bloque 2 de Llamadas Noche & Cierres', desc: 'Contactar a padres en casa / Demos online agendadas', icon: '📞' },
      { id: 'b11', time: '21:30 - 22:00', title: 'Gabapentina + Desconexión & Sueño', desc: '1 cápsula 30 min antes de dormir. CERO alcohol estricto', detailKey: 'gaba', icon: '💊' }
    ]
  },
  2: {
    id: 2,
    name: 'Vía 2: El Operador de Tarde',
    tagline: 'Dev 10:00 • Donnie 12:00 • Salida Colegios 13:00 • Almuerzo 15:00 • Calistenia Noche 20:45',
    badge: '💻 Foco Dev & Calistenia Noche',
    accentColor: '#3b82f6',
    blocks: [
      { id: 'b1', time: '06:00 - 06:30', title: 'Shot Matutino Neuro-Dopaminérgico', desc: 'Sal de Maras + Citrato Potasio + Limón + Tirosina + Vit C partida (Sin estevia, sin magnesio)', detailKey: 'shot', icon: '⚡' },
      { id: 'b2', time: '07:00 - 08:00', title: 'Entrada de Colegios (Prospección Presencial)', desc: 'Contacto directo matutino en colegios', icon: '🎒' },
      { id: 'b3', time: '08:15 - 10:00', title: 'Bloque 1 de Llamadas & WSP', desc: 'Marcación y prospección telefónica matutina', icon: '📞' },
      { id: 'b4', time: '10:00 - 12:00', title: 'Dev & Tooling PWA (En Ayuno / Foco Frío)', desc: 'Desarrollo en alta concentración sin digestión pesada', icon: '💻' },
      { id: 'b5', time: '12:00 - 12:30', title: 'Donnie: Paseo Fijo de Mediodía (20-30 min)', desc: 'Paseo innegociable a Donnie + sol de mediodía', detailKey: 'donnie', icon: '🐕' },
      { id: 'b6', time: '13:00 - 14:30', title: 'Salida de Colegios (Demos en Puerta)', desc: 'Demos en vivo en Tab A7 / iPad a padres', icon: '🎒' },
      { id: 'b7', time: '15:00 - 15:45', title: 'Comida 1: Almuerzo Post-Colegios', desc: 'Huevos + órganos + arroz frío + NAC & B-Complex', detailKey: 'comida', icon: '🍳' },
      { id: 'b8', time: '16:00 - 18:00', title: 'Soporte & Preparación de Propuestas', desc: 'Seguimiento comercial y material de ventas', icon: '💻' },
      { id: 'b9', time: '18:30 - 20:30', title: 'Bloque 2 de Llamadas Comerciales', desc: 'Llamadas de cierre en horario estelar con padres en casa', icon: '📞' },
      { id: 'b10', time: '20:45 - 21:30', title: 'Calistenia Nocturna (45m) + Ducha Caliente', desc: 'Descarga somática de tensión acumulada en la jornada', icon: '🏋️' },
      { id: 'b11', time: '21:30 - 22:00', title: 'Gabapentina + Desconexión & Sueño', desc: '1 cápsula 30 min antes de dormir. CERO alcohol estricto', detailKey: 'gaba', icon: '💊' }
    ]
  },
  3: {
    id: 3,
    name: 'Vía 3: Jornada Continua de Campo',
    tagline: 'Ruta Continua de Demos • Snack Chicharrón • Comida Unificada 17:30 • Cierres',
    badge: '🚶 Caza de Campo Agresiva',
    accentColor: '#f59e0b',
    blocks: [
      { id: 'b1', time: '06:00 - 06:30', title: 'Shot Matutino (Doble Sal de Maras)', desc: 'Máxima hidratación osmótica para ruta larga (Sin estevia, sin magnesio)', detailKey: 'shot', icon: '⚡' },
      { id: 'b2', time: '07:00 - 08:00', title: 'Entrada de Colegios (Cluster 1)', desc: 'Primer contacto matutino en colegios', icon: '🎒' },
      { id: 'b3', time: '08:15 - 10:00', title: 'Llamadas & WSP desde Cafetería / Ruta', desc: 'Agendamiento y marcación sobre la marcha', icon: '📞' },
      { id: 'b4', time: '10:00 - 12:00', title: 'Visitas a Contactos / Demos Agendadas', desc: 'Demostraciones presenciales en terreno', icon: '🚶' },
      { id: 'b5', time: '12:00 - 12:30', title: 'Donnie: Paseo Express en Casa', desc: 'Regreso táctico a casa para atender a Donnie (12:00 PM)', detailKey: 'donnie', icon: '🐕' },
      { id: 'b6', time: '13:00 - 14:30', title: 'Salida de Colegios (Cluster 2)', desc: 'Demos presenciales en puerta de colegios', icon: '🎒' },
      { id: 'b7', time: '14:30 - 17:30', title: 'Prospección en La Rambla / Parques', desc: 'Snack de chicharrón casero en ziploc + termo de agua con sal', detailKey: 'snack', icon: '🚶' },
      { id: 'b8', time: '17:30 - 18:30', title: 'Gran Comida Unificada al Volver', desc: 'Corazón/hígado + 4 huevos + arroz frío de refrigeradora + ensalada', detailKey: 'comida', icon: '🍳' },
      { id: 'b9', time: '18:30 - 20:30', title: 'Seguimientos Finales de WSP & Cierres', desc: 'Formalización de acuerdos y citas siguientes', icon: '📞' },
      { id: 'b10', time: '21:00 - 22:00', title: 'Gabapentina + Descanso Profundo', desc: '1 cápsula 30 min antes de dormir. CERO alcohol estricto', detailKey: 'gaba', icon: '💊' }
    ]
  }
};

export const PROTOCOLO_DETAILS = {
  shot: {
    title: '⚡ Shot Matutino Neuro-Dopaminérgico (06:00 - 06:15 AM)',
    icon: '⚡',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>💧 Base Líquida:</strong> 400 - 500 ml de agua fresca templada.</div>
        <div class="proto-detail-item"><strong>🧂 Sal de Maras:</strong> 1/3 cdta (~1.5g) para restaurar volumen plasmático y tono adrenal.</div>
        <div class="proto-detail-item"><strong>🧪 Citrato de Potasio:</strong> 1/4 a 1/2 cdta para balance electrolítico intracelular.</div>
        <div class="proto-detail-item"><strong>🍋 Limón Fresco:</strong> Jugo de 1/2 a 1 limón entero recién exprimido.</div>
        <div class="proto-detail-item"><strong>🧠 L-Tirosina:</strong> 500 - 1000 mg (1-2 cápsulas en ayunas). Precursor directo de dopamina y noradrenalina.</div>
        <div class="proto-detail-item"><strong>🍊 Vitamina C:</strong> 1/2 cápsula (partida por la mitad). Máxima absorción como cofactor de neurotransmisores.</div>
        <div class="proto-detail-alert">🚫 <strong>AJUSTE CLÍNICO:</strong> Estevia ELIMINADA por completo. Citrato de Magnesio EXCLUIDO (terminado).</div>
      </div>
    `
  },
  comida: {
    title: '🍳 Guía de Nutrición Densa & Arroz Frío Retrogradado',
    icon: '🍳',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>🥚 Base Diaria:</strong> 4 huevos enteros revueltos/fritos en mantequilla o manteca de cerdo + queso edam/fresco.</div>
        <div class="proto-detail-item"><strong>❤️ Corazón de Res:</strong> 150g (1-2 filetes). <strong>Consumo diario seguro</strong>. CoQ10, zinc y carnitina muscular masiva.</div>
        <div class="proto-detail-item"><strong>🥩 Hígado de Res:</strong> 100 - 120g (1 filete). <strong>Máximo 2 veces por semana</strong> (ej. Lunes y Jueves). Retinol y complejo B.</div>
        <div class="proto-detail-item"><strong>🧠 Sesos de Res:</strong> 150 - 180g. <strong>Máximo 2 veces por semana</strong> (ej. Miércoles y Sábado). DHA puro y fosfatidilserina.</div>
        <div class="proto-detail-item"><strong>🍚 Arroz Frío Retrogradado:</strong> 1 taza sacada de la <strong>refrigeradora normal (NO congelador)</strong>. Almidón resistente que previene picos de glucosa.</div>
        <div class="proto-detail-item"><strong>💊 Suplementos con Almuerzo:</strong> 1 cápsula NAC (600 mg) + B-Complex (usar con Zinc si no comes carne de res/corazón).</div>
      </div>
    `
  },
  donnie: {
    title: '🐕 Donnie: Paseo Fijo de Mediodía (12:00 - 12:30 PM)',
    icon: '🐕',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>⏱️ Duración:</strong> 20 a 30 minutos innegociables todos los días.</div>
        <div class="proto-detail-item"><strong>☀️ Anclaje Circadiano:</strong> Exposición a luz natural cenital directa (sincroniza ritmo suprarrenal y vigilia).</div>
        <div class="proto-detail-item"><strong>🧠 Higiene Mental:</strong> Desconexión física obligatoria de pantallas antes de la salida a colegios de la 1:00 PM.</div>
      </div>
    `
  },
  snack: {
    title: '🥓 Snack de Ruta Casero "Zero Sugar" (Chicharrón de Cerdo)',
    icon: '🥓',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>🐖 Preparación:</strong> 1 kg de tocino/papada en cubitos a fuego lento con sal de Maras en sartén.</div>
        <div class="proto-detail-item"><strong>🎒 Logística:</strong> Trozos de chicharrón crocante en bolsa ziploc. Saciedad lipídica limpia; mata cualquier craving en ruta.</div>
        <div class="proto-detail-item"><strong>🏺 Oro Líquido:</strong> Cuela la manteca en un frasco de vidrio para cocinar huevos e hígado sin usar aceites vegetales.</div>
      </div>
    `
  },
  gaba: {
    title: '💊 Gabapentina Nocturna & Protocolo de Cierre (21:30 - 22:00 PM)',
    icon: '💊',
    content: `
      <div class="proto-detail-grid">
        <div class="proto-detail-item"><strong>💊 Fármaco:</strong> 1 pastilla de Gabapentina 30 minutos antes de dormir según indicación psiquiátrica.</div>
        <div class="proto-detail-item"><strong>🧠 Función:</strong> Modulador de canales de calcio y estabilizador GABA. Evita rumiación nocturna e insomnio de rebote.</div>
        <div class="proto-detail-alert">🚫 <strong>PROHIBICIÓN ESTRICTA:</strong> Cero alcohol. La interacción con etanol desactiva el control prefrontal y causa amnesia conductual.</div>
      </div>
    `
  }
};

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
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
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
      viaId: 1,
      blocks: {},
      notes: ''
    };
  }
  return protoData.days[dateStr];
}

export function calculateDayProgress(blocks, dayBlocks) {
  if (!blocks || blocks.length === 0) return 0;
  let completed = 0;
  blocks.forEach(b => {
    if (dayBlocks && dayBlocks[b.id] && dayBlocks[b.id].status === 'completed') {
      completed++;
    }
  });
  return Math.round((completed / blocks.length) * 100);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- RENDER PREVIEW VIEW (EN SECCIÓN BACKLOG) ---
export function renderProtocoloPreviewHTML() {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const activeViaId = dayData.viaId || 1;
  const via = PROTOCOLO_VIAS[activeViaId] || PROTOCOLO_VIAS[1];
  const progressPct = calculateDayProgress(via.blocks, dayData.blocks || {});

  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'short' };
  const dateFormatted = now.toLocaleDateString('es-ES', options);

  let blocksHtml = via.blocks.map(b => {
    const statusObj = dayData.blocks && dayData.blocks[b.id] ? dayData.blocks[b.id] : { status: 'pending', note: '' };
    const isCompleted = statusObj.status === 'completed';
    const isSkipped = statusObj.status === 'skipped';

    return `
      <div class="proto-block-row ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <div class="proto-block-check" data-action="toggle-complete" data-block-id="${b.id}" title="Marcar como cumplido">
          ${isCompleted ? '✓' : ''}
        </div>
        
        <div class="proto-block-body" data-action="toggle-empty-space" data-block-id="${b.id}" title="Clic en el espacio para registrar si omitiste o hiciste otra cosa">
          <div class="proto-block-meta">
            <span class="proto-block-time">${b.time}</span>
            ${isSkipped ? `<span class="proto-skipped-tag">Omitido: ${escapeHTML(statusObj.note || 'No realizado')}</span>` : ''}
          </div>
          <div class="proto-block-title">${b.icon} ${b.title}</div>
          <div class="proto-block-desc">${b.desc}</div>
        </div>

        <div class="proto-block-actions">
          ${b.detailKey ? `<button type="button" class="btn-proto-detail" data-detail-key="${b.detailKey}" title="Ver pautas y receta exacta">Detalles</button>` : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="protocolo-30d-preview-card" id="protocolo-30d-preview-card">
      <!-- HEADER -->
      <div class="proto-card-header">
        <div class="proto-header-left">
          <div class="proto-badge-row">
            <span class="proto-pulse-dot"></span>
            <span class="proto-badge-live">PROTOCOLO ACTIVO</span>
            <span class="proto-badge-date">${dateFormatted}</span>
          </div>
          <h3 class="proto-title">PROTOCOLO PRE-ELROW</h3>
          <p class="proto-subtitle">30 Días de Recomposición Biológica, Prospección y Disciplina</p>
        </div>
        <div class="proto-header-right">
          <a href="#backlog/protocolo-30dias" class="btn-proto-expand-full" title="Expandir a Pantalla Completa">
            <span>⛶ Pantalla Completa</span>
          </a>
        </div>
      </div>

      <!-- SELECTOR DE VÍA -->
      <div class="proto-vias-selector">
        <span class="proto-vias-label">Vía de Hoy:</span>
        <div class="proto-vias-btns">
          <button type="button" class="btn-proto-via ${activeViaId === 1 ? 'active' : ''}" data-via-id="1">
            <span class="via-btn-badge">VÍA 1</span>
            <span class="via-btn-name">🏋️ Atleta</span>
          </button>
          <button type="button" class="btn-proto-via ${activeViaId === 2 ? 'active' : ''}" data-via-id="2">
            <span class="via-btn-badge">VÍA 2</span>
            <span class="via-btn-name">💻 Dev Tarde</span>
          </button>
          <button type="button" class="btn-proto-via ${activeViaId === 3 ? 'active' : ''}" data-via-id="3">
            <span class="via-btn-badge">VÍA 3</span>
            <span class="via-btn-name">🚶 Campo</span>
          </button>
        </div>
      </div>

      <!-- PROGRESS BAR -->
      <div class="proto-progress-wrap">
        <div class="proto-progress-bar">
          <div class="proto-progress-fill" style="width: ${progressPct}%;"></div>
        </div>
        <div class="proto-progress-text">Adherencia del día: <strong>${progressPct}%</strong></div>
      </div>

      <!-- QUICK DETAILS POPUP -->
      <div class="proto-detail-modal" id="proto-detail-modal" style="display: none;">
        <div class="proto-detail-modal-header">
          <h4 id="proto-detail-title">⚡ Detalle</h4>
          <button type="button" class="btn-close-proto-detail" id="btn-close-proto-detail">✕</button>
        </div>
        <div class="proto-detail-modal-body" id="proto-detail-body"></div>
      </div>

      <!-- LISTA DE BLOQUES -->
      <div class="proto-blocks-list" id="proto-blocks-container">
        ${blocksHtml}
      </div>

      <!-- FOOTER ACCIÓN RÁPIDA -->
      <div class="proto-card-footer">
        <div class="proto-footer-chips">
          <button type="button" class="btn-quick-guide" data-detail-key="shot">⚡ Shot</button>
          <button type="button" class="btn-quick-guide" data-detail-key="comida">🍳 Nutrición</button>
          <button type="button" class="btn-quick-guide" data-detail-key="donnie">🐕 Donnie (12:00)</button>
          <button type="button" class="btn-quick-guide" data-detail-key="gaba">💊 Gaba (21:30)</button>
        </div>
        <a href="#backlog/protocolo-30dias" class="proto-link-full">Ver Calendario Completo →</a>
      </div>
    </div>
  `;
}

// --- RENDER FULL PAGE VIEW (#backlog/protocolo-30dias) ---
export function renderProtocolo30DiasFullPage(container) {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];
  const dayData = getDayData(proto, todayStr);
  const activeViaId = dayData.viaId || 1;
  const via = PROTOCOLO_VIAS[activeViaId] || PROTOCOLO_VIAS[1];

  const start = new Date(START_DATE_STR + 'T00:00:00');
  const daysBarHtml = Array.from({ length: TOTAL_DAYS }).map((_, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    const dateIso = d.toISOString().split('T')[0];
    const isCurrent = dateIso === todayStr;
    const existingDay = proto.days[dateIso];
    let isDone = false;
    if (existingDay && existingDay.blocks) {
      const v = PROTOCOLO_VIAS[existingDay.viaId || 1] || PROTOCOLO_VIAS[1];
      const prog = calculateDayProgress(v.blocks, existingDay.blocks);
      if (prog >= 70) isDone = true;
    }

    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
    const dayNum = d.getDate();

    return `
      <div class="proto-day-chip ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}" data-date="${dateIso}">
        <div class="day-chip-sub">DÍA ${idx + 1}</div>
        <div class="day-chip-num">${dayNum}</div>
        <div class="day-chip-weekday">${dayName}</div>
      </div>
    `;
  }).join('');

  const progressPct = calculateDayProgress(via.blocks, dayData.blocks || {});

  let blocksFullHtml = via.blocks.map(b => {
    const statusObj = dayData.blocks && dayData.blocks[b.id] ? dayData.blocks[b.id] : { status: 'pending', note: '' };
    const isCompleted = statusObj.status === 'completed';
    const isSkipped = statusObj.status === 'skipped';

    return `
      <div class="proto-fullpage-block-card ${isCompleted ? 'is-completed' : ''} ${isSkipped ? 'is-skipped' : ''}" data-block-id="${b.id}">
        <div class="fullpage-block-header">
          <div class="fullpage-block-left">
            <div class="proto-block-check" data-action="toggle-complete" data-block-id="${b.id}" style="width: 32px; height: 32px; font-size: 16px;">
              ${isCompleted ? '✓' : ''}
            </div>
            <div>
              <div class="fullpage-block-time">${b.time}</div>
              <h4 class="fullpage-block-title">${b.icon} ${b.title}</h4>
            </div>
          </div>
          <div class="fullpage-block-right">
            ${b.detailKey ? `<button type="button" class="btn-proto-detail" data-detail-key="${b.detailKey}">ℹ️ Ver Protocolo</button>` : ''}
            <button type="button" class="btn-proto-skip ${isSkipped ? 'active' : ''}" data-action="toggle-skip" data-block-id="${b.id}">
              ${isSkipped ? '⭕ Omitido / Hice otra cosa' : 'Marcar Omitido'}
            </button>
          </div>
        </div>
        <div class="fullpage-block-body">
          <p class="fullpage-block-desc">${b.desc}</p>
          <div class="fullpage-note-box">
            <input type="text" class="proto-note-input" data-block-id="${b.id}" placeholder="¿Hiciste otra cosa o tienes alguna nota de este bloque? Escribe aquí..." value="${escapeHTML(statusObj.note || '')}" />
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="protocolo-fullpage-workspace">
      <!-- TOP NAVIGATION BAR -->
      <div class="proto-fullpage-nav">
        <a href="#backlog" class="btn-proto-back" id="btn-back-to-backlog">
          ← Volver a Selección de Backlog
        </a>
        <div class="proto-fullpage-tag">PROTOCOLO PRE-ELROW • 30 DÍAS (10 SEP - 10 OCT 2026)</div>
      </div>

      <!-- 30-DAY HORIZONTAL SLIDER -->
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

      <!-- MAIN WORKSPACE: 2 COLUMNS (LEFT: TODAY VIA & BLOCKS | RIGHT: REFERENCE GUIDES) -->
      <div class="proto-fullpage-grid">
        <div class="proto-grid-main">
          <!-- VIA SELECTOR CARD -->
          <div class="proto-active-day-card">
            <div class="active-day-card-header">
              <div>
                <span class="active-day-badge">DÍA SELECCIONADO</span>
                <h2 class="active-day-date-title" id="proto-active-date-display">${todayStr}</h2>
              </div>
              <div class="active-day-progress-wrap">
                <span class="active-day-progress-val">${progressPct}%</span>
                <span class="active-day-progress-lbl">Cumplimiento</span>
              </div>
            </div>

            <div class="proto-vias-selector-full">
              <span class="vias-selector-full-label">Vía seleccionada para hoy:</span>
              <div class="vias-selector-full-grid">
                ${Object.values(PROTOCOLO_VIAS).map(v => `
                  <div class="via-option-card ${v.id === activeViaId ? 'selected' : ''}" data-via-id="${v.id}">
                    <div class="via-card-top">
                      <span class="via-card-badge">${v.badge}</span>
                      <span class="via-card-radio">${v.id === activeViaId ? '●' : '○'}</span>
                    </div>
                    <h4 class="via-card-title">${v.name}</h4>
                    <p class="via-card-tagline">${v.tagline}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="proto-day-notes-container">
              <label class="notes-label">📝 Cuaderno de Bitácora del Día (Notas, sensaciones y cierres):</label>
              <textarea class="proto-day-textarea" id="proto-day-textarea" placeholder="Escribe aquí reflexiones del día, prospecciones en colegios, llamadas realizadas o estado físico...">${escapeHTML(dayData.notes || '')}</textarea>
            </div>
          </div>

          <!-- BLOCKS LIST -->
          <div class="proto-fullpage-blocks-list">
            <h3 class="blocks-section-title">Bloques Horarios de la ${via.name}</h3>
            ${blocksFullHtml}
          </div>
        </div>

        <!-- RIGHT SIDEBAR: PERMANENT REFERENCE GUIDES -->
        <div class="proto-grid-sidebar">
          <div class="sidebar-guide-card">
            <div class="sidebar-guide-header">
              <span class="guide-icon">⚡</span>
              <h4>Shot Neuro-Dopaminérgico</h4>
            </div>
            <div class="sidebar-guide-body">
              <p>400-500ml agua + 1.5g Sal de Maras + 1/4 cdta Citrato Potasio + limón + 500-1000mg L-Tirosina + 1/2 cápsula Vitamina C partida. <strong>Sin estevia y sin magnesio</strong>.</p>
            </div>
          </div>

          <div class="sidebar-guide-card">
            <div class="sidebar-guide-header">
              <span class="guide-icon">🍳</span>
              <h4>Nutrición Densa & Arroz Frío</h4>
            </div>
            <div class="sidebar-guide-body">
              <p>4 huevos + corazón de res diario (150g). Hígado (máx 2x sem, 120g). Sesos (máx 2x sem, 180g). Arroz frío de <strong>refrigeradora normal (NO congelador)</strong> para almidón resistente.</p>
            </div>
          </div>

          <div class="sidebar-guide-card">
            <div class="sidebar-guide-header">
              <span class="guide-icon">🐕</span>
              <h4>Donnie: 12:00 PM Innegociable</h4>
            </div>
            <div class="sidebar-guide-body">
              <p>Paseo de 20 a 30 minutos todos los días sin excepción. Luz solar directa de mediodía para anclaje circadiano y pausa mental antes de salida de colegios.</p>
            </div>
          </div>

          <div class="sidebar-guide-card">
            <div class="sidebar-guide-header">
              <span class="guide-icon">💊</span>
              <h4>Gabapentina Nocturna</h4>
            </div>
            <div class="sidebar-guide-body">
              <p>1 cápsula 30 minutos antes de dormir según indicación psiquiátrica. <strong>Tolerancia cero al alcohol</strong>.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DETALLE EN FULLPAGE -->
      <div class="proto-detail-modal" id="proto-detail-modal" style="display: none;">
        <div class="proto-detail-modal-header">
          <h4 id="proto-detail-title">⚡ Detalle</h4>
          <button type="button" class="btn-close-proto-detail" id="btn-close-proto-detail">✕</button>
        </div>
        <div class="proto-detail-modal-body" id="proto-detail-body"></div>
      </div>
    </div>
  `;
}

// --- CONTROLLER DE EVENTOS ---
export function setupProtocoloEvents(container, isFullPage = false) {
  const proto = getProtocoloData();
  const todayStr = proto.activeDate || new Date().toISOString().split('T')[0];

  const refreshUI = () => {
    if (isFullPage) {
      renderProtocolo30DiasFullPage(container);
      setupProtocoloEvents(container, true);
    } else {
      const card = container.querySelector('#protocolo-30d-preview-card');
      if (card) {
        const temp = document.createElement('div');
        temp.innerHTML = renderProtocoloPreviewHTML();
        card.replaceWith(temp.firstElementChild);
        setupProtocoloEvents(container, false);
      }
    }
  };

  // 1. Selector de Vías
  container.querySelectorAll('[data-via-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const viaId = parseInt(btn.getAttribute('data-via-id'), 10);
      const day = getDayData(proto, proto.activeDate || todayStr);
      day.viaId = viaId;
      saveProtocoloData(proto);
      refreshUI();
    });
  });

  // 2. Toggle Complete (Check)
  container.querySelectorAll('[data-action="toggle-complete"]').forEach(checkEl => {
    checkEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const blockId = checkEl.getAttribute('data-block-id');
      const day = getDayData(proto, proto.activeDate || todayStr);
      if (!day.blocks[blockId]) day.blocks[blockId] = { status: 'pending', note: '' };
      
      if (day.blocks[blockId].status === 'completed') {
        day.blocks[blockId].status = 'pending';
      } else {
        day.blocks[blockId].status = 'completed';
      }
      saveProtocoloData(proto);
      refreshUI();
    });
  });

  // 3. Toggle Empty Space (Mark as Skipped or Note)
  container.querySelectorAll('[data-action="toggle-empty-space"]').forEach(bodyEl => {
    bodyEl.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const blockId = bodyEl.getAttribute('data-block-id');
      const day = getDayData(proto, proto.activeDate || todayStr);
      if (!day.blocks[blockId]) day.blocks[blockId] = { status: 'pending', note: '' };

      const current = day.blocks[blockId];
      if (current.status === 'skipped') {
        const reset = confirm('¿Deseas quitar la marca de omitido de este bloque?');
        if (reset) {
          current.status = 'pending';
          current.note = '';
        }
      } else {
        const note = prompt('¿Qué hiciste en este bloque o por qué se omitió? (Dejar vacío si no aplica):', current.note || '');
        if (note !== null) {
          current.status = 'skipped';
          current.note = note.trim();
        }
      }
      saveProtocoloData(proto);
      refreshUI();
    });
  });

  // 4. Detalle Modal
  const modal = container.querySelector('#proto-detail-modal');
  const modalTitle = container.querySelector('#proto-detail-title');
  const modalBody = container.querySelector('#proto-detail-body');
  const closeBtn = container.querySelector('#btn-close-proto-detail');

  container.querySelectorAll('[data-detail-key]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-detail-key');
      const detail = PROTOCOLO_DETAILS[key];
      if (detail && modal && modalTitle && modalBody) {
        modalTitle.textContent = detail.title;
        modalBody.innerHTML = detail.content;
        modal.style.display = 'block';
      }
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
  }

  // 5. Timeline selector en FullPage
  if (isFullPage) {
    container.querySelectorAll('.proto-day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const dateIso = chip.getAttribute('data-date');
        proto.activeDate = dateIso;
        saveProtocoloData(proto);
        refreshUI();
      });
    });

    const textarea = container.querySelector('#proto-day-textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        const day = getDayData(proto, proto.activeDate || todayStr);
        day.notes = textarea.value;
        saveProtocoloData(proto);
      });
    }

    container.querySelectorAll('.proto-note-input').forEach(input => {
      input.addEventListener('change', () => {
        const blockId = input.getAttribute('data-block-id');
        const day = getDayData(proto, proto.activeDate || todayStr);
        if (!day.blocks[blockId]) day.blocks[blockId] = { status: 'pending', note: '' };
        day.blocks[blockId].note = input.value.trim();
        saveProtocoloData(proto);
      });
    });
  }
}
