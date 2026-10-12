// ==============================================================================
// QZ HUB — SPRINT DE 3 DÍAS (MICRO-BLOQUES DE CORTO PLAZO)
// ==============================================================================
// Enlace entre el Timeblocking inmediato (Presente) y la Hoja de Ruta (14 Días).
// ==============================================================================

const SPRINT_STORAGE_KEY = 'qz_sprint_3dias';

export function getDefaultSprint3DiasData() {
  return {
    sprintNumber: 1,
    title: 'Sprint 1: Aterrizaje Biológico, Orden y Calistenia',
    startDate: '2026-10-12',
    endDate: '2026-10-14',
    goal: 'Restaurar homeostasis química, cero azúcar ni pornografía, y primeros bloques comerciales.',
    days: [
      {
        id: 'day-1',
        date: '2026-10-12',
        dayLabel: 'D1 • Lunes 12 Octubre',
        bio: 'Keto Limpio (5 huevos + palta + mantequilla + queso) + Sal de Maras & Limón + Cero Azúcar',
        workout: 'Calistenia en barras frente a casa: Front Lever (máx 1.5h)',
        sales: '30m llamadas Royal Prestige + 30m prospección Royal',
        support: '1h orden leads ExpoMaternidad + 30m mensajes Zentry',
        completed: false
      },
      {
        id: 'day-2',
        date: '2026-10-13',
        dayLabel: 'D2 • Martes 13 Octubre',
        bio: 'Keto continuo + Ventana de comida cerrada a las 19:00 + Cero estimulación barata',
        workout: 'Calistenia: Estiramiento y acondicionamiento físico (45 min)',
        sales: 'Llamadas fuera de casa (08:30–10:00 AM) en barras/caminata',
        support: 'Preparación y cierre de presentación/demo ZentryOS (Factor WOW)',
        completed: false
      },
      {
        id: 'day-3',
        date: '2026-10-14',
        dayLabel: 'D3 • Miércoles 14 Octubre',
        bio: 'Keto estricto + Electrolitos + Foco mental (Antídoto a autoflagelación blanca)',
        workout: 'Calistenia intensa: Rutina de empuje (máx 1.5h)',
        sales: 'Lanzamiento de llamadas Zentry + Citas para fin de semana',
        support: 'Lista cerrada de compras para el jueves temprano (S/ 100 casa, S/ 50 bio)',
        completed: false
      }
    ],
    rules: [
      '🚫 Cero alcohol, cero porros, cero azúcar refinado, cero pornografía.',
      '📱 Tablet apagada y guardada en gaveta fuera del dormitorio durante la noche.',
      '📞 Llamadas matutinas (08:30–10:00 AM) siempre fuera de casa para eliminar fricción.'
    ]
  };
}

export function getSprint3DiasData() {
  try {
    const raw = localStorage.getItem(SPRINT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.days && parsed.days.length === 3) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading sprint 3 dias from storage, using default:', e);
  }
  const defaultData = getDefaultSprint3DiasData();
  saveSprint3DiasData(defaultData);
  return defaultData;
}

export function saveSprint3DiasData(data) {
  try {
    localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(data));
    if (window.pushCloudDataDebounced) {
      window.pushCloudDataDebounced();
    }
  } catch (e) {
    console.error('Error saving sprint 3 dias:', e);
  }
}

export function renderSprint3DiasHTML() {
  const sprint = getSprint3DiasData();
  const completedCount = sprint.days.filter(d => d.completed).length;
  const progressPct = Math.round((completedCount / 3) * 100);

  const daysHtml = sprint.days.map((day, idx) => {
    const isCompleted = !!day.completed;
    return `
      <div class="sprint-day-card ${isCompleted ? 'is-completed' : ''}" data-day-index="${idx}">
        <div class="sprint-day-header">
          <div class="sprint-day-title-wrap">
            <span class="sprint-day-badge">DÍA ${idx + 1}</span>
            <span class="sprint-day-label">${day.dayLabel}</span>
          </div>
          <button type="button" class="btn-toggle-sprint-day ${isCompleted ? 'active' : ''}" data-day-index="${idx}" title="${isCompleted ? 'Marcar incompleto' : 'Marcar día completado'}">
            ${isCompleted ? '✓ CUMPLIDO' : '○ PENDIENTE'}
          </button>
        </div>
        <div class="sprint-day-body">
          <div class="sprint-item">
            <span class="sprint-item-icon">🍳</span>
            <div class="sprint-item-text">
              <strong>Nutrición / Bio:</strong> ${day.bio}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">🤸</span>
            <div class="sprint-item-text">
              <strong>Entrenamiento:</strong> ${day.workout}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">📞</span>
            <div class="sprint-item-text">
              <strong>Comercial:</strong> ${day.sales}
            </div>
          </div>
          <div class="sprint-item">
            <span class="sprint-item-icon">📋</span>
            <div class="sprint-item-text">
              <strong>Soporte / Dev:</strong> ${day.support}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="sprint-3dias-card" id="sprint-3dias-widget">
      <div class="sprint-card-header">
        <div class="sprint-header-left">
          <div class="sprint-icon-box">⚡</div>
          <div>
            <div class="sprint-badge-row">
              <span class="sprint-phase-tag">MICRO-BLOQUE</span>
              <span class="sprint-period-pill">${sprint.startDate} ➔ ${sprint.endDate}</span>
            </div>
            <h3 class="sprint-card-title">${sprint.title}</h3>
            <p class="sprint-card-goal">🎯 <strong>Norte:</strong> ${sprint.goal}</p>
          </div>
        </div>
        <div class="sprint-header-right">
          <div class="sprint-progress-pill">
            <div class="sprint-progress-bar-wrap">
              <div class="sprint-progress-bar" style="width: ${progressPct}%;"></div>
            </div>
            <span class="sprint-progress-label">${completedCount}/3 Días (${progressPct}%)</span>
          </div>
          <button type="button" class="btn-sprint-action" id="btn-next-sprint" title="Avanzar al siguiente sprint de 3 días">
            Siguiente Sprint ➔
          </button>
        </div>
      </div>

      <!-- REGLAS DE ORO DEL SPRINT -->
      <div class="sprint-rules-strip">
        ${sprint.rules.map(r => `<span class="sprint-rule-chip">${r}</span>`).join('')}
      </div>

      <!-- TRÍADA DE DÍAS -->
      <div class="sprint-days-grid">
        ${daysHtml}
      </div>
    </div>
  `;
}

export function setupSprint3DiasEvents(container) {
  const widget = container.querySelector('#sprint-3dias-widget');
  if (!widget) return;

  // Toggle Day completion
  widget.querySelectorAll('.btn-toggle-sprint-day').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.dayIndex, 10);
      const data = getSprint3DiasData();
      if (data.days[idx]) {
        data.days[idx].completed = !data.days[idx].completed;
        saveSprint3DiasData(data);
        const parentSection = widget.closest('.backlog-extension-container');
        if (parentSection) {
          widget.outerHTML = renderSprint3DiasHTML();
          setupSprint3DiasEvents(parentSection);
        }
      }
    };
  });

  // Next Sprint advance
  const nextBtn = widget.querySelector('#btn-next-sprint');
  if (nextBtn) {
    nextBtn.onclick = () => {
      const data = getSprint3DiasData();
      if (data.sprintNumber === 1) {
        if (!confirm('¿Deseas avanzar al Sprint 2 (Jueves 15 a Sábado 17 Oct)? Esto configurará los hitos de compra en Gamarra y demos.')) return;
        data.sprintNumber = 2;
        data.title = 'Sprint 2: Compras Logísticas (S/ 100/50) y Caza de Demos';
        data.startDate = '2026-10-15';
        data.endDate = '2026-10-17';
        data.goal = 'Compras Jueves temprano (Gamarra), llamadas fuera de casa (20-30/día) y agendar 2-3 demos.';
        data.days = [
          {
            id: 'day-4',
            date: '2026-10-15',
            dayLabel: 'D4 • Jueves 15 Octubre',
            bio: 'Compras Parada Gamarra temprano: S/ 100 casa, S/ 50 bio (maní, vísceras, carne)',
            workout: 'Calistenia / Descanso activo post-mercado',
            sales: '20 llamadas fuera de casa (08:30-10:00 y 18:00-21:00)',
            support: 'Transcripción de nuevos leads y agendamiento',
            completed: false
          },
          {
            id: 'day-5',
            date: '2026-10-16',
            dayLabel: 'D5 • Viernes 16 Octubre',
            bio: 'Keto denso + Mantequilla de maní casera + Cero tentaciones',
            workout: 'Calistenia: Fuerza y tracción',
            sales: 'Día pico de llamadas: 25-30 llamadas + cierre de citas para sábado y domingo',
            support: 'Preparación de material y demos de venta',
            completed: false
          },
          {
            id: 'day-6',
            date: '2026-10-17',
            dayLabel: 'D6 • Sábado 17 Octubre',
            bio: 'Keto + Batch cooking (chicharrón / carne deshidratada)',
            workout: 'Calistenia o Pádel con padre',
            sales: 'Ejecución de Demostración 1 agendada (CERO inasistencias)',
            support: 'Seguimiento de prospectos calientes',
            completed: false
          }
        ];
        saveSprint3DiasData(data);
        const parentSection = widget.closest('.backlog-extension-container');
        if (parentSection) {
          widget.outerHTML = renderSprint3DiasHTML();
          setupSprint3DiasEvents(parentSection);
        }
      } else {
        alert('Estás en el Sprint 2 activo. Para reiniciar o editar, utiliza la configuración.');
      }
    };
  }
}
